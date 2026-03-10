/**
 * WordPress Installation via Playwright
 */

import { chromium } from 'playwright';

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

async function main() {
  console.log('🚀 WordPress Installation via Playwright\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Login to cPanel
    console.log('📍 Opening cPanel...');
    await page.goto(CPANEL_URL, { timeout: 60000 });

    // Wait for login form
    await page.waitForSelector('#user', { timeout: 30000 });
    console.log('📍 Found login form, entering credentials...');

    await page.fill('#user', CPANEL_USER);
    await page.fill('#pass', CPANEL_PASS);

    // Wait for button to become enabled
    await page.waitForTimeout(1000);

    // Try pressing Enter instead of clicking disabled button
    await page.press('#pass', 'Enter');

    // Wait for dashboard
    console.log('📍 Waiting for dashboard...');
    await page.waitForTimeout(5000);

    // Check if login was successful
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    if (currentUrl.includes('login') || currentUrl.includes('Login')) {
      console.log('⚠️  Still on login page. Checking for error...');
      const errorText = await page.textContent('.login-error, .error, #error') || '';
      if (errorText) {
        console.log(`❌ Login error: ${errorText}`);
      }
      console.log('\n💡 Please check the browser and login manually if needed.');
      console.log('   Browser will stay open...');
      await page.waitForTimeout(300000); // Wait 5 min
      return;
    }

    console.log('✅ Logged into cPanel!');

    // Step 2: Navigate to WordPress Manager / Softaculous
    console.log('\n📍 Looking for WordPress Manager...');

    // Try direct Softaculous URL
    const baseUrl = currentUrl.split('/frontend')[0] || currentUrl.split('/cpsess')[0];
    const wpManagerUrl = `${baseUrl}/frontend/jupiter/softaculous/index.live.php?act=software&soft=26`;

    console.log(`📍 Navigating to: ${wpManagerUrl}`);
    await page.goto(wpManagerUrl, { timeout: 60000 });
    await page.waitForTimeout(3000);

    // Look for Install button
    const installLink = await page.$('a[href*="act=install"]');
    if (installLink) {
      console.log('📍 Found Install link, clicking...');
      await installLink.click();
      await page.waitForTimeout(3000);
    }

    // Now we should be on the installation form
    console.log('\n📋 INSTALLATION FORM READY');
    console.log('=' .repeat(50));
    console.log('\nDomains to install:');
    DOMAINS.forEach((d, i) => console.log(`  ${i+1}. ${d.domain}`));

    console.log('\nSettings:');
    console.log(`  Admin: ${WP_ADMIN.username}`);
    console.log(`  Pass:  ${WP_ADMIN.password}`);
    console.log(`  Email: ${WP_ADMIN.email}`);

    console.log('\n⏳ Browser open. Complete installation manually or wait...');

    // Keep browser open
    await page.waitForTimeout(600000); // 10 min

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n⏳ Browser will stay open for manual intervention...');
    await page.waitForTimeout(300000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
