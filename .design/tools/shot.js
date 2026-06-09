// Autonomous screenshot tool — replaces the unavailable Playwright MCP.
// Usage:
//   node shot.js <url> <out.png> [width] [height] [fullPage:true|false] [waitMs]
// Examples:
//   node shot.js https://linear.app shots/linear.png 1440 900 true 2500
//   node shot.js "file:///Users/Lexi/.../compare-01.html" shots/compare01.png 1440 1200 true
const { chromium } = require('playwright');

(async () => {
  const [,, url, out, w = '1440', h = '900', full = 'true', waitMs = '1800'] = process.argv;
  if (!url || !out) { console.error('need <url> <out.png>'); process.exit(1); }
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: parseInt(w), height: parseInt(h) },
    deviceScaleFactor: 2, // retina-sharp screenshots
  });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 }); // fallback for slow/animated sites
  }
  await page.waitForTimeout(parseInt(waitMs));
  // Scroll through the page to trigger any IntersectionObserver scroll-reveals,
  // then return to top so full-page capture shows revealed content.
  await page.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight * 0.8) { window.scrollTo(0, y); await sleep(120); }
    window.scrollTo(0, 0); await sleep(300);
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, fullPage: full === 'true' });
  await browser.close();
  console.log('saved', out);
})();
