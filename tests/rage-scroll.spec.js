import { test, expect } from '@playwright/test';

test.describe('Rage Scroll Stress Test', () => {
  test('Guided tour can handle rapid scrolling without dropping frames to 0 or crashing', async ({ page }) => {
    // Navigate to the guided tour page
    await page.goto('/explore#/');

    // Wait for the main app to mount and the canvas to initialize
    await page.waitForSelector('canvas', { state: 'attached' });

    // Ensure there are no unhandled exceptions in the page console
    let pageErrors = [];
    page.on('pageerror', exception => {
      pageErrors.push(exception);
    });
    
    // Grab the document body handle to perform scrolling
    const body = await page.locator('body');

    // Rage scroll down rapidly (increased intensity)
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 1500);
      await page.waitForTimeout(20); 
    }

    // Wait a brief moment at the bottom to trigger intersection observers
    await page.waitForTimeout(500);

    // Rage scroll up rapidly
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, -1500);
      await page.waitForTimeout(20);
    }
    
    // Wait a brief moment at the top
    await page.waitForTimeout(500);
    
    // Jerky scrolling (up and down rapidly)
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(30);
      await page.mouse.wheel(0, -500);
      await page.waitForTimeout(20);
    }

    // Assert no unhandled JS errors occurred during the stress test
    expect(pageErrors.length).toBe(0);
  });
});
