import { chromium } from 'playwright';
import fs from 'fs';

const toursToScrape = [
  { slug: 'mon-cheri-cruise-lan-ha-bay', url: 'https://www.bestpricetravel.com/halong-bay-cruises/mon-cheri-cruise.html' },
  { slug: 'lyra-grandeur-cruise-halong-bay', url: 'https://www.bestpricetravel.com/halong-bay-cruises/lyra-grandeur-cruise.html' },
];

async function scrapeTour(page, tour) {
  console.log(`Scraping: ${tour.slug}`);

  try {
    await page.goto(tour.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      const result = {
        title: '',
        description: '',
        itinerary: [],
        images: [],
        included: [],
        excluded: [],
      };

      // Title
      const titleEl = document.querySelector('h1');
      if (titleEl) result.title = titleEl.textContent.trim();

      // Description
      const descEl = document.querySelector('.tour-overview, .description, [class*="description"]');
      if (descEl) result.description = descEl.textContent.trim().substring(0, 500);

      // Images
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset.src;
        if (src && src.includes('bestpricetravel') && !src.includes('icon') && !src.includes('logo')) {
          result.images.push(src);
        }
      });

      // Itinerary - look for day sections
      document.querySelectorAll('[class*="itinerary"], [class*="day-"], .day-content, .timeline-item').forEach((dayEl, idx) => {
        const titleEl = dayEl.querySelector('h3, h4, .day-title, [class*="title"]');
        const descEl = dayEl.querySelector('p, .day-desc, [class*="content"]');

        if (titleEl) {
          const day = {
            day: idx + 1,
            title: titleEl.textContent.trim(),
            description: descEl ? descEl.textContent.trim() : '',
            activities: [],
            meals: [],
            images: []
          };

          // Get images in this day
          dayEl.querySelectorAll('img').forEach(img => {
            const src = img.src || img.dataset.src;
            if (src && src.includes('bestpricetravel')) {
              day.images.push(src);
            }
          });

          result.itinerary.push(day);
        }
      });

      return result;
    });

    return { slug: tour.slug, ...data };
  } catch (error) {
    console.error(`Error scraping ${tour.slug}: ${error.message}`);
    return null;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  for (const tour of toursToScrape) {
    const data = await scrapeTour(page, tour);
    if (data) {
      results.push(data);
      fs.writeFileSync(`scripts/tour-data-output/${tour.slug}.json`, JSON.stringify(data, null, 2));
      console.log(`Saved: ${tour.slug}`);
    }
  }

  await browser.close();
  console.log(`\nScraped ${results.length} tours`);
}

main().catch(console.error);
