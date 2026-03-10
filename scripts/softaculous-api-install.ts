/**
 * Install WordPress via Softaculous API
 * Uses direct API calls instead of browser automation
 */

const CPANEL_HOST = 'business189.web-hosting.com';
const CPANEL_USER = 'flyvpdnt';
const CPANEL_PASS = 'u9q2c5kFWPWT';

const DOMAINS = [
  { domain: 'vietnamvisaurgent.com', siteName: 'Vietnam Visa Urgent', desc: 'Get Vietnam e-visa fast' },
  { domain: 'vietnam-visa-fast.com', siteName: 'Vietnam Visa Fast', desc: 'Express Vietnam visa' },
  { domain: 'vietnamtravel.help', siteName: 'Vietnam Travel Help', desc: 'Vietnam travel guide' },
  { domain: 'vietnamvisaurgent.in', siteName: 'Vietnam Visa India', desc: 'Vietnam visa for Indians' },
  { domain: 'vietnamcheckin.help', siteName: 'Vietnam Check-in', desc: 'Airport fast track' }
];

const WP_ADMIN = {
  username: 'admin',
  password: 'VietnamVisa2025!@#',
  email: 'admin@vietnamvisaurgent.com'
};

const authHeader = 'Basic ' + Buffer.from(`${CPANEL_USER}:${CPANEL_PASS}`).toString('base64');

async function listInstalledScripts(): Promise<any[]> {
  console.log('📋 Checking installed scripts via Softaculous...');

  try {
    // Softaculous API endpoint for listing installations
    const response = await fetch(`https://${CPANEL_HOST}:2083/frontend/jupiter/softaculous/index.live.php?api=json&act=installations`, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('   Response:', JSON.stringify(data).substring(0, 500));

    if (data.installations) {
      const installs = Object.values(data.installations) as any[];
      console.log(`   Found ${installs.length} installations`);
      return installs;
    }

    return [];
  } catch (error) {
    console.log('   Error:', error);
    return [];
  }
}

async function installWordPressViaSoftaculous(domain: string, siteName: string, desc: string): Promise<boolean> {
  console.log(`\n📦 Installing WordPress on ${domain}...`);

  try {
    // First, get a login session token
    const loginResponse = await fetch(`https://${CPANEL_HOST}:2083/login/?login_only=1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'user': CPANEL_USER,
        'pass': CPANEL_PASS
      }).toString()
    });

    const loginData = await loginResponse.json();

    if (loginData.status !== 1) {
      console.log('   ❌ Login failed');
      return false;
    }

    const securityToken = loginData.security_token;
    console.log('   ✓ Got security token');

    // Use the security token for Softaculous install
    // Build URL with all params as query string (Softaculous prefers GET-style)
    const params = new URLSearchParams({
      'api': 'json',
      'act': 'install',
      'soft': '26',
      'softdomain': domain,
      'softdirectory': '',
      'softproto': '4', // 4 = https://
      'site_name': siteName,
      'site_desc': desc,
      'admin_username': WP_ADMIN.username,
      'admin_pass': WP_ADMIN.password,
      'admin_email': WP_ADMIN.email,
      'language': 'en',
      'noemail': '1',
      'overwrite_existing': '0',
      'eu_auto_upgrade': '1'
    });

    const installUrl = `https://${CPANEL_HOST}:2083${securityToken}/frontend/jupiter/softaculous/index.live.php?${params.toString()}`;

    const response = await fetch(installUrl, {
      method: 'GET',
      headers: {
        'Cookie': `cpsession=${securityToken.replace(/\//g, '')}`
      }
    });

    const text = await response.text();

    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      console.log('   Response:', JSON.stringify(data).substring(0, 300));

      if (data.done === 1 || data.success) {
        console.log(`   ✅ WordPress installed on ${domain}!`);
        return true;
      } else if (data.error) {
        console.log(`   ❌ Error: ${data.error}`);
        if (data.error.includes('already') || data.error.includes('exist')) {
          return true;
        }
      }
    } catch {
      // Check if HTML response indicates success
      if (text.includes('Congratulations') || text.includes('successfully')) {
        console.log(`   ✅ WordPress installed on ${domain}!`);
        return true;
      }
      console.log('   Response (HTML):', text.substring(0, 200));
    }

    return false;
  } catch (error) {
    console.log(`   ❌ Error: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🚀 WordPress Installation via Softaculous API\n');
  console.log('=' .repeat(50));

  // First check what's already installed
  const existing = await listInstalledScripts();

  // Install WordPress on each domain
  console.log('\n📦 Installing WordPress on domains...');

  const results: { domain: string; success: boolean }[] = [];

  for (const { domain, siteName, desc } of DOMAINS) {
    // Check if already installed
    const alreadyInstalled = existing.some((inst: any) =>
      inst.softurl?.includes(domain) || inst.softdomain === domain
    );

    if (alreadyInstalled) {
      console.log(`\n✓ ${domain} - WordPress already installed`);
      results.push({ domain, success: true });
      continue;
    }

    const success = await installWordPressViaSoftaculous(domain, siteName, desc);
    results.push({ domain, success });

    // Brief pause between installs
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 INSTALLATION SUMMARY\n');

  for (const { domain, success } of results) {
    console.log(`  ${success ? '✅' : '❌'} ${domain}`);
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n  Total: ${successCount}/${results.length}`);
}

main().catch(console.error);
