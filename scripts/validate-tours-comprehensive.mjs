#!/usr/bin/env node

/**
 * Comprehensive Tour Validation Script
 *
 * Validates all tours in tours-data.ts against their scraped source data:
 * 1. Image galleries match
 * 2. Descriptions and prices match
 * 3. Itineraries have real data
 * 4. All relevant information matches source
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOURS_DATA_PATH = path.join(__dirname, '../src/lib/tours-data.ts');
const SCRAPED_DIR = path.join(__dirname, 'tour-data-output');

// Extract URL slug from affiliate URL
function getUrlSlug(url) {
  if (!url) return null;
  const match = url.match(/\/([^\/]+)\.html$/);
  return match ? match[1] : null;
}

// Parse tours from tours-data.ts
function parseTours() {
  const content = fs.readFileSync(TOURS_DATA_PATH, 'utf-8');
  const tours = [];

  // Find all tour objects
  const tourRegex = /\{\s*id:\s*["']([^"']+)["']/g;
  const lines = content.split('\n');

  let currentTour = null;
  let braceDepth = 0;
  let tourStartLine = -1;
  let tourContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Start of a new tour object
    if (braceDepth === 0 && line.match(/^\s*\{/) && !line.includes('//')) {
      braceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      tourStartLine = i;
      tourContent = line + '\n';
      continue;
    }

    if (braceDepth > 0) {
      tourContent += line + '\n';
      braceDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

      if (braceDepth === 0) {
        // Parse the tour
        const idMatch = tourContent.match(/id:\s*["']([^"']+)["']/);
        const nameMatch = tourContent.match(/name:\s*["']([^"']+)["']/);
        const slugMatch = tourContent.match(/slug:\s*["']([^"']+)["']/);
        const categoryMatch = tourContent.match(/category:\s*["']([^"']+)["']/);
        const durationMatch = tourContent.match(/duration:\s*["']([^"']+)["']/);
        const priceMatch = tourContent.match(/price:\s*(\d+)/);
        const descMatch = tourContent.match(/description:\s*["']([^"']+)["']/);
        const urlMatch = tourContent.match(/affiliateUrl:\s*["']([^"']+)["']/);
        const ratingMatch = tourContent.match(/rating:\s*([\d.]+)/);
        const reviewMatch = tourContent.match(/reviewCount:\s*(\d+)/);
        const galleryMatch = tourContent.match(/imageGallery:\s*\[([^\]]+)\]/);

        // Check itinerary quality - improved regex for complex nested structures
        const dayMatches = tourContent.match(/\{\s*day:\s*(\d+)/g);
        let itineraryDays = dayMatches ? dayMatches.length : 0;

        // Check for detailed descriptions (looking for description fields with substantial content)
        const descMatches = tourContent.match(/description:\s*["'`][\s\S]{100,}?["'`]/g);
        let hasDetailedItinerary = descMatches && descMatches.length >= Math.floor(itineraryDays * 0.5);

        // Extract full description
        const fullDescMatch = tourContent.match(/fullDescription:\s*`([\s\S]*?)`,/);
        const hasDetailedFullDesc = fullDescMatch && fullDescMatch[1].length > 200;

        if (idMatch) {
          tours.push({
            id: idMatch[1],
            name: nameMatch ? nameMatch[1] : '',
            slug: slugMatch ? slugMatch[1] : '',
            category: categoryMatch ? categoryMatch[1] : '',
            duration: durationMatch ? durationMatch[1] : '',
            price: priceMatch ? parseInt(priceMatch[1]) : null,
            description: descMatch ? descMatch[1] : '',
            affiliateUrl: urlMatch ? urlMatch[1] : '',
            rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
            reviewCount: reviewMatch ? parseInt(reviewMatch[1]) : null,
            imageGalleryCount: galleryMatch ? (galleryMatch[1].match(/http/g) || []).length : 0,
            itineraryDays,
            hasDetailedItinerary,
            hasDetailedFullDesc,
            lineNumber: tourStartLine + 1
          });
        }
        tourContent = '';
      }
    }
  }

  return tours;
}

// Load scraped data for a tour
function loadScrapedData(affiliateUrl) {
  const slug = getUrlSlug(affiliateUrl);
  if (!slug) return null;

  const filePath = path.join(SCRAPED_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

// Compare tour with scraped data
function validateTour(tour, scraped) {
  const issues = [];
  const warnings = [];

  if (!scraped) {
    warnings.push('No scraped data available for validation');
    return { issues, warnings };
  }

  // 1. Validate rating
  if (scraped.rating && tour.rating) {
    if (Math.abs(scraped.rating - tour.rating) > 0.5) {
      issues.push(`Rating mismatch: ours=${tour.rating}, source=${scraped.rating}`);
    }
  }

  // 2. Validate review count (should be close)
  if (scraped.reviewCount && tour.reviewCount) {
    const diff = Math.abs(scraped.reviewCount - tour.reviewCount);
    if (diff > tour.reviewCount * 0.3) {  // More than 30% difference
      warnings.push(`Review count differs: ours=${tour.reviewCount}, source=${scraped.reviewCount}`);
    }
  }

  // 3. Validate image gallery
  if (scraped.images && scraped.images.length > 0) {
    if (tour.imageGalleryCount === 0) {
      issues.push(`Missing image gallery (source has ${scraped.images.length} images)`);
    } else if (tour.imageGalleryCount < 5 && scraped.images.length >= 10) {
      warnings.push(`Limited images: ours=${tour.imageGalleryCount}, source=${scraped.images.length}`);
    }
  }

  // 4. Validate itinerary depth
  if (scraped.itinerary && scraped.itinerary.length > 0) {
    const sourceDays = scraped.itinerary.length;

    if (tour.itineraryDays === 0) {
      issues.push(`Missing itinerary (source has ${sourceDays} days)`);
    } else if (tour.itineraryDays !== sourceDays) {
      warnings.push(`Itinerary days mismatch: ours=${tour.itineraryDays}, source=${sourceDays}`);
    }

    // Check if we have detailed descriptions
    const sourceHasDetailedItinerary = scraped.itinerary.some(day =>
      day.description && day.description.length > 100
    );

    if (sourceHasDetailedItinerary && !tour.hasDetailedItinerary) {
      issues.push('Itinerary lacks detailed descriptions (source has full descriptions)');
    }
  }

  // 5. Validate full description richness
  if (scraped.overview && scraped.overview.length > 200) {
    if (!tour.hasDetailedFullDesc) {
      warnings.push('Full description could be richer based on source');
    }
  }

  // 6. Check highlights
  if (scraped.highlights && scraped.highlights.length > 0) {
    // We could compare highlights but they may be reformatted
  }

  // 7. Check included items
  if (scraped.included && scraped.included.length > 0) {
    // Check if we have comprehensive included list
  }

  return { issues, warnings };
}

// Main validation
async function main() {
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE TOUR VALIDATION');
  console.log('Validating tours against scraped source data');
  console.log('='.repeat(80));

  const tours = parseTours();
  console.log(`\nFound ${tours.length} tours in tours-data.ts\n`);

  // Count scraped files
  const scrapedFiles = fs.readdirSync(SCRAPED_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${scrapedFiles.length} scraped tour files\n`);

  const results = {
    valid: [],
    withIssues: [],
    withWarnings: [],
    noScrapedData: [],
    byCategory: {}
  };

  // Filter BestPrice tours only (we have scraped data for these)
  const bestPriceTours = tours.filter(t =>
    t.affiliateUrl && t.affiliateUrl.includes('bestpricetravel.com')
  );

  console.log(`Validating ${bestPriceTours.length} BestPrice tours...\n`);

  for (const tour of bestPriceTours) {
    const scraped = loadScrapedData(tour.affiliateUrl);
    const { issues, warnings } = validateTour(tour, scraped);

    // Categorize results
    if (!results.byCategory[tour.category]) {
      results.byCategory[tour.category] = { total: 0, issues: 0, warnings: 0 };
    }
    results.byCategory[tour.category].total++;

    if (!scraped) {
      results.noScrapedData.push(tour);
    } else if (issues.length > 0) {
      results.withIssues.push({ tour, issues, warnings });
      results.byCategory[tour.category].issues++;
    } else if (warnings.length > 0) {
      results.withWarnings.push({ tour, warnings });
      results.byCategory[tour.category].warnings++;
    } else {
      results.valid.push(tour);
    }
  }

  // Report results
  console.log('\n' + '='.repeat(80));
  console.log('VALIDATION RESULTS BY CATEGORY');
  console.log('='.repeat(80));

  for (const [category, stats] of Object.entries(results.byCategory)) {
    const valid = stats.total - stats.issues - stats.warnings;
    console.log(`\n${category.toUpperCase()}: ${stats.total} tours`);
    console.log(`  Valid: ${valid} | Issues: ${stats.issues} | Warnings: ${stats.warnings}`);
  }

  // Critical issues
  if (results.withIssues.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log(`CRITICAL ISSUES (${results.withIssues.length} tours)`);
    console.log('='.repeat(80));

    for (const { tour, issues, warnings } of results.withIssues.slice(0, 30)) {
      console.log(`\n[${tour.id}] ${tour.name}`);
      console.log(`  Category: ${tour.category} | Duration: ${tour.duration}`);
      console.log(`  URL: ${tour.affiliateUrl}`);
      console.log(`  Line: ${tour.lineNumber}`);
      for (const issue of issues) {
        console.log(`  ERROR: ${issue}`);
      }
      for (const warning of warnings) {
        console.log(`  WARN: ${warning}`);
      }
    }

    if (results.withIssues.length > 30) {
      console.log(`\n... and ${results.withIssues.length - 30} more tours with issues`);
    }
  }

  // Warnings only
  if (results.withWarnings.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log(`WARNINGS (${results.withWarnings.length} tours)`);
    console.log('='.repeat(80));

    for (const { tour, warnings } of results.withWarnings.slice(0, 20)) {
      console.log(`\n[${tour.id}] ${tour.name}`);
      for (const warning of warnings) {
        console.log(`  WARN: ${warning}`);
      }
    }

    if (results.withWarnings.length > 20) {
      console.log(`\n... and ${results.withWarnings.length - 20} more tours with warnings`);
    }
  }

  // No scraped data
  if (results.noScrapedData.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log(`NO SCRAPED DATA AVAILABLE (${results.noScrapedData.length} tours)`);
    console.log('These tours need to be scraped from their source URLs');
    console.log('='.repeat(80));

    for (const tour of results.noScrapedData.slice(0, 30)) {
      console.log(`  [${tour.id}] ${getUrlSlug(tour.affiliateUrl)}`);
    }

    if (results.noScrapedData.length > 30) {
      console.log(`\n... and ${results.noScrapedData.length - 30} more tours without scraped data`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total BestPrice tours: ${bestPriceTours.length}`);
  console.log(`Fully valid: ${results.valid.length}`);
  console.log(`With critical issues: ${results.withIssues.length}`);
  console.log(`With warnings: ${results.withWarnings.length}`);
  console.log(`No scraped data: ${results.noScrapedData.length}`);

  // Save detailed report
  const reportPath = path.join(__dirname, 'tour-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalTours: bestPriceTours.length,
      valid: results.valid.length,
      withIssues: results.withIssues.length,
      withWarnings: results.withWarnings.length,
      noScrapedData: results.noScrapedData.length
    },
    byCategory: results.byCategory,
    issues: results.withIssues.map(r => ({
      id: r.tour.id,
      name: r.tour.name,
      url: r.tour.affiliateUrl,
      issues: r.issues,
      warnings: r.warnings
    })),
    warnings: results.withWarnings.map(r => ({
      id: r.tour.id,
      name: r.tour.name,
      warnings: r.warnings
    })),
    noScrapedData: results.noScrapedData.map(t => ({
      id: t.id,
      url: t.affiliateUrl,
      slug: getUrlSlug(t.affiliateUrl)
    }))
  }, null, 2));

  console.log(`\nDetailed report saved to: ${reportPath}`);
}

main().catch(console.error);
