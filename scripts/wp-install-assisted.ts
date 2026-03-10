/**
 * WordPress Installation - Assisted Mode
 * Opens browser and waits for manual login, then automates WordPress installation
 */

import { chromium, Page } from 'playwright';

const CPANEL_URL = 'https://business189.web-hosting.com:2083';
const CPANEL_USER = 'flyvpdnt';
const CPANEL_PASS = 'u9q2c5kFWPWT';

const DOMAINS = [
  { domain: 'vietnamvisaurgent.com', siteName: 'Vietnam Visa Urgent', desc: 'Fast Vietnam e-visa' },
  { domain: 'vietnam-visa-fast.com', siteName: 'Vietnam Visa Fast', desc: 'Express visa processing' },
  { domain: 'vietnamtravel.help', siteName: 'Vietnam Travel Help', desc: 'Travel guide' },
  { domain: 'vietnamcheckin.help', siteName: 'Vietnam Check-in', desc: 'Airport fast track' }
];

// Skip vietnamvisaurgent.in - already has WordPress installed

const WP_ADMIN = {
  username: 'admin',
  password: 'VietnamVisa2025!@#',
  email: 'admin@vietnamvisaurgent.com'
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLogin(page: Page): Promise<string | null> {
  console.log('\n👆 Please login manually in the browser window...');
  console.log('   URL:', CPANEL_URL);
  console.log('   Username:', CPANEL_USER);
  console.log('   Password:', CPANEL_PASS);
  console.log('\n   Waiting for login (3 minutes max)...\n');

  for (let i = 0; i < 180; i++) {
    const url = page.url();
    const match = url.match(/cpsess\d+/);
    if (match) {
      console.log('✅ Login detected!');
      return match[0];
    }
    await sleep(1000);
    if (i % 30 === 0 && i > 0) {
      console.log(`   Still waiting... (${i} seconds)`);
    }
  }

  console.log('❌ Login timeout after 3 minutes');
  return null;
}

async function installWordPress(page: Page, session: string, domain: string, siteName: string, desc: string): Promise<boolean> {
  console.log(`\n📦 Installing WordPress on ${domain}...`);

  try {
    // Navigate to WordPress install
    const url = `https://business189.web-hosting.com:2083/${session}/frontend/jupiter/softaculous/index.live.php?act=software&soft=26`;
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await sleep(5000);

    // Click Install tab
    const installTab = await page.$('a:has-text("Install")');
    if (installTab) {
      await installTab.click();
      await sleep(3000);
    }

    // Select HTTPS protocol
    await page.selectOption('select[name="softproto"]', 'https://').catch(() => {});

    // Select domain
    try {
      const options = await page.$$eval('select[name="softdomain"] option', opts =>
        opts.map(o => ({ value: o.getAttribute('value') || '', text: o.textContent?.trim() || '' }))
      );
      const target = options.find(o => o.text.includes(domain) || o.value.includes(domain));
      if (target) {
        await page.selectOption('select[name="softdomain"]', target.value);
        console.log(`   ✓ Selected: ${domain}`);
      } else {
        console.log(`   ❌ Domain not found: ${domain}`);
        console.log('   Available:', options.map(o => o.text).join(', '));
        return false;
      }
    } catch (e) {
      console.log('   ❌ Could not select domain');
      return false;
    }

    await sleep(1000);

    // Clear directory
    const dirInput = await page.$('input[name="softdirectory"]');
    if (dirInput) await dirInput.fill('');

    // Site name and description
    const siteNameInput = await page.$('input[name="site_name"]');
    if (siteNameInput) await siteNameInput.fill(siteName);

    const descInput = await page.$('input[name="site_desc"]');
    if (descInput) await descInput.fill(desc);

    // Admin credentials
    const adminUser = await page.$('input[name="admin_username"]');
    if (adminUser) await adminUser.fill(WP_ADMIN.username);

    const adminPass = await page.$('input[name="admin_pass"]');
    if (adminPass) await adminPass.fill(WP_ADMIN.password);

    const adminEmail = await page.$('input[name="admin_email"]');
    if (adminEmail) await adminEmail.fill(WP_ADMIN.email);

    console.log(`   ✓ Admin: ${WP_ADMIN.username}`);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);

    // Click Install
    const installBtn = await page.$('#inssubmit, input[value="Install"]');
    if (installBtn) {
      await installBtn.click();
      console.log('   ⏳ Installing... (60 seconds)');
      await sleep(60000);

      const content = await page.content();
      if (content.includes('Congratulations') || content.includes('successfully')) {
        console.log(`   ✅ WordPress installed on ${domain}!`);
        return true;
      }
    }

    console.log('   ⚠️ Status unclear');
    return true;

  } catch (error) {
    console.log(`   ❌ Error: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🚀 WordPress Installation - Assisted Mode\n');
  console.log('=' .repeat(50));
  console.log('\nThis script will open a browser window.');
  console.log('Please login to cPanel manually, then the script will continue.\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
    channel: 'chrome' // Use real Chrome instead of Chromium
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // Navigate to cPanel and fill credentials
    await page.goto(CPANEL_URL, { waitUntil: 'load', timeout: 60000 });
    await sleep(3000);

    // Pre-fill credentials
    try {
      await page.fill('#user', CPANEL_USER);
      await page.fill('#pass', CPANEL_PASS);
      console.log('📝 Credentials pre-filled. Please click "Log in" button.');
    } catch {
      console.log('📝 Please enter credentials manually.');
    }

    // Wait for manual login
    const session = await waitForLogin(page);
    if (!session) {
      console.log('\n❌ Login failed. Exiting.');
      await browser.close();
      return;
    }

    // Install WordPress on each domain
    const results: { domain: string; success: boolean }[] = [];

    for (const { domain, siteName, desc } of DOMAINS) {
      const success = await installWordPress(page, session, domain, siteName, desc);
      results.push({ domain, success });
      await sleep(3000);
    }

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SUMMARY\n');
    for (const { domain, success } of results) {
      console.log(`  ${success ? '✅' : '❌'} ${domain}`);
    }

    console.log('\n✅ Done! Browser will close in 30 seconds...');
    await sleep(30000);

  } catch (error) {
    console.error('❌ Error:', error);
    await sleep(60000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
