/**
 * cPanel API Setup Script
 * Uses cPanel UAPI directly instead of browser automation
 */

const CPANEL_HOST = 'business189.web-hosting.com';
const CPANEL_USER = 'flyvpdnt';
const CPANEL_PASS = 'u9q2c5kFWPWT';

const DOMAINS = [
  { domain: 'vietnamvisaurgent.com', siteName: 'Vietnam Visa Urgent', desc: 'Fast Vietnam e-visa service' },
  { domain: 'vietnam-visa-fast.com', siteName: 'Vietnam Visa Fast', desc: 'Express e-visa processing' },
  { domain: 'vietnamtravel.help', siteName: 'Vietnam Travel Help', desc: 'Vietnam travel and visa guide' },
  { domain: 'vietnamvisaurgent.in', siteName: 'Vietnam Visa India', desc: 'Vietnam e-visa for Indians' },
  { domain: 'vietnamcheckin.help', siteName: 'Vietnam Check-in', desc: 'Airport fast track assistance' }
];

// Base64 encode credentials for Basic Auth
const authHeader = 'Basic ' + Buffer.from(`${CPANEL_USER}:${CPANEL_PASS}`).toString('base64');

async function cpanelRequest(endpoint: string, method: string = 'GET', params?: Record<string, string>): Promise<any> {
  const url = new URL(`https://${CPANEL_HOST}:2083${endpoint}`);

  if (params && method === 'GET') {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: method === 'POST' && params ? new URLSearchParams(params).toString() : undefined
  });

  if (!response.ok) {
    throw new Error(`cPanel API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function listDomains(): Promise<string[]> {
  console.log('📋 Listing all domains...');

  try {
    // Use DomainInfo API (newer cPanel)
    const result = await cpanelRequest('/execute/DomainInfo/list_domains');

    if (result.status === 1 && result.data) {
      const allDomains = [
        ...(result.data.main_domain ? [result.data.main_domain] : []),
        ...(result.data.addon_domains || []),
        ...(result.data.sub_domains || []),
        ...(result.data.parked_domains || [])
      ];
      console.log('   Main domain:', result.data.main_domain);
      console.log('   Addon domains:', result.data.addon_domains?.join(', ') || 'None');
      return allDomains;
    }
  } catch (error) {
    console.log('   DomainInfo failed, trying SubDomain API...');

    try {
      const result2 = await cpanelRequest('/execute/SubDomain/listsubdomains');
      if (result2.status === 1) {
        const domains = result2.data?.map((d: any) => d.domain) || [];
        console.log('   Found subdomains:', domains.join(', '));
        return domains;
      }
    } catch {
      console.log('   SubDomain API also failed');
    }
  }

  return [];
}

async function addDomain(domain: string): Promise<boolean> {
  console.log(`\n📍 Adding domain: ${domain}`);

  try {
    // Try SubDomain API (works on most cPanel versions)
    const subdomain = domain.replace(/\./g, '-');

    const result = await cpanelRequest('/execute/SubDomain/addsubdomain', 'POST', {
      domain: subdomain,
      rootdomain: 'flyvietnam.help',
      dir: `public_html/${domain}`
    });

    if (result.status === 1) {
      console.log(`   ✅ Added subdomain: ${subdomain}.flyvietnam.help`);
      return true;
    } else {
      const errors = result.errors?.join(', ') || 'Unknown error';
      console.log(`   ❌ SubDomain failed: ${errors}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error}`);
  }

  return false;
}

async function listInstalledWordPress(): Promise<any[]> {
  console.log('\n📋 Checking installed WordPress sites...');

  try {
    // Try WordPress Toolkit API
    const result = await cpanelRequest('/execute/WordPressInstanceManager/get_instances');

    if (result.status === 1 && result.data) {
      console.log('   Found:', result.data.length, 'installations');
      return result.data;
    }
  } catch (error) {
    console.log('   WordPress API not available, trying Softaculous...');
  }

  return [];
}

async function testConnection(): Promise<boolean> {
  console.log('🔗 Testing cPanel API connection...');

  try {
    const result = await cpanelRequest('/execute/Stats/get_site_traffic');
    console.log('   ✅ Connection successful!');
    return true;
  } catch (error: any) {
    console.log('   ❌ Connection failed:', error.message);

    // Try alternative auth method
    console.log('   Trying alternative endpoint...');
    try {
      const result2 = await fetch(`https://${CPANEL_HOST}:2083/login/?login_only=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          user: CPANEL_USER,
          pass: CPANEL_PASS
        }).toString()
      });

      const data = await result2.json();
      console.log('   Login response:', JSON.stringify(data).substring(0, 200));

      if (data.status === 1) {
        console.log('   ✅ Login successful via form!');
        return true;
      }
    } catch (e) {
      console.log('   Alternative method also failed');
    }

    return false;
  }
}

async function getDomainDocRoots(): Promise<void> {
  console.log('\n📂 Checking document roots...');

  try {
    // Try single_domain_data for each domain
    for (const { domain } of DOMAINS) {
      try {
        const result = await cpanelRequest('/execute/DomainInfo/single_domain_data', 'GET', { domain });
        if (result.status === 1 && result.data) {
          console.log(`   ${domain}: ${result.data.documentroot || 'N/A'}`);
        }
      } catch {
        // Try alternative
        const result2 = await cpanelRequest('/execute/DomainInfo/domain_data', 'GET', { domain });
        if (result2.status === 1 && result2.data) {
          console.log(`   ${domain}: ${JSON.stringify(result2.data).substring(0, 100)}`);
        }
      }
    }
  } catch (error) {
    console.log('   Error:', error);
  }
}

async function main() {
  console.log('🚀 cPanel API Setup Script\n');
  console.log('=' .repeat(50));

  // Test connection
  const connected = await testConnection();

  if (!connected) {
    console.log('\n❌ Cannot connect to cPanel API.');
    console.log('   Please verify credentials or try browser-based setup.');
    return;
  }

  // List existing domains
  const existingDomains = await listDomains();

  // Check which domains are already configured
  console.log('\n📊 Domain Status:');
  for (const { domain } of DOMAINS) {
    const exists = existingDomains.some(d => d.includes(domain) || domain.includes(d));
    console.log(`   ${exists ? '✓' : '✗'} ${domain}`);
  }

  // Get document roots
  await getDomainDocRoots();

  // Check WordPress installations
  await listInstalledWordPress();

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Script completed!');
}

main().catch(console.error);
