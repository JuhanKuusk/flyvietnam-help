#!/usr/bin/env node

/**
 * Find Correct BestPrice URLs for Mismatched Tours
 *
 * Uses Playwright to search bestpricetravel.com and find correct URLs
 * for tours that have duration/name mismatches.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALIDATION_RESULTS = path.join(__dirname, 'tour-data-output/url-validation-results.json');
const OUTPUT_PATH = path.join(__dirname, 'tour-data-output/url-corrections.json');
const TOURS_DATA_PATH = path.join(__dirname, '../src/lib/tours-data.ts');

// Load validation results
function loadValidationResults() {
  if (!fs.existsSync(VALIDATION_RESULTS)) {
    console.error('Run validate-bestprice-urls.mjs first');
    return null;
  }
  return JSON.parse(fs.readFileSync(VALIDATION_RESULTS, 'utf-8'));
}

// Extract duration in days from string
function extractDays(str) {
  if (!str) return null;
  const match = str.match(/(\d+)\s*days?/i);
  return match ? parseInt(match[1]) : null;
}

// Search bestpricetravel.com for a tour
async function searchForTour(page, tourName, targetDays) {
  // Clean up the tour name for better search
  const searchTerms = tourName
    .replace(/['"]/g, '')
    .replace(/\d+\s*days?/i, '')  // Remove day count
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 2 && !['tour', 'the', 'and', 'for', 'with'].includes(w.toLowerCase()))
    .slice(0, 4)  // Take first 4 meaningful words
    .join(' ');

  if (!searchTerms) {
    return null;
  }

  const searchUrl = `https://www.bestpricetravel.com/search?q=${encodeURIComponent(searchTerms)}`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Get all search results
    const results = await page.evaluate(() => {
      const items = [];

      // Look for tour links
      document.querySelectorAll('a[href*=".html"]').forEach(a => {
        if (a.href.includes('-tours/') && !a.href.includes('?')) {
          const text = a.textContent?.trim() || '';
          if (text && text.length > 10 && !items.some(i => i.url === a.href)) {
            items.push({
              url: a.href,
              title: text,
            });
          }
        }
      });

      return items.slice(0, 20);  // Return top 20 results
    });

    // Score results based on match quality
    const scored = results.map(r => {
      let score = 0;
      const normalizedTitle = r.title.toLowerCase();
      const normalizedName = tourName.toLowerCase();

      // Check keyword matches
      const keywords = normalizedName.split(/\s+/).filter(w => w.length > 2);
      keywords.forEach(kw => {
        if (normalizedTitle.includes(kw)) score += 10;
      });

      // Check duration match
      const resultDays = extractDays(r.title);
      if (resultDays && targetDays) {
        if (resultDays === targetDays) {
          score += 30;
        } else if (Math.abs(resultDays - targetDays) === 1) {
          score += 15;
        }
      }

      // Location matches
      const locations = ['hanoi', 'halong', 'sapa', 'hue', 'hoi an', 'saigon', 'ho chi minh', 'mekong', 'phu quoc', 'danang', 'nha trang', 'dalat', 'mui ne', 'phong nha', 'ha giang', 'ninh binh', 'cu chi', 'angkor', 'cambodia'];
      locations.forEach(loc => {
        if (normalizedName.includes(loc) && normalizedTitle.includes(loc)) {
          score += 20;
        }
      });

      // Type matches
      const types = ['cruise', 'cycling', 'trek', 'bike', 'food', 'culinary', 'luxury', 'budget', 'family', 'honeymoon', 'photo', 'war', 'dmz', 'wellness', 'golf', 'beach'];
      types.forEach(type => {
        if (normalizedName.includes(type) && normalizedTitle.includes(type)) {
          score += 25;
        }
      });

      return { ...r, score };
    });

    // Sort by score and return best match above threshold
    scored.sort((a, b) => b.score - a.score);

    if (scored[0]?.score >= 30) {
      return scored[0];
    }

    return null;
  } catch (error) {
    console.error(`  Search error: ${error.message}`);
    return null;
  }
}

// Alternative: browse category pages to find matching tour
async function findInCategory(page, tourName, targetDays) {
  const normalizedName = tourName.toLowerCase();

  // Determine likely category
  let categoryUrl = 'https://www.bestpricetravel.com/vietnam-tours.html';

  if (normalizedName.includes('halong') || normalizedName.includes('cruise')) {
    categoryUrl = 'https://www.bestpricetravel.com/halong-bay-tours.html';
  } else if (normalizedName.includes('sapa')) {
    categoryUrl = 'https://www.bestpricetravel.com/sapa-tours.html';
  } else if (normalizedName.includes('mekong')) {
    categoryUrl = 'https://www.bestpricetravel.com/mekong-delta-tours.html';
  } else if (normalizedName.includes('hoi an')) {
    categoryUrl = 'https://www.bestpricetravel.com/hoi-an-tours.html';
  } else if (normalizedName.includes('ha giang')) {
    categoryUrl = 'https://www.bestpricetravel.com/ha-giang-tours.html';
  } else if (normalizedName.includes('phu quoc')) {
    categoryUrl = 'https://www.bestpricetravel.com/phu-quoc-tours.html';
  } else if (normalizedName.includes('hue') || normalizedName.includes('dmz')) {
    categoryUrl = 'https://www.bestpricetravel.com/hue-tours.html';
  } else if (normalizedName.includes('hanoi')) {
    categoryUrl = 'https://www.bestpricetravel.com/hanoi-tours.html';
  } else if (normalizedName.includes('saigon') || normalizedName.includes('ho chi minh') || normalizedName.includes('hcmc')) {
    categoryUrl = 'https://www.bestpricetravel.com/ho-chi-minh-city-tours.html';
  } else if (normalizedName.includes('cambodia') || normalizedName.includes('angkor') || normalizedName.includes('indochina')) {
    categoryUrl = 'https://www.bestpricetravel.com/indochina-tours.html';
  }

  try {
    await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);

    // Scroll to load more
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(300);
    }

    const results = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('a[href*="-tours/"][href$=".html"]').forEach(a => {
        if (!items.some(i => i.url === a.href)) {
          items.push({
            url: a.href,
            title: a.textContent?.trim() || '',
          });
        }
      });
      return items;
    });

    // Score and find best match
    const scored = results.map(r => {
      let score = 0;
      const normalizedTitle = r.title.toLowerCase();

      // Keywords
      const keywords = normalizedName.split(/\s+/).filter(w => w.length > 2);
      keywords.forEach(kw => {
        if (normalizedTitle.includes(kw)) score += 10;
      });

      // Duration
      const resultDays = extractDays(r.title);
      if (resultDays && targetDays && resultDays === targetDays) {
        score += 30;
      }

      return { ...r, score };
    });

    scored.sort((a, b) => b.score - a.score);

    if (scored[0]?.score >= 25) {
      return scored[0];
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Finding Correct URLs for Mismatched Tours');
  console.log('='.repeat(60));

  const validation = loadValidationResults();
  if (!validation) return;

  const mismatched = validation.mismatch || [];
  console.log(`\nFound ${mismatched.length} tours with mismatched URLs\n`);

  if (mismatched.length === 0) {
    console.log('No mismatched tours to fix!');
    return;
  }

  // Launch browser
  console.log('Launching browser...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const corrections = [];
  const noMatch = [];
  let processed = 0;

  try {
    for (const tour of mismatched) {
      processed++;
      const targetDays = extractDays(tour.duration);
      console.log(`[${processed}/${mismatched.length}] ${tour.id}`);
      console.log(`  Searching for: "${tour.name}" (${targetDays || '?'} days)`);

      // Try search first
      let match = await searchForTour(page, tour.name, targetDays);

      // If no match from search, try category browsing
      if (!match) {
        match = await findInCategory(page, tour.name, targetDays);
      }

      if (match && match.url !== tour.url) {
        console.log(`  FOUND: ${match.url} (score: ${match.score})`);
        corrections.push({
          id: tour.id,
          name: tour.name,
          duration: tour.duration,
          oldUrl: tour.url,
          newUrl: match.url,
          matchTitle: match.title,
          matchScore: match.score,
        });
      } else if (match && match.url === tour.url) {
        console.log(`  URL unchanged (current URL is best match)`);
      } else {
        console.log(`  NO MATCH FOUND`);
        noMatch.push({
          id: tour.id,
          name: tour.name,
          duration: tour.duration,
          currentUrl: tour.url,
        });
      }

      // Small delay between requests
      await page.waitForTimeout(500);
    }
  } finally {
    await browser.close();
  }

  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalMismatched: mismatched.length,
      correctionsFound: corrections.length,
      noMatchFound: noMatch.length,
    },
    corrections,
    noMatch,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total mismatched tours: ${mismatched.length}`);
  console.log(`Corrections found: ${corrections.length}`);
  console.log(`No match found: ${noMatch.length}`);
  console.log(`\nResults saved to: ${OUTPUT_PATH}`);

  if (corrections.length > 0) {
    console.log('\n--- CORRECTIONS TO APPLY ---');
    for (const c of corrections) {
      console.log(`\n${c.id}:`);
      console.log(`  OLD: ${c.oldUrl}`);
      console.log(`  NEW: ${c.newUrl}`);
    }
  }
}

main().catch(console.error);
