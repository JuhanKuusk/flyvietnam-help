/**
 * WordPress Installation Helper - Opens cPanel WordPress Manager
 *
 * This script opens the browser at the correct URL and provides
 * step-by-step instructions for bulk WordPress installation.
 */

import puppeteer from 'puppeteer';

const CPANEL_URL = 'https://business189.web-hosting.com:2083';
const CPANEL_USER = 'Vietnamvisahelp';
const CPANEL_PASS = 'Johannes-123--!';

const DOMAINS = [
  'vietnamvisaurgent.com',
  'vietnam-visa-fast.com',
  'vietnamtravel.help',
  'vietnamvisaurgent.in',
  'xn--vyzo38a.com',
  'vietnamcheckin.help'
];

const WP_CONFIG = {
  admin_username: 'admin',
  admin_pass: 'VietnamVisa2025!@#',
  admin_email: 'admin@vietnamvisaurgent.com'
};

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 WordPress Installation Helper\n');
  console.log('=' .repeat(60));

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Step 1: Navigate to cPanel login
  console.log('\n📍 Step 1: Opening cPanel login...');
  await page.goto(CPANEL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Step 2: Login
  console.log('📍 Step 2: Logging in...');
  await page.waitForSelector('#user', { timeout: 30000 });
  await page.type('#user', CPANEL_USER, { delay: 30 });
  await page.type('#pass', CPANEL_PASS, { delay: 30 });
  await page.click('#login_submit');
  await delay(8000);

  // Step 3: Navigate to WordPress Manager
  console.log('📍 Step 3: Opening WordPress Manager...');

  // Direct URL to WordPress Manager in cPanel
  const wpManagerUrl = `${page.url().split('/frontend')[0]}/frontend/jupiter/softaculous/index.live.php?act=wpm`;
  await page.goto(wpManagerUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await delay(3000);

  console.log('\n' + '=' .repeat(60));
  console.log('✅ BROWSER IS READY!\n');
  console.log('📋 FOLLOW THESE STEPS IN THE BROWSER:\n');

  console.log('1️⃣  Click "Install" or "+" button');
  console.log('2️⃣  For EACH domain, fill in:');
  console.log('');

  console.log('   📌 DOMAINS TO INSTALL:');
  DOMAINS.forEach((d, i) => {
    console.log(`      ${i + 1}. ${d}`);
  });

  console.log('');
  console.log('   📌 SETTINGS TO USE:');
  console.log(`      Protocol:       https://`);
  console.log(`      Domain:         (select from dropdown)`);
  console.log(`      Directory:      (leave EMPTY)`);
  console.log(`      Admin Username: ${WP_CONFIG.admin_username}`);
  console.log(`      Admin Password: ${WP_CONFIG.admin_pass}`);
  console.log(`      Admin Email:    ${WP_CONFIG.admin_email}`);
  console.log('');
  console.log('3️⃣  Click "Install" for each domain');
  console.log('4️⃣  Wait ~30 seconds per installation');
  console.log('');
  console.log('=' .repeat(60));
  console.log('⏳ Browser will stay open. Close this terminal when done.');
  console.log('=' .repeat(60));

  // Keep open
  await new Promise(() => {});
}

main().catch(console.error);
