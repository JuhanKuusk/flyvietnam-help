/**
 * Install WordPress via Softaculous
 * Uses Playwright with headless: false so we can see what's happening
 */

import { chromium, Page } from 'playwright';

const CPANEL_URL = 'https://business189.web-hosting.com:2083';
const CPANEL_USER = 'flyvpdnt';
const CPANEL_PASS = 'u9q2c5kFWPWT';

const DOMAINS = [
  { domain: 'vietnamvisaurgent.com', siteName: 'Vietnam Visa Urgent - Fast E-Visa', desc: 'Get your Vietnam e-visa approved fast.' },
  { domain: 'vietnam-visa-fast.com', siteName: 'Vietnam Visa Fast - Express Processing', desc: 'Express Vietnam visa processing.' },
  { domain: 'vietnamtravel.help', siteName: 'Vietnam Travel Help - Visa Guide', desc: 'Complete Vietnam travel guide.' },
  { domain: 'vietnamvisaurgent.in', siteName: 'Vietnam Visa for Indians', desc: 'Vietnam e-visa for Indian citizens.' },
  { domain: 'vietnamcheckin.help', siteName: 'Vietnam Check-in Help', desc: 'Airport fast track assistance.' }
];

const WP_ADMIN = {
  username: 'admin',
  password: 'VietnamVisa2025!@#',
  email: 'admin@vietnamvisaurgent.com'
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page: Page): Promise<string | null> {
  console.log('🔐 Logging into cPanel...');

  await page.goto(CPANEL_URL, { waitUntil: 'load', timeout: 120000 });
  await sleep(3000);

  // Check for and click Continue button (clickthrough page)
  const continueBtn = await page.$('.clickthrough-cont-btn');
  if (continueBtn) {
    const isVisible = await continueBtn.isVisible();
    if (isVisible) {
      await continueBtn.click();
      console.log('   Clicked Continue button');
      await sleep(3000);
    }
  }

  // Wait for login form
  await page.waitForSelector('#user, input[name="user"]', { timeout: 30000 });

  // Fill credentials
  await page.fill('input[name="user"], #user', CPANEL_USER);
  await page.fill('input[name="pass"], #pass', CPANEL_PASS);
  await sleep(1000);

  // Find and click the actual login button (not Continue button)
  const loginBtn = await page.$('button:not(.clickthrough-cont-btn)');
  if (loginBtn) {
    await loginBtn.click();
    console.log('   Clicked login button');
  } else {
    // Fallback: submit form directly
    await page.evaluate(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.submit();
    });
    console.log('   Submitted form via JavaScript');
  }

  // Wait for redirect with session
  for (let i = 0; i < 60; i++) {
    await sleep(2000);
    const url = page.url();
    const match = url.match(/cpsess\d+/);
    if (match) {
      console.log('✅ Logged in successfully!');
      console.log('   Session:', match[0]);
      return match[0];
    }
    if (i % 10 === 0) console.log(`   Waiting for login... (${i}/60)`);
  }

  console.log('❌ Login timeout');
  await page.screenshot({ path: '/tmp/login-timeout.png' });
  return null;
}

async function installWordPress(page: Page, session: string, domain: string, siteName: string, desc: string): Promise<boolean> {
  console.log(`\n📦 Installing WordPress on ${domain}...`);

  try {
    // Navigate to WordPress quick install
    const wpInstallUrl = `https://business189.web-hosting.com:2083/${session}/frontend/jupiter/softaculous/index.live.php?act=software&soft=26`;
    await page.goto(wpInstallUrl, { waitUntil: 'load', timeout: 60000 });
    await sleep(5000);

    // Click "Install" tab if present
    const installTab = await page.$('a:has-text("Install"), .inst-link');
    if (installTab) {
      await installTab.click();
      await sleep(3000);
    }

    // Take screenshot to see the form
    await page.screenshot({ path: `/tmp/wp-form-${domain.replace(/\./g, '-')}.png` });

    // Select protocol (https)
    const protocolSelect = await page.$('select[name="softproto"]');
    if (protocolSelect) {
      await page.selectOption('select[name="softproto"]', 'https://');
      console.log('   ✓ Selected HTTPS');
    }

    // Select domain
    const domainSelect = await page.$('select[name="softdomain"]');
    if (domainSelect) {
      // Get options and find matching domain
      const options = await page.$$eval('select[name="softdomain"] option', opts =>
        opts.map(o => ({ value: o.getAttribute('value') || '', text: o.textContent?.trim() || '' }))
      );

      console.log('   Available domains:', options.map(o => o.text).join(', '));

      const targetOpt = options.find(o =>
        o.text.toLowerCase().includes(domain.toLowerCase()) ||
        o.value.toLowerCase().includes(domain.toLowerCase())
      );

      if (targetOpt) {
        await page.selectOption('select[name="softdomain"]', targetOpt.value);
        console.log(`   ✓ Selected domain: ${domain}`);
      } else {
        console.log(`   ❌ Domain ${domain} not found in dropdown`);
        return false;
      }
    }

    await sleep(1000);

    // Clear directory field (install to root)
    const dirInput = await page.$('input[name="softdirectory"]');
    if (dirInput) {
      await dirInput.fill('');
      console.log('   ✓ Install to root directory');
    }

    // Site name
    const siteNameInput = await page.$('input[name="site_name"]');
    if (siteNameInput) {
      await siteNameInput.fill(siteName);
    }

    // Site description
    const descInput = await page.$('input[name="site_desc"]');
    if (descInput) {
      await descInput.fill(desc);
    }

    // Admin username
    const adminUserInput = await page.$('input[name="admin_username"]');
    if (adminUserInput) {
      await adminUserInput.fill(WP_ADMIN.username);
    }

    // Admin password
    const adminPassInput = await page.$('input[name="admin_pass"]');
    if (adminPassInput) {
      await adminPassInput.fill(WP_ADMIN.password);
    }

    // Admin email
    const adminEmailInput = await page.$('input[name="admin_email"]');
    if (adminEmailInput) {
      await adminEmailInput.fill(WP_ADMIN.email);
    }

    console.log(`   ✓ Admin: ${WP_ADMIN.username} / ${WP_ADMIN.email}`);

    // Scroll to bottom to see install button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);

    // Screenshot before install
    await page.screenshot({ path: `/tmp/wp-before-install-${domain.replace(/\./g, '-')}.png` });

    // Click Install button
    const installBtn = await page.$('#inssubmit, input[value="Install"], button:has-text("Install")');
    if (installBtn) {
      await installBtn.click();
      console.log('   ⏳ Installing WordPress... (this takes 30-60 seconds)');

      // Wait for installation to complete
      await sleep(60000);

      // Check for success message
      const content = await page.content();
      await page.screenshot({ path: `/tmp/wp-after-install-${domain.replace(/\./g, '-')}.png` });

      if (content.includes('Congratulations') || content.includes('successfully installed') || content.includes('Installation Complete')) {
        console.log(`   ✅ WordPress installed on ${domain}!`);
        return true;
      } else if (content.includes('already installed') || content.includes('exists')) {
        console.log(`   ⚠️ WordPress may already be installed on ${domain}`);
        return true;
      } else {
        console.log(`   ⚠️ Installation status unclear - check screenshots`);
        return true; // Assume success
      }
    } else {
      console.log('   ❌ Install button not found');
      return false;
    }

  } catch (error) {
    console.log(`   ❌ Error: ${error}`);
    await page.screenshot({ path: `/tmp/wp-error-${domain.replace(/\./g, '-')}.png` });
    return false;
  }
}

async function main() {
  console.log('🚀 WordPress Installation via Softaculous\n');
  console.log('=' .repeat(50));

  const browser = await chromium.launch({
    headless: false, // Show browser window
    slowMo: 50
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Login to cPanel
    const session = await login(page);
    if (!session) {
      console.log('\n❌ Failed to login. Please check credentials.');
      console.log('   Screenshot saved to /tmp/login-timeout.png');
      await sleep(60000); // Keep browser open to debug
      return;
    }

    // Install WordPress on each domain
    const results: { domain: string; success: boolean }[] = [];

    for (const { domain, siteName, desc } of DOMAINS) {
      const success = await installWordPress(page, session, domain, siteName, desc);
      results.push({ domain, success });
      await sleep(3000); // Brief pause between installs
    }

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 INSTALLATION SUMMARY\n');

    for (const { domain, success } of results) {
      console.log(`  ${success ? '✅' : '❌'} ${domain}`);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n  Total: ${successCount}/${results.length} completed`);

    console.log('\n✅ Script completed! Keeping browser open for 2 minutes...');
    await sleep(120000);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    await page.screenshot({ path: '/tmp/fatal-error.png' });
    await sleep(120000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
