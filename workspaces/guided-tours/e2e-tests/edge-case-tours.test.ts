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

test.describe('edge case tours', () => {
  test.beforeEach(async ({ page }) => {
    await resetAllTours(page);
    await page.goto('/guided-tours');
    await closeTour(page);
  });

  test('a target that never shows up centers the step or skips it', async ({
    page,
  }) => {
    await page
      .locator(
        '[data-guided-tour="guided-tours.row.guided-tours/missing-target"]',
      )
      .getByRole('button', { name: 'Start' })
      .click();
    await expect(step(page, 'Missing targets')).toBeVisible();
    // centered steps sit on the spotlight mask, the dialog adds no backdrop
    await expect(spotlight(page)).toBeVisible();
    await expect(page.locator('.bui-DialogOverlay')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    await stepButton(page, 'Next').click();

    // meanwhile a card shaped placeholder with a progress ring is shown,
    // which can be closed too
    await expect(page.getByRole('progressbar')).toBeVisible();
    await expect(
      page.getByRole('dialog').getByRole('button', { name: 'Close tour' }),
    ).toBeVisible();

    // after 1.5 s the card is centered
    await expect(step(page, 'Shown centered')).toBeVisible({ timeout: 5000 });
    await expect(
      step(page, 'Shown centered').getByText('Step 2 of 4'),
    ).toBeVisible();
    await expect(spotlight(page)).toBeVisible();

    // the skip step is passed over after its timeout
    await stepButton(page, 'Next').click();
    await expect(step(page, 'The end')).toBeVisible({ timeout: 5000 });
    await expect(step(page, 'The end').getByText('Step 4 of 4')).toBeVisible();
    await stepButton(page, 'Done').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('an invalid selector neither breaks the tour nor the app', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page
      .locator(
        '[data-guided-tour="guided-tours.row.guided-tours/invalid-selector"]',
      )
      .getByRole('button', { name: 'Start' })
      .click();
    await expect(step(page, 'Invalid selectors')).toBeVisible();
    await stepButton(page, 'Next').click();

    // shown centered at once, with the mistake reported through the error API
    await expect(step(page, 'Broken selector')).toBeVisible({ timeout: 1000 });
    await expect(spotlight(page)).toBeVisible();
    await expect(
      page.getByText(/Invalid target selector "div\[" in step "broken"/),
    ).toBeVisible();

    await stepButton(page, 'Previous').click();
    await expect(step(page, 'Invalid selectors')).toBeVisible();
    await stepButton(page, 'Next').click();
    await stepButton(page, 'Next').click();
    await expect(step(page, 'The end')).toBeVisible();
    await stepButton(page, 'Done').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });
});
