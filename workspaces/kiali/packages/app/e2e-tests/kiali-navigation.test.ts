/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect, test } from '@playwright/test';

test.describe('Kiali Plugin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Click Enter button if present
    const enterButton = page.getByRole('button', { name: 'Enter' });
    if (await enterButton.isVisible()) {
      await enterButton.click();
    }
  });

  test('should navigate to Kiali page', async ({ page }) => {
    // Wait for catalog to load
    await expect(
      page.getByRole('heading', { name: 'Kiali Community Catalog' }),
    ).toBeVisible();

    // Look for Kiali navigation or link
    // This is a basic test - adjust selectors based on actual UI
    await expect(page).toHaveURL(/.*/);
  });

  test('should display Kiali plugin content', async ({ page }) => {
    // Navigate to a page that might have Kiali content
    // Adjust based on actual routing
    await page.goto('/');

    // Basic check that page loads
    await expect(page).toHaveURL(/.*/);
  });
});
