#!/usr/bin/env node

/**
 * Search BestPrice Travel for Correct Tour URLs
 *
 * This script:
 * 1. Reads all tours from tours-data.ts
 * 2. Searches bestpricetravel.com for matching tours by name
 * 3. Outputs a mapping of tour IDs to correct URLs
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOURS_DATA_PATH = path.join(__dirname, '../src/lib/tours-data.ts');
const OUTPUT_PATH = path.join(__dirname, 'tour-data-output/url-corrections.json');

// Extract all tours from tours-data.ts
function extractAllTours() {
  const content = fs.readFileSync(TOURS_DATA_PATH, 'utf-8');
  const tours = [];
  const seen = new Set();

  const lines = content.split('\n');
  let braceCount = 0;
  let tourBlock = '';

  for (const line of lines) {
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;

    if (braceCount > 0) {
      tourBlock += line + '\n';
      braceCount += openBraces - closeBraces;

      if (braceCount === 0) {
        const idMatch = tourBlock.match(/id:\s*["']([^"']+)["']/);
        const nameMatch = tourBlock.match(/name:\s*["']([^"']+)["']/);
        const durationMatch = tourBlock.match(/duration:\s*["']([^"']+)["']/);
        const urlMatch = tourBlock.match(/affiliateUrl:\s*["'](https:\/\/www\.bestpricetravel\.com[^"']+)["']/);
        const categoryMatch = tourBlock.match(/category:\s*["']([^"']+)["']/);

        if (idMatch && nameMatch && !seen.has(idMatch[1])) {
          seen.add(idMatch[1]);
          tours.push({
            id: idMatch[1],
            name: nameMatch[1],
            duration: durationMatch ? durationMatch[1] : null,
            currentUrl: urlMatch ? urlMatch[1] : null,
            category: categoryMatch ? categoryMatch[1] : null,
          });
        }
        tourBlock = '';
      }
    } else if (line.includes('id:') && line.includes('{')) {
      braceCount = openBraces - closeBraces;
      tourBlock = line + '\n';
    } else if (line.trim().startsWith('{') && !line.includes('//')) {
      braceCount = openBraces - closeBraces;
      tourBlock = line + '\n';
    }
  }

  return tours;
}

// Normalize tour name for comparison
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract duration in days from string
function extractDays(duration) {
  if (!duration) return null;
  const match = duration.match(/(\d+)\s*days?/i);
  return match ? parseInt(match[1]) : null;
}

// Search bestpricetravel.com for a tour
async function searchTour(page, tourName, tourDuration) {
  const searchQuery = tourName.replace(/['"]/g, '');
  const searchUrl = `https://www.bestpricetravel.com/search?q=${encodeURIComponent(searchQuery)}`;

  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get all search results
    const results = await page.evaluate(() => {
      const items = [];
      // Try different selectors for search results
      const selectors = [
        '.tour-item', '.search-result', '.product-item',
        '[class*="tour"]', '[class*="result"]', 'article'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => {
            const linkEl = el.querySelector('a[href*="/vietnam-tours/"], a[href*="-tours/"]');
            const titleEl = el.querySelector('h2, h3, h4, .title, [class*="title"]');
            const priceEl = el.querySelector('[class*="price"], .price');
            const durationEl = el.querySelector('[class*="duration"], .duration');

            if (linkEl) {
              items.push({
                url: linkEl.href,
                title: titleEl?.textContent?.trim() || linkEl.textContent?.trim() || '',
                price: priceEl?.textContent?.trim() || '',
                duration: durationEl?.textContent?.trim() || '',
              });
            }
          });
          if (items.length > 0) break;
        }
      }

      // Also try to get links directly
      if (items.length === 0) {
        document.querySelectorAll('a[href*="bestpricetravel.com"]').forEach(a => {
          if (a.href.includes('/vietnam-tours/') || a.href.includes('-tours/')) {
            items.push({
              url: a.href,
              title: a.textContent?.trim() || '',
              price: '',
              duration: '',
            });
          }
        });
      }

      return items;
    });

    return results;
  } catch (error) {
    console.error(`  Error searching: ${error.message}`);
    return [];
  }
}

// Browse category pages to find tours
async function browseCategoryPage(page, category) {
  const categoryUrls = {
    'multi-day': 'https://www.bestpricetravel.com/vietnam-tours.html',
    'day-tour': 'https://www.bestpricetravel.com/vietnam-day-tours.html',
    'cruise': 'https://www.bestpricetravel.com/halong-bay-tours.html',
    'sapa': 'https://www.bestpricetravel.com/sapa-tours.html',
    'mekong': 'https://www.bestpricetravel.com/mekong-delta-tours.html',
  };

  const url = categoryUrls[category] || categoryUrls['multi-day'];

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Scroll to load more content
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(500);
    }

    // Get all tour links
    const tours = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('a[href*=".html"]').forEach(a => {
        if (a.href.includes('/vietnam-tours/') ||
            a.href.includes('/halong-bay-tours/') ||
            a.href.includes('/sapa-tours/') ||
            a.href.includes('/mekong-delta-tours/') ||
            a.href.includes('/hoi-an-tours/') ||
            a.href.includes('/ho-chi-minh-city-tours/') ||
            a.href.includes('/hanoi-tours/') ||
            a.href.includes('/hue-tours/') ||
            a.href.includes('/phu-quoc-tours/') ||
            a.href.includes('/da-nang-tours/') ||
            a.href.includes('/ninh-binh-tours/') ||
            a.href.includes('/ha-giang-tours/') ||
            a.href.includes('/indochina-tours/')) {
          const title = a.textContent?.trim() || '';
          if (title && !items.some(i => i.url === a.href)) {
            items.push({
              url: a.href,
              title: title,
            });
          }
        }
      });
      return items;
    });

    return tours;
  } catch (error) {
    console.error(`  Error browsing category: ${error.message}`);
    return [];
  }
}

// Scrape all tour listings from bestpricetravel.com
async function scrapeAllTourListings(page) {
  console.log('\nScraping all tour listings from bestpricetravel.com...\n');

  const allTours = new Map();

  const categoryPages = [
    'https://www.bestpricetravel.com/vietnam-tours.html',
    'https://www.bestpricetravel.com/vietnam-tours.html?page=2',
    'https://www.bestpricetravel.com/vietnam-tours.html?page=3',
    'https://www.bestpricetravel.com/vietnam-tours.html?page=4',
    'https://www.bestpricetravel.com/vietnam-tours.html?page=5',
    'https://www.bestpricetravel.com/vietnam-day-tours.html',
    'https://www.bestpricetravel.com/halong-bay-tours.html',
    'https://www.bestpricetravel.com/sapa-tours.html',
    'https://www.bestpricetravel.com/mekong-delta-tours.html',
    'https://www.bestpricetravel.com/hoi-an-tours.html',
    'https://www.bestpricetravel.com/ho-chi-minh-city-tours.html',
    'https://www.bestpricetravel.com/hanoi-tours.html',
    'https://www.bestpricetravel.com/hue-tours.html',
    'https://www.bestpricetravel.com/phu-quoc-tours.html',
    'https://www.bestpricetravel.com/da-nang-tours.html',
    'https://www.bestpricetravel.com/ninh-binh-tours.html',
    'https://www.bestpricetravel.com/ha-giang-tours.html',
    'https://www.bestpricetravel.com/indochina-tours.html',
    'https://www.bestpricetravel.com/halong-sapa-tours.html',
  ];

  for (const pageUrl of categoryPages) {
    console.log(`  Scraping: ${pageUrl}`);
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500);

      // Scroll to load lazy content
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(300);
      }

      const tours = await page.evaluate(() => {
        const items = [];
        // Get all tour cards
        document.querySelectorAll('.tour-item, .product-item, [class*="tour-card"], article').forEach(card => {
          const link = card.querySelector('a[href*=".html"]');
          const title = card.querySelector('h2, h3, h4, .title, [class*="title"]');
          const duration = card.querySelector('[class*="duration"], .duration, [class*="day"]');
          const price = card.querySelector('[class*="price"], .price');

          if (link && link.href.includes('-tours/')) {
            items.push({
              url: link.href,
              title: title?.textContent?.trim() || link.textContent?.trim() || '',
              duration: duration?.textContent?.trim() || '',
              price: price?.textContent?.trim() || '',
            });
          }
        });

        // Also get standalone links
        document.querySelectorAll('a[href*="-tours/"][href$=".html"]').forEach(a => {
          if (!items.some(i => i.url === a.href)) {
            items.push({
              url: a.href,
              title: a.textContent?.trim() || '',
              duration: '',
              price: '',
            });
          }
        });

        return items;
      });

      tours.forEach(tour => {
        if (tour.url && tour.title && !allTours.has(tour.url)) {
          allTours.set(tour.url, tour);
        }
      });

      console.log(`    Found ${tours.length} tours (total unique: ${allTours.size})`);
    } catch (error) {
      console.error(`    Error: ${error.message}`);
    }
  }

  return Array.from(allTours.values());
}

// Find best matching URL for a tour
function findBestMatch(tour, availableTours) {
  const normalizedTourName = normalizeName(tour.name);
  const tourDays = extractDays(tour.duration);

  let bestMatch = null;
  let bestScore = 0;

  for (const available of availableTours) {
    const normalizedAvailableName = normalizeName(available.title);
    const availableDays = extractDays(available.duration);

    // Calculate similarity score
    let score = 0;

    // Check for keyword matches
    const tourWords = normalizedTourName.split(' ').filter(w => w.length > 2);
    const availableWords = normalizedAvailableName.split(' ').filter(w => w.length > 2);

    const matchingWords = tourWords.filter(w => availableWords.includes(w));
    score += matchingWords.length * 10;

    // Check for key location matches
    const locations = ['hanoi', 'saigon', 'hcmc', 'halong', 'sapa', 'hue', 'hoi an', 'hoian', 'mekong', 'phu quoc', 'phuquoc', 'da nang', 'danang', 'ninh binh', 'ninhbinh', 'ha giang', 'hagiang', 'cu chi', 'cuchi'];
    for (const loc of locations) {
      if (normalizedTourName.includes(loc) && normalizedAvailableName.includes(loc)) {
        score += 15;
      }
    }

    // Check for type matches
    const types = ['cruise', 'trek', 'bike', 'cycling', 'motorbike', 'food', 'culinary', 'luxury', 'budget', 'family', 'honeymoon', 'adventure', 'heritage', 'war', 'history'];
    for (const type of types) {
      if (normalizedTourName.includes(type) && normalizedAvailableName.includes(type)) {
        score += 20;
      }
    }

    // Duration match bonus
    if (tourDays && availableDays && tourDays === availableDays) {
      score += 25;
    } else if (tourDays && availableDays && Math.abs(tourDays - availableDays) <= 1) {
      score += 10;
    }

    // Penalize if duration is very different
    if (tourDays && availableDays && Math.abs(tourDays - availableDays) > 3) {
      score -= 15;
    }

    // Check for exact or near-exact name match
    if (normalizedTourName === normalizedAvailableName) {
      score += 100;
    } else if (normalizedAvailableName.includes(normalizedTourName) || normalizedTourName.includes(normalizedAvailableName)) {
      score += 30;
    }

    if (score > bestScore && score >= 30) {
      bestScore = score;
      bestMatch = { ...available, score };
    }
  }

  return bestMatch;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Search BestPrice Travel for Correct Tour URLs');
  console.log('='.repeat(60));

  // Extract our tours
  const ourTours = extractAllTours();
  const toursWithBestPrice = ourTours.filter(t => t.currentUrl);
  console.log(`\nFound ${ourTours.length} total tours`);
  console.log(`${toursWithBestPrice.length} have bestpricetravel.com URLs\n`);

  // Launch browser
  console.log('Launching browser...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    // Scrape all available tours from bestpricetravel.com
    const availableTours = await scrapeAllTourListings(page);
    console.log(`\nTotal unique tours found on bestpricetravel.com: ${availableTours.length}\n`);

    // Save available tours for reference
    const availableToursPath = path.join(__dirname, 'tour-data-output/bestprice-available-tours.json');
    fs.writeFileSync(availableToursPath, JSON.stringify(availableTours, null, 2));
    console.log(`Saved available tours to: ${availableToursPath}\n`);

    // Find matches for each of our tours
    const corrections = [];
    const noMatch = [];
    const goodMatch = [];

    console.log('Finding best matches for our tours...\n');

    for (const tour of toursWithBestPrice) {
      const match = findBestMatch(tour, availableTours);

      if (match) {
        if (match.url !== tour.currentUrl) {
          corrections.push({
            id: tour.id,
            name: tour.name,
            duration: tour.duration,
            currentUrl: tour.currentUrl,
            suggestedUrl: match.url,
            suggestedName: match.title,
            matchScore: match.score,
          });
          console.log(`[CORRECTION] ${tour.id}`);
          console.log(`  Current: ${tour.currentUrl}`);
          console.log(`  Suggested: ${match.url} (score: ${match.score})`);
        } else {
          goodMatch.push({
            id: tour.id,
            name: tour.name,
            url: tour.currentUrl,
          });
        }
      } else {
        noMatch.push({
          id: tour.id,
          name: tour.name,
          duration: tour.duration,
          currentUrl: tour.currentUrl,
        });
        console.log(`[NO MATCH] ${tour.id}: ${tour.name}`);
      }
    }

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTours: toursWithBestPrice.length,
        goodMatches: goodMatch.length,
        corrections: corrections.length,
        noMatch: noMatch.length,
      },
      corrections,
      noMatch,
      goodMatch,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tours with bestpricetravel URLs: ${toursWithBestPrice.length}`);
    console.log(`Good matches (URL already correct): ${goodMatch.length}`);
    console.log(`Corrections needed: ${corrections.length}`);
    console.log(`No match found: ${noMatch.length}`);
    console.log(`\nResults saved to: ${OUTPUT_PATH}`);

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
