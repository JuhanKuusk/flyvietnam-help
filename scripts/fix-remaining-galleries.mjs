import fs from 'fs';

// Tours still missing galleries with their types
const missingTours = [
  { slug: 'mon-cheri-cruise-lan-ha-bay', type: 'halong' },
  { slug: 'lyra-grandeur-cruise-halong-bay', type: 'halong' },
  { slug: 'insight-mekong-delta-day-trip', type: 'mekong' },
  { slug: 'best-vietnam-cambodia-15-days', type: 'vietnam' },
  { slug: 'cu-chi-tunnels-mekong-delta-day-tour', type: 'mekong' },
  { slug: 'saigon-to-danang-golf-history-8-days', type: 'vietnam' },
  { slug: 'south-vietnam-saigon-mui-ne-beach-7-days', type: 'hcm' },
  { slug: 'luxury-vietnam-beach-wellness-spa-14-days', type: 'vietnam' },
  { slug: 'highlights-vietnam-north-south-12-days', type: 'vietnam' },
  { slug: 'vietnam-essential-10-days', type: 'vietnam' },
  { slug: 'hanoi-street-food-walking-tour', type: 'hanoi' },
  { slug: 'vietnam-adventure-biking-trekking-snorkeling-12-days', type: 'vietnam' },
  { slug: 'vietnam-adventure-bike-north-south-16-days', type: 'vietnam' },
  { slug: 'small-group-mekong-adventure-3-days', type: 'mekong' },
  { slug: 'vietnam-photography-expedition-15-days', type: 'vietnam' },
  { slug: 'dmz-battlefield-tour-2-days', type: 'hue' },
  { slug: 'vietnam-birdwatching-expedition-10-days', type: 'vietnam' },
];

// Load category images
const categoryImages = JSON.parse(fs.readFileSync('scripts/asiatouradvisor-category-images.json', 'utf8'));

// Filter function to clean up images
const filterImages = (images) => {
  return images.filter(img =>
    !img.includes('cambodia.webp') &&
    !img.includes('myanmar.webp') &&
    !img.includes('thailand.webp') &&
    !img.includes('laos.webp') &&
    !img.includes('travellers-choices') &&
    !img.includes('ints.png')
  );
};

// Map tour types to categories
const typeToCategory = {
  halong: 'hanoi-tours',
  mekong: 'mekong-delta-tours',
  vietnam: 'package-tours',
  hanoi: 'hanoi-tours',
  hcm: 'ho-chi-minh-tours',
  hue: 'hue-tours',
};

// Update tours-data.ts
let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
let updatedCount = 0;

for (const tour of missingTours) {
  const category = typeToCategory[tour.type] || 'package-tours';
  const images = filterImages(categoryImages[category] || categoryImages['package-tours']);

  if (images.length < 5) {
    console.log(`SKIP: ${tour.slug} - not enough images for ${category}`);
    continue;
  }

  // Select random subset
  const shuffled = [...images].sort(() => 0.5 - Math.random());
  const selectedImages = shuffled.slice(0, 12);

  // Find the tour
  const slugIndex = content.indexOf(`slug: "${tour.slug}"`);
  if (slugIndex === -1) {
    console.log(`NOT FOUND: ${tour.slug}`);
    continue;
  }

  // Find next tour
  const nextTourMatch = content.slice(slugIndex + 50).match(/\n  \{[\s\n]+id:/);
  const tourEndIndex = nextTourMatch ? slugIndex + 50 + nextTourMatch.index : content.length;
  const tourSection = content.slice(slugIndex, tourEndIndex);

  // Skip if already has gallery
  if (tourSection.includes('imageGallery:')) {
    console.log(`SKIP: ${tour.slug} - already has gallery`);
    continue;
  }

  // Find insertion point
  let insertMatch = tourSection.match(/itinerary:\s*\[[\s\S]*?\n    \],?/);
  if (!insertMatch) insertMatch = tourSection.match(/excluded:\s*\[[\s\S]*?\n    \],?/);
  if (!insertMatch) insertMatch = tourSection.match(/included:\s*\[[\s\S]*?\n    \],?/);
  if (!insertMatch) {
    console.log(`NO INSERTION POINT: ${tour.slug}`);
    continue;
  }

  const galleryCode = `\n    imageGallery: [\n      ${selectedImages.map(i => `"${i}"`).join(',\n      ')}\n    ],`;
  const insertPosition = slugIndex + insertMatch.index + insertMatch[0].length;

  content = content.slice(0, insertPosition) + galleryCode + content.slice(insertPosition);
  updatedCount++;
  console.log(`Updated: ${tour.slug}`);
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log(`\n=== COMPLETE ===`);
console.log(`Tours updated: ${updatedCount}`);
