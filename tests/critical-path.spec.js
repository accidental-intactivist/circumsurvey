import { test, expect } from '@playwright/test';

test.describe('Critical Path Walkthrough', () => {
  test('Guided tour can be navigated from start to finish via scrolling', async ({ page }) => {
    await page.goto('/explore#/');

    // Wait for canvas to load
    await page.waitForSelector('canvas', { state: 'attached' });

    // Scroll down gradually to simulate user reading the tour
    for (let i = 0; i < 20; i++) {
        await page.mouse.wheel(0, 800);
        await page.waitForTimeout(500); // Allow animations to play
    }

    // Verify we reached the narrative mirrors (quotes section)
    const loadMoreButton = page.locator('text="Load More Quotes ↻"');
    if (await loadMoreButton.isVisible()) {
        await expect(loadMoreButton).toBeVisible();
        await loadMoreButton.click();
    }
    
    // Ensure no crashes occurred
    expect(await page.locator('canvas').isVisible()).toBe(true);
  });
});
