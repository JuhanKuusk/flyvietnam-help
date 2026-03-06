#!/usr/bin/env node

/**
 * Validate BestPrice Travel URLs
 *
 * This script validates existing bestpricetravel.com URLs by:
 * 1. Making HEAD requests to check if URLs are valid
 * 2. Fetching the actual tour name/duration from valid pages
 * 3. Identifying mismatches between our data and actual page content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOURS_DATA_PATH = path.join(__dirname, '../src/lib/tours-data.ts');
const OUTPUT_DIR = path.join(__dirname, 'tour-data-output');

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
        const priceMatch = tourBlock.match(/price:\s*(\d+)/);

        if (idMatch && nameMatch && !seen.has(idMatch[1])) {
          seen.add(idMatch[1]);
          tours.push({
            id: idMatch[1],
            name: nameMatch[1],
            duration: durationMatch ? durationMatch[1] : null,
            currentUrl: urlMatch ? urlMatch[1] : null,
            price: priceMatch ? parseInt(priceMatch[1]) : null,
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

// Simple HTTP GET to fetch page content
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        resolve({ redirect: res.headers.location, statusCode: res.statusCode });
        return;
      }

      if (res.statusCode !== 200) {
        resolve({ error: `Status ${res.statusCode}`, statusCode: res.statusCode });
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, statusCode: 200 }));
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
  });
}

// Extract tour info from page HTML
function extractTourInfo(html) {
  // Extract title
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                     html.match(/<title>([^<|]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Extract duration
  const durationMatch = html.match(/(\d+)\s*days?\s*[&/]\s*\d+\s*nights?/i) ||
                        html.match(/(\d+)\s*days?/i);
  const days = durationMatch ? parseInt(durationMatch[1]) : null;

  // Extract price
  const priceMatch = html.match(/\$\s*([\d,]+)/);
  const price = priceMatch ? parseInt(priceMatch[1].replace(',', '')) : null;

  return { title, days, price };
}

// Extract days from duration string
function extractDays(duration) {
  if (!duration) return null;
  const match = duration.match(/(\d+)\s*days?/i);
  return match ? parseInt(match[1]) : null;
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('='.repeat(60));
  console.log('Validating BestPrice Travel URLs');
  console.log('='.repeat(60));

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const ourTours = extractAllTours();
  const toursWithBestPrice = ourTours.filter(t => t.currentUrl);

  console.log(`\nFound ${ourTours.length} total tours`);
  console.log(`${toursWithBestPrice.length} have bestpricetravel.com URLs\n`);

  const results = {
    valid: [],
    invalid: [],
    mismatch: [],
    error: [],
  };

  let processed = 0;

  for (const tour of toursWithBestPrice) {
    processed++;
    process.stdout.write(`\r[${processed}/${toursWithBestPrice.length}] Checking: ${tour.id.substring(0, 30).padEnd(30)}...`);

    const response = await fetchPage(tour.currentUrl);

    if (response.error) {
      results.error.push({
        id: tour.id,
        name: tour.name,
        url: tour.currentUrl,
        error: response.error,
      });
      continue;
    }

    if (response.statusCode === 404 || response.statusCode >= 400) {
      results.invalid.push({
        id: tour.id,
        name: tour.name,
        url: tour.currentUrl,
        statusCode: response.statusCode,
      });
      continue;
    }

    if (response.html) {
      const pageInfo = extractTourInfo(response.html);
      const ourDays = extractDays(tour.duration);

      // Check for mismatches
      const issues = [];

      if (pageInfo.days && ourDays && pageInfo.days !== ourDays) {
        issues.push(`Duration: ours=${ourDays} days, page=${pageInfo.days} days`);
      }

      // Check if page title is significantly different
      if (pageInfo.title) {
        const normalizedOurs = tour.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedPage = pageInfo.title.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Check if names share at least 30% of characters
        const overlap = normalizedOurs.split('').filter(c => normalizedPage.includes(c)).length;
        const similarity = overlap / Math.max(normalizedOurs.length, normalizedPage.length);

        if (similarity < 0.3) {
          issues.push(`Name mismatch: ours="${tour.name}", page="${pageInfo.title}"`);
        }
      }

      if (issues.length > 0) {
        results.mismatch.push({
          id: tour.id,
          name: tour.name,
          duration: tour.duration,
          url: tour.currentUrl,
          pageTitle: pageInfo.title,
          pageDays: pageInfo.days,
          issues,
        });
      } else {
        results.valid.push({
          id: tour.id,
          name: tour.name,
          url: tour.currentUrl,
        });
      }
    }

    // Rate limiting
    await sleep(300);
  }

  console.log('\n');

  // Summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total checked: ${toursWithBestPrice.length}`);
  console.log(`Valid (matching): ${results.valid.length}`);
  console.log(`Mismatched data: ${results.mismatch.length}`);
  console.log(`Invalid URLs (404): ${results.invalid.length}`);
  console.log(`Errors (timeout/network): ${results.error.length}`);

  // Show mismatches
  if (results.mismatch.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('MISMATCHED TOURS');
    console.log('='.repeat(60));
    for (const m of results.mismatch) {
      console.log(`\n[${m.id}]`);
      console.log(`  Our name: ${m.name}`);
      console.log(`  Page title: ${m.pageTitle || 'N/A'}`);
      console.log(`  URL: ${m.url}`);
      for (const issue of m.issues) {
        console.log(`  ! ${issue}`);
      }
    }
  }

  // Show invalid
  if (results.invalid.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('INVALID URLs (404 or other errors)');
    console.log('='.repeat(60));
    for (const inv of results.invalid) {
      console.log(`  ${inv.id}: ${inv.url} (${inv.statusCode})`);
    }
  }

  // Save results
  const outputPath = path.join(OUTPUT_DIR, 'url-validation-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
}

main().catch(console.error);
