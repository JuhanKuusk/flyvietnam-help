#!/usr/bin/env node

/**
 * Scrape missing tour data from BestPrice Travel
 * Uses playwright to fetch tour details
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_PATH = path.join(__dirname, 'tour-validation-report.json');
const OUTPUT_DIR = path.join(__dirname, 'tour-data-output');

// Load the validation report
const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));

// Get unique URLs to scrape
const urlsToScrape = new Set();
const tourMapping = {};

for (const tour of report.noScrapedData) {
  if (tour.url && tour.url.includes('bestpricetravel.com')) {
    urlsToScrape.add(tour.url);
    if (!tourMapping[tour.url]) {
      tourMapping[tour.url] = [];
    }
    tourMapping[tour.url].push(tour.id);
  }
}

console.log('='.repeat(60));
console.log('Missing Tour URLs to Scrape');
console.log('='.repeat(60));
console.log(`\nTotal unique URLs: ${urlsToScrape.size}`);
console.log(`\nURLs and their tour mappings:\n`);

let i = 1;
for (const url of urlsToScrape) {
  const slug = url.match(/\/([^\/]+)\.html$/)?.[1] || 'unknown';
  const existingFile = path.join(OUTPUT_DIR, `${slug}.json`);
  const exists = fs.existsSync(existingFile);

  console.log(`${i}. ${slug}`);
  console.log(`   URL: ${url}`);
  console.log(`   Scraped: ${exists ? 'YES' : 'NO'}`);
  console.log(`   Tours using this URL: ${tourMapping[url].join(', ')}`);
  console.log('');
  i++;
}

// Check for obvious mismatches
console.log('='.repeat(60));
console.log('POTENTIAL MISMATCHES (tour ID vs URL slug)');
console.log('='.repeat(60));
console.log('');

for (const tour of report.noScrapedData) {
  const slug = tour.slug || '';
  const urlSlug = tour.url?.match(/\/([^\/]+)\.html$/)?.[1] || '';

  // Check if the tour ID/name seems very different from the URL
  const tourWords = tour.id.toLowerCase().replace(/-/g, ' ').split(' ');
  const urlWords = urlSlug.toLowerCase().replace(/-/g, ' ').split(' ');

  // Count matching words
  const matchingWords = tourWords.filter(w => urlWords.includes(w) && w.length > 2).length;
  const similarity = matchingWords / Math.max(tourWords.length, 1);

  if (similarity < 0.3) {
    console.log(`MISMATCH: ${tour.id}`);
    console.log(`  Our tour: ${tour.id}`);
    console.log(`  URL slug: ${urlSlug}`);
    console.log(`  Similarity: ${(similarity * 100).toFixed(0)}%`);
    console.log('');
  }
}

// Save URLs to scrape
const urlList = Array.from(urlsToScrape);
fs.writeFileSync(
  path.join(__dirname, 'urls-to-scrape.json'),
  JSON.stringify({ urls: urlList, mapping: tourMapping }, null, 2)
);

console.log(`\nSaved URL list to: scripts/urls-to-scrape.json`);
