/**
 * Enable SSL via Cloudflare for all domains
 */

const CLOUDFLARE_API_TOKEN = 'GJuJz6kxM1WpMPkxQUozPoxbi4aZPvbKbcNFWwq2';

const DOMAINS = [
  'vietnamvisaurgent.com',
  'vietnam-visa-fast.com',
  'vietnamtravel.help',
  'vietnamvisaurgent.in',
  'vietnamcheckin.help'
];

async function enableSSL(domain: string) {
  console.log(`\n📍 Enabling SSL for ${domain}...`);

  // Get zone ID
  const zoneRes = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
    headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
  });
  const zoneData = await zoneRes.json() as { result?: { id: string }[], success: boolean };

  if (!zoneData.result?.[0]?.id) {
    console.log(`   ❌ Zone not found for ${domain}`);
    return false;
  }
  const zoneId = zoneData.result[0].id;
  console.log(`   Zone ID: ${zoneId}`);

  // Enable proxy on A records (required for Cloudflare SSL)
  const dnsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A`, {
    headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}` }
  });
  const dnsData = await dnsRes.json() as { result?: { id: string, name: string, content: string }[] };

  for (const record of dnsData.result || []) {
    const updateRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ proxied: true })
    });
    const updateData = await updateRes.json() as { success: boolean };
    console.log(`   ${updateData.success ? '✅' : '❌'} Proxy enabled for ${record.name}`);
  }

  // Set SSL mode to Flexible (works without server SSL cert)
  const sslRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: 'flexible' })
  });
  const sslData = await sslRes.json() as { success: boolean };
  console.log(`   ${sslData.success ? '✅' : '❌'} SSL mode: Flexible`);

  // Enable "Always Use HTTPS"
  const httpsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/always_use_https`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: 'on' })
  });
  const httpsData = await httpsRes.json() as { success: boolean };
  console.log(`   ${httpsData.success ? '✅' : '❌'} Always Use HTTPS: On`);

  return sslData.success && httpsData.success;
}

async function main() {
  console.log('🔒 Enabling SSL via Cloudflare for all domains\n');
  console.log('='.repeat(50));

  const results: { domain: string; success: boolean }[] = [];

  for (const domain of DOMAINS) {
    const success = await enableSSL(domain);
    results.push({ domain, success: success ?? false });
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SSL SETUP SUMMARY\n');

  for (const { domain, success } of results) {
    console.log(`  ${success ? '✅' : '❌'} https://${domain}`);
  }

  console.log('\n⏳ SSL will be active within 5 minutes.');
}

main().catch(console.error);
