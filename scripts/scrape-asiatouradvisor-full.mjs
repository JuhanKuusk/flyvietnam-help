import { chromium } from 'playwright';
import fs from 'fs';

// All Vietnam tours from asiatouradvisor - using new URL structure
const toursToScrape = [
  'signatures-of-vietnam',
  'vietnam-discovery-12-days',
  'natural-wonders-of-vietnam',
  'vietnam-beach-family',
  'vietnam-best-cultural-heritage',
  'discovery-north-east-vietnam-9-days-8-nights',
  'vietnamese-cultural-odyssey-a-10-day-journey',
  'best-vietnam-tour-13days',
  'best-of-nature-in-northern-vietnam-7-days',
  'vietnam-family-tours',
  'vietnam-culinary-discovery',
  'simply-vietnam-10-days',
  'heart-of-vietnam-tour',
  'ventures-through-vietnam',
  'authentic-vietnam',
  'vietnam-beach-holiday-12-days',
  'vietnam-beach-vacation',
  'vietnam-heritage-the-coast',
  'hidden-jewels-of-vietnam',
  'package-tours',
];

async function scrapeTour(page, slug) {
  const url = `https://www.asiatouradvisor.com/vietnam-tours/${slug}/`;
  console.log(`Scraping: ${slug}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for dynamic content

    // Extract tour data
    const data = await page.evaluate(() => {
      const result = {
        title: '',
        description: '',
        duration: '',
        price: 0,
        originalPrice: 0,
        startCity: '',
        endCity: '',
        destinations: [],
        travelStyle: '',
        itinerary: [],
        images: [],
        included: [],
        excluded: [],
        highlights: [],
        rating: 0,
        reviewCount: 0,
      };

      // Title
      const titleEl = document.querySelector('h1, .tour-title, [class*="tour-name"]');
      if (!titleEl) {
        const headerTitle = document.querySelector('[class*="title"]');
        if (headerTitle) result.title = headerTitle.textContent.trim();
      } else {
        result.title = titleEl.textContent.trim();
      }

      // Get title from breadcrumb if not found
      if (!result.title) {
        const breadcrumb = document.querySelector('nav[aria-label="breadcrumb"] li:last-child');
        if (breadcrumb) result.title = breadcrumb.textContent.trim();
      }

      // Duration from definition list
      const durationDef = Array.from(document.querySelectorAll('dt')).find(dt => dt.textContent.includes('Duration'));
      if (durationDef && durationDef.nextElementSibling) {
        result.duration = durationDef.nextElementSibling.textContent.trim();
      }

      // Start/End cities
      const startDef = Array.from(document.querySelectorAll('dt')).find(dt => dt.textContent.includes('Start'));
      if (startDef && startDef.nextElementSibling) {
        result.startCity = startDef.nextElementSibling.textContent.trim();
      }
      const endDef = Array.from(document.querySelectorAll('dt')).find(dt => dt.textContent.includes('End'));
      if (endDef && endDef.nextElementSibling) {
        result.endCity = endDef.nextElementSibling.textContent.trim();
      }

      // Travel Style
      const styleDef = Array.from(document.querySelectorAll('dt')).find(dt => dt.textContent.includes('Travel Style'));
      if (styleDef && styleDef.nextElementSibling) {
        result.travelStyle = styleDef.nextElementSibling.textContent.trim();
      }

      // Destinations from links
      const destLinks = document.querySelectorAll('a[href*="destination/vietnam/"]');
      destLinks.forEach(link => {
        const dest = link.textContent.trim();
        if (dest && !result.destinations.includes(dest) && dest.length < 30) {
          result.destinations.push(dest);
        }
      });

      // Price
      const priceText = document.body.innerText.match(/\$(\d{1,3}(?:,\d{3})*|\d+)\/person/);
      if (priceText) {
        result.price = parseInt(priceText[1].replace(',', ''));
      }
      const origPriceText = document.body.innerText.match(/Valued up to \$(\d{1,3}(?:,\d{3})*|\d+)/);
      if (origPriceText) {
        result.originalPrice = parseInt(origPriceText[1].replace(',', ''));
      }

      // Images - collect all tour-related images
      const imageSet = new Set();
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset.src || img.dataset.lazySrc;
        if (src &&
            !src.includes('icon') &&
            !src.includes('logo') &&
            !src.includes('avatar') &&
            !src.includes('flag') &&
            !src.includes('payment') &&
            !src.includes('tripadvisor') &&
            !src.includes('wta') &&
            (src.includes('asiatouradvisor') || src.includes('cloudfront') || src.includes('amazonaws')) &&
            src.match(/\.(jpg|jpeg|png|webp)/i)) {
          imageSet.add(src);
        }
      });
      result.images = Array.from(imageSet).slice(0, 20);

      // Itinerary - find all day buttons and their content
      const dayButtons = document.querySelectorAll('button[aria-expanded], button[class*="accordion"]');
      dayButtons.forEach((btn, idx) => {
        const btnText = btn.textContent.trim();
        const dayMatch = btnText.match(/Day\s*(\d+)[:.\s-]*(.*?)(?:\d+\s*km)?$/i);

        if (dayMatch) {
          const dayNum = parseInt(dayMatch[1]);
          const dayTitle = dayMatch[2].trim();

          const day = {
            day: dayNum,
            title: dayTitle || `Day ${dayNum}`,
            description: '',
            activities: [],
            meals: [],
            images: []
          };

          // Try to find the content panel for this day
          const panelId = btn.getAttribute('aria-controls');
          let panel = panelId ? document.getElementById(panelId) : null;
          if (!panel) {
            panel = btn.nextElementSibling;
          }
          if (!panel) {
            // Look for sibling with content
            let sibling = btn.parentElement?.querySelector('[class*="content"], [class*="panel"], [class*="body"]');
            if (sibling) panel = sibling;
          }

          if (panel) {
            // Get description text
            const paragraphs = panel.querySelectorAll('p');
            paragraphs.forEach(p => {
              const text = p.textContent.trim();
              if (text.length > 20) {
                if (!day.description) {
                  day.description = text;
                } else {
                  day.activities.push(text.substring(0, 200));
                }
              }
            });

            // Get images from this day
            panel.querySelectorAll('img').forEach(img => {
              const src = img.src || img.dataset.src;
              if (src && src.match(/\.(jpg|jpeg|png|webp)/i) && !src.includes('icon')) {
                day.images.push(src);
              }
            });

            // Check for meals icons/text
            const panelText = panel.textContent.toLowerCase();
            if (panelText.includes('breakfast')) day.meals.push('Breakfast');
            if (panelText.includes('lunch')) day.meals.push('Lunch');
            if (panelText.includes('dinner')) day.meals.push('Dinner');
          }

          if (day.day > 0) {
            result.itinerary.push(day);
          }
        }
      });

      // Sort itinerary by day
      result.itinerary.sort((a, b) => a.day - b.day);

      // Reviews count
      const reviewText = document.body.innerText.match(/(\d+)\s*Reviews?/i);
      if (reviewText) {
        result.reviewCount = parseInt(reviewText[1]);
      }

      // Rating - look for star ratings
      const ratingStars = document.querySelectorAll('[class*="rating"] img[src*="star"], [class*="star"]');
      if (ratingStars.length > 0) {
        result.rating = Math.min(ratingStars.length, 5) * 2; // Convert to 10-point scale
      }

      return result;
    });

    // Click on "What's Included" to get that data
    try {
      const includedBtn = await page.$('button:has-text("What\'s Included")');
      if (includedBtn) {
        await includedBtn.click();
        await page.waitForTimeout(500);

        const includedData = await page.evaluate(() => {
          const items = [];
          document.querySelectorAll('[class*="included"] li, [class*="include"] li').forEach(li => {
            const text = li.textContent.trim();
            if (text && text.length > 3 && text.length < 200) {
              items.push(text);
            }
          });
          return items;
        });
        data.included = includedData;
      }
    } catch (e) {
      // Ignore if can't click
    }

    // Click on "What's Excluded"
    try {
      const excludedBtn = await page.$('button:has-text("What\'s Excluded")');
      if (excludedBtn) {
        await excludedBtn.click();
        await page.waitForTimeout(500);

        const excludedData = await page.evaluate(() => {
          const items = [];
          document.querySelectorAll('[class*="excluded"] li, [class*="exclude"] li').forEach(li => {
            const text = li.textContent.trim();
            if (text && text.length > 3 && text.length < 200) {
              items.push(text);
            }
          });
          return items;
        });
        data.excluded = excludedData;
      }
    } catch (e) {
      // Ignore if can't click
    }

    // Expand all days to get full content
    try {
      const expandAllBtn = await page.$('button:has-text("Expand All")');
      if (expandAllBtn) {
        await expandAllBtn.click();
        await page.waitForTimeout(1000);

        // Re-extract itinerary with expanded content
        const expandedItinerary = await page.evaluate(() => {
          const days = [];
          const dayPanels = document.querySelectorAll('[class*="accordion"] > div, [class*="day-content"], [class*="itinerary-day"]');

          dayPanels.forEach((panel, idx) => {
            const text = panel.textContent;
            const dayMatch = text.match(/Day\s*(\d+)/i);
            if (dayMatch) {
              const dayNum = parseInt(dayMatch[1]);
              const paragraphs = panel.querySelectorAll('p');
              let description = '';
              const activities = [];

              paragraphs.forEach(p => {
                const pText = p.textContent.trim();
                if (pText.length > 30) {
                  if (!description) {
                    description = pText;
                  } else {
                    activities.push(pText.substring(0, 300));
                  }
                }
              });

              // Get day images
              const images = [];
              panel.querySelectorAll('img').forEach(img => {
                const src = img.src || img.dataset.src;
                if (src && src.match(/\.(jpg|jpeg|png|webp)/i) && !src.includes('icon')) {
                  images.push(src);
                }
              });

              // Meals
              const meals = [];
              const panelLower = panel.textContent.toLowerCase();
              if (panelLower.includes('breakfast')) meals.push('Breakfast');
              if (panelLower.includes('lunch')) meals.push('Lunch');
              if (panelLower.includes('dinner')) meals.push('Dinner');

              // Title from heading or button
              const heading = panel.querySelector('h3, h4, button, [class*="title"]');
              let title = heading ? heading.textContent.replace(/Day\s*\d+[:.\s-]*/i, '').trim() : `Day ${dayNum}`;
              title = title.replace(/\d+\s*km$/i, '').trim();

              if (description || activities.length > 0) {
                days.push({
                  day: dayNum,
                  title: title.substring(0, 100),
                  description: description.substring(0, 800),
                  activities: activities.slice(0, 5),
                  meals,
                  images: images.slice(0, 3)
                });
              }
            }
          });

          return days.sort((a, b) => a.day - b.day);
        });

        if (expandedItinerary.length > data.itinerary.length) {
          data.itinerary = expandedItinerary;
        }
      }
    } catch (e) {
      // Ignore
    }

    return { slug, url, ...data };
  } catch (error) {
    console.error(`Error scraping ${slug}: ${error.message}`);
    return { slug, url, error: error.message };
  }
}

async function main() {
  console.log(`Starting to scrape ${toursToScrape.length} tours from asiatouradvisor.com...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Accept cookies if prompted
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  const results = [];
  const outputDir = 'scripts/asiatouradvisor-new';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < toursToScrape.length; i++) {
    const slug = toursToScrape[i];
    console.log(`[${i + 1}/${toursToScrape.length}] ${slug}`);

    const data = await scrapeTour(page, slug);
    results.push(data);

    // Save individual tour data
    fs.writeFileSync(`${outputDir}/${slug}.json`, JSON.stringify(data, null, 2));

    // Small delay
    await page.waitForTimeout(1500);
  }

  await browser.close();

  // Save summary
  fs.writeFileSync(`${outputDir}/all-tours.json`, JSON.stringify(results, null, 2));

  const successful = results.filter(r => !r.error && r.itinerary && r.itinerary.length > 0);
  const withImages = results.filter(r => r.images && r.images.length > 0);
  const failed = results.filter(r => r.error || !r.itinerary || r.itinerary.length === 0);

  console.log(`\n=== SCRAPING COMPLETE ===`);
  console.log(`Total: ${results.length}`);
  console.log(`With itinerary: ${successful.length}`);
  console.log(`With images: ${withImages.length}`);
  console.log(`Without/failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed tours:`);
    failed.forEach(t => console.log(`  - ${t.slug}: ${t.error || 'No itinerary found'}`));
  }

  // Show sample of what we got
  if (successful.length > 0) {
    const sample = successful[0];
    console.log(`\nSample tour (${sample.slug}):`);
    console.log(`  Title: ${sample.title}`);
    console.log(`  Duration: ${sample.duration}`);
    console.log(`  Price: $${sample.price} (was $${sample.originalPrice})`);
    console.log(`  Destinations: ${sample.destinations?.slice(0, 5).join(', ')}`);
    console.log(`  Itinerary days: ${sample.itinerary?.length}`);
    console.log(`  Images: ${sample.images?.length}`);
  }
}

main().catch(console.error);
