import fs from 'fs';

// Read all scraped tour data
const scrapedDir = 'scripts/tour-data-output';
const scrapedData = {};

fs.readdirSync(scrapedDir).forEach(file => {
  if (file.endsWith('.json')) {
    const slug = file.replace('.json', '');
    try {
      const data = JSON.parse(fs.readFileSync(`${scrapedDir}/${file}`, 'utf8'));
      if (data.images && data.images.length > 0) {
        scrapedData[slug] = data;
      }
    } catch (e) {
      console.log(`Error reading ${file}: ${e.message}`);
    }
  }
});

console.log(`Loaded ${Object.keys(scrapedData).length} scraped tours with images`);

// Read tours-data.ts
let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
let updatedCount = 0;

// Find all tours without imageGallery
const tourRegex = /slug:\s*["']([^"']+)["']/g;
let match;
const toursToUpdate = [];

while ((match = tourRegex.exec(content)) !== null) {
  const slug = match[1];
  const startIdx = match.index;

  // Find next tour or end
  const nextSlugMatch = content.slice(startIdx + 20).match(/slug:\s*["']/);
  const endIdx = nextSlugMatch ? startIdx + 20 + nextSlugMatch.index : content.length;
  const tourSection = content.slice(startIdx, endIdx);

  // Skip if already has imageGallery
  if (tourSection.includes('imageGallery:')) continue;

  // Get affiliate URL to map to scraped data
  const affiliateMatch = tourSection.match(/affiliateUrl:\s*["']([^"']+)["']/);
  if (!affiliateMatch) continue;

  const affiliateUrl = affiliateMatch[1];
  if (!affiliateUrl.includes('bestpricetravel.com')) continue;

  // Extract the BestPrice URL slug
  const urlSlugMatch = affiliateUrl.match(/bestpricetravel\.com\/([^?]+)/);
  if (!urlSlugMatch) continue;

  const urlSlug = urlSlugMatch[1].replace('.html', '').replace(/\//g, '-').replace(/-+/g, '-');

  // Try different variations to find scraped data
  const variations = [
    urlSlug.replace(/^[^-]+-/, ''),  // Remove first segment like "vietnam-tours-"
    urlSlug.split('-').slice(-3).join('-'),  // Last 3 parts
    urlSlug,  // Full slug
  ];

  let scrapedTour = null;
  let matchedSlug = '';

  for (const v of variations) {
    // Find scraped data file
    for (const [scrapedSlug, data] of Object.entries(scrapedData)) {
      if (scrapedSlug.includes(v) || v.includes(scrapedSlug)) {
        scrapedTour = data;
        matchedSlug = scrapedSlug;
        break;
      }
    }
    if (scrapedTour) break;
  }

  if (scrapedTour) {
    toursToUpdate.push({
      slug,
      startIdx,
      matchedSlug,
      images: scrapedTour.images
    });
  }
}

console.log(`Found ${toursToUpdate.length} tours to update`);

// Sort by startIdx descending (to update from end to beginning)
toursToUpdate.sort((a, b) => b.startIdx - a.startIdx);

// Update each tour
for (const tour of toursToUpdate) {
  // Filter images - remove icons, logos, small images, review images
  const filteredImages = tour.images.filter(img => {
    return img &&
      img.includes('cloudfront.net') &&
      !img.includes('/dcma.png') &&
      !img.includes('/review/') &&
      !img.includes('/origin/') &&  // Prefer 800_450 size
      !img.includes('370_207') &&   // Too small
      !img.includes('250_170') &&   // Review images
      (img.includes('800_450') || img.includes('544_306'));
  }).slice(0, 15);

  if (filteredImages.length < 3) {
    console.log(`SKIP: ${tour.slug} - only ${filteredImages.length} usable images`);
    continue;
  }

  // Find the position to insert imageGallery (after itinerary or before closing brace)
  const slugIndex = content.indexOf(`slug: "${tour.slug}"`);
  if (slugIndex === -1) continue;

  // Find next tour or end
  const nextTourMatch = content.slice(slugIndex + 50).match(/\n  \{[\s\n]+id:/);
  const tourEndIndex = nextTourMatch
    ? slugIndex + 50 + nextTourMatch.index
    : content.length;

  const tourSection = content.slice(slugIndex, tourEndIndex);

  // Find position after itinerary or after included/excluded
  let insertAfter = tourSection.match(/itinerary:\s*\[[\s\S]*?\n    \],?/);
  if (!insertAfter) {
    insertAfter = tourSection.match(/excluded:\s*\[[\s\S]*?\n    \],?/);
  }
  if (!insertAfter) {
    insertAfter = tourSection.match(/included:\s*\[[\s\S]*?\n    \],?/);
  }

  if (!insertAfter) {
    console.log(`SKIP: ${tour.slug} - no insertion point found`);
    continue;
  }

  // Build imageGallery code
  const galleryCode = `\n    imageGallery: [\n      ${filteredImages.map(i => `"${i}"`).join(',\n      ')}\n    ],`;

  // Insert after the matched field
  const insertPosition = slugIndex + insertAfter.index + insertAfter[0].length;

  // Check if it doesn't already have imageGallery right after
  const afterInsert = content.slice(insertPosition, insertPosition + 50);
  if (afterInsert.includes('imageGallery:')) {
    console.log(`SKIP: ${tour.slug} - already has imageGallery nearby`);
    continue;
  }

  content = content.slice(0, insertPosition) + galleryCode + content.slice(insertPosition);

  updatedCount++;
  console.log(`UPDATED: ${tour.slug} <- ${tour.matchedSlug} (${filteredImages.length} images)`);
}

// Write updated content
fs.writeFileSync('src/lib/tours-data.ts', content);

console.log(`\n=== COMPLETE ===`);
console.log(`Tours updated: ${updatedCount}`);
