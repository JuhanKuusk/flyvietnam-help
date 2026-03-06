import fs from 'fs';

// Map our tour slugs to the scraped asiatouradvisor data
const tourMappings = {
  // Direct matches by new URL slug
  'signatures-vietnam-14-days': 'signatures-of-vietnam',
  'vietnam-discovery-11-days': 'vietnam-discovery-12-days',
  'natural-wonders-vietnam-16-days': 'natural-wonders-of-vietnam',
  'vietnam-beach-family-14-days': 'vietnam-beach-family',
  'cultural-heritage-vietnam-12-days': 'vietnam-best-cultural-heritage',
  'discovery-northeast-vietnam-9-days': 'discovery-north-east-vietnam-9-days-8-nights',
  'cultural-odyssey-vietnam-10-days': 'vietnamese-cultural-odyssey-a-10-day-journey',
  'best-vietnam-13-days': 'best-vietnam-tour-13days',
  'nature-north-vietnam-8-days': 'best-of-nature-in-northern-vietnam-7-days',
  'vietnam-family-tour-11-days': 'vietnam-family-tours',
  'highlights-vietnam-10-days': 'vietnam-culinary-discovery',
  'scenic-vietnam-10-days': 'simply-vietnam-10-days',
  'essence-vietnam-10-days': 'simply-vietnam-10-days',
  'discovery-north-east-vietnam-13-days': 'heart-of-vietnam-tour',
  'vietnam-insight-14-days': 'ventures-through-vietnam',
  'discover-vietnam-20-days': 'authentic-vietnam',
  'vietnam-complete-12-days': 'vietnam-discovery-12-days',
  'vietnam-luxury-10-days': 'vietnam-culinary-discovery',
};

// Read scraped data
const scrapedDir = 'scripts/asiatouradvisor-new';
const scrapedData = {};

fs.readdirSync(scrapedDir).forEach(file => {
  if (file.endsWith('.json') && file !== 'all-tours.json') {
    const slug = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(`${scrapedDir}/${file}`, 'utf8'));
    if (data.itinerary && data.itinerary.length > 0) {
      scrapedData[slug] = data;
    }
  }
});

console.log(`Loaded ${Object.keys(scrapedData).length} scraped tours`);

// Read tours-data.ts
let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
let updatedCount = 0;

// For each mapping, find the tour in tours-data.ts and update it
for (const [ourSlug, scrapedSlug] of Object.entries(tourMappings)) {
  const scraped = scrapedData[scrapedSlug];
  if (!scraped) {
    console.log(`SKIP: No scraped data for ${scrapedSlug}`);
    continue;
  }

  // Find the tour in tours-data.ts by slug
  const slugRegex = new RegExp(`slug:\\s*["']${ourSlug}["']`, 'g');
  if (!content.match(slugRegex)) {
    console.log(`SKIP: Tour ${ourSlug} not found in tours-data.ts`);
    continue;
  }

  // Check if tour already has rich itinerary
  // We'll look for the tour block and check if it has imageGallery
  const tourBlockRegex = new RegExp(`(\\{[^{}]*slug:\\s*["']${ourSlug}["'][^]*?\\n  \\})`, 's');
  const match = content.match(tourBlockRegex);

  if (!match) {
    console.log(`SKIP: Could not parse tour block for ${ourSlug}`);
    continue;
  }

  const tourBlock = match[1];

  // Build new itinerary with day images
  const newItinerary = scraped.itinerary.map(day => ({
    day: day.day,
    title: day.title,
    description: day.description || `Day ${day.day} of your ${scraped.destinations?.slice(0, 3).join(' & ') || 'Vietnam'} adventure.`,
    activities: day.activities || [],
    meals: day.meals || [],
    images: day.images?.slice(0, 3) || []
  }));

  // Build imageGallery from all day images + main images
  const allImages = new Set();
  scraped.itinerary.forEach(day => {
    if (day.images) {
      day.images.slice(0, 2).forEach(img => allImages.add(img));
    }
  });
  // Add some main tour images too (skip flags and icons)
  scraped.images?.forEach(img => {
    if (!img.includes('flag') && !img.includes('GB.webp') && !img.includes('FR.webp') &&
        !img.includes('ES.webp') && !img.includes('DE.webp') && !img.includes('IT.webp') &&
        !img.includes('live-chat') && !img.includes('cambodia') && !img.includes('myanmar') &&
        !img.includes('thailand') && !img.includes('laos')) {
      allImages.add(img);
    }
  });
  const imageGallery = Array.from(allImages).slice(0, 15);

  // Format the new data as TypeScript
  const itineraryStr = JSON.stringify(newItinerary, null, 6)
    .replace(/"([^"]+)":/g, '$1:')  // Remove quotes from keys
    .replace(/\n/g, '\n    ');       // Indent properly

  const imageGalleryStr = JSON.stringify(imageGallery, null, 6)
    .replace(/\n/g, '\n    ');

  // Check if tour already has itinerary field
  if (tourBlock.includes('itinerary:')) {
    // Replace existing itinerary
    const itineraryRegex = /itinerary:\s*\[[^\]]*\]/s;
    let updatedBlock = tourBlock.replace(itineraryRegex, `itinerary: ${itineraryStr}`);

    // Add or update imageGallery
    if (updatedBlock.includes('imageGallery:')) {
      const galleryRegex = /imageGallery:\s*\[[^\]]*\]/s;
      updatedBlock = updatedBlock.replace(galleryRegex, `imageGallery: ${imageGalleryStr}`);
    } else {
      // Add imageGallery before the closing brace
      const insertPoint = updatedBlock.lastIndexOf('}');
      updatedBlock = updatedBlock.slice(0, insertPoint) + `\n    imageGallery: ${imageGalleryStr},\n  ` + updatedBlock.slice(insertPoint);
    }

    content = content.replace(tourBlock, updatedBlock);
    updatedCount++;
    console.log(`UPDATED: ${ourSlug} <- ${scrapedSlug} (${scraped.itinerary.length} days, ${imageGallery.length} images)`);
  } else {
    console.log(`SKIP: ${ourSlug} has no itinerary field to update`);
  }
}

// Write updated content
fs.writeFileSync('src/lib/tours-data.ts', content);

console.log(`\n=== UPDATE COMPLETE ===`);
console.log(`Tours updated: ${updatedCount}`);
console.log(`Scraped tours available: ${Object.keys(scrapedData).length}`);
