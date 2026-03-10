/**
 * WordPress Installation via Namecheap Dashboard
 *
 * Automates WordPress installation through Namecheap hosting panel
 */

import puppeteer, { Browser, Page } from 'puppeteer';

const NAMECHEAP_URL = 'https://ap.www.namecheap.com';
const NC_USER = 'info@vietnamvisahelp.com';
const NC_PASS = 'Johannes-123--!';

const DOMAINS = [
  { domain: 'vietnamvisaurgent.com', siteName: 'Vietnam Visa Urgent', lang: 'en_US' },
  { domain: 'vietnam-visa-fast.com', siteName: 'Vietnam Visa Fast', lang: 'en_US' },
  { domain: 'vietnamtravel.help', siteName: 'Vietnam Travel Help', lang: 'en_US' },
  { domain: 'vietnamvisaurgent.in', siteName: 'Vietnam Visa India', lang: 'en_US' },
  { domain: 'xn--vyzo38a.com', siteName: '越签 - 越南签证', lang: 'zh_CN' },
  { domain: 'vietnamcheckin.help', siteName: 'Vietnam Check-in', lang: 'en_US' }
];

const WP_CONFIG = {
  admin_username: 'admin',
  admin_pass: 'VietnamVisa2025!@#',
  admin_email: 'admin@vietnamvisaurgent.com'
};

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginToNamecheap(page: Page): Promise<boolean> {
  console.log('🔐 Logging into Namecheap...');

  try {
    await page.goto(NAMECHEAP_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Look for login fields
    await delay(3000);

    // Check if already logged in
    const pageContent = await page.content();
    if (pageContent.includes('Dashboard') || pageContent.includes('My Products')) {
      console.log('✅ Already logged in to Namecheap');
      return true;
    }

    // Try to find and fill login form
    const emailInput = await page.$('input[type="email"], input[name="email"], #ctl00_ctl00_ctl00_ctl00_base_content_web_base_content_home_content_page_content_ctl00_loginPanel_txtUsername');
    const passInput = await page.$('input[type="password"], input[name="password"], #ctl00_ctl00_ctl00_ctl00_base_content_web_base_content_home_content_page_content_ctl00_loginPanel_txtPassword');

    if (emailInput && passInput) {
      await emailInput.type(NC_USER, { delay: 50 });
      await passInput.type(NC_PASS, { delay: 50 });

      // Find and click submit
      const submitBtn = await page.$('button[type="submit"], input[type="submit"], .btn-submit');
      if (submitBtn) {
        await submitBtn.click();
        await delay(5000);
      }
    }

    console.log('✅ Logged into Namecheap (or login attempted)');
    return true;
  } catch (error) {
    console.error('❌ Failed to login to Namecheap:', error);
    return false;
  }
}

async function navigateToHosting(page: Page): Promise<boolean> {
  console.log('📂 Navigating to Hosting section...');

  try {
    // Go to hosting dashboard
    await page.goto('https://ap.www.namecheap.com/Hosting/Shared/', { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(3000);

    console.log('✅ On Hosting dashboard');
    return true;
  } catch (error) {
    console.error('❌ Could not navigate to hosting:', error);
    return false;
  }
}

async function installWordPressForDomain(page: Page, domainConfig: typeof DOMAINS[0]): Promise<boolean> {
  const { domain, siteName } = domainConfig;
  console.log(`\n📦 Installing WordPress on ${domain}...`);

  try {
    // In Namecheap, you need to:
    // 1. Go to cPanel for the hosting account
    // 2. Navigate to Softaculous
    // 3. Install WordPress

    // Navigate to cPanel
    const cpanelLink = await page.$(`a[href*="cpanel"], a[href*="cPanel"]`);
    if (cpanelLink) {
      await cpanelLink.click();
      await delay(5000);
    }

    // This opens a new tab typically, so we need to handle that
    const pages = await page.browser().pages();
    const cpanelPage = pages[pages.length - 1];

    // Look for Softaculous/WordPress Manager
    await cpanelPage.waitForSelector('body', { timeout: 30000 });
    await delay(3000);

    // Find WordPress Manager
    const wpManager = await cpanelPage.$('a[href*="softaculous"], a[href*="wordpress"], div:has-text("WordPress")');
    if (wpManager) {
      await wpManager.click();
      await delay(5000);
    }

    console.log(`⏳ WordPress installation for ${domain} needs manual completion`);
    return true;
  } catch (error) {
    console.error(`❌ Error installing WordPress on ${domain}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Namecheap WordPress Installation Script\n');
  console.log('=' .repeat(50));

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();

  try {
    const loggedIn = await loginToNamecheap(page);
    if (!loggedIn) {
      console.log('❌ Could not login. Please login manually in the browser.');
    }

    await navigateToHosting(page);

    console.log('\n' + '=' .repeat(50));
    console.log('📋 MANUAL STEPS REQUIRED:\n');
    console.log('Since Namecheap uses a complex multi-step process,');
    console.log('please complete WordPress installation manually:\n');

    console.log('1. In Namecheap dashboard, go to "Hosting List"');
    console.log('2. Click "Manage" next to your hosting account');
    console.log('3. Click "cPanel" button to open cPanel');
    console.log('4. In cPanel, find "WordPress Manager by Softaculous"');
    console.log('5. Click "Install" and select each domain:\n');

    DOMAINS.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.domain} (${d.siteName})`);
    });

    console.log('\n📋 WordPress Settings to use:');
    console.log(`   Admin Username: ${WP_CONFIG.admin_username}`);
    console.log(`   Admin Password: ${WP_CONFIG.admin_pass}`);
    console.log(`   Admin Email: ${WP_CONFIG.admin_email}`);
    console.log(`   Protocol: https://`);
    console.log(`   Directory: (leave empty for root)`);

    console.log('\n⏳ Browser will remain open. Complete the installation manually.');
    console.log('   Press Ctrl+C when done to close.\n');

    // Keep browser open indefinitely
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

main().catch(console.error);
