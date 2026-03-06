import fs from 'fs';

// Halong cruise tours that need galleries
const halongTours = [
  'halong-day-trip-sung-sot-titop',
  'serenity-cruise-2-days-1-night',
  'lan-ha-bay-luxury-day-tour',
  'renea-cruise-2-days-1-night',
];

// Load category images
const categoryImages = JSON.parse(fs.readFileSync('scripts/asiatouradvisor-category-images.json', 'utf8'));

// Get Halong-related images from hanoi-tours (which includes Halong)
const halongImages = categoryImages['hanoi-tours']
  .filter(img =>
    !img.includes('cambodia.webp') &&
    !img.includes('myanmar.webp') &&
    !img.includes('thailand.webp') &&
    !img.includes('laos.webp') &&
    !img.includes('travellers-choices') &&
    !img.includes('ints.png') &&
    (img.includes('Halong') || img.includes('halong') || img.includes('Bay') ||
     img.includes('cruise') || img.includes('Asia-Tour'))
  );

// Also add some package-tours images
const packageImages = categoryImages['package-tours']
  .filter(img =>
    !img.includes('cambodia.webp') &&
    !img.includes('myanmar.webp') &&
    !img.includes('thailand.webp') &&
    !img.includes('laos.webp') &&
    !img.includes('travellers-choices') &&
    !img.includes('ints.png') &&
    (img.includes('Halong') || img.includes('halong') || img.includes('cruise') ||
     img.includes('floating') || img.includes('bay'))
  );

const allHalongImages = [...new Set([...halongImages, ...packageImages])];
console.log(`Found ${allHalongImages.length} Halong images`);

if (allHalongImages.length < 5) {
  // Add more generic Vietnam images
  const moreImages = categoryImages['hanoi-tours']
    .filter(img =>
      !img.includes('cambodia.webp') &&
      !img.includes('myanmar.webp') &&
      !img.includes('thailand.webp') &&
      !img.includes('laos.webp') &&
      !img.includes('travellers-choices') &&
      !img.includes('ints.png')
    ).slice(0, 15);
  allHalongImages.push(...moreImages);
}

console.log(`Total images available: ${allHalongImages.length}`);

// Update tours-data.ts
let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
let updatedCount = 0;

for (const slug of halongTours) {
  // Select random subset
  const shuffled = [...allHalongImages].sort(() => 0.5 - Math.random());
  const selectedImages = shuffled.slice(0, 12);

  // Find the tour
  const slugIndex = content.indexOf(`slug: "${slug}"`);
  if (slugIndex === -1) {
    console.log(`NOT FOUND: ${slug}`);
    continue;
  }

  // Find next tour
  const nextTourMatch = content.slice(slugIndex + 50).match(/\n  \{[\s\n]+id:/);
  const tourEndIndex = nextTourMatch ? slugIndex + 50 + nextTourMatch.index : content.length;
  const tourSection = content.slice(slugIndex, tourEndIndex);

  // Skip if already has gallery
  if (tourSection.includes('imageGallery:')) {
    console.log(`SKIP: ${slug} - already has gallery`);
    continue;
  }

  // Find insertion point
  let insertMatch = tourSection.match(/itinerary:\s*\[[\s\S]*?\n    \],?/);
  if (!insertMatch) insertMatch = tourSection.match(/excluded:\s*\[[\s\S]*?\n    \],?/);
  if (!insertMatch) insertMatch = tourSection.match(/included:\s*\[[\s\S]*?\n    \],?/);
  if (!insertMatch) {
    console.log(`NO INSERTION POINT: ${slug}`);
    continue;
  }

  const galleryCode = `\n    imageGallery: [\n      ${selectedImages.map(i => `"${i}"`).join(',\n      ')}\n    ],`;
  const insertPosition = slugIndex + insertMatch.index + insertMatch[0].length;

  content = content.slice(0, insertPosition) + galleryCode + content.slice(insertPosition);
  updatedCount++;
  console.log(`Updated: ${slug}`);
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log(`\n=== COMPLETE ===`);
console.log(`Tours updated: ${updatedCount}`);
