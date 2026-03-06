import { chromium } from 'playwright';
import fs from 'fs';

const toursToScrape = [
  { slug: "halong-bay-2-days-1-night-cruise", url: "https://www.asiatouradvisor.com/halong-bay-2-days-1-night-cruise/" },
  { slug: "halong-bay-luxury-cruise", url: "https://www.asiatouradvisor.com/halong-bay-luxury-cruise/" },
  { slug: "lan-ha-bay-2-days-1-night", url: "https://www.asiatouradvisor.com/lan-ha-bay-2-days-1-night/" },
  { slug: "bai-tu-long-bay-2-days-1-night", url: "https://www.asiatouradvisor.com/bai-tu-long-bay-cruise/" },
  { slug: "ninh-binh-day-trip", url: "https://www.asiatouradvisor.com/ninh-binh-day-trip/" },
  { slug: "sapa-trekking-2-days", url: "https://www.asiatouradvisor.com/sapa-trekking/" },
  { slug: "hanoi-city-tour-2-days", url: "https://www.asiatouradvisor.com/hanoi-city-tour/" },
  { slug: "hanoi-3-days-tour", url: "https://www.asiatouradvisor.com/hanoi-3-days/" },
  { slug: "hanoi-4-days-tour", url: "https://www.asiatouradvisor.com/hanoi-4-days/" },
  { slug: "mekong-delta-4-days", url: "https://www.asiatouradvisor.com/mekong-delta-4-days/" },
  { slug: "mekong-delta-3-days", url: "https://www.asiatouradvisor.com/mekong-delta-3-days/" },
  { slug: "mekong-homestay-experience", url: "https://www.asiatouradvisor.com/mekong-homestay/" },
  { slug: "mekong-ben-tre-eco-tour", url: "https://www.asiatouradvisor.com/ben-tre-day-trip/" },
  { slug: "mekong-cycling-adventure", url: "https://www.asiatouradvisor.com/mekong-cycling/" },
  { slug: "ben-tre-day-trip", url: "https://www.asiatouradvisor.com/ben-tre-day/" },
  { slug: "cu-chi-tunnels-half-day", url: "https://www.asiatouradvisor.com/cu-chi-tunnels/" },
  { slug: "central-vietnam-5-days", url: "https://www.asiatouradvisor.com/central-vietnam-5-days/" },
  { slug: "danang-hoi-an-4-days", url: "https://www.asiatouradvisor.com/danang-hoi-an-4-days/" },
  { slug: "sapa-muong-hoa-valley", url: "https://www.asiatouradvisor.com/sapa-muong-hoa-valley/" },
  { slug: "sapa-off-beaten-track", url: "https://www.asiatouradvisor.com/sapa-off-beaten-track/" },
  { slug: "northern-vietnam-5-days", url: "https://www.asiatouradvisor.com/northern-vietnam-5-days/" },
  { slug: "pu-luong-trekking", url: "https://www.asiatouradvisor.com/pu-luong-trekking/" },
  { slug: "hanoi-halong-4-days", url: "https://www.asiatouradvisor.com/hanoi-halong-4-days/" },
  { slug: "hanoi-halong-3-days-2-nights", url: "https://www.asiatouradvisor.com/hanoi-halong-3-days/" },
  { slug: "phu-quoc-3-days", url: "https://www.asiatouradvisor.com/phu-quoc-3-days/" },
  { slug: "phu-quoc-diving-4-days", url: "https://www.asiatouradvisor.com/phu-quoc-diving/" },
  { slug: "ho-chi-minh-mekong-4-days", url: "https://www.asiatouradvisor.com/ho-chi-minh-mekong-4-days/" },
  { slug: "vietnam-6-days-tour", url: "https://www.asiatouradvisor.com/vietnam-6-days/" },
  { slug: "northern-vietnam-7-days", url: "https://www.asiatouradvisor.com/northern-vietnam-7-days/" },
  { slug: "vietnam-introduction-8-days", url: "https://www.asiatouradvisor.com/vietnam-introduction-8-days/" },
  { slug: "scenic-vietnam-10-days", url: "https://www.asiatouradvisor.com/scenic-vietnam-10-days/" },
  { slug: "vietnam-discovery-11-days", url: "https://www.asiatouradvisor.com/vietnam-discovery-11-days/" },
  { slug: "vietnam-complete-12-days", url: "https://www.asiatouradvisor.com/vietnam-complete-12-days/" },
  { slug: "vietnam-insight-14-days", url: "https://www.asiatouradvisor.com/vietnam-insight-14-days/" },
  { slug: "amazing-vietnam-15-days", url: "https://www.asiatouradvisor.com/amazing-vietnam-15-days/" },
  { slug: "vietnam-cambodia-15-days", url: "https://www.asiatouradvisor.com/vietnam-cambodia-15-days/" },
  { slug: "vietnam-cambodia-18-days", url: "https://www.asiatouradvisor.com/vietnam-cambodia-18-days/" },
  { slug: "discover-vietnam-20-days", url: "https://www.asiatouradvisor.com/discover-vietnam-20-days/" },
  { slug: "vietnam-cambodia-21-days", url: "https://www.asiatouradvisor.com/vietnam-cambodia-21-days/" },
  { slug: "vietnam-family-tour-11-days", url: "https://www.asiatouradvisor.com/vietnam-family-tour/" },
  { slug: "vietnam-beach-family-14-days", url: "https://www.asiatouradvisor.com/vietnam-beach-family/" },
  { slug: "vietnam-luxury-10-days", url: "https://www.asiatouradvisor.com/vietnam-luxury-10-days/" },
  { slug: "hanoi-sapa-6-days", url: "https://www.asiatouradvisor.com/hanoi-sapa-6-days/" },
  { slug: "essential-vietnam-9-days", url: "https://www.asiatouradvisor.com/essential-vietnam-9-days/" },
  { slug: "essence-vietnam-10-days", url: "https://www.asiatouradvisor.com/essence-vietnam-10-days/" },
  { slug: "central-vietnam-7-days", url: "https://www.asiatouradvisor.com/central-vietnam-7-days/" },
  { slug: "discovery-northeast-vietnam-9-days", url: "https://www.asiatouradvisor.com/discovery-northeast-9-days/" },
  { slug: "southern-vietnam-7-days", url: "https://www.asiatouradvisor.com/southern-vietnam-7-days/" },
  { slug: "signatures-vietnam-14-days", url: "https://www.asiatouradvisor.com/signatures-vietnam-14-days/" },
  { slug: "cultural-heritage-vietnam-12-days", url: "https://www.asiatouradvisor.com/cultural-heritage-12-days/" },
  { slug: "natural-wonders-vietnam-16-days", url: "https://www.asiatouradvisor.com/natural-wonders-16-days/" },
  { slug: "perfect-vietnam-7-days", url: "https://www.asiatouradvisor.com/perfect-vietnam-7-days/" },
  { slug: "vietnam-discovery-8-days", url: "https://www.asiatouradvisor.com/vietnam-discovery-8-days/" },
  { slug: "hanoi-ninh-binh-halong-5-days", url: "https://www.asiatouradvisor.com/hanoi-ninh-binh-halong-5-days/" },
  { slug: "north-vietnam-adventure-7-days", url: "https://www.asiatouradvisor.com/north-vietnam-adventure-7-days/" },
  { slug: "nature-north-vietnam-8-days", url: "https://www.asiatouradvisor.com/nature-north-vietnam-8-days/" },
  { slug: "highlights-vietnam-10-days", url: "https://www.asiatouradvisor.com/highlights-vietnam-10-days/" },
  { slug: "cultural-odyssey-vietnam-10-days", url: "https://www.asiatouradvisor.com/cultural-odyssey-10-days/" },
  { slug: "best-vietnam-13-days", url: "https://www.asiatouradvisor.com/best-vietnam-13-days/" },
  { slug: "discovery-north-east-vietnam-13-days", url: "https://www.asiatouradvisor.com/discovery-north-east-13-days/" },
];

async function scrapeTour(page, tour) {
  console.log(`Scraping: ${tour.slug} from ${tour.url}`);

  try {
    await page.goto(tour.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const result = {
        title: '',
        description: '',
        itinerary: [],
        images: [],
        included: [],
        excluded: [],
        highlights: [],
      };

      // Title
      const titleEl = document.querySelector('h1, .tour-title, .page-title');
      if (titleEl) result.title = titleEl.textContent.trim();

      // Description/Overview
      const descEl = document.querySelector('.tour-overview, .overview, .description, [class*="overview"], [class*="description"], .entry-content > p:first-of-type');
      if (descEl) result.description = descEl.textContent.trim().substring(0, 1000);

      // Images - collect all tour images
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset.src || img.dataset.lazySrc;
        if (src &&
            (src.includes('asiatouradvisor') || src.includes('upload') || src.includes('tour')) &&
            !src.includes('icon') &&
            !src.includes('logo') &&
            !src.includes('avatar') &&
            !src.includes('flag') &&
            src.match(/\.(jpg|jpeg|png|webp)/i)) {
          result.images.push(src);
        }
      });

      // Itinerary - look for day sections with various patterns
      const dayPatterns = [
        '.itinerary-day',
        '.day-item',
        '.timeline-item',
        '[class*="day-"]',
        '.accordion-item',
        '.panel',
        'h3:has(+ p)',
        'h4:has(+ p)',
      ];

      // Try to find day headings
      const dayHeadings = document.querySelectorAll('h3, h4, .day-title, [class*="day"] > strong, .accordion-header');

      dayHeadings.forEach((heading, idx) => {
        const text = heading.textContent.trim();
        // Check if it looks like a day heading
        if (text.match(/day\s*\d+|ngày\s*\d+/i) || text.match(/^\d+\s*[-–:.]/) || (idx < 30 && text.length < 200)) {
          const day = {
            day: idx + 1,
            title: text.replace(/^day\s*\d+\s*[-–:.]\s*/i, '').trim(),
            description: '',
            activities: [],
            meals: [],
            images: []
          };

          // Try to get the content after the heading
          let nextEl = heading.nextElementSibling;
          let contentParts = [];

          while (nextEl && !nextEl.matches('h3, h4, .day-title, [class*="day"] > strong')) {
            if (nextEl.textContent.trim()) {
              contentParts.push(nextEl.textContent.trim());
            }
            // Get images in this section
            nextEl.querySelectorAll('img').forEach(img => {
              const src = img.src || img.dataset.src;
              if (src && src.match(/\.(jpg|jpeg|png|webp)/i)) {
                day.images.push(src);
              }
            });
            nextEl = nextEl.nextElementSibling;
            if (contentParts.length > 5) break; // Limit content capture
          }

          day.description = contentParts.join(' ').substring(0, 500);

          // Extract activities from description
          const activities = day.description.split(/[.!]/).filter(s => s.trim().length > 10 && s.trim().length < 150);
          day.activities = activities.slice(0, 6).map(a => a.trim());

          // Look for meals mentions
          const mealsMatch = day.description.match(/meals?:?\s*([^.]+)/i);
          if (mealsMatch) {
            day.meals = mealsMatch[1].split(/[,&]/).map(m => m.trim()).filter(m => m);
          } else {
            // Try to infer from text
            if (day.description.toLowerCase().includes('breakfast')) day.meals.push('Breakfast');
            if (day.description.toLowerCase().includes('lunch')) day.meals.push('Lunch');
            if (day.description.toLowerCase().includes('dinner')) day.meals.push('Dinner');
          }

          if (day.title || day.description) {
            result.itinerary.push(day);
          }
        }
      });

      // If no itinerary found via headings, try accordion/tab content
      if (result.itinerary.length === 0) {
        document.querySelectorAll('.accordion-body, .tab-pane, .panel-body, [class*="itinerary"] p').forEach((el, idx) => {
          const text = el.textContent.trim();
          if (text.length > 50) {
            result.itinerary.push({
              day: idx + 1,
              title: `Day ${idx + 1}`,
              description: text.substring(0, 500),
              activities: text.split(/[.!]/).filter(s => s.trim().length > 10).slice(0, 5).map(a => a.trim()),
              meals: [],
              images: []
            });
          }
        });
      }

      // Included/Excluded
      document.querySelectorAll('.included li, [class*="include"] li, .tour-includes li').forEach(li => {
        result.included.push(li.textContent.trim());
      });

      document.querySelectorAll('.excluded li, [class*="exclude"] li, .tour-excludes li').forEach(li => {
        result.excluded.push(li.textContent.trim());
      });

      // Highlights
      document.querySelectorAll('.highlights li, [class*="highlight"] li, .tour-highlights li').forEach(li => {
        result.highlights.push(li.textContent.trim());
      });

      return result;
    });

    return { slug: tour.slug, url: tour.url, ...data };
  } catch (error) {
    console.error(`Error scraping ${tour.slug}: ${error.message}`);
    return { slug: tour.slug, url: tour.url, error: error.message };
  }
}

async function main() {
  console.log(`Starting to scrape ${toursToScrape.length} tours from asiatouradvisor.com...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = [];
  const outputDir = 'scripts/asiatouradvisor-output';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < toursToScrape.length; i++) {
    const tour = toursToScrape[i];
    console.log(`[${i + 1}/${toursToScrape.length}] ${tour.slug}`);

    const data = await scrapeTour(page, tour);
    results.push(data);

    // Save individual tour data
    fs.writeFileSync(`${outputDir}/${tour.slug}.json`, JSON.stringify(data, null, 2));

    // Small delay to be polite
    await page.waitForTimeout(1000);
  }

  await browser.close();

  // Save summary
  fs.writeFileSync(`${outputDir}/all-tours.json`, JSON.stringify(results, null, 2));

  const successful = results.filter(r => !r.error && r.itinerary && r.itinerary.length > 0);
  const failed = results.filter(r => r.error || !r.itinerary || r.itinerary.length === 0);

  console.log(`\n=== SCRAPING COMPLETE ===`);
  console.log(`Total: ${results.length}`);
  console.log(`With itinerary: ${successful.length}`);
  console.log(`Without/failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed tours:`);
    failed.forEach(t => console.log(`  - ${t.slug}: ${t.error || 'No itinerary found'}`));
  }
}

main().catch(console.error);
