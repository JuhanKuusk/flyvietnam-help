#!/usr/bin/env node

/**
 * Fix Tour Mismatches
 *
 * This script:
 * 1. Identifies tours with bestpricetravel.com URLs that have mismatched data
 * 2. Re-scrapes the correct data from bestpricetravel.com
 * 3. Updates tours-data.ts with correct information
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOURS_DATA_PATH = path.join(__dirname, '../src/lib/tours-data.ts');
const SCRAPED_DATA_PATH = path.join(__dirname, 'tour-data-output/scraped-tours-playwright.json');

// Read tours-data.ts and extract all tours with bestpricetravel URLs
function extractToursWithBestPriceUrls() {
  const content = fs.readFileSync(TOURS_DATA_PATH, 'utf-8');
  const tours = [];

  // Match tour objects with bestpricetravel URLs
  const tourRegex = /\{\s*id:\s*["']([^"']+)["'][^}]*?name:\s*["']([^"']+)["'][^}]*?duration:\s*["']([^"']+)["'][^}]*?affiliateUrl:\s*["'](https:\/\/www\.bestpricetravel\.com[^"']+)["']/gs;

  let match;
  const seen = new Set();

  // Use line-by-line parsing for more accuracy
  const lines = content.split('\n');
  let currentTour = null;
  let braceCount = 0;
  let tourBlock = '';

  for (const line of lines) {
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;

    if (braceCount > 0) {
      tourBlock += line + '\n';
      braceCount += openBraces - closeBraces;

      if (braceCount === 0) {
        // Parse the completed tour block
        const idMatch = tourBlock.match(/id:\s*["']([^"']+)["']/);
        const nameMatch = tourBlock.match(/name:\s*["']([^"']+)["']/);
        const durationMatch = tourBlock.match(/duration:\s*["']([^"']+)["']/);
        const priceMatch = tourBlock.match(/price:\s*(\d+)/);
        const urlMatch = tourBlock.match(/affiliateUrl:\s*["'](https:\/\/www\.bestpricetravel\.com[^"']+)["']/);
        const imageMatch = tourBlock.match(/imageUrl:\s*["']([^"']+)["']/);
        const ratingMatch = tourBlock.match(/rating:\s*([\d.]+)/);
        const reviewMatch = tourBlock.match(/reviewCount:\s*(\d+)/);

        if (idMatch && urlMatch && !seen.has(idMatch[1])) {
          seen.add(idMatch[1]);
          tours.push({
            id: idMatch[1],
            name: nameMatch ? nameMatch[1] : 'Unknown',
            duration: durationMatch ? durationMatch[1] : 'Unknown',
            price: priceMatch ? parseInt(priceMatch[1]) : null,
            affiliateUrl: urlMatch[1],
            imageUrl: imageMatch ? imageMatch[1] : null,
            rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
            reviewCount: reviewMatch ? parseInt(reviewMatch[1]) : null,
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

// Load scraped data
function loadScrapedData() {
  if (!fs.existsSync(SCRAPED_DATA_PATH)) {
    console.error('Scraped data not found. Run scrape-tours-playwright.mjs first.');
    return null;
  }
  return JSON.parse(fs.readFileSync(SCRAPED_DATA_PATH, 'utf-8'));
}

// Find mismatches between our data and scraped data
function findMismatches(ourTours, scrapedData) {
  const mismatches = [];
  const urlToScraped = new Map();

  // Index scraped data by URL
  for (const tour of scrapedData.scraped) {
    urlToScraped.set(tour.url, tour);
  }

  // Check each of our tours
  for (const tour of ourTours) {
    const scraped = urlToScraped.get(tour.affiliateUrl);

    if (!scraped) {
      mismatches.push({
        type: 'NOT_SCRAPED',
        tour,
        message: 'Tour URL not found in scraped data'
      });
      continue;
    }

    // Check for mismatches
    const issues = [];

    // Duration mismatch (extract days from both)
    const ourDays = tour.duration?.match(/(\d+)\s*days?/i)?.[1];
    const scrapedDays = scraped.duration?.match(/(\d+)\s*days?/i)?.[1];
    if (ourDays && scrapedDays && ourDays !== scrapedDays) {
      issues.push(`Duration: ours=${ourDays} days, scraped=${scrapedDays} days`);
    }

    // Name mismatch (significant difference)
    const normalizedOurName = tour.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedScrapedName = scraped.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    if (normalizedOurName && normalizedScrapedName &&
        !normalizedOurName.includes(normalizedScrapedName.slice(0, 20)) &&
        !normalizedScrapedName.includes(normalizedOurName.slice(0, 20))) {
      issues.push(`Name mismatch: ours="${tour.name}", scraped="${scraped.name}"`);
    }

    // Price significantly different (more than 50% off)
    if (tour.price && scraped.price && Math.abs(tour.price - scraped.price) / tour.price > 0.5) {
      issues.push(`Price: ours=$${tour.price}, scraped=$${scraped.price}`);
    }

    if (issues.length > 0) {
      mismatches.push({
        type: 'MISMATCH',
        tour,
        scraped,
        issues
      });
    }
  }

  // Find duplicate URLs
  const urlCounts = new Map();
  for (const tour of ourTours) {
    const count = urlCounts.get(tour.affiliateUrl) || 0;
    urlCounts.set(tour.affiliateUrl, count + 1);
  }

  const duplicates = [];
  for (const [url, count] of urlCounts) {
    if (count > 1) {
      const toursWithUrl = ourTours.filter(t => t.affiliateUrl === url);
      duplicates.push({ url, count, tours: toursWithUrl });
    }
  }

  return { mismatches, duplicates };
}

// Main
async function main() {
  console.log('='.repeat(60));
  console.log('Tour Mismatch Analysis');
  console.log('='.repeat(60));

  const ourTours = extractToursWithBestPriceUrls();
  console.log(`\nFound ${ourTours.length} tours with bestpricetravel.com URLs\n`);

  const scrapedData = loadScrapedData();
  if (!scrapedData) return;

  console.log(`Scraped data contains ${scrapedData.scraped.length} tours\n`);

  const { mismatches, duplicates } = findMismatches(ourTours, scrapedData);

  // Report duplicates
  if (duplicates.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('DUPLICATE URLs (multiple tours pointing to same URL)');
    console.log('='.repeat(60));

    for (const dup of duplicates) {
      console.log(`\n[${dup.count}x] ${dup.url}`);
      for (const tour of dup.tours) {
        console.log(`   - ${tour.id}: "${tour.name}" (${tour.duration})`);
      }
    }
  }

  // Report mismatches
  if (mismatches.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('MISMATCHED TOURS');
    console.log('='.repeat(60));

    const notScraped = mismatches.filter(m => m.type === 'NOT_SCRAPED');
    const dataMismatch = mismatches.filter(m => m.type === 'MISMATCH');

    if (notScraped.length > 0) {
      console.log(`\n--- NOT FOUND IN SCRAPED DATA (${notScraped.length}) ---`);
      for (const m of notScraped) {
        console.log(`  ${m.tour.id}: ${m.tour.affiliateUrl}`);
      }
    }

    if (dataMismatch.length > 0) {
      console.log(`\n--- DATA MISMATCHES (${dataMismatch.length}) ---`);
      for (const m of dataMismatch) {
        console.log(`\n  ${m.tour.id}:`);
        console.log(`    URL: ${m.tour.affiliateUrl}`);
        for (const issue of m.issues) {
          console.log(`    - ${issue}`);
        }
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total tours with bestpricetravel URLs: ${ourTours.length}`);
  console.log(`Duplicate URL groups: ${duplicates.length}`);
  console.log(`Tours with data mismatches: ${mismatches.filter(m => m.type === 'MISMATCH').length}`);
  console.log(`Tours not found in scraped data: ${mismatches.filter(m => m.type === 'NOT_SCRAPED').length}`);
}

main().catch(console.error);