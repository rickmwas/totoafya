const { chromium } = require('playwright');
const path = require('path');

const TARGET_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = path.join(__dirname, 'responsive-screenshots');

const viewports = [
  // Phones
  { name: 'iPhone_SE',        width: 375,  height: 667  },
  { name: 'iPhone_14_Pro',    width: 393,  height: 852  },
  { name: 'Galaxy_S21',       width: 360,  height: 800  },
  { name: 'Pixel_7',          width: 412,  height: 915  },
  // Tablets
  { name: 'iPad_Mini',        width: 768,  height: 1024 },
  { name: 'iPad_Pro_11',      width: 834,  height: 1194 },
  // Laptops
  { name: 'Laptop_13inch',    width: 1280, height: 800  },
  { name: 'Desktop_1080p',    width: 1920, height: 1080 },
];

const pages = [
  { name: 'login',      path: '/login' },
  { name: 'onboarding', path: '/onboarding' },
  { name: 'home',       path: '/' },
];

(async () => {
  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const issues = [];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.width <= 430 ? 2 : 1,
    });
    const page = await context.newPage();

    for (const pg of pages) {
      const label = `${vp.name}_${pg.name}`;
      console.log(`📸 ${label} (${vp.width}x${vp.height}) ...`);

      try {
        await page.goto(`${TARGET_URL}${pg.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (e) {
        // fallback: just wait for load
        try {
          await page.goto(`${TARGET_URL}${pg.path}`, { waitUntil: 'load', timeout: 10000 });
        } catch (e2) {
          console.log(`  ❌ Failed to load ${pg.path}: ${e2.message}`);
          continue;
        }
      }
      await page.waitForTimeout(2000); // let splash/animations finish

      // Take screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${label}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  ✅ Saved: ${screenshotPath}`);

      // Check for horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      if (hasHorizontalOverflow) {
        const overflowAmount = await page.evaluate(() => {
          return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        });
        issues.push(`⚠️  ${label}: Horizontal overflow by ${overflowAmount}px`);
        console.log(`  ⚠️  Horizontal overflow: ${overflowAmount}px`);
      }

      // Check for elements overflowing viewport
      const overflowingElements = await page.evaluate(() => {
        const results = [];
        const all = document.querySelectorAll('*');
        const vpWidth = window.innerWidth;
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.right > vpWidth + 5) {
            const tag = el.tagName.toLowerCase();
            const cls = el.className ? `.${String(el.className).split(' ').slice(0, 2).join('.')}` : '';
            const id = el.id ? `#${el.id}` : '';
            results.push({
              selector: `${tag}${id}${cls}`,
              right: Math.round(rect.right),
              vpWidth,
              overflow: Math.round(rect.right - vpWidth),
            });
          }
        }
        return results.slice(0, 5); // top 5
      });

      if (overflowingElements.length > 0) {
        for (const el of overflowingElements) {
          const msg = `⚠️  ${label}: "${el.selector}" overflows by ${el.overflow}px (right=${el.right}, viewport=${el.vpWidth})`;
          issues.push(msg);
          console.log(`  ${msg}`);
        }
      }

      // Check for text truncation (elements with overflow:hidden and text-overflow:ellipsis that are actually truncated)
      const truncatedElements = await page.evaluate(() => {
        const results = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const style = getComputedStyle(el);
          if (style.textOverflow === 'ellipsis' && style.overflow === 'hidden') {
            if (el.scrollWidth > el.clientWidth + 2) {
              const tag = el.tagName.toLowerCase();
              const cls = el.className ? `.${String(el.className).split(' ').slice(0, 2).join('.')}` : '';
              results.push({
                selector: `${tag}${cls}`,
                text: el.textContent?.substring(0, 40),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
              });
            }
          }
        }
        return results.slice(0, 5);
      });

      if (truncatedElements.length > 0) {
        for (const el of truncatedElements) {
          const msg = `ℹ️  ${label}: Text truncated in "${el.selector}": "${el.text}..."`;
          issues.push(msg);
          console.log(`  ${msg}`);
        }
      }

      // Check for overlapping important elements (buttons, inputs, nav)
      const overlapping = await page.evaluate(() => {
        const interactive = document.querySelectorAll('button, input, a, select, textarea, [role="button"]');
        const rects = [];
        for (const el of interactive) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            rects.push({ el, rect: r, tag: el.tagName.toLowerCase(), text: el.textContent?.substring(0, 20) || '' });
          }
        }
        const overlaps = [];
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i].rect;
            const b = rects[j].rect;
            if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) {
              const overlapArea = (Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
                                  (Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
              if (overlapArea > 100) { // significant overlap
                overlaps.push({
                  el1: `${rects[i].tag} "${rects[i].text}"`,
                  el2: `${rects[j].tag} "${rects[j].text}"`,
                  overlapArea: Math.round(overlapArea),
                });
              }
            }
          }
        }
        return overlaps.slice(0, 3);
      });

      if (overlapping.length > 0) {
        for (const o of overlapping) {
          const msg = `⚠️  ${label}: Overlapping interactive elements: ${o.el1} ↔ ${o.el2} (${o.overlapArea}px²)`;
          issues.push(msg);
          console.log(`  ${msg}`);
        }
      }
    }

    await context.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('RESPONSIVE TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Tested ${viewports.length} viewports × ${pages.length} pages = ${viewports.length * pages.length} screenshots`);
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log('');

  if (issues.length === 0) {
    console.log('✅ No responsiveness issues detected!');
  } else {
    console.log(`Found ${issues.length} potential issues:\n`);
    for (const issue of issues) {
      console.log(`  ${issue}`);
    }
  }
})();
