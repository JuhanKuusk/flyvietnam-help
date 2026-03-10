/**
 * WordPress Installation v2 - Stays logged in and uses cPanel dashboard
 */

import { chromium, Page } from 'playwright';

const CPANEL_URL = 'https://business189.web-hosting.com:2083';
const CPANEL_USER = 'flyvpdnt';
const CPANEL_PASS = 'u9q2c5kFWPWT';

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
  console.log('🚀 WordPress Installation v2\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const page = await browser.newPage();
  page.setViewportSize({ width: 1400, height: 900 });

  try {
    // Step 1: Login
    console.log('📍 Logging into cPanel...');
    await page.goto(CPANEL_URL, { waitUntil: 'networkidle' });

    await page.fill('#user', CPANEL_USER);
    await page.fill('#pass', CPANEL_PASS);
    await page.waitForTimeout(1000);
    await page.press('#pass', 'Enter');

    // Wait for dashboard to load
    console.log('📍 Waiting for cPanel dashboard...');
    await page.waitForURL(/.*cpsess.*/, { timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('✅ Logged into cPanel!');

    // Get session from URL
    const dashboardUrl = page.url();
    console.log(`📍 Dashboard URL: ${dashboardUrl}`);

    // Step 2: Find and click on WordPress Manager
    console.log('\n📍 Looking for WordPress Manager...');

    // Search for WordPress in cPanel search
    const searchBox = await page.$('input[type="search"], input[placeholder*="Search"], #search-box');
    if (searchBox) {
      await searchBox.fill('WordPress');
      await page.waitForTimeout(2000);
    }

    // Look for WordPress Manager link
    const wpManagerLink = await page.$('a:has-text("WordPress Manager"), a[href*="wordpress"], a[href*="softaculous"][href*="wpm"]');
    if (wpManagerLink) {
      console.log('📍 Found WordPress Manager, clicking...');
      await wpManagerLink.click();
      await page.waitForTimeout(5000);
    } else {
      // Try direct navigation
      console.log('📍 Navigating directly to Softaculous...');
      // Extract session token
      const match = dashboardUrl.match(/cpsess\d+/);
      if (match) {
        const softUrl = `https://business189.web-hosting.com:2083/${match[0]}/frontend/jupiter/softaculous/index.live.php`;
        await page.goto(softUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
      }
    }

    // Step 3: Navigate to WordPress section
    console.log('📍 Finding WordPress in Softaculous...');

    // Click on WordPress in the software list
    const wpLink = await page.$('a[href*="soft=26"], a:has-text("WordPress"):not(:has-text("Manager"))');
    if (wpLink) {
      await wpLink.click();
      await page.waitForTimeout(3000);
    }

    // Step 4: Click Install
    console.log('📍 Looking for Install button...');
    const installBtn = await page.$('a[href*="act=install"], a:has-text("Install Now"), .btn-install');
    if (installBtn) {
      await installBtn.click();
      await page.waitForTimeout(3000);
    }

    // Now we should be on the install form
    console.log('\n✅ On installation page!');
    console.log('\n📋 MANUAL INSTALLATION REQUIRED');
    console.log('=' .repeat(50));
    console.log('\nThe browser is now on the WordPress installation page.');
    console.log('Please complete the following for each domain:\n');

    console.log('DOMAINS:');
    DOMAINS.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.domain}`);
    });

    console.log('\nSETTINGS:');
    console.log(`  Protocol:       https://`);
    console.log(`  Domain:         (select from dropdown)`);
    console.log(`  In Directory:   (leave EMPTY for root)`);
    console.log(`  Admin Username: ${WP_ADMIN.username}`);
    console.log(`  Admin Password: ${WP_ADMIN.password}`);
    console.log(`  Admin Email:    ${WP_ADMIN.email}`);

    console.log('\n⏳ Browser will stay open. Complete installations manually.');
    console.log('   Close terminal when done.\n');

    // Keep browser open for manual work
    await page.waitForTimeout(600000); // 10 min

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n⏳ Browser staying open for manual intervention...');
    await page.waitForTimeout(300000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
