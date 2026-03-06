import { chromium } from 'playwright';
import fs from 'fs';

// Get missing BestPrice tours from tours-data.ts
const content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
const tourRegex = /slug:\s*["']([^"']+)["']/g;
let match;
const toursToScrape = [];
const seenUrls = new Set();

while ((match = tourRegex.exec(content)) !== null) {
  const slug = match[1];
  const startIdx = match.index;

  const nextSlugMatch = content.slice(startIdx + 20).match(/slug:\s*["']/);
  const endIdx = nextSlugMatch ? startIdx + 20 + nextSlugMatch.index : content.length;
  const tourSection = content.slice(startIdx, endIdx);

  const affiliateMatch = tourSection.match(/affiliateUrl:\s*["']([^"']+)["']/);
  const affiliateUrl = affiliateMatch ? affiliateMatch[1] : "";

  if (affiliateUrl.includes("bestpricetravel.com") && !tourSection.includes("imageGallery:")) {
    if (!seenUrls.has(affiliateUrl)) {
      seenUrls.add(affiliateUrl);
      toursToScrape.push({ slug, url: affiliateUrl });
    }
  }
}

console.log(`Found ${toursToScrape.length} unique BestPrice tours to scrape`);

async function scrapeTour(page, url) {
  console.log(`  Scraping: ${url}`);
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
      return Array.from(imgs).slice(0, 15);
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
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = {};

  for (let i = 0; i < toursToScrape.length; i++) {
    const tour = toursToScrape[i];
    console.log(`[${i + 1}/${toursToScrape.length}] ${tour.slug}`);

    const images = await scrapeTour(page, tour.url);
    if (images.length >= 3) {
      results[tour.slug] = images;
      console.log(`  Found ${images.length} images`);
    } else {
      console.log(`  Only ${images.length} images, skipping`);
    }

    await page.waitForTimeout(1000);
  }

  await browser.close();

  // Save results
  fs.writeFileSync('scripts/bestprice-gallery-images.json', JSON.stringify(results, null, 2));
  console.log(`\nSaved ${Object.keys(results).length} tours with images`);

  // Now update tours-data.ts
  let updatedContent = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
  let updatedCount = 0;

  for (const [slug, images] of Object.entries(results)) {
    // Find the tour
    const slugIndex = updatedContent.indexOf(`slug: "${slug}"`);
    if (slugIndex === -1) {
      const altIndex = updatedContent.indexOf(`slug: '${slug}'`);
      if (altIndex === -1) continue;
    }

    const searchStart = updatedContent.indexOf(`slug: "${slug}"`) !== -1
      ? updatedContent.indexOf(`slug: "${slug}"`)
      : updatedContent.indexOf(`slug: '${slug}'`);

    // Find next tour
    const nextTourMatch = updatedContent.slice(searchStart + 50).match(/\n  \{[\s\n]+id:/);
    const tourEndIndex = nextTourMatch
      ? searchStart + 50 + nextTourMatch.index
      : updatedContent.length;

    const tourSection = updatedContent.slice(searchStart, tourEndIndex);

    // Skip if already has gallery
    if (tourSection.includes('imageGallery:')) continue;

    // Find insertion point
    let insertMatch = tourSection.match(/itinerary:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) insertMatch = tourSection.match(/excluded:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) insertMatch = tourSection.match(/included:\s*\[[\s\S]*?\n    \],?/);
    if (!insertMatch) continue;

    const galleryCode = `\n    imageGallery: [\n      ${images.map(i => `"${i}"`).join(',\n      ')}\n    ],`;
    const insertPosition = searchStart + insertMatch.index + insertMatch[0].length;

    updatedContent = updatedContent.slice(0, insertPosition) + galleryCode + updatedContent.slice(insertPosition);
    updatedCount++;
    console.log(`Updated: ${slug}`);
  }

  fs.writeFileSync('src/lib/tours-data.ts', updatedContent);
  console.log(`\n=== COMPLETE ===`);
  console.log(`Tours updated: ${updatedCount}`);
}

main().catch(console.error);
