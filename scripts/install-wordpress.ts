/**
 * WordPress Installation Script via Softaculous API
 *
 * This script installs WordPress on multiple domains via Softaculous API.
 * Softaculous provides an API endpoint that can be called with cPanel credentials.
 */

const CPANEL_URL = 'https://business189.web-hosting.com:2083';
const CPANEL_USER = 'Vietnamvisahelp';
const CPANEL_PASS = 'Johannes-123--!';

const DOMAINS = [
  'vietnamvisaurgent.com',
  'vietnam-visa-fast.com',
  'vietnamtravel.help',
  'vietnamvisaurgent.in',
  'xn--vyzo38a.com', // 越签.com
  'vietnamcheckin.help'
];

const WORDPRESS_CONFIG = {
  admin_username: 'admin',
  admin_pass: 'VietnamVisa2025!@#',
  admin_email: 'admin@vietnamvisaurgent.com',
  site_name: 'Vietnam Visa',
  site_desc: 'Vietnam Visa Services'
};

async function installWordPressViaSoftaculous(domain: string): Promise<boolean> {
  console.log(`\n📦 Installing WordPress on ${domain}...`);

  // Softaculous API endpoint for WordPress installation
  // Note: This requires Softaculous to be installed in cPanel
  const softaculousUrl = `${CPANEL_URL}/frontend/jupiter/softaculous/index.live.php`;

  const formData = new URLSearchParams({
    'softsubmit': '1',
    'softdomain': domain,
    'softdirectory': '',
    'softdb': `wp_${domain.replace(/[.-]/g, '').slice(0, 8)}`,
    'dbusername': `wp_${domain.replace(/[.-]/g, '').slice(0, 5)}`,
    'dbuserpass': WORDPRESS_CONFIG.admin_pass,
    'hostname': 'localhost',
    'admin_username': WORDPRESS_CONFIG.admin_username,
    'admin_pass': WORDPRESS_CONFIG.admin_pass,
    'admin_email': WORDPRESS_CONFIG.admin_email,
    'site_name': `${WORDPRESS_CONFIG.site_name} - ${domain}`,
    'site_desc': WORDPRESS_CONFIG.site_desc,
    'language': domain.includes('xn--') ? 'zh_CN' : 'en_US',
    'softproto': 'https://',
    'wp_content_dir': 'wp-content',
  });

  try {
    const authHeader = 'Basic ' + Buffer.from(`${CPANEL_USER}:${CPANEL_PASS}`).toString('base64');

    const response = await fetch(`${softaculousUrl}?act=software&soft=26`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (response.ok) {
      console.log(`✅ WordPress installation initiated for ${domain}`);
      return true;
    } else {
      console.log(`❌ Failed to install WordPress on ${domain}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error installing WordPress on ${domain}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting WordPress Installation on All Domains\n');
  console.log('=' .repeat(50));

  // Note: Softaculous API typically requires a session cookie from cPanel
  // This script demonstrates the API structure, but may need browser automation
  // for full functionality due to cPanel's CSRF protection.

  console.log('\n⚠️  IMPORTANT: Softaculous API requires an active cPanel session.');
  console.log('   For automated installation, please use one of these methods:\n');

  console.log('📋 METHOD 1: Manual Installation (Recommended - 5 minutes)');
  console.log('   1. Go to: https://business189.web-hosting.com:2083');
  console.log('   2. Login with: Vietnamvisahelp / Johannes-123--!');
  console.log('   3. Click "WordPress Manager by Softaculous"');
  console.log('   4. Click "Install" for each domain\n');

  console.log('📋 METHOD 2: WordPress Manager Bulk Install');
  console.log('   In WordPress Manager, you can select multiple domains');
  console.log('   and install WordPress on all of them at once.\n');

  console.log('📋 DOMAINS TO INSTALL:');
  DOMAINS.forEach((domain, i) => {
    console.log(`   ${i + 1}. ${domain}`);
  });

  console.log('\n📋 WORDPRESS SETTINGS TO USE:');
  console.log(`   Admin Username: ${WORDPRESS_CONFIG.admin_username}`);
  console.log(`   Admin Password: ${WORDPRESS_CONFIG.admin_pass}`);
  console.log(`   Admin Email: ${WORDPRESS_CONFIG.admin_email}`);
  console.log(`   Site Name: Vietnam Visa (varies per domain)`);

  console.log('\n' + '=' .repeat(50));
  console.log('After WordPress is installed, run: npm run setup:aiwu');
}

main().catch(console.error);
