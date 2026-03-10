/**
 * Setup DNS A Records for all domains in Cloudflare
 * Points domains to Namecheap cPanel hosting server: 199.188.201.174
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'GJuJz6kxM1WpMPkxQUozPoxbi4aZPvbKbcNFWwq2';
const HOSTING_IP = '199.188.201.174'; // Namecheap Stellar Business cPanel server (business189.web-hosting.com)

const DOMAINS = [
  'vietnamvisaurgent.com',
  'vietnam-visa-fast.com',
  'vietnamtravel.help',
  'vietnamvisaurgent.in',
  'vietnamcheckin.help'
];

async function getZoneId(domain: string): Promise<string | null> {
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (data.success && data.result.length > 0) {
    return data.result[0].id;
  }
  return null;
}

async function createDnsRecord(zoneId: string, name: string, type: string, content: string, proxied: boolean = true): Promise<boolean> {
  // First check if record already exists
  const checkResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${type}&name=${name}`,
    {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const checkData = await checkResponse.json();

  if (checkData.success && checkData.result.length > 0) {
    // Record exists, update it
    const recordId = checkData.result[0].id;
    const updateResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          name,
          content,
          proxied,
          ttl: 1 // Auto
        })
      }
    );
    const updateData = await updateResponse.json();
    return updateData.success;
  }

  // Create new record
  const createResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        name,
        content,
        proxied,
        ttl: 1 // Auto
      })
    }
  );

  const createData = await createResponse.json();
  return createData.success;
}

async function setupDomainDns(domain: string): Promise<boolean> {
  console.log(`\n📍 Setting up DNS for ${domain}...`);

  const zoneId = await getZoneId(domain);
  if (!zoneId) {
    console.log(`   ❌ Zone not found for ${domain}`);
    return false;
  }

  console.log(`   Zone ID: ${zoneId}`);

  // Create A record for root domain (@) - proxied = false for direct access
  const rootSuccess = await createDnsRecord(zoneId, domain, 'A', HOSTING_IP, false);
  console.log(`   ${rootSuccess ? '✅' : '❌'} A record for ${domain} -> ${HOSTING_IP} (DNS only)`);

  // Create A record for www subdomain - proxied = false for direct access
  const wwwSuccess = await createDnsRecord(zoneId, `www.${domain}`, 'A', HOSTING_IP, false);
  console.log(`   ${wwwSuccess ? '✅' : '❌'} A record for www.${domain} -> ${HOSTING_IP} (DNS only)`);

  return rootSuccess && wwwSuccess;
}

async function main() {
  console.log('🚀 Setting up DNS A Records for all domains\n');
  console.log(`Pointing all domains to: ${HOSTING_IP}`);
  console.log('=' .repeat(50));

  const results: { domain: string; success: boolean }[] = [];

  for (const domain of DOMAINS) {
    const success = await setupDomainDns(domain);
    results.push({ domain, success });
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 DNS SETUP SUMMARY\n');

  for (const { domain, success } of results) {
    console.log(`  ${success ? '✅' : '❌'} ${domain}`);
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n  Total: ${successCount}/${results.length} configured`);

  console.log('\n⏳ DNS propagation typically takes 5-10 minutes.');
  console.log('   After propagation, sites will be accessible.');
}

main().catch(console.error);
