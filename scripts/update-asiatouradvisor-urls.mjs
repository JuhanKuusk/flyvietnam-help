import fs from 'fs';

// Mapping from old asiatouradvisor URLs to new URLs based on site exploration
// New site structure: https://www.asiatouradvisor.com/vietnam-tours/{slug}/
const urlMappings = {
  // Multi-day Vietnam tours - mapped to similar tours on new site
  "https://www.asiatouradvisor.com/signatures-vietnam-14-days/": "https://www.asiatouradvisor.com/vietnam-tours/signatures-of-vietnam/",
  "https://www.asiatouradvisor.com/vietnam-discovery-11-days/": "https://www.asiatouradvisor.com/vietnam-tours/vietnam-discovery-12-days/",
  "https://www.asiatouradvisor.com/natural-wonders-16-days/": "https://www.asiatouradvisor.com/vietnam-tours/natural-wonders-of-vietnam/",
  "https://www.asiatouradvisor.com/vietnam-beach-family/": "https://www.asiatouradvisor.com/vietnam-tours/vietnam-beach-family/",
  "https://www.asiatouradvisor.com/cultural-heritage-12-days/": "https://www.asiatouradvisor.com/vietnam-tours/vietnam-best-cultural-heritage/",
  "https://www.asiatouradvisor.com/discovery-northeast-9-days/": "https://www.asiatouradvisor.com/vietnam-tours/discovery-north-east-vietnam-9-days-8-nights/",
  "https://www.asiatouradvisor.com/cultural-odyssey-10-days/": "https://www.asiatouradvisor.com/vietnam-tours/vietnamese-cultural-odyssey-a-10-day-journey/",
  "https://www.asiatouradvisor.com/best-vietnam-13-days/": "https://www.asiatouradvisor.com/vietnam-tours/best-vietnam-tour-13days/",
  "https://www.asiatouradvisor.com/nature-north-vietnam-8-days/": "https://www.asiatouradvisor.com/vietnam-tours/best-of-nature-in-northern-vietnam-7-days/",
  "https://www.asiatouradvisor.com/vietnam-family-tour/": "https://www.asiatouradvisor.com/vietnam-tours/vietnam-family-tours/",
  "https://www.asiatouradvisor.com/highlights-vietnam-10-days/": "https://www.asiatouradvisor.com/vietnam-tours/vietnam-culinary-discovery/",

  // Regional tours - redirect to category pages
  "https://www.asiatouradvisor.com/ninh-binh-day-trip/": "https://www.asiatouradvisor.com/vietnam-tours/ninh-binh-tours/",
  "https://www.asiatouradvisor.com/sapa-trekking/": "https://www.asiatouradvisor.com/vietnam-tours/sapa-tours/",
  "https://www.asiatouradvisor.com/sapa-muong-hoa-valley/": "https://www.asiatouradvisor.com/vietnam-tours/sapa-tours/",
  "https://www.asiatouradvisor.com/sapa-off-beaten-track/": "https://www.asiatouradvisor.com/vietnam-tours/sapa-tours/",
  "https://www.asiatouradvisor.com/hanoi-city-tour/": "https://www.asiatouradvisor.com/vietnam-tours/hanoi-tours/",
  "https://www.asiatouradvisor.com/hanoi-3-days/": "https://www.asiatouradvisor.com/vietnam-tours/hanoi-tours/",
  "https://www.asiatouradvisor.com/hanoi-4-days/": "https://www.asiatouradvisor.com/vietnam-tours/hanoi-tours/",
  "https://www.asiatouradvisor.com/mekong-delta-4-days/": "https://www.asiatouradvisor.com/vietnam-tours/mekong-delta-tours/",
  "https://www.asiatouradvisor.com/mekong-delta-3-days/": "https://www.asiatouradvisor.com/vietnam-tours/mekong-delta-tours/",
  "https://www.asiatouradvisor.com/mekong-homestay/": "https://www.asiatouradvisor.com/vietnam-tours/mekong-delta-tours/",
  "https://www.asiatouradvisor.com/mekong-cycling/": "https://www.asiatouradvisor.com/vietnam-tours/mekong-delta-tours/",
  "https://www.asiatouradvisor.com/ben-tre-day-trip/": "https://www.asiatouradvisor.com/vietnam-tours/ben-tre-tours/",
  "https://www.asiatouradvisor.com/ben-tre-day/": "https://www.asiatouradvisor.com/vietnam-tours/ben-tre-tours/",
  "https://www.asiatouradvisor.com/cu-chi-tunnels/": "https://www.asiatouradvisor.com/vietnam-tours/ho-chi-minh-tours/",
  "https://www.asiatouradvisor.com/central-vietnam-5-days/": "https://www.asiatouradvisor.com/vietnam-tours/da-nang-tours/",
  "https://www.asiatouradvisor.com/danang-hoi-an-4-days/": "https://www.asiatouradvisor.com/vietnam-tours/da-nang-tours/",
  "https://www.asiatouradvisor.com/central-vietnam-7-days/": "https://www.asiatouradvisor.com/vietnam-tours/hoi-an-tours/",
  "https://www.asiatouradvisor.com/pu-luong-trekking/": "https://www.asiatouradvisor.com/vietnam-tours/pu-luong-tours/",
  "https://www.asiatouradvisor.com/phu-quoc-3-days/": "https://www.asiatouradvisor.com/vietnam-tours/phu-quoc-tours/",
  "https://www.asiatouradvisor.com/phu-quoc-diving/": "https://www.asiatouradvisor.com/vietnam-tours/phu-quoc-tours/",
  "https://www.asiatouradvisor.com/hanoi-sapa-6-days/": "https://www.asiatouradvisor.com/vietnam-tours/sapa-tours/",
  "https://www.asiatouradvisor.com/ho-chi-minh-mekong-4-days/": "https://www.asiatouradvisor.com/vietnam-tours/ho-chi-minh-tours/",

  // Halong Bay cruises - redirect to main Vietnam tours (no specific cruise pages)
  "https://www.asiatouradvisor.com/halong-bay-2-days-1-night-cruise/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/halong-bay-luxury-cruise/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/lan-ha-bay-2-days-1-night/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/bai-tu-long-bay-cruise/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/hanoi-halong-4-days/": "https://www.asiatouradvisor.com/vietnam-tours/hanoi-tours/",
  "https://www.asiatouradvisor.com/hanoi-halong-3-days/": "https://www.asiatouradvisor.com/vietnam-tours/hanoi-tours/",
  "https://www.asiatouradvisor.com/hanoi-ninh-binh-halong-5-days/": "https://www.asiatouradvisor.com/vietnam-tours/hanoi-tours/",

  // Multi-day Vietnam tours - redirect to main packages page
  "https://www.asiatouradvisor.com/northern-vietnam-5-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/vietnam-6-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/northern-vietnam-7-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/perfect-vietnam-7-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/southern-vietnam-7-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/north-vietnam-adventure-7-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/vietnam-introduction-8-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/vietnam-discovery-8-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/essential-vietnam-9-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",
  "https://www.asiatouradvisor.com/scenic-vietnam-10-days/": "https://www.asiatouradvisor.com/vietnam-tours/simply-vietnam-10-days/",
  "https://www.asiatouradvisor.com/essence-vietnam-10-days/": "https://www.asiatouradvisor.com/vietnam-tours/simply-vietnam-10-days/",
  "https://www.asiatouradvisor.com/vietnam-luxury-10-days/": "https://www.asiatouradvisor.com/vietnam-tours/vietnam-culinary-discovery/",
  "https://www.asiatouradvisor.com/vietnam-complete-12-days/": "https://www.asiatouradvisor.com/vietnam-tours/vietnam-discovery-12-days/",
  "https://www.asiatouradvisor.com/discovery-north-east-13-days/": "https://www.asiatouradvisor.com/vietnam-tours/heart-of-vietnam-tour/",
  "https://www.asiatouradvisor.com/vietnam-insight-14-days/": "https://www.asiatouradvisor.com/vietnam-tours/ventures-through-vietnam/",
  "https://www.asiatouradvisor.com/amazing-vietnam-15-days/": "https://www.asiatouradvisor.com/vietnam-tours/package-tours/",

  // Vietnam & Cambodia combined tours - redirect to main page
  "https://www.asiatouradvisor.com/vietnam-cambodia-15-days/": "https://www.asiatouradvisor.com/vietnam-tours/",
  "https://www.asiatouradvisor.com/vietnam-cambodia-18-days/": "https://www.asiatouradvisor.com/vietnam-tours/",
  "https://www.asiatouradvisor.com/vietnam-cambodia-21-days/": "https://www.asiatouradvisor.com/vietnam-tours/",
  "https://www.asiatouradvisor.com/discover-vietnam-20-days/": "https://www.asiatouradvisor.com/vietnam-tours/authentic-vietnam/",
};

// Read tours-data.ts
let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
let updatedCount = 0;

for (const [oldUrl, newUrl] of Object.entries(urlMappings)) {
  if (content.includes(oldUrl)) {
    content = content.replace(oldUrl, newUrl);
    updatedCount++;
    console.log(`Updated: ${oldUrl.split('/').slice(-2, -1)[0]} -> ${newUrl.split('/').slice(-2, -1)[0]}`);
  }
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log(`\n=== URL Update Complete ===`);
console.log(`Total URLs updated: ${updatedCount}`);

// Verify remaining old URLs
const remainingOldUrls = content.match(/asiatouradvisor\.com\/[a-z0-9-]+\//g) || [];
const uniqueOldFormats = [...new Set(remainingOldUrls.filter(url => !url.includes('vietnam-tours/')))];
if (uniqueOldFormats.length > 0) {
  console.log(`\nRemaining old-format URLs (${uniqueOldFormats.length}):`);
  uniqueOldFormats.forEach(url => console.log(`  - ${url}`));
}
