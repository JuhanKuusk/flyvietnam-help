import fs from 'fs';

const toursToUpdate = [
  { slug: 'ninh-binh-day-trip', days: 1, type: 'nature', location: 'Ninh Binh' },
  { slug: 'cu-chi-tunnels-half-day', days: 1, type: 'history', location: 'Cu Chi' },
  { slug: 'hanoi-street-food-walking-tour', days: 1, type: 'food', location: 'Hanoi' },
  { slug: 'insight-mekong-delta-day-trip', days: 1, type: 'delta', location: 'Mekong Delta' },
  { slug: 'luxury-cu-chi-tunnels-speedboat-tour', days: 1, type: 'history', location: 'Cu Chi' },
  { slug: 'luxury-dinner-cruise-saigon-river', days: 1, type: 'cruise', location: 'Saigon River' },
  { slug: 'hoi-an-memories-show-ticket', days: 1, type: 'show', location: 'Hoi An' },
  { slug: 'cam-thanh-coconut-village-basket-boat', days: 1, type: 'experience', location: 'Hoi An' },
  { slug: 'hoi-an-half-day-walking-city-tour', days: 1, type: 'city', location: 'Hoi An' },
];

const itineraries = {
  'ninh-binh-day-trip': [
    { day: 1, title: 'Ninh Binh Day Trip', description: 'Explore the stunning landscapes of Ninh Binh, known as "Halong Bay on Land".', activities: ['Morning pickup from Hanoi', 'Visit Hoa Lu ancient capital', 'Boat ride through Tam Coc caves', 'Cycle through rice paddies', 'Visit Bich Dong Pagoda', 'Return to Hanoi'], meals: ['Lunch'] }
  ],
  'cu-chi-tunnels-half-day': [
    { day: 1, title: 'Cu Chi Tunnels Exploration', description: 'Discover the incredible underground tunnel network used during the Vietnam War.', activities: ['Hotel pickup in Ho Chi Minh City', 'Drive to Cu Chi district', 'Watch documentary film', 'Explore tunnel sections', 'See war remnants and traps', 'Optional shooting range', 'Return to city'], meals: ['Snacks'] }
  ],
  'hanoi-street-food-walking-tour': [
    { day: 1, title: 'Hanoi Street Food Adventure', description: 'Taste the best of Hanoi cuisine on this walking food tour through the Old Quarter.', activities: ['Evening meetup in Old Quarter', 'Try famous Pho Bo', 'Sample Bun Cha', 'Taste Banh Mi', 'Visit local beer corner', 'Try egg coffee', 'Sweet dessert finale'], meals: ['Dinner'] }
  ],
  'insight-mekong-delta-day-trip': [
    { day: 1, title: 'Mekong Delta Discovery', description: 'Experience the vibrant life of the Mekong Delta waterways.', activities: ['Early pickup from Ho Chi Minh City', 'Boat cruise through canals', 'Visit Cai Be floating market', 'Explore fruit orchards', 'Traditional music performance', 'Coconut candy workshop', 'Return to city'], meals: ['Lunch'] }
  ],
  'luxury-cu-chi-tunnels-speedboat-tour': [
    { day: 1, title: 'Luxury Cu Chi Speedboat Tour', description: 'Travel in style by speedboat to the historic Cu Chi Tunnels.', activities: ['Hotel pickup', 'Scenic speedboat ride on Saigon River', 'Explore tunnel complex', 'Learn about wartime history', 'Lunch at riverside restaurant', 'Speedboat return to city'], meals: ['Lunch'] }
  ],
  'luxury-dinner-cruise-saigon-river': [
    { day: 1, title: 'Saigon River Dinner Cruise', description: 'Enjoy a romantic evening cruise along the Saigon River with fine dining.', activities: ['Evening pier pickup', 'Welcome drink on deck', 'Scenic river cruise', 'Gourmet dinner service', 'Live music entertainment', 'City lights viewing', 'Return to pier'], meals: ['Dinner'] }
  ],
  'hoi-an-memories-show-ticket': [
    { day: 1, title: 'Hoi An Memories Show', description: 'Experience the spectacular outdoor performance showcasing Hoi An\'s rich history.', activities: ['Transfer to show venue', 'Pre-show riverside walk', 'Watch Hoi An Memories performance', '500+ performers', 'Stunning visual effects', 'Return transfer'], meals: [] }
  ],
  'cam-thanh-coconut-village-basket-boat': [
    { day: 1, title: 'Coconut Village Basket Boat', description: 'Paddle through the coconut palm water forest in traditional round basket boats.', activities: ['Pickup from Hoi An', 'Arrive at Cam Thanh village', 'Board basket boat', 'Paddle through coconut forest', 'Learn local fishing techniques', 'Crab catching demonstration', 'Return to Hoi An'], meals: ['Snacks'] }
  ],
  'hoi-an-half-day-walking-city-tour': [
    { day: 1, title: 'Hoi An Walking Tour', description: 'Discover the UNESCO World Heritage ancient town of Hoi An on foot.', activities: ['Morning meetup', 'Japanese Covered Bridge', 'Tan Ky Ancient House', 'Fujian Assembly Hall', 'Local market visit', 'Riverside stroll', 'Free time in Old Town'], meals: [] }
  ],
};

let content = fs.readFileSync('src/lib/tours-data.ts', 'utf8');
let updatedCount = 0;

for (const tour of toursToUpdate) {
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

  const itinerary = itineraries[tour.slug];
  if (!itinerary) {
    console.log(`SKIP: ${tour.slug} no itinerary defined`);
    continue;
  }

  const itineraryCode = `    itinerary: [\n${itinerary.map(day => `      {
        day: ${day.day},
        title: ${JSON.stringify(day.title)},
        description: ${JSON.stringify(day.description)},
        activities: ${JSON.stringify(day.activities)},
        meals: ${JSON.stringify(day.meals)},
      }`).join(',\n')}\n    ],`;

  const tourSection = match[1];
  const insertPoint = tourSection.lastIndexOf('}');
  const updatedTour = tourSection.slice(0, insertPoint) + '\n' + itineraryCode + '\n  ' + tourSection.slice(insertPoint);

  content = content.replace(tourSection, updatedTour);
  updatedCount++;
  console.log(`UPDATED: ${tour.slug}`);
}

fs.writeFileSync('src/lib/tours-data.ts', content);
console.log(`\nTotal updated: ${updatedCount} tours`);
