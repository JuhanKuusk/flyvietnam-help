#!/usr/bin/env node

/**
 * Check for tours where the category doesn't match the affiliate URL content
 * e.g., day-trip tours linked to multi-day tour URLs
 */

import { FEATURED_TOURS as tours } from '../src/lib/tours-data.js';

const results = {
  mismatches: [],
  brokenUrls: [],
  ok: []
};

async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return response.status;
  } catch (e) {
    return 'ERROR';
  }
}

async function main() {
  // Focus on day-trip and cruise tours
  const shortTours = tours.filter(t =>
    t.category === 'day-trip' || t.category === 'cruise'
  );

  console.log(`\nChecking ${shortTours.length} day-trip and cruise tours...\n`);

  for (const tour of shortTours) {
    const url = tour.affiliateUrl;

    // Check for obvious multi-day URL patterns in short tours
    const multiDayPatterns = [
      /\d+-days?\.html/i,
      /\d+-day-\d+-night/i,
      /-\d+d\d+n/i,
      /vietnam-.*-tour-\d+-days/i,
      /-\d+-days-\d+-nights/i
    ];

    const looksLikeMultiDay = multiDayPatterns.some(pattern => pattern.test(url));

    if (looksLikeMultiDay) {
      results.mismatches.push({
        id: tour.id,
        name: tour.name,
        category: tour.category,
        duration: tour.duration,
        affiliateUrl: url
      });
    }
  }

  console.log('=== POTENTIAL MISMATCHES (day-trip/cruise with multi-day URLs) ===\n');
  if (results.mismatches.length === 0) {
    console.log('No obvious mismatches found.');
  } else {
    for (const m of results.mismatches) {
      console.log(`ID: ${m.id}`);
      console.log(`  Name: ${m.name}`);
      console.log(`  Category: ${m.category}`);
      console.log(`  Duration: ${m.duration}`);
      console.log(`  URL: ${m.affiliateUrl}`);

      // Check if URL is valid
      const status = await checkUrl(m.affiliateUrl);
      console.log(`  Status: ${status}`);
      console.log('');
    }
  }

  console.log(`\nTotal mismatches found: ${results.mismatches.length}`);
}

main().catch(console.error);