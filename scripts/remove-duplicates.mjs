import fs from 'fs';

let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');

// Find duplicate slugs
const tourRegex = /slug:\s*["']([^"']+)["']/g;
let match;
const slugPositions = {};

while ((match = tourRegex.exec(content)) !== null) {
  const slug = match[1];
  const startIdx = match.index;

  // Find the start of this tour object (look backwards for '{')
  let objStart = startIdx;
  let braceCount = 0;
  for (let i = startIdx; i >= 0; i--) {
    if (content[i] === '{') {
      braceCount++;
      if (braceCount === 1) {
        objStart = i;
        break;
      }
    } else if (content[i] === '}') {
      braceCount--;
    }
  }

  // Find the end of this tour object
  const nextSlugMatch = content.slice(startIdx + 20).match(/\n  \{[\s\n]+id:/);
  const objEnd = nextSlugMatch ? startIdx + 20 + nextSlugMatch.index : content.length;

  const tourSection = content.slice(startIdx, objEnd);
  const hasGallery = tourSection.includes('imageGallery:');

  if (!slugPositions[slug]) {
    slugPositions[slug] = [];
  }
  slugPositions[slug].push({ startIdx, objStart, objEnd, hasGallery });
}

// Find duplicates
const duplicates = Object.entries(slugPositions).filter(([slug, positions]) => positions.length > 1);

console.log(`Found ${duplicates.length} duplicate slugs:`);

// For each duplicate, keep the one with gallery (or first one)
const toRemove = [];

for (const [slug, positions] of duplicates) {
  console.log(`\n${slug}: ${positions.length} occurrences`);
  positions.forEach((p, i) => console.log(`  [${i}] line ~${Math.round(p.startIdx / 80)}, hasGallery: ${p.hasGallery}`));

  // Find the best one to keep (with gallery preferably)
  const withGallery = positions.filter(p => p.hasGallery);
  let keepIdx = 0;
  if (withGallery.length > 0) {
    keepIdx = positions.indexOf(withGallery[0]);
  }

  console.log(`  Keeping index ${keepIdx}`);

  // Mark others for removal
  positions.forEach((p, i) => {
    if (i !== keepIdx) {
      toRemove.push(p);
    }
  });
}

console.log(`\nWill remove ${toRemove.length} duplicate entries`);

// Sort by position descending (remove from end first)
toRemove.sort((a, b) => b.startIdx - a.startIdx);

// Remove duplicates
for (const pos of toRemove) {
  // Find the actual tour object boundaries
  const searchStart = Math.max(0, pos.objStart - 100);
  const beforeTour = content.lastIndexOf('\n  {', pos.startIdx);
  const afterTour = content.indexOf('\n  },', pos.startIdx) + 4;

  if (beforeTour > 0 && afterTour > pos.startIdx) {
    console.log(`Removing tour at position ${beforeTour}-${afterTour}`);
    content = content.slice(0, beforeTour) + content.slice(afterTour);
  }
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log('\nDuplicates removed');
