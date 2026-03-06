import fs from 'fs';

// Map our tour slugs to the scraped asiatouradvisor data
const tourMappings = {
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

// Process each mapping
for (const [ourSlug, scrapedSlug] of Object.entries(tourMappings)) {
  const scraped = scrapedData[scrapedSlug];
  if (!scraped) {
    console.log(`SKIP: No scraped data for ${scrapedSlug}`);
    continue;
  }

  // Find position of slug in content
  const slugIndex = content.indexOf(`slug: "${ourSlug}"`);
  if (slugIndex === -1) {
    const altIndex = content.indexOf(`slug: '${ourSlug}'`);
    if (altIndex === -1) {
      console.log(`SKIP: Tour ${ourSlug} not found`);
      continue;
    }
  }

  // Find the itinerary field for this tour
  // Look for 'itinerary: [' after the slug
  const searchStart = content.indexOf(`slug: "${ourSlug}"`) !== -1
    ? content.indexOf(`slug: "${ourSlug}"`)
    : content.indexOf(`slug: '${ourSlug}'`);

  // Find next tour or end of array
  const nextTourMatch = content.slice(searchStart + 50).match(/\n  \{[\s\n]+id:/);
  const tourEndIndex = nextTourMatch
    ? searchStart + 50 + nextTourMatch.index
    : content.length;

  const tourSection = content.slice(searchStart, tourEndIndex);

  // Find existing itinerary in this tour section
  const itineraryMatch = tourSection.match(/itinerary:\s*\[[\s\S]*?\n    \],?/);

  if (!itineraryMatch) {
    console.log(`SKIP: No itinerary found for ${ourSlug}`);
    continue;
  }

  // Build new itinerary
  const newItinerary = scraped.itinerary.map(day => {
    return {
      day: day.day,
      title: JSON.stringify(day.title || `Day ${day.day}`),
      description: JSON.stringify(day.description || ''),
      activities: day.activities?.map(a => JSON.stringify(a.substring(0, 200))) || [],
      meals: day.meals?.map(m => JSON.stringify(m)) || [],
      dayImages: day.images?.slice(0, 3).map(i => JSON.stringify(i)) || []
    };
  });

  // Format itinerary as TypeScript code
  const itineraryCode = `itinerary: [
${newItinerary.map(day => `      {
        day: ${day.day},
        title: ${day.title},
        description: ${day.description},
        activities: [${day.activities.join(', ')}],
        meals: [${day.meals.join(', ')}],
        dayImages: [${day.dayImages.join(', ')}],
      }`).join(',\n')}
    ],`;

  // Build imageGallery
  const allImages = new Set();
  scraped.itinerary.forEach(day => {
    if (day.images) {
      day.images.slice(0, 2).forEach(img => allImages.add(img));
    }
  });
  scraped.images?.forEach(img => {
    if (!img.includes('GB.webp') && !img.includes('FR.webp') &&
        !img.includes('ES.webp') && !img.includes('DE.webp') && !img.includes('IT.webp') &&
        !img.includes('live-chat') && !img.includes('cambodia.webp') && !img.includes('myanmar.webp') &&
        !img.includes('thailand.webp') && !img.includes('laos.webp')) {
      allImages.add(img);
    }
  });
  const imageGallery = Array.from(allImages).slice(0, 12);
  const imageGalleryCode = `imageGallery: [\n      ${imageGallery.map(i => JSON.stringify(i)).join(',\n      ')}\n    ],`;

  // Replace existing itinerary
  const oldItinerary = itineraryMatch[0];
  let replacement = itineraryCode;

  // Check if imageGallery exists
  if (!tourSection.includes('imageGallery:')) {
    replacement = itineraryCode + '\n    ' + imageGalleryCode;
  }

  const absoluteStart = searchStart + itineraryMatch.index;
  const absoluteEnd = absoluteStart + oldItinerary.length;

  content = content.slice(0, absoluteStart) + replacement + content.slice(absoluteEnd);

  updatedCount++;
  console.log(`UPDATED: ${ourSlug} (${scraped.itinerary.length} days, ${imageGallery.length} gallery images)`);
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log(`\n=== COMPLETE ===`);
console.log(`Tours updated: ${updatedCount}`);
