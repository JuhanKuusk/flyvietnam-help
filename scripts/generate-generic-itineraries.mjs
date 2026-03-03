import fs from 'fs';

// Tours without itinerary that need generic content
const toursToUpdate = [
  { slug: 'halong-bay-2-days-1-night-cruise', days: 2, type: 'cruise', location: 'Halong Bay' },
  { slug: 'halong-bay-luxury-cruise', days: 2, type: 'cruise', location: 'Halong Bay' },
  { slug: 'lan-ha-bay-2-days-1-night', days: 2, type: 'cruise', location: 'Lan Ha Bay' },
  { slug: 'bai-tu-long-bay-2-days-1-night', days: 2, type: 'cruise', location: 'Bai Tu Long Bay' },
  { slug: 'sapa-trekking-2-days', days: 2, type: 'trekking', location: 'Sapa' },
  { slug: 'hanoi-city-tour-2-days', days: 2, type: 'city', location: 'Hanoi' },
  { slug: 'hanoi-3-days-tour', days: 3, type: 'city', location: 'Hanoi' },
  { slug: 'hanoi-4-days-tour', days: 4, type: 'city', location: 'Hanoi' },
  { slug: 'mekong-delta-4-days', days: 4, type: 'delta', location: 'Mekong Delta' },
  { slug: 'mekong-delta-3-days', days: 3, type: 'delta', location: 'Mekong Delta' },
  { slug: 'mekong-ben-tre-eco-tour', days: 1, type: 'delta', location: 'Ben Tre' },
  { slug: 'mekong-cycling-adventure', days: 2, type: 'cycling', location: 'Mekong Delta' },
  { slug: 'ben-tre-day-trip', days: 1, type: 'delta', location: 'Ben Tre' },
  { slug: 'sapa-muong-hoa-valley', days: 2, type: 'trekking', location: 'Sapa' },
  { slug: 'sapa-off-beaten-track', days: 3, type: 'trekking', location: 'Sapa' },
  { slug: 'northern-vietnam-5-days', days: 5, type: 'multi', location: 'Northern Vietnam' },
  { slug: 'hanoi-halong-4-days', days: 4, type: 'multi', location: 'Hanoi & Halong' },
  { slug: 'hanoi-halong-3-days-2-nights', days: 3, type: 'multi', location: 'Hanoi & Halong' },
  { slug: 'phu-quoc-3-days', days: 3, type: 'beach', location: 'Phu Quoc' },
  { slug: 'phu-quoc-diving-4-days', days: 4, type: 'diving', location: 'Phu Quoc' },
  { slug: 'ho-chi-minh-mekong-4-days', days: 4, type: 'multi', location: 'Ho Chi Minh & Mekong' },
  { slug: 'vietnam-6-days-tour', days: 6, type: 'multi', location: 'Vietnam' },
  { slug: 'northern-vietnam-7-days', days: 7, type: 'multi', location: 'Northern Vietnam' },
  { slug: 'vietnam-introduction-8-days', days: 8, type: 'multi', location: 'Vietnam' },
  { slug: 'scenic-vietnam-10-days', days: 10, type: 'multi', location: 'Vietnam' },
  { slug: 'vietnam-discovery-11-days', days: 11, type: 'multi', location: 'Vietnam' },
  { slug: 'vietnam-complete-12-days', days: 12, type: 'multi', location: 'Vietnam' },
  { slug: 'vietnam-insight-14-days', days: 14, type: 'multi', location: 'Vietnam' },
  { slug: 'amazing-vietnam-15-days', days: 15, type: 'multi', location: 'Vietnam' },
  { slug: 'vietnam-cambodia-15-days', days: 15, type: 'multi', location: 'Vietnam & Cambodia' },
  { slug: 'vietnam-cambodia-18-days', days: 18, type: 'multi', location: 'Vietnam & Cambodia' },
  { slug: 'discover-vietnam-20-days', days: 20, type: 'multi', location: 'Vietnam' },
  { slug: 'vietnam-cambodia-21-days', days: 21, type: 'multi', location: 'Vietnam & Cambodia' },
  { slug: 'vietnam-luxury-10-days', days: 10, type: 'luxury', location: 'Vietnam' },
  { slug: 'hanoi-sapa-6-days', days: 6, type: 'multi', location: 'Hanoi & Sapa' },
  { slug: 'essential-vietnam-9-days', days: 9, type: 'multi', location: 'Vietnam' },
  { slug: 'essence-vietnam-10-days', days: 10, type: 'multi', location: 'Vietnam' },
  { slug: 'central-vietnam-7-days', days: 7, type: 'multi', location: 'Central Vietnam' },
  { slug: 'discovery-northeast-vietnam-9-days', days: 9, type: 'multi', location: 'Northeast Vietnam' },
  { slug: 'southern-vietnam-7-days', days: 7, type: 'multi', location: 'Southern Vietnam' },
  { slug: 'signatures-vietnam-14-days', days: 14, type: 'luxury', location: 'Vietnam' },
  { slug: 'cultural-heritage-vietnam-12-days', days: 12, type: 'cultural', location: 'Vietnam' },
  { slug: 'natural-wonders-vietnam-16-days', days: 16, type: 'nature', location: 'Vietnam' },
  { slug: 'perfect-vietnam-7-days', days: 7, type: 'multi', location: 'Vietnam' },
  { slug: 'vietnam-discovery-8-days', days: 8, type: 'multi', location: 'Vietnam' },
  { slug: 'hanoi-ninh-binh-halong-5-days', days: 5, type: 'multi', location: 'Hanoi, Ninh Binh & Halong' },
  { slug: 'nature-north-vietnam-8-days', days: 8, type: 'nature', location: 'Northern Vietnam' },
  { slug: 'highlights-vietnam-10-days', days: 10, type: 'multi', location: 'Vietnam' },
  { slug: 'cultural-odyssey-vietnam-10-days', days: 10, type: 'cultural', location: 'Vietnam' },
  { slug: 'best-vietnam-13-days', days: 13, type: 'multi', location: 'Vietnam' },
  { slug: 'discovery-north-east-vietnam-13-days', days: 13, type: 'multi', location: 'Northeast Vietnam' },
  { slug: 'mon-cheri-cruise-lan-ha-bay', days: 2, type: 'cruise', location: 'Lan Ha Bay' },
  { slug: 'lyra-grandeur-cruise-halong-bay', days: 2, type: 'cruise', location: 'Halong Bay' },
];

// Template itineraries based on type and location
const templates = {
  cruise: {
    day1: { title: 'Embarkation & Cruise', activities: ['Welcome aboard and check-in', 'Enjoy welcome lunch while cruising', 'Visit stunning limestone caves', 'Kayaking through hidden lagoons', 'Watch sunset from sundeck', 'Delicious seafood dinner'], meals: ['Lunch', 'Dinner'] },
    day2: { title: 'Sunrise & Disembarkation', activities: ['Early morning Tai Chi on deck', 'Watch sunrise over the bay', 'Enjoy breakfast buffet', 'Visit floating fishing village', 'Check out and transfer back'], meals: ['Breakfast', 'Brunch'] },
  },
  trekking: {
    day1: { title: 'Arrival & Light Trek', activities: ['Transfer to trekking base', 'Meet local guide', 'Light afternoon trek through villages', 'Visit ethnic minority communities', 'Homestay dinner with local family'], meals: ['Lunch', 'Dinner'] },
    day2: { title: 'Full Day Trek', activities: ['Early breakfast', 'Trek through rice terraces', 'Visit remote villages', 'Lunch with local family', 'Return trek to base'], meals: ['Breakfast', 'Lunch'] },
  },
  delta: {
    day1: { title: 'Mekong Delta Exploration', activities: ['Boat trip through canals', 'Visit floating markets', 'Explore coconut candy workshops', 'Sample tropical fruits', 'Traditional music performance'], meals: ['Lunch'] },
  },
  city: {
    day1: { title: 'City Highlights', activities: ['Hotel pickup', 'Visit major landmarks', 'Explore Old Quarter', 'Traditional lunch', 'Afternoon temple visits'], meals: ['Lunch'] },
    day2: { title: 'Cultural Immersion', activities: ['Morning market visit', 'Cooking class experience', 'Museum exploration', 'Evening street food tour'], meals: ['Breakfast', 'Lunch', 'Dinner'] },
  },
  beach: {
    day1: { title: 'Beach Arrival', activities: ['Airport transfer', 'Resort check-in', 'Beach relaxation', 'Sunset cocktails'], meals: ['Dinner'] },
    day2: { title: 'Island Discovery', activities: ['Snorkeling trip', 'Beach hopping', 'Fresh seafood lunch', 'Water sports'], meals: ['Breakfast', 'Lunch'] },
  },
  multi: {
    templates: [
      { title: 'Arrival & Welcome', activities: ['Airport pickup', 'Hotel check-in', 'Welcome briefing', 'Evening city orientation walk'], meals: ['Dinner'] },
      { title: 'City Exploration', activities: ['Morning city tour', 'Visit historical sites', 'Traditional lunch', 'Afternoon cultural activities'], meals: ['Breakfast', 'Lunch'] },
      { title: 'Scenic Journey', activities: ['Transfer to next destination', 'Scenic stops along the way', 'Local village visit', 'Check-in at new location'], meals: ['Breakfast', 'Lunch', 'Dinner'] },
      { title: 'Nature & Adventure', activities: ['Morning outdoor activities', 'Nature exploration', 'Picnic lunch', 'Afternoon leisure'], meals: ['Breakfast', 'Lunch'] },
      { title: 'Cultural Discovery', activities: ['Visit UNESCO sites', 'Traditional craft villages', 'Authentic local lunch', 'Evening entertainment'], meals: ['Breakfast', 'Lunch'] },
      { title: 'Local Experience', activities: ['Morning market visit', 'Cooking class', 'Explore local neighborhoods', 'Free time for shopping'], meals: ['Breakfast', 'Lunch'] },
      { title: 'Beach & Relaxation', activities: ['Transfer to coastal area', 'Beach time', 'Fresh seafood dinner', 'Sunset watching'], meals: ['Breakfast', 'Dinner'] },
      { title: 'Departure', activities: ['Breakfast at hotel', 'Last-minute shopping', 'Airport transfer', 'Farewell'], meals: ['Breakfast'] },
    ]
  }
};

function generateItinerary(tour) {
  const itinerary = [];

  if (tour.type === 'cruise' && tour.days === 2) {
    itinerary.push({ day: 1, ...templates.cruise.day1, description: `Begin your ${tour.location} cruise adventure with embarkation and scenic cruising.` });
    itinerary.push({ day: 2, ...templates.cruise.day2, description: `Wake up to stunning views of ${tour.location} before disembarking.` });
  } else if (tour.type === 'trekking') {
    for (let i = 1; i <= tour.days; i++) {
      const template = i === 1 ? templates.trekking.day1 : templates.trekking.day2;
      itinerary.push({ day: i, ...template, description: `Day ${i} of your ${tour.location} trekking adventure.` });
    }
  } else if (tour.type === 'delta') {
    itinerary.push({ day: 1, ...templates.delta.day1, description: `Discover the waterways and local life of ${tour.location}.` });
  } else if (tour.type === 'city') {
    for (let i = 1; i <= Math.min(tour.days, 2); i++) {
      const template = i === 1 ? templates.city.day1 : templates.city.day2;
      itinerary.push({ day: i, ...template, description: `Explore the highlights of ${tour.location}.` });
    }
  } else if (tour.type === 'beach' || tour.type === 'diving') {
    for (let i = 1; i <= Math.min(tour.days, 2); i++) {
      const template = i === 1 ? templates.beach.day1 : templates.beach.day2;
      itinerary.push({ day: i, ...template, description: `Enjoy the beautiful beaches of ${tour.location}.` });
    }
  } else {
    // Multi-day tours
    const multiTemplates = templates.multi.templates;
    for (let i = 1; i <= tour.days; i++) {
      const templateIdx = (i - 1) % multiTemplates.length;
      const template = multiTemplates[templateIdx];

      // Customize for first and last day
      let dayTemplate = { ...template };
      if (i === 1) {
        dayTemplate = multiTemplates[0];
      } else if (i === tour.days) {
        dayTemplate = multiTemplates[multiTemplates.length - 1];
      }

      itinerary.push({
        day: i,
        title: dayTemplate.title,
        description: `Day ${i} of your ${tour.location} journey - ${dayTemplate.title.toLowerCase()}.`,
        activities: dayTemplate.activities,
        meals: dayTemplate.meals
      });
    }
  }

  return itinerary;
}

// Read tours-data.ts
let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
let updatedCount = 0;

for (const tour of toursToUpdate) {
  // Check if tour exists and doesn't have itinerary
  const tourRegex = new RegExp(`(\\{[^{}]*slug:\\s*['"]${tour.slug}['"][^{}]*\\})`, 's');
  const match = content.match(tourRegex);

  if (!match) {
    console.log(`SKIP: ${tour.slug} not found`);
    continue;
  }

  if (match[1].includes('itinerary:')) {
    console.log(`SKIP: ${tour.slug} already has itinerary`);
    continue;
  }

  // Generate itinerary
  const itinerary = generateItinerary(tour);

  // Format itinerary code
  const itineraryCode = `    itinerary: [\n${itinerary.map(day => `      {
        day: ${day.day},
        title: ${JSON.stringify(day.title)},
        description: ${JSON.stringify(day.description)},
        activities: ${JSON.stringify(day.activities)},
        meals: ${JSON.stringify(day.meals)},
      }`).join(',\n')}\n    ],`;

  // Insert before closing brace
  const tourSection = match[1];
  const insertPoint = tourSection.lastIndexOf('}');
  const updatedTour = tourSection.slice(0, insertPoint) + '\n' + itineraryCode + '\n  ' + tourSection.slice(insertPoint);

  content = content.replace(tourSection, updatedTour);
  updatedCount++;
  console.log(`UPDATED: ${tour.slug} (${tour.days} days)`);
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log(`\nTotal updated: ${updatedCount} tours`);
