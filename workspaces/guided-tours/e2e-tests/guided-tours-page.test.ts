/*
 * Copyright 2026 The Backstage Authors
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
import { closeTour, resetAllTours, step, stepButton } from './helpers';

test.describe('guided tours page', () => {
  test.beforeEach(async ({ page }) => {
    await resetAllTours(page);
    await page.goto('/guided-tours');
    await closeTour(page);
  });

  test('lists every tour with its status and lets the user start, continue and restart', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'Guided tours' }).first(),
    ).toBeVisible();
    for (const title of [
      'Welcome to Backstage',
      'The software catalog',
      'Create from a template',
      'Your notifications',
      'Your settings',
    ]) {
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    }
    const welcome = page.locator(
      '[data-guided-tour="guided-tours.row.guided-tours/welcome"]',
    );
    const catalog = page.locator(
      '[data-guided-tour="guided-tours.row.guided-tours/catalog"]',
    );
    await expect(welcome.getByText('Dismissed')).toBeVisible();
    await expect(catalog.getByText('New')).toBeVisible();
    await expect(
      catalog.getByText('3 steps · Starts on first visit of /catalog'),
    ).toBeVisible();

    // Start opens the tour on the page of its first step
    await catalog.getByRole('button', { name: 'Start' }).click();
    await expect(page).toHaveURL(/\/catalog/);
    await expect(step(page, 'Pick a kind')).toBeVisible();
    await stepButton(page, 'Next').click();
    await expect(step(page, 'Yours, starred, or everything')).toBeVisible();

    // a tour left on another page is not resumed here, the page offers to
    // continue it where it was
    await page.goto('/guided-tours');
    await expect(catalog.getByText('In progress')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await catalog.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/catalog/);
    await expect(
      step(page, 'Yours, starred, or everything').getByText('Step 2 of 3'),
    ).toBeVisible();
    await closeTour(page);

    // dismissed and completed tours can be restarted from the first step
    await page.goto('/guided-tours');
    await expect(catalog.getByText('Dismissed')).toBeVisible();
    await welcome.getByRole('button', { name: 'Restart' }).click();
    await expect(
      step(page, 'Welcome 👋').getByText('Step 1 of 6'),
    ).toBeVisible();
    await closeTour(page);

    // Reset all asks for confirmation and clears every status
    await page.getByRole('button', { name: 'Reset all tours' }).click();
    await expect(
      page.getByRole('dialog').getByText('Reset all tours?'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(welcome.getByText('Dismissed')).toBeVisible();
    await page.getByRole('button', { name: 'Reset all tours' }).click();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByText('New')).toHaveCount(5);
  });
});
