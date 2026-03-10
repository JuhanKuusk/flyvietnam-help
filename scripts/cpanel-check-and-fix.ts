/**
 * cPanel Check and Fix Script
 * 1. Login to cPanel
 * 2. Check addon domains
 * 3. Check WordPress Manager for installed sites
 * 4. Reinstall WordPress if needed
 */

import { chromium, Page } from 'playwright';

const CPANEL_URL = 'https://business189.web-hosting.com:2083';
const CPANEL_USER = process.env.CPANEL_USER || 'flyvpdnt';
const CPANEL_PASS = process.env.CPANEL_PASS || 'u9q2c5kFWPWT';

const DOMAINS = [
  { domain: 'vietnamvisaurgent.com', siteName: 'Vietnam Visa Urgent - Fast E-Visa Service', desc: 'Get your Vietnam e-visa approved fast. Emergency processing available.' },
  { domain: 'vietnam-visa-fast.com', siteName: 'Vietnam Visa Fast - Express E-Visa Processing', desc: 'Express Vietnam visa processing. Same-day approval available.' },
  { domain: 'vietnamtravel.help', siteName: 'Vietnam Travel Help - Visa & Travel Guide', desc: 'Complete Vietnam travel guide with visa assistance.' },
  { domain: 'vietnamvisaurgent.in', siteName: 'Vietnam Visa for Indians - Fast E-Visa', desc: 'Vietnam e-visa for Indian citizens. Quick approval.' },
  { domain: 'vietnamcheckin.help', siteName: 'Vietnam Check-in - Airport Fast Track', desc: 'Airport fast track and visa on arrival assistance.' }
];

const WP_ADMIN = {
  username: 'admin',
  password: 'VietnamVisa2025!@#',
  email: 'admin@vietnamvisaurgent.com'
};

async function login(page: Page): Promise<string> {
  console.log('🔐 Logging into cPanel...');

  await page.goto(CPANEL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.fill('#user', CPANEL_USER);
  await page.fill('#pass', CPANEL_PASS);
  await page.waitForTimeout(500);
  await page.press('#pass', 'Enter');

  console.log('   Waiting for login...');
  await page.waitForTimeout(10000);

  // Get session from URL
  for (let i = 0; i < 15; i++) {
    const url = page.url();
    const match = url.match(/cpsess\d+/);
    if (match) {
      console.log('✅ Logged into cPanel!');
      return match[0];
    }
    await page.waitForTimeout(2000);
  }

  throw new Error('Failed to login to cPanel');
}

async function checkWordPressManager(page: Page, session: string): Promise<string[]> {
  console.log('\n📋 Checking WordPress Manager...');

  const wpManagerUrl = `https://business189.web-hosting.com:2083/${session}/frontend/jupiter/softaculous/index.live.php?act=wpm`;
  await page.goto(wpManagerUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Extract installed WordPress sites
  const installedSites = await page.evaluate(() => {
    const sites: string[] = [];
    // Look for domain links in the WordPress Manager
    const links = document.querySelectorAll('a[href*="http"]');
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href.match(/https?:\/\/([^\/]+)/);
      if (match && !href.includes('softaculous') && !href.includes('web-hosting')) {
        sites.push(match[1]);
      }
    });
    return [...new Set(sites)];
  });

  console.log('   Installed WordPress sites:', installedSites.length > 0 ? installedSites.join(', ') : 'None found');
  return installedSites;
}

async function installWordPress(page: Page, session: string, domain: string, siteName: string, desc: string): Promise<boolean> {
  console.log(`\n📦 Installing WordPress on ${domain}...`);

  try {
    // Navigate to WordPress install page
    const installUrl = `https://business189.web-hosting.com:2083/${session}/frontend/jupiter/softaculous/index.live.php?act=software&soft=26`;
    await page.goto(installUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Click Install Now if present
    const installNowBtn = await page.$('a[href*="act=install"], .install-btn, [onclick*="install"]');
    if (installNowBtn) {
      await installNowBtn.click();
      await page.waitForTimeout(3000);
    }

    // Select domain from dropdown
    const domainSelect = await page.$('select[name="softdomain"], #softdomain');
    if (domainSelect) {
      // Get all options
      const options = await page.$$eval('select[name="softdomain"] option, #softdomain option', opts =>
        opts.map(o => ({ value: o.getAttribute('value') || '', text: o.textContent || '' }))
      );

      console.log('   Available domains:', options.map(o => o.text).join(', '));

      // Find matching domain
      const targetOption = options.find(o => o.text.includes(domain) || o.value.includes(domain));
      if (targetOption) {
        await page.selectOption('select[name="softdomain"], #softdomain', targetOption.value);
        console.log(`   ✓ Selected domain: ${domain}`);
      } else {
        console.log(`   ❌ Domain ${domain} not found in dropdown`);
        return false;
      }
    }

    await page.waitForTimeout(1000);

    // Clear directory field (install to root)
    const dirInput = await page.$('input[name="softdirectory"], #softdirectory');
    if (dirInput) {
      await dirInput.fill('');
      console.log('   ✓ Directory: root (/)');
    }

    // Fill site name and description
    const siteNameInput = await page.$('input[name="site_name"]');
    if (siteNameInput) {
      await siteNameInput.fill(siteName);
    }

    const siteDescInput = await page.$('input[name="site_desc"]');
    if (siteDescInput) {
      await siteDescInput.fill(desc);
    }

    // Fill admin credentials
    const adminUser = await page.$('input[name="admin_username"]');
    if (adminUser) {
      await adminUser.fill(WP_ADMIN.username);
    }

    const adminPass = await page.$('input[name="admin_pass"]');
    if (adminPass) {
      await adminPass.fill(WP_ADMIN.password);
    }

    const adminEmail = await page.$('input[name="admin_email"]');
    if (adminEmail) {
      await adminEmail.fill(WP_ADMIN.email);
    }

    console.log(`   ✓ Admin: ${WP_ADMIN.username}`);

    // Scroll down and click Install
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find and click install button
    const installBtn = await page.$('input[value="Install"], #inssubmit, button:has-text("Install")');
    if (installBtn) {
      await installBtn.click();
      console.log('   Installing... (this takes ~45 seconds)');

      // Wait for installation
      await page.waitForTimeout(60000);

      // Check for success
      const content = await page.content();
      if (content.includes('Congratulations') || content.includes('successfully') || content.includes('installed')) {
        console.log(`   ✅ WordPress installed on ${domain}!`);
        return true;
      }
    }

    console.log(`   ⚠️ Installation status unclear for ${domain}`);
    return true; // Assume success

  } catch (error) {
    console.error(`   ❌ Error installing on ${domain}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔧 cPanel Check and Fix Script\n');
  console.log('=' .repeat(50));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Login
    const session = await login(page);

    // Check existing WordPress installations
    const installedSites = await checkWordPressManager(page, session);

    // Find domains that need WordPress installation
    const needsInstall = DOMAINS.filter(d =>
      !installedSites.some(site => site.includes(d.domain))
    );

    console.log('\n📊 Status:');
    console.log(`   Already installed: ${installedSites.length}`);
    console.log(`   Need installation: ${needsInstall.length}`);

    if (needsInstall.length > 0) {
      console.log('\n🚀 Installing WordPress on missing domains...');

      for (const { domain, siteName, desc } of needsInstall) {
        await installWordPress(page, session, domain, siteName, desc);
        await page.waitForTimeout(5000); // Brief pause between installs
      }
    }

    // Final check
    console.log('\n📋 Final WordPress Manager check...');
    const finalSites = await checkWordPressManager(page, session);

    console.log('\n' + '=' .repeat(50));
    console.log('📊 FINAL SUMMARY\n');

    for (const { domain } of DOMAINS) {
      const installed = finalSites.some(site => site.includes(domain));
      console.log(`  ${installed ? '✅' : '❌'} ${domain}`);
    }

    console.log('\n✅ Script completed! Browser staying open for 60 seconds...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Error:', error);
    await page.waitForTimeout(120000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
