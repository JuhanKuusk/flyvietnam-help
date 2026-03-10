/**
 * Check WordPress Installation Status via cPanel
 * Verifies addon domains and WordPress installations
 */

import { chromium, Page } from 'playwright';

const CPANEL_URL = 'https://business189.web-hosting.com:2083';
const CPANEL_USER = 'flyvpdnt';
const CPANEL_PASS = 'u9q2c5kFWPWT';

const DOMAINS = [
  'vietnamvisaurgent.com',
  'vietnam-visa-fast.com',
  'vietnamtravel.help',
  'vietnamvisaurgent.in',
  'vietnamcheckin.help'
];

async function login(page: Page): Promise<boolean> {
  console.log('🔐 Logging into cPanel...');

  await page.goto(CPANEL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.fill('#user', CPANEL_USER);
  await page.fill('#pass', CPANEL_PASS);
  await page.waitForTimeout(500);
  await page.press('#pass', 'Enter');

  // Wait for dashboard
  console.log('   Waiting for login...');
  await page.waitForTimeout(10000);

  for (let i = 0; i < 10; i++) {
    const url = page.url();
    if (url.includes('cpsess')) {
      console.log('✅ Logged into cPanel!\n');
      return true;
    }
    await page.waitForTimeout(2000);
  }

  return false;
}

async function checkWordPressManager(page: Page): Promise<void> {
  console.log('📋 Checking WordPress Manager...\n');

  // Get session
  const currentUrl = page.url();
  const sessionMatch = currentUrl.match(/cpsess\d+/);
  const session = sessionMatch ? sessionMatch[0] : '';

  // Navigate to WordPress Manager
  const wpManagerUrl = `https://business189.web-hosting.com:2083/${session}/frontend/jupiter/softaculous/index.live.php?act=wpm`;
  await page.goto(wpManagerUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Get list of installed WordPress sites
  const wpSites = await page.evaluate(() => {
    const sites: string[] = [];
    // Look for installed WordPress instances
    const rows = document.querySelectorAll('tr[data-domain], .installation-row, [class*="install"]');
    rows.forEach(row => {
      const text = row.textContent || '';
      sites.push(text.substring(0, 100));
    });

    // Also check for any domain mentions
    const allText = document.body.innerText;
    return { sites, pageText: allText.substring(0, 2000) };
  });

  console.log('WordPress Manager content preview:');
  console.log(wpSites.pageText);
  console.log('\n');
}

async function checkAddonDomains(page: Page): Promise<void> {
  console.log('📋 Checking Addon Domains...\n');

  // Get session
  const currentUrl = page.url();
  const sessionMatch = currentUrl.match(/cpsess\d+/);
  const session = sessionMatch ? sessionMatch[0] : '';

  // Navigate to Addon Domains
  const addonUrl = `https://business189.web-hosting.com:2083/${session}/frontend/jupiter/addon_domains.html`;
  await page.goto(addonUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Get addon domains list
  const addonInfo = await page.evaluate(() => {
    const domains: { domain: string; root: string }[] = [];
    const rows = document.querySelectorAll('table tr, .domain-row');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        domains.push({
          domain: cells[0]?.textContent?.trim() || '',
          root: cells[1]?.textContent?.trim() || ''
        });
      }
    });
    return { domains, pageText: document.body.innerText.substring(0, 2000) };
  });

  console.log('Addon Domains:');
  addonInfo.domains.forEach(d => {
    if (d.domain) {
      console.log(`  - ${d.domain} -> ${d.root}`);
    }
  });
  console.log('\nPage preview:', addonInfo.pageText.substring(0, 500));
}

async function checkFileManager(page: Page, domain: string): Promise<boolean> {
  console.log(`\n📁 Checking files for ${domain}...`);

  const currentUrl = page.url();
  const sessionMatch = currentUrl.match(/cpsess\d+/);
  const session = sessionMatch ? sessionMatch[0] : '';

  // Navigate to File Manager for the domain directory
  const fileManagerUrl = `https://business189.web-hosting.com:2083/${session}/frontend/jupiter/filemanager/index.html?dir=%2Fhome%2Fflyvpdnt%2F${domain}`;
  await page.goto(fileManagerUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Check for WordPress files
  const hasWP = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasWpAdmin: text.includes('wp-admin'),
      hasWpContent: text.includes('wp-content'),
      hasWpIncludes: text.includes('wp-includes'),
      hasIndex: text.includes('index.php'),
      preview: text.substring(0, 1000)
    };
  });

  if (hasWP.hasWpAdmin && hasWP.hasWpContent) {
    console.log(`   ✅ WordPress files found!`);
    return true;
  } else {
    console.log(`   ❌ WordPress files NOT found`);
    console.log(`   Preview: ${hasWP.preview.substring(0, 200)}`);
    return false;
  }
}

async function main() {
  console.log('🔍 WordPress Installation Status Check\n');
  console.log('=' .repeat(50));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50
  });

  const page = await browser.newPage();
  page.setViewportSize({ width: 1400, height: 900 });

  try {
    const loggedIn = await login(page);
    if (!loggedIn) {
      console.log('❌ Login failed');
      return;
    }

    // Check WordPress Manager
    await checkWordPressManager(page);

    // Check Addon Domains
    await checkAddonDomains(page);

    // Check files for each domain
    console.log('\n📁 Checking WordPress files for each domain...');
    const results: { domain: string; hasWP: boolean }[] = [];

    for (const domain of DOMAINS) {
      const hasWP = await checkFileManager(page, domain);
      results.push({ domain, hasWP });
    }

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 SUMMARY\n');

    for (const { domain, hasWP } of results) {
      console.log(`  ${hasWP ? '✅' : '❌'} ${domain}`);
    }

    console.log('\n⏳ Browser staying open for inspection...');
    await page.waitForTimeout(120000);

  } catch (error) {
    console.error('❌ Error:', error);
    await page.waitForTimeout(60000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
