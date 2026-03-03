import fs from 'fs';

// Only good quality matches
const matches = [
  { tour: 'hanoi-street-food-walking-tour', scraped: 'hanoi-street-food-tour' },
  { tour: 'luxury-cu-chi-tunnels-speedboat-tour', scraped: 'luxury-cu-chi-tunnels-speedboat-tour' },
  { tour: 'luxury-dinner-cruise-saigon-river', scraped: 'luxury-dinner-cruise-on-saigon-river' },
  { tour: 'hoi-an-memories-show-ticket', scraped: 'hoi-an-memories-show-ticket' },
  { tour: 'cam-thanh-coconut-village-basket-boat', scraped: 'cam-thanh-coconut-village-basket-boat-tour' },
  { tour: 'hoi-an-half-day-walking-city-tour', scraped: 'hoi-an-half-day-walking-city-tour' },
  { tour: 'ninh-binh-day-trip', scraped: 'ninh-binh-hoa-lu-trang-an-full-day-private-tour' },
  { tour: 'pu-luong-trekking', scraped: 'mai-chau-to-pu-luong-mountain-escape-3-days' },
  { tour: 'danang-hoi-an-4-days', scraped: 'da-nang-hoi-an-ba-na-hills-5-days' },
  { tour: 'insight-mekong-delta-day-trip', scraped: 'insight-mekong-delta-full-day' },
  { tour: 'cu-chi-tunnels-half-day', scraped: 'cu-chi-tunnels-biking-tour-full-day' },
  { tour: 'mekong-homestay-experience', scraped: 'mekong-delta-explore-at-ben-tre-homestay-2-days' },
  { tour: 'vietnam-family-tour-11-days', scraped: 'classic-vietnam-tours-for-family-12-days' },
  { tour: 'vietnam-beach-family-14-days', scraped: 'classic-vietnam-tours-for-family-12-days' },
];

function generateItinerary(itinerary) {
  if (!itinerary || itinerary.length === 0) return null;

  const days = itinerary.map(day => {
    const dayImages = day.images && day.images.length > 0
      ? `\n        dayImages: ${JSON.stringify(day.images)},`
      : '';

    return `      {
        day: ${day.day || 1},
        title: ${JSON.stringify(day.title || '')},
        description: ${JSON.stringify(day.description || '')},
        activities: ${JSON.stringify(day.activities || [])},
        meals: ${JSON.stringify(day.meals || [])},${dayImages}
      }`;
  }).join(',\n');

  return `    itinerary: [\n${days}\n    ],`;
}

function generateImageGallery(images) {
  if (!images || images.length === 0) return null;
  return `    imageGallery: ${JSON.stringify(images)},`;
}

let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
let updatedCount = 0;

for (const match of matches) {
  const scrapedPath = `scripts/tour-data-output/${match.scraped}.json`;

  if (!fs.existsSync(scrapedPath)) {
    console.log(`SKIP: No scraped file for ${match.scraped}`);
    continue;
  }

  const scraped = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));

  // Find the tour in tours-data.ts
  const tourRegex = new RegExp(`(\\{[^{}]*slug:\\s*['"]${match.tour}['"][^{}]*\\})`, 's');
  const tourMatch = content.match(tourRegex);

  if (!tourMatch) {
    console.log(`SKIP: Tour ${match.tour} not found in tours-data.ts`);
    continue;
  }

  let tourSection = tourMatch[1];

  // Skip if already has itinerary
  if (tourSection.includes('itinerary:')) {
    console.log(`SKIP: ${match.tour} already has itinerary`);
    continue;
  }

  // Generate new content
  const newContent = [];

  if (scraped.itinerary && scraped.itinerary.length > 0) {
    newContent.push(generateItinerary(scraped.itinerary));
  }

  if (scraped.images && scraped.images.length > 0 && !tourSection.includes('imageGallery:')) {
    newContent.push(generateImageGallery(scraped.images));
  }

  if (newContent.length === 0) {
    console.log(`SKIP: No new content for ${match.tour}`);
    continue;
  }

  // Insert before the closing brace
  const insertPoint = tourSection.lastIndexOf('}');
  const updatedTour = tourSection.slice(0, insertPoint) + '\n' + newContent.join('\n') + '\n  ' + tourSection.slice(insertPoint);

  content = content.replace(tourSection, updatedTour);
  updatedCount++;
  console.log(`UPDATED: ${match.tour}`);
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log(`\nTotal updated: ${updatedCount} tours`);
