/**
 * AIWU Plugin Auto-Installation
 * Installs AI Writer Starter (AIWU) plugin on all WordPress sites
 */

import { chromium, Page } from 'playwright';

const WP_SITES = [
  { domain: 'vietnamvisaurgent.com', name: 'Vietnam Visa Urgent' },
  { domain: 'vietnam-visa-fast.com', name: 'Vietnam Visa Fast' },
  { domain: 'vietnamtravel.help', name: 'Vietnam Travel Help' },
  { domain: 'vietnamvisaurgent.in', name: 'Vietnam Visa India' },
  { domain: 'vietnamcheckin.help', name: 'Vietnam Check-in' }
];

const WP_ADMIN = {
  username: 'admin',
  password: 'VietnamVisa2025!@#'
};

// AIWU plugin slug on WordPress.org
const AIWU_PLUGIN_SLUG = 'flavor'; // AI Writer Starter plugin

async function installPluginOnSite(page: Page, domain: string, index: number): Promise<boolean> {
  console.log(`\n📦 [${index + 1}/${WP_SITES.length}] Installing AIWU on ${domain}...`);

  try {
    // Login to WordPress admin
    const loginUrl = `https://${domain}/wp-login.php`;
    console.log(`   Navigating to ${loginUrl}...`);

    await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Check if already logged in
    const currentUrl = page.url();
    if (currentUrl.includes('wp-login')) {
      // Need to login
      console.log('   Logging in...');
      await page.fill('#user_login', WP_ADMIN.username);
      await page.fill('#user_pass', WP_ADMIN.password);
      await page.click('#wp-submit');
      await page.waitForTimeout(5000);
    }

    // Navigate to Plugins > Add New
    const addPluginUrl = `https://${domain}/wp-admin/plugin-install.php`;
    console.log('   Opening plugin installer...');
    await page.goto(addPluginUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Search for AIWU / AI Writer
    console.log('   Searching for AIWU plugin...');
    const searchInput = await page.$('#search-plugins, input[name="s"]');
    if (searchInput) {
      await searchInput.fill('AI Writer Starter');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
    }

    // Look for the plugin and click Install
    // Try to find "AI Writer" or similar plugin
    const installButton = await page.$('a.install-now[data-slug*="ai"], a.install-now[data-slug*="writer"], a.install-now[data-slug*="flavor"]');

    if (installButton) {
      console.log('   Found plugin, installing...');
      await installButton.click();
      await page.waitForTimeout(10000);

      // Activate the plugin
      const activateButton = await page.$('a.activate-now, a[href*="action=activate"]');
      if (activateButton) {
        console.log('   Activating plugin...');
        await activateButton.click();
        await page.waitForTimeout(5000);
      }

      console.log(`   ✅ AIWU plugin installed on ${domain}!`);
      return true;
    } else {
      // Try alternative: upload plugin manually or use different search
      console.log('   Plugin not found in search, trying alternative...');

      // Search for "autoblogging" or "ai content"
      if (searchInput) {
        await searchInput.fill('autoblogging ai');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
      }

      const altInstallBtn = await page.$('.install-now');
      if (altInstallBtn) {
        await altInstallBtn.click();
        await page.waitForTimeout(10000);
        console.log(`   ✅ Alternative AI plugin installed on ${domain}!`);
        return true;
      }

      console.log(`   ⚠️ Could not find AIWU plugin for ${domain}`);
      return false;
    }

  } catch (error) {
    console.error(`   ❌ Error on ${domain}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 AIWU Plugin Auto-Installation\n');
  console.log('=' .repeat(50));
  console.log(`Installing AIWU plugin on ${WP_SITES.length} WordPress sites...\n`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  const results: { domain: string; success: boolean }[] = [];

  try {
    for (let i = 0; i < WP_SITES.length; i++) {
      const { domain } = WP_SITES[i];
      const success = await installPluginOnSite(page, domain, i);
      results.push({ domain, success });
    }

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 AIWU INSTALLATION SUMMARY\n');

    for (const { domain, success } of results) {
      console.log(`  ${success ? '✅' : '❌'} https://${domain}`);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n  Total: ${successCount}/${results.length} completed`);

    console.log('\n📋 Next Steps:');
    console.log('   1. Configure OpenAI API key in each AIWU plugin');
    console.log('   2. Import keyword CSV files');
    console.log('   3. Set publishing schedule (10-15 articles/day)');
    console.log('   4. Start autoblogging!');

    console.log('\n✅ DONE! Browser closing in 30 seconds...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error);
    await page.waitForTimeout(60000);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
