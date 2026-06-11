const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    await page.goto('http://localhost:5173/explore#/demographics');
    await page.waitForSelector('button', { timeout: 10000 });
    
    const buttons = await page.$$('button');
    let clicked = false;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Unclassified')) {
        console.log('Clicking Unclassified...');
        await b.click();
        clicked = true;
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    
    if (!clicked) {
        console.log('Unclassified button not found initially. Trying to change dropdown to "Generation"...');
        const selects = await page.$$('select');
        if (selects.length > 0) {
            await selects[0].select('generation');
            await new Promise(r => setTimeout(r, 2000));
            const buttons2 = await page.$$('button');
            for (const b of buttons2) {
              const text = await page.evaluate(el => el.textContent, b);
              if (text && text.includes('Unclassified')) {
                console.log('Clicking Unclassified after dropdown change...');
                await b.click();
                await new Promise(r => setTimeout(r, 2000));
                break;
              }
            }
        }
    }

    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.includes('vite-error-overlay') || bodyHTML.includes('Error')) {
      console.log('CRASH OVERLAY DETECTED!');
      // Extract the error message from the overlay
      const errorText = await page.evaluate(() => {
          const overlay = document.querySelector('vite-error-overlay');
          if (overlay && overlay.shadowRoot) {
              const err = overlay.shadowRoot.querySelector('.message-body');
              return err ? err.textContent : 'Unknown error in overlay';
          }
          return 'No shadow root';
      });
      console.log('Error details:', errorText);
    } else {
      console.log('No crash detected immediately.');
    }
    
    await browser.close();
  } catch(e) {
    console.error('SCRIPT ERROR:', e);
  }
})();
