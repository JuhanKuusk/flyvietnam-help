#!/usr/bin/env node
/**
 * Scrape only the missing tour URLs from bestpricetravel.com
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'tour-data-output');
const URLS_FILE = path.join(__dirname, 'urls-to-scrape.json');

const DELAY_BETWEEN_REQUESTS = 2000;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load URLs to scrape
const { urls } = JSON.parse(fs.readFileSync(URLS_FILE, 'utf-8'));

console.log(`\nScraping ${urls.length} missing tour URLs...\n`);

async function scrapeTourPage(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1000);

    const data = await page.evaluate(() => {
      const getText = (selector) => document.querySelector(selector)?.textContent?.trim() || '';
      const getAll = (selector) => Array.from(document.querySelectorAll(selector)).map(el => el.textContent?.trim()).filter(Boolean);

      // Get name
      const name = getText('h1') || getText('.tour-title');

      // Get rating
      const ratingEl = document.querySelector('.rating-star .value, .rating-value, [class*="rating"] .value');
      const rating = ratingEl ? parseFloat(ratingEl.textContent) : null;

      // Get review count
      const reviewText = document.querySelector('.review-count, .reviews-count, [class*="review"]')?.textContent || '';
      const reviewMatch = reviewText.match(/(\d+)/);
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : null;

      // Get duration
      const duration = getText('.duration, .tour-duration, [class*="duration"]');

      // Get highlights
      const highlights = getAll('.highlight-item, .highlights li, .tour-highlight');

      // Get itinerary
      const itinerary = [];
      document.querySelectorAll('.itinerary-day, .day-item, [class*="itinerary"] .day').forEach((dayEl, i) => {
        const title = dayEl.querySelector('.day-title, h3, h4')?.textContent?.trim() || '';
        const desc = dayEl.querySelector('.day-description, .day-content, p')?.textContent?.trim() || '';
        const meals = getAll.call(null, '.meal, .meals li');
        const images = Array.from(dayEl.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('cloudfront'));

        itinerary.push({
          day: i + 1,
          title,
          description: desc,
          meals,
          dayImages: images
        });
      });

      // Get all images
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => src && src.includes('cloudfront') && !src.includes('dcma'));

      // Get included/excluded
      const included = getAll('.included li, .inclusions li, [class*="include"] li');
      const excluded = getAll('.excluded li, .exclusions li, [class*="exclude"] li');

      // Get pricing tiers
      const pricingTiers = [];
      document.querySelectorAll('.price-tier, .pricing-row, [class*="price"] tr').forEach(row => {
        const category = row.querySelector('.tier-name, td:first-child')?.textContent?.trim();
        const priceText = row.querySelector('.tier-price, td:last-child')?.textContent?.trim();
        const priceMatch = priceText?.match(/\$?([\d,]+)/);
        if (category && priceMatch) {
          pricingTiers.push({
            category,
            price: parseInt(priceMatch[1].replace(',', ''))
          });
        }
      });

      return {
        name,
        rating,
        reviewCount,
        duration,
        highlights,
        itinerary,
        images: [...new Set(images)],
        included,
        excluded,
        pricingTiers
      };
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const results = { scraped: [], failed: [] };

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const slug = url.match(/\/([^\/]+)\.html$/)?.[1] || 'unknown';
    const outputFile = path.join(OUTPUT_DIR, `${slug}.json`);

    // Skip if already scraped
    if (fs.existsSync(outputFile)) {
      console.log(`[${i + 1}/${urls.length}] SKIP: ${slug} (already exists)`);
      continue;
    }

    console.log(`[${i + 1}/${urls.length}] Scraping: ${slug}`);

    const result = await scrapeTourPage(page, url);

    if (result.success) {
      const tourData = {
        sourceUrl: url,
        fetchedAt: new Date().toISOString(),
        ...result.data
      };

      fs.writeFileSync(outputFile, JSON.stringify(tourData, null, 2));
      results.scraped.push({ url, slug });
      console.log(`  ✓ Saved: ${slug}.json`);
    } else {
      results.failed.push({ url, slug, error: result.error });
      console.log(`  ✗ Failed: ${result.error}`);
    }

    await sleep(DELAY_BETWEEN_REQUESTS);
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('SCRAPING COMPLETE');
  console.log('='.repeat(60));
  console.log(`Scraped: ${results.scraped.length}`);
  console.log(`Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed URLs:');
    results.failed.forEach(f => console.log(`  - ${f.slug}: ${f.error}`));
  }
}

main().catch(console.error);
