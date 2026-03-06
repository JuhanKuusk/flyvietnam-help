import fs from 'fs';

const content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');

const tourRegex = /slug:\s*["']([^"']+)["']/g;
let match;
const invalidTours = [];

while ((match = tourRegex.exec(content)) !== null) {
  const slug = match[1];
  const startIdx = match.index;

  const nextSlugMatch = content.slice(startIdx + 20).match(/slug:\s*["']/);
  const endIdx = nextSlugMatch ? startIdx + 20 + nextSlugMatch.index : content.length;
  const tourSection = content.slice(startIdx, endIdx);

  const affiliateMatch = tourSection.match(/affiliateUrl:\s*["']([^"']+)["']/);
  const affiliateUrl = affiliateMatch ? affiliateMatch[1] : "";

  // Check for invalid URLs
  let isInvalid = false;
  let host = "";
  try {
    if (affiliateUrl) {
      host = new URL(affiliateUrl).hostname;
    } else {
      isInvalid = true;
    }
  } catch(e) {
    isInvalid = true;
  }

  if (isInvalid || (host !== "www.bestpricetravel.com" && host !== "www.asiatouradvisor.com")) {
    const nameMatch = tourSection.match(/name:\s*["']([^"']+)["']/);
    const name = nameMatch ? nameMatch[1] : slug;
    const hasGallery = tourSection.includes("imageGallery:");
    invalidTours.push({ slug, name, affiliateUrl: affiliateUrl || "MISSING", host, hasGallery });
  }
}

console.log(`Tours with invalid/missing URLs (${invalidTours.length}):\n`);
invalidTours.forEach(t => {
  console.log(`- ${t.slug}`);
  console.log(`  Name: ${t.name}`);
  console.log(`  URL: ${t.affiliateUrl}`);
  console.log(`  Host: ${t.host || "INVALID"}`);
  console.log(`  Has Gallery: ${t.hasGallery}`);
  console.log("");
});
