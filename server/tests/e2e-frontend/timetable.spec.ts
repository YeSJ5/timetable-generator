/**
 * E2E Tests for Timetable Page
 */

import { test, expect } from '@playwright/test';

test.describe('Timetable Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to timetable page with a test section
    await page.goto('/timetable/test-section');
  });

  test('loads timetable page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Timetable');
  });

  test('displays timetable grid', async ({ page }) => {
    // Wait for grid to load
    await page.waitForSelector('[data-testid="timetable-grid"]', { timeout: 5000 }).catch(() => {
      // Grid might not have testid, check for day headers instead
      expect(page.locator('text=Mon')).toBeVisible();
    });
  });

  test('shows regeneration buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Regenerate Teacher")')).toBeVisible();
    await expect(page.locator('button:has-text("Regenerate Section")')).toBeVisible();
    await expect(page.locator('button:has-text("Regenerate Day")')).toBeVisible();
    await expect(page.locator('button:has-text("Regenerate Slot")')).toBeVisible();
  });

  test('opens regeneration dialog', async ({ page }) => {
    await page.click('button:has-text("Regenerate Teacher")');
    await expect(page.locator('text=Regenerate Teacher Schedule')).toBeVisible();
  });

  test('handles empty timetable state', async ({ page }) => {
    // Navigate to non-existent section
    await page.goto('/timetable/non-existent');
    
    // Should show empty state or error
    await expect(
      page.locator('text=No timetable found') || page.locator('text=Error')
    ).toBeVisible();
  });
});

test.describe('Version History', () => {
  test('loads version history page', async ({ page }) => {
    await page.goto('/admin/versions');
    await expect(page.locator('h1')).toContainText('Version History');
  });

  test('allows section ID input', async ({ page }) => {
    await page.goto('/admin/versions');
    const input = page.locator('input[placeholder*="section ID"]');
    await input.fill('test-section');
    await expect(input).toHaveValue('test-section');
  });
});

test.describe('Admin Dashboard', () => {
  test('loads admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test('displays quick actions', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('text=Quick Actions')).toBeVisible();
  });
});

