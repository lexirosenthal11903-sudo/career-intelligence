const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2], prefix = process.argv[3];
  const offsets = process.argv.slice(4).map(Number);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
  try { await p.goto(url,{waitUntil:'networkidle',timeout:45000}); } catch(e){ await p.goto(url,{waitUntil:'load'}); }
  await p.waitForTimeout(2500);
  // pre-scroll to load lazy content
  await p.evaluate(async()=>{const s=ms=>new Promise(r=>setTimeout(r,ms));for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await s(100);}window.scrollTo(0,0);await s(400);});
  for (let i=0;i<offsets.length;i++){
    await p.evaluate(y=>window.scrollTo(0,y), offsets[i]);
    await p.waitForTimeout(700);
    await p.screenshot({ path:`shots/${prefix}-${offsets[i]}.png` });
  }
  await b.close(); console.log('done', prefix, offsets.join(','));
})();
