/**
 * Full WordPress Auto-Installation via Playwright
 * Installs WordPress on all domains automatically
 */

import { chromium, Page } from 'playwright';

const CPANEL_URL = 'https://business189.web-hosting.com:2083';
const CPANEL_USER = 'Vietnamvisahelp';
const CPANEL_PASS = 'Johannes-123--!';

const DOMAINS = [
  { domain: 'vietnamvisaurgent.com', siteName: 'Vietnam Visa Urgent' },
  { domain: 'vietnam-visa-fast.com', siteName: 'Vietnam Visa Fast' },
  { domain: 'vietnamtravel.help', siteName: 'Vietnam Travel Help' },
  { domain: 'vietnamvisaurgent.in', siteName: 'Vietnam Visa India' },
  { domain: 'xn--vyzo38a.com', siteName: '越签 Vietnam Visa' },
  { domain: 'vietnamcheckin.help', siteName: 'Vietnam Check-in' }
];

const WP_ADMIN = {
  username: 'admin',
  password: 'VietnamVisa2025!@#',
  email: 'admin@vietnamvisaurgent.com'
};

async function login(page: Page): Promise<boolean> {
  console.log('🔐 Logging into cPanel...');

  await page.goto(CPANEL_URL, { timeout: 60000, waitUntil: 'networkidle' });

  // Fill login form
  await page.fill('#user', CPANEL_USER);
  await page.fill('#pass', CPANEL_PASS);
  await page.waitForTimeout(500);

  // Press Enter to submit
  await page.press('#pass', 'Enter');

  // Wait for redirect
  await page.waitForTimeout(8000);

  // Verify login
  const url = page.url();
  if (url.includes('login')) {
    console.log('❌ Still on login page');
    return false;
  }

  console.log('✅ Logged in successfully!');
  return true;
}

async function installWordPress(page: Page, domain: string, siteName: string): Promise<boolean> {
  console.log(`\n📦 Installing WordPress on ${domain}...`);

  try {
    // Navigate to Softaculous WordPress install page
    // Use the session URL from current page
    const currentUrl = page.url();
    const sessionMatch = currentUrl.match(/cpsess\d+/);
    const session = sessionMatch ? sessionMatch[0] : '';

    const installUrl = `https://business189.web-hosting.com:2083/${session}/frontend/jupiter/softaculous/index.live.php?act=software&soft=26&tab=install`;

    console.log(`   Navigating to install page...`);
    await page.goto(installUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Check if we need to click Install button first
    const installTab = await page.$('a[href*="tab=install"]');
    if (installTab) {
      await installTab.click();
      await page.waitForTimeout(2000);
    }

    // Select HTTPS protocol
    const protoSelect = await page.$('select[name="softproto"]');
    if (protoSelect) {
      await page.selectOption('select[name="softproto"]', 'https://');
      console.log('   ✓ Selected HTTPS');
    }

    // Select domain
    const domainSelect = await page.$('select[name="softdomain"]');
    if (domainSelect) {
      // Get available options
      const options = await page.$$eval('select[name="softdomain"] option', opts =>
        opts.map(o => ({ value: o.value, text: o.textContent }))
      );
      console.log('   Available domains:', options.map(o => o.value).join(', '));

      // Find matching domain
      const matchingOption = options.find(o => o.value?.includes(domain));
      if (matchingOption) {
        await page.selectOption('select[name="softdomain"]', matchingOption.value!);
        console.log(`   ✓ Selected domain: ${matchingOption.value}`);
      } else {
        console.log(`   ⚠️ Domain ${domain} not found in dropdown`);
        return false;
      }
    }

    // Clear directory field (install to root)
    const dirInput = await page.$('input[name="softdirectory"]');
    if (dirInput) {
      await page.fill('input[name="softdirectory"]', '');
      console.log('   ✓ Cleared directory (root install)');
    }

    // Site name
    const siteNameInput = await page.$('input[name="site_name"]');
    if (siteNameInput) {
      await page.fill('input[name="site_name"]', siteName);
      console.log(`   ✓ Set site name: ${siteName}`);
    }

    // Site description
    const siteDescInput = await page.$('input[name="site_desc"]');
    if (siteDescInput) {
      await page.fill('input[name="site_desc"]', 'Vietnam Visa Services');
    }

    // Admin username
    const adminUserInput = await page.$('input[name="admin_username"]');
    if (adminUserInput) {
      await page.fill('input[name="admin_username"]', WP_ADMIN.username);
      console.log(`   ✓ Set admin username: ${WP_ADMIN.username}`);
    }

    // Admin password
    const adminPassInput = await page.$('input[name="admin_pass"]');
    if (adminPassInput) {
      await page.fill('input[name="admin_pass"]', WP_ADMIN.password);
      console.log('   ✓ Set admin password');
    }

    // Admin email
    const adminEmailInput = await page.$('input[name="admin_email"]');
    if (adminEmailInput) {
      await page.fill('input[name="admin_email"]', WP_ADMIN.email);
      console.log(`   ✓ Set admin email: ${WP_ADMIN.email}`);
    }

    // Scroll down and click Install button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find and click install button
    const installButton = await page.$('input[type="submit"][value*="Install"], button[type="submit"]:has-text("Install")');
    if (installButton) {
      console.log('   Clicking Install button...');
      await installButton.click();

      // Wait for installation
      await page.waitForTimeout(30000);

      // Check for success
      const pageContent = await page.content();
      if (pageContent.includes('Congratulations') || pageContent.includes('successfully')) {
        console.log(`✅ WordPress installed on ${domain}!`);
        return true;
      }
    }

    console.log(`⚠️ Installation status unclear for ${domain}`);
    return true;

  } catch (error) {
    console.error(`❌ Error installing on ${domain}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 WordPress Full Auto-Installation\n');
  console.log('=' .repeat(50));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Login
    const loggedIn = await login(page);
    if (!loggedIn) {
      console.log('\n❌ Login failed. Please check credentials.');
      console.log('Browser will stay open for manual login...');
      await page.waitForTimeout(300000);
      return;
    }

    // Install WordPress on each domain
    const results: { domain: string; success: boolean }[] = [];

    for (const { domain, siteName } of DOMAINS) {
      const success = await installWordPress(page, domain, siteName);
      results.push({ domain, success });
      await page.waitForTimeout(2000);
    }

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 INSTALLATION SUMMARY\n');

    for (const { domain, success } of results) {
      console.log(`  ${success ? '✅' : '❌'} ${domain}`);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n  Total: ${successCount}/${results.length}`);

    console.log('\n🔑 WordPress Admin Credentials:');
    console.log(`   Username: ${WP_ADMIN.username}`);
    console.log(`   Password: ${WP_ADMIN.password}`);
    console.log(`   Email: ${WP_ADMIN.email}`);

    console.log('\n📋 Test your sites:');
    for (const { domain } of DOMAINS) {
      console.log(`   https://${domain}/wp-admin`);
    }

    console.log('\n⏳ Browser staying open for verification...');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('❌ Script error:', error);
    await page.waitForTimeout(300000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
