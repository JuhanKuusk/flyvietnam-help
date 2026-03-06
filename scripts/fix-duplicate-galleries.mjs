import fs from 'fs';

let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');

// Find all tours and check for duplicate imageGallery fields
const tourRegex = /slug:\s*["']([^"']+)["']/g;
let match;
let fixedCount = 0;

while ((match = tourRegex.exec(content)) !== null) {
  const slug = match[1];
  const startIdx = match.index;

  // Find next tour
  const nextTourMatch = content.slice(startIdx + 50).match(/\n  \{[\s\n]+id:/);
  const endIdx = nextTourMatch ? startIdx + 50 + nextTourMatch.index : content.length;
  const tourSection = content.slice(startIdx, endIdx);

  // Count imageGallery occurrences
  const galleryMatches = tourSection.match(/imageGallery:\s*\[/g);
  if (galleryMatches && galleryMatches.length > 1) {
    console.log(`Found ${galleryMatches.length} imageGallery in ${slug}`);

    // Keep only the first imageGallery, remove others
    let fixedSection = tourSection;
    let firstGalleryFound = false;

    // Remove all but the first imageGallery
    fixedSection = fixedSection.replace(/(\n\s+imageGallery:\s*\[[^\]]*\],?)/g, (match, p1, offset) => {
      if (!firstGalleryFound) {
        firstGalleryFound = true;
        return p1; // Keep the first one
      }
      console.log(`  Removing duplicate at offset ${offset}`);
      return ''; // Remove subsequent ones
    });

    if (fixedSection !== tourSection) {
      content = content.slice(0, startIdx) + fixedSection + content.slice(endIdx);
      fixedCount++;
    }
  }
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log(`\nFixed ${fixedCount} tours with duplicate imageGallery`);
