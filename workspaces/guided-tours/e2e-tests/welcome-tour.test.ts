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
import {
  closeTour,
  resetAllTours,
  spotlight,
  step,
  stepButton,
} from './helpers';

test.describe('welcome tour', () => {
  test.beforeEach(async ({ page }) => {
    await resetAllTours(page);
  });

  test('starts on the first visit, moves across pages and finishes on the start page', async ({
    page,
  }) => {
    await page.goto('/');

    // the first step has no target: a centered dialog without spotlight
    const intro = step(page, 'Welcome 👋');
    await expect(intro).toBeVisible();
    await expect(intro.getByText('Welcome to Backstage')).toBeVisible();
    await expect(intro.getByText('Step 1 of 6')).toBeVisible();
    await expect(stepButton(page, 'Previous')).toBeDisabled();
    await expect(spotlight(page)).toHaveCount(0);

    // the second step navigates and anchors to the sidebar item
    await stepButton(page, 'Next').click();
    await expect(page).toHaveURL(/\/guided-tours$/);
    await expect(step(page, 'Guided tours')).toBeVisible();
    await expect(
      step(page, 'Guided tours').getByText('Step 2 of 6'),
    ).toBeVisible();
    await expect(spotlight(page)).toBeVisible();
    await expect(stepButton(page, 'Previous')).toBeEnabled();

    await stepButton(page, 'Next').click();
    await expect(page).toHaveURL(/\/catalog/);
    await expect(step(page, 'The software catalog')).toBeVisible();

    // the previous button goes back one step and restores that step's page
    await stepButton(page, 'Previous').click();
    await expect(page).toHaveURL(/\/guided-tours$/);
    await expect(step(page, 'Guided tours')).toBeVisible();
    await stepButton(page, 'Previous').click();
    await expect(step(page, 'Welcome 👋')).toBeVisible();
    await expect(stepButton(page, 'Previous')).toBeDisabled();

    // through to the end: Done closes the tour and returns to the start page
    for (const title of [
      'Guided tours',
      'The software catalog',
      'Create something new',
      'Your notifications',
      'Your settings',
    ]) {
      await stepButton(page, 'Next').click();
      await expect(step(page, title)).toBeVisible();
    }
    await expect(page).toHaveURL(/\/settings/);
    await expect(
      step(page, 'Your settings').getByText('Step 6 of 6'),
    ).toBeVisible();
    await expect(stepButton(page, 'Next')).toHaveCount(0);
    await stepButton(page, 'Done').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);

    // a completed tour does not come back
    await page.goto('/guided-tours');
    const row = page.locator(
      '[data-guided-tour="guided-tours.row.guided-tours/welcome"]',
    );
    await expect(row.getByText('Completed')).toBeVisible();
    await expect(row.getByRole('button', { name: 'Restart' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('remembers the current step across reloads and can be dismissed', async ({
    page,
  }) => {
    await page.goto('/');
    await stepButton(page, 'Next').click();
    await expect(step(page, 'Guided tours')).toBeVisible();

    await page.reload();
    await expect(step(page, 'Guided tours')).toBeVisible();
    await expect(
      step(page, 'Guided tours').getByText('Step 2 of 6'),
    ).toBeVisible();

    // Escape dismisses the tour, and dismissing is remembered
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Guided tours', exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('the close button dismisses and the tours page shows the status', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(step(page, 'Welcome 👋')).toBeVisible();
    await closeTour(page);

    await page.goto('/guided-tours');
    const row = page.locator(
      '[data-guided-tour="guided-tours.row.guided-tours/welcome"]',
    );
    await expect(row.getByText('Dismissed')).toBeVisible();
    await expect(row.getByText('6 steps · Starts on login')).toBeVisible();
  });
});
