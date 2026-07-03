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
});
