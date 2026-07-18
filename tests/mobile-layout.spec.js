import { test, expect } from '@playwright/test';

test.describe('Mobile Layout Tests', () => {
  test('Culture & Generations masthead wraps correctly and mobile elements hide', async ({ page }) => {
    // Navigate to the Culture & Generations page
    await page.goto('/explore#/culture');

    // Wait for the masthead to be visible
    const masthead = page.locator('#explore-masthead');
    await expect(masthead).toBeVisible();

    // Check the h1 title element
    const title = masthead.locator('h1.masthead-title');
    await expect(title).toBeVisible();

    // Verify it contains the correct text
    await expect(title).toContainText('Culture & Generations', { ignoreCase: true });

    // Check that white-space is 'normal' so it can wrap if needed
    const computedStyle = await title.evaluate(el => window.getComputedStyle(el).whiteSpace);
    expect(computedStyle).toBe('normal');
    // Check that elements with the 'mobile-hide' class are not visible on mobile
    const hiddenElements = masthead.locator('.mobile-hide');
    const hiddenCount = await hiddenElements.count();
    
    for (let i = 0; i < hiddenCount; i++) {
      await expect(hiddenElements.nth(i)).toBeHidden();
    }
    
    // Check that specific mobile texts are hidden
    await expect(masthead.locator('.mobile-docent-text')).toBeHidden();
    await expect(masthead.locator('.mobile-findings-text')).toBeHidden();
  });

  test.use({ viewport: { width: 375, height: 667 } });
  
  test('Guided Tour quotes grid does not break horizontal bounds on iPhone SE', async ({ page }) => {
    await page.goto('/explore#/');
    // Scroll down to where the Narrative Mirror is (usually station 04 or 06)
    // We'll just evaluate if any elements in the DOM cause horizontal scrolling
    await page.waitForTimeout(1000); // Wait for rendering
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    // Some minor overflow might occur due to animations or padding, 
    // but ideally we want no overflow on the main html document.
    expect(hasHorizontalScroll).toBe(false);
  });
});
