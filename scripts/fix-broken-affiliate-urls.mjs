#!/usr/bin/env node

/**
 * Script to fix broken affiliate URLs by mapping to real tours on bestpricetravel.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOURS_DATA_FILE = path.join(__dirname, '..', 'src', 'lib', 'tours-data.ts');

// Mapping of broken tour IDs to real bestpricetravel.com URLs
const URL_FIXES = {
  // Central Vietnam tours
  "central-vietnam-deep-dive-7d": "https://www.bestpricetravel.com/vietnam-tours/central-vietnam-grand-discovery-9-days.html",

  // Wellness/Spa tours - map to real wellness tours
  "vietnam-natural-wonders-healing-8d": "https://www.bestpricetravel.com/vietnam-tours/vietnams-cultural-wellness-8-days.html",
  "vietnam-mountain-retreat-10d": "https://www.bestpricetravel.com/vietnam-tours/vietnam-mountain-retreat-healing-9-days.html",
  "rejuvenate-vietnam-14d": "https://www.bestpricetravel.com/vietnam-tours/healing-heritage-a-luxury-wellness-journey-through-vietnam-16-days.html",

  // Ba Na Hills
  "ba-na-hills-day-trip": "https://www.bestpricetravel.com/da-nang-tours/ba-na-hills-full-day.html",

  // Dalat tours - no direct Dalat tours, map to Central Vietnam
  "dalat-highlands-3d": "https://www.bestpricetravel.com/vietnam-tours/a-glimpse-of-the-central-vietnam-5-days.html",
  "dalat-highlands-5d": "https://www.bestpricetravel.com/vietnam-tours/a-glimpse-of-the-central-vietnam-5-days.html",
  "dalat-canyoning-2d": "https://www.bestpricetravel.com/vietnam-tours/central-vietnam-adventure-4-days.html",
  "dalat-coffee-wine-2d": "https://www.bestpricetravel.com/vietnam-tours/a-glimpse-of-the-central-vietnam-5-days.html",
  "dalat-easy-escape-3d": "https://www.bestpricetravel.com/vietnam-tours/a-glimpse-of-the-central-vietnam-5-days.html",

  // Budget tours
  "vietnam-gentle-pace-10d": "https://www.bestpricetravel.com/vietnam-tours/vietnam-marvelous-budget-adventure-10-days.html",
  "vietnam-express-6d": "https://www.bestpricetravel.com/vietnam-tours/super-saver-hanoi-ho-chi-minh-group-tour-6-days.html",
  "vietnam-complete-18d": "https://www.bestpricetravel.com/vietnam-tours/along-vietnam-by-train-15-days-small-group-tour.html",
  "south-vietnam-budget-5d": "https://www.bestpricetravel.com/vietnam-tours/best-of-south-vietnam-5-days.html",
  "central-vietnam-budget-4d": "https://www.bestpricetravel.com/vietnam-tours/hue-and-hoi-an-at-a-glance-4-days.html",

  // Hoi An tours
  "hoi-an-lantern-photo-2d": "https://www.bestpricetravel.com/hoi-an-tours/hoi-an-memories-show-ticket.html",
  "hoi-an-lantern-festival-3d": "https://www.bestpricetravel.com/hoi-an-tours/hoi-an-memories-show-ticket.html",

  // Festival tours - map to cultural tours
  "vietnam-tet-festival-10d": "https://www.bestpricetravel.com/vietnam-tours/vietnam-essential-10-days-small-group-tour.html",
  "sapa-spring-festival-5d": "https://www.bestpricetravel.com/sapa-tours/highlights-sapa-with-fansipan-mountain-2-days.html",
  "mid-autumn-festival-3d": "https://www.bestpricetravel.com/hanoi-tours/hanoi-street-food-tour.html",

  // Mui Ne
  "mui-ne-sand-dunes-2d": "https://www.bestpricetravel.com/vietnam-tours/saigon-and-mui-ne-relaxation-7-days.html",

  // Ethnic minorities
  "northern-ethnic-minorities-10d": "https://www.bestpricetravel.com/vietnam-tours/hill-tribes-of-northern-vietnam-9-days.html",

  // Craft/Artisan
  "vietnam-craft-artisan-8d": "https://www.bestpricetravel.com/vietnam-tours/real-taste-of-vietnam-13-days.html",
};

function fixBrokenUrls() {
  let content = fs.readFileSync(TOURS_DATA_FILE, 'utf-8');
  let fixedCount = 0;

  for (const [tourId, newUrl] of Object.entries(URL_FIXES)) {
    // Find the affiliateUrl for this tour and replace it
    const pattern = new RegExp(
      `(id:\\s*"${tourId}"[\\s\\S]*?affiliateUrl:\\s*")([^"]+)(")`,
      'g'
    );

    const newContent = content.replace(pattern, (match, prefix, oldUrl, suffix) => {
      console.log(`Fixed: ${tourId}`);
      console.log(`  Old: ${oldUrl}`);
      console.log(`  New: ${newUrl}`);
      fixedCount++;
      return `${prefix}${newUrl}${suffix}`;
    });

    if (newContent !== content) {
      content = newContent;
    }
  }

  if (fixedCount > 0) {
    fs.writeFileSync(TOURS_DATA_FILE, content);
    console.log(`\n✅ Fixed ${fixedCount} affiliate URLs`);
  } else {
    console.log('No URLs found to fix');
  }

  return fixedCount;
}

console.log('===========================================');
console.log('  Fixing Broken Affiliate URLs');
console.log('===========================================\n');

const fixed = fixBrokenUrls();
console.log(`\nTotal fixed: ${fixed} URLs`);
