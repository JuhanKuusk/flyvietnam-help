import { chromium } from 'playwright';
import fs from 'fs';

// Cruise tours that need galleries
const cruiseTours = [
  { slug: 'halong-day-trip-sung-sot-titop', type: 'halong', searchTerm: 'halong bay day trip' },
  { slug: 'serenity-cruise-2-days-1-night', type: 'halong', searchTerm: 'serenity cruise halong' },
  { slug: 'lan-ha-bay-luxury-day-tour', type: 'halong', searchTerm: 'lan ha bay cruise' },
  { slug: 'renea-cruise-2-days-1-night', type: 'halong', searchTerm: 'renea cruise halong' },
  { slug: 'mekong-eyes-cruise-2-days', type: 'mekong', searchTerm: 'mekong eyes cruise' },
  { slug: 'mekong-eyes-cruise-3-days', type: 'mekong', searchTerm: 'mekong eyes cruise' },
  { slug: 'gecko-eyes-cruise-2-days', type: 'mekong', searchTerm: 'gecko eyes cruise mekong' },
  { slug: 'cambodia-vietnam-cruise-3-days', type: 'mekong', searchTerm: 'mekong cruise cambodia' },
];

// BestPrice cruise URLs to scrape for images
const cruiseUrls = {
  halong: [
    'https://www.bestpricetravel.com/halong-bay-cruises/mon-cheri-cruise.html',
    'https://www.bestpricetravel.com/halong-bay-cruises/ambassador-signature-cruise.html',
    'https://www.bestpricetravel.com/halong-bay-cruises/capella-cruise.html',
  ],
  mekong: [
    'https://www.bestpricetravel.com/mekong-delta-cruises/mekong-eyes-classic-cruise.html',
    'https://www.bestpricetravel.com/mekong-delta-cruises/mekong-eyes-explorer-cruise.html',
    'https://www.bestpricetravel.com/mekong-delta-cruises/victoria-mekong-cruise.html',
  ]
};

async function scrapeImages(page, url) {
  console.log(`Scraping: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const images = await page.evaluate(() => {
      const imgs = new Set();
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset.src || img.dataset.lazySrc;
        if (src && src.includes('cloudfront.net') &&
            (src.includes('800_450') || src.includes('544_306')) &&
            !src.includes('dcma.png') &&
            !src.includes('/review/')) {
          imgs.add(src);
        }
      });
      return Array.from(imgs);
    });

    return images;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return [];
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // Scrape cruise images
  const cruiseImages = { halong: [], mekong: [] };

  for (const [type, urls] of Object.entries(cruiseUrls)) {
    for (const url of urls) {
      const images = await scrapeImages(page, url);
      cruiseImages[type].push(...images);
      await page.waitForTimeout(1000);
    }
    // Dedupe
    cruiseImages[type] = [...new Set(cruiseImages[type])];
    console.log(`${type} images: ${cruiseImages[type].length}`);
  }

  await browser.close();

  // Update tours-data.ts
  let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
  let updatedCount = 0;

  for (const tour of cruiseTours) {
    const images = cruiseImages[tour.type] || [];
    if (images.length < 5) {
      console.log(`SKIP: ${tour.slug} - not enough ${tour.type} images`);
      continue;
    }

    // Select random subset
    const shuffled = images.sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 12);

    // Find the tour
    const slugIndex = content.indexOf(`slug: "${tour.slug}"`);
    if (slugIndex === -1) {
      console.log(`NOT FOUND: ${tour.slug}`);
      continue;
    }

    // Find next tour
    const nextTourMatch = content.slice(slugIndex + 50).match(/\n  \{[\s\n]+id:/);
    const tourEndIndex = nextTourMatch ? slugIndex + 50 + nextTourMatch.index : content.length;
    const tourSection = content.slice(slugIndex, tourEndIndex);

    // Skip if already has gallery
    if (tourSection.includes('imageGallery:')) {
      console.log(`SKIP: ${tour.slug} - already has gallery`);
      continue;
    }

    // Find insertion point
    let insertMatch = tourSection.match(/itinerary:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) insertMatch = tourSection.match(/excluded:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) insertMatch = tourSection.match(/included:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) {
      console.log(`NO INSERTION POINT: ${tour.slug}`);
      continue;
    }

    const galleryCode = `\n    imageGallery: [\n      ${selectedImages.map(i => `"${i}"`).join(',\n      ')}\n    ],`;
    const insertPosition = slugIndex + insertMatch.index + insertMatch[0].length;

    content = content.slice(0, insertPosition) + galleryCode + content.slice(insertPosition);
    updatedCount++;
    console.log(`Updated: ${tour.slug}`);
  }

  fs.writeFileSync('src/lib/tours-data.ts', content);
  console.log(`\n=== COMPLETE ===`);
  console.log(`Tours updated: ${updatedCount}`);
}

main().catch(console.error);
