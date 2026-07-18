import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/explore#/',
  '/explore#/pathways',
  '/explore#/demographics',
  '/explore#/pleasure-gap',
  '/explore#/correlations',
  '/explore#/pairs',
  '/explore#/narrative-mirrors',
  '/explore#/religious-mirrors',
  '/explore#/culture',
  '/explore#/observer-lens',
  '/explore#/methodology',
  '/explore#/numbers',
  '/explore#/restoration-journey',
  '/explore#/adult-experience',
  '/explore#/for-parents',
  '/explore#/the-forward-view',
];

test.describe('Navigation Soak Test', () => {
  // Give this test a longer timeout since it visits many pages
  test.setTimeout(120000);

  test('App can survive rapid navigation between complex data exhibits without crashing', async ({ page }) => {
    let pageErrors = [];
    page.on('pageerror', exception => {
      pageErrors.push(exception);
    });
    
    // Perform 3 full loops of all routes
    const LOOPS = 3;
    
    for (let loop = 0; loop < LOOPS; loop++) {
      console.log(`Navigation Soak Loop ${loop + 1}/${LOOPS}`);
      
      for (const route of ROUTES) {
        await page.goto(route);
        
        // Wait for the main exhibit container or root element to signify render completion
        await page.waitForSelector('#root', { state: 'attached' });
        
        // Wait briefly for D3/React to mount internal components
        await page.waitForTimeout(500);
      }
    }
    
    // Assert no unhandled JS errors occurred across all navigations
    if (pageErrors.length > 0) {
      console.error("PAGE ERRORS CAUGHT:", pageErrors);
    }
    expect(pageErrors.length).toBe(0);
  });
});
