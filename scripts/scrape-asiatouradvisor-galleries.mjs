import { chromium } from 'playwright';
import fs from 'fs';

// Map old URLs to new URL structure
const urlMappings = {
  'halong-bay-2-days-1-night-cruise': 'package-tours',
  'halong-bay-luxury-cruise': 'package-tours',
  'lan-ha-bay-2-days-1-night': 'package-tours',
  'bai-tu-long-bay-cruise': 'package-tours',
  'sapa-trekking': 'sapa-tours',
  'hanoi-city-tour': 'hanoi-tours',
  'hanoi-3-days': 'hanoi-tours',
  'hanoi-4-days': 'hanoi-tours',
  'mekong-delta-4-days': 'mekong-delta-tours',
  'mekong-delta-3-days': 'mekong-delta-tours',
  'ben-tre-day-trip': 'ben-tre-tours',
  'mekong-cycling': 'mekong-delta-tours',
  'ben-tre-day': 'ben-tre-tours',
  'sapa-muong-hoa-valley': 'sapa-tours',
  'sapa-off-beaten-track': 'sapa-tours',
  'northern-vietnam-5-days': 'package-tours',
  'hanoi-halong-4-days': 'hanoi-tours',
  'hanoi-halong-3-days': 'hanoi-tours',
  'phu-quoc-3-days': 'phu-quoc-tours',
  'phu-quoc-diving': 'phu-quoc-tours',
  'ho-chi-minh-mekong-4-days': 'ho-chi-minh-tours',
  'vietnam-6-days': 'package-tours',
  'northern-vietnam-7-days': 'package-tours',
  'vietnam-introduction-8-days': 'package-tours',
  'amazing-vietnam-15-days': 'package-tours',
  'vietnam-cambodia-15-days': 'package-tours',
  'vietnam-cambodia-18-days': 'package-tours',
  'vietnam-cambodia-21-days': 'package-tours',
  'hanoi-sapa-6-days': 'sapa-tours',
  'essential-vietnam-9-days': 'package-tours',
  'central-vietnam-7-days': 'hoi-an-tours',
  'southern-vietnam-7-days': 'package-tours',
  'perfect-vietnam-7-days': 'package-tours',
  'vietnam-discovery-8-days': 'package-tours',
  'hanoi-ninh-binh-halong-5-days': 'hanoi-tours',
};

// Category pages to scrape for images
const categoryPages = [
  'package-tours',
  'hanoi-tours',
  'sapa-tours',
  'mekong-delta-tours',
  'ben-tre-tours',
  'phu-quoc-tours',
  'ho-chi-minh-tours',
  'hoi-an-tours',
  'da-nang-tours',
  'hue-tours',
];

async function scrapeCategory(page, category) {
  const url = `https://www.asiatouradvisor.com/vietnam-tours/${category}/`;
  console.log(`Scraping category: ${category}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const images = await page.evaluate(() => {
      const imgs = new Set();
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset.src;
        if (src &&
            (src.includes('asiatouradvisor') || src.includes('cloudfront') || src.includes('amazonaws')) &&
            src.match(/\.(jpg|jpeg|png|webp)/i) &&
            !src.includes('flag') &&
            !src.includes('icon') &&
            !src.includes('logo') &&
            !src.includes('avatar') &&
            !src.includes('payment') &&
            !src.includes('tripadvisor') &&
            !src.includes('wta') &&
            !src.includes('live-chat') &&
            !src.includes('GB.webp') &&
            !src.includes('FR.webp') &&
            !src.includes('ES.webp') &&
            !src.includes('DE.webp') &&
            !src.includes('IT.webp')) {
          imgs.add(src);
        }
      });
      return Array.from(imgs);
    });

    console.log(`  Found ${images.length} images`);
    return images;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return [];
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Scrape all category pages
  const categoryImages = {};
  for (const category of categoryPages) {
    categoryImages[category] = await scrapeCategory(page, category);
    await page.waitForTimeout(1500);
  }

  await browser.close();

  // Save category images
  fs.writeFileSync('scripts/asiatouradvisor-category-images.json', JSON.stringify(categoryImages, null, 2));

  // Now assign images to tours based on their category
  let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
  const tourRegex = /slug:\s*["']([^"']+)["']/g;
  let match;
  const toursToUpdate = [];

  while ((match = tourRegex.exec(content)) !== null) {
    const slug = match[1];
    const startIdx = match.index;

    const nextSlugMatch = content.slice(startIdx + 20).match(/slug:\s*["']/);
    const endIdx = nextSlugMatch ? startIdx + 20 + nextSlugMatch.index : content.length;
    const tourSection = content.slice(startIdx, endIdx);

    const affiliateMatch = tourSection.match(/affiliateUrl:\s*["']([^"']+)["']/);
    const affiliateUrl = affiliateMatch ? affiliateMatch[1] : "";

    if (affiliateUrl.includes("asiatouradvisor.com") && !tourSection.includes("imageGallery:")) {
      // Extract old URL slug
      const oldSlugMatch = affiliateUrl.match(/asiatouradvisor\.com\/([^/]+)\/?$/);
      if (oldSlugMatch) {
        const oldSlug = oldSlugMatch[1];
        const category = urlMappings[oldSlug] || 'package-tours';
        toursToUpdate.push({ slug, oldSlug, category, startIdx });
      }
    }
  }

  console.log(`\nFound ${toursToUpdate.length} tours to update`);

  // Sort by startIdx descending
  toursToUpdate.sort((a, b) => b.startIdx - a.startIdx);

  let updatedCount = 0;

  for (const tour of toursToUpdate) {
    const images = categoryImages[tour.category] || categoryImages['package-tours'] || [];

    if (images.length < 5) {
      console.log(`SKIP: ${tour.slug} - not enough images for ${tour.category}`);
      continue;
    }

    // Select random subset of images for variety
    const shuffled = images.sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 12);

    // Find the tour in content
    const slugIndex = content.indexOf(`slug: "${tour.slug}"`);
    if (slugIndex === -1) continue;

    // Find next tour
    const nextTourMatch = content.slice(slugIndex + 50).match(/\n  \{[\s\n]+id:/);
    const tourEndIndex = nextTourMatch ? slugIndex + 50 + nextTourMatch.index : content.length;
    const tourSection = content.slice(slugIndex, tourEndIndex);

    // Skip if already has gallery
    if (tourSection.includes('imageGallery:')) continue;

    // Find insertion point
    let insertMatch = tourSection.match(/itinerary:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) insertMatch = tourSection.match(/excluded:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) insertMatch = tourSection.match(/included:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) continue;

    const galleryCode = `\n    imageGallery: [\n      ${selectedImages.map(i => `"${i}"`).join(',\n      ')}\n    ],`;
    const insertPosition = slugIndex + insertMatch.index + insertMatch[0].length;

    content = content.slice(0, insertPosition) + galleryCode + content.slice(insertPosition);
    updatedCount++;
    console.log(`Updated: ${tour.slug} (${tour.category})`);
  }

  fs.writeFileSync('src/lib/tours-data.ts', content);
  console.log(`\n=== COMPLETE ===`);
  console.log(`Tours updated: ${updatedCount}`);
}

main().catch(console.error);
