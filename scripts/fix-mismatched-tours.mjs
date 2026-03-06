#!/usr/bin/env node

/**
 * Fix Mismatched Tours
 *
 * Removes affiliateUrl from tours that point to completely different tours on bestpricetravel.com.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOURS_DATA_PATH = path.join(__dirname, '../src/lib/tours-data.ts');
const VALIDATION_RESULTS = path.join(__dirname, 'tour-data-output/url-validation-results.json');

// Load validation results
function loadValidationResults() {
  return JSON.parse(fs.readFileSync(VALIDATION_RESULTS, 'utf-8'));
}

// Identify tours with significantly wrong URLs to remove
function getToursToRemoveUrl() {
  const validation = loadValidationResults();
  const toRemove = [];

  for (const m of validation.mismatch) {
    let remove = false;
    let reason = '';

    for (const issue of m.issues) {
      // Duration mismatch
      const durationMatch = issue.match(/Duration: ours=(\d+) days, page=(\d+) days/);
      if (durationMatch) {
        const ours = parseInt(durationMatch[1]);
        const page = parseInt(durationMatch[2]);
        const diff = Math.abs(ours - page);

        // Remove if duration difference is >= 2 days OR > 50%
        if (diff >= 2 || (ours > 0 && diff / ours > 0.5)) {
          remove = true;
          reason = `Duration mismatch: ${ours} vs ${page} days (diff: ${diff})`;
        }
      }

      // Name mismatch (indicates completely different tour)
      if (issue.includes('Name mismatch')) {
        remove = true;
        reason = reason || 'Name mismatch';
      }
    }

    if (remove) {
      toRemove.push({
        id: m.id,
        name: m.name,
        currentUrl: m.url,
        reason,
      });
    }
  }

  return toRemove;
}

// Remove affiliateUrl from tours in tours-data.ts
function removeAffiliateUrls(tourIds) {
  let content = fs.readFileSync(TOURS_DATA_PATH, 'utf-8');
  let modified = 0;

  for (const id of tourIds) {
    // Find tour and remove affiliateUrl line within its block
    // Match: affiliateUrl: 'https://...',
    // or affiliateUrl: "https://...",

    // Strategy: Find the tour by id, then remove the affiliateUrl line
    const lines = content.split('\n');
    const newLines = [];
    let inTargetTour = false;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if we're entering a tour block with this id
      if (line.includes(`id: '${id}'`) || line.includes(`id: "${id}"`)) {
        inTargetTour = true;
        // Count braces from the line that has 'id:'
        // Find the start of this object (look back for opening brace)
        let searchIdx = i;
        while (searchIdx >= 0 && !lines[searchIdx].trim().startsWith('{')) {
          searchIdx--;
        }
        braceDepth = 1;
      }

      if (inTargetTour) {
        // Track brace depth
        const openCount = (line.match(/\{/g) || []).length;
        const closeCount = (line.match(/\}/g) || []).length;
        braceDepth += openCount - closeCount;

        // Skip affiliateUrl line
        if (line.includes('affiliateUrl:') && line.includes('bestpricetravel.com')) {
          modified++;
          // Check if this is within our target tour
          continue; // Skip this line
        }

        // Check if we're leaving the tour block
        if (braceDepth <= 0) {
          inTargetTour = false;
        }
      }

      newLines.push(line);
    }

    content = newLines.join('\n');
  }

  return { content, modified };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Fix Mismatched Tours - Remove Wrong Affiliate URLs');
  console.log('='.repeat(60));

  const toursToFix = getToursToRemoveUrl();
  console.log(`\nFound ${toursToFix.length} tours with wrong URLs to remove\n`);

  if (toursToFix.length === 0) {
    console.log('No tours need fixing!');
    return;
  }

  console.log('Tours to fix:');
  console.log('-'.repeat(60));

  for (const tour of toursToFix) {
    console.log(`[${tour.id}] - ${tour.reason}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Removing affiliate URLs...');
  console.log('='.repeat(60));

  const tourIds = toursToFix.map(t => t.id);
  const { content, modified } = removeAffiliateUrls(tourIds);

  if (modified > 0) {
    // Backup original
    const backupPath = TOURS_DATA_PATH + '.backup-' + Date.now();
    fs.copyFileSync(TOURS_DATA_PATH, backupPath);
    console.log(`\nBackup created: ${backupPath}`);

    // Write modified content
    fs.writeFileSync(TOURS_DATA_PATH, content);
    console.log(`Removed affiliateUrl from ${modified} tours`);
  } else {
    console.log('No modifications made');
  }

  console.log('\nDone!');
}

main().catch(console.error);
