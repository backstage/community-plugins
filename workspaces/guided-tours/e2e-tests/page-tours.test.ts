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

test.describe('page tours', () => {
  test.beforeEach(async ({ page }) => {
    await resetAllTours(page);
    await page.goto('/');
    await closeTour(page);
  });

  test('the catalog tour starts on the first visit and can be restarted from the header', async ({
    page,
  }) => {
    await page.goto('/catalog');
    await expect(step(page, 'Pick a kind')).toBeVisible();
    await expect(spotlight(page)).toBeVisible();
    await stepButton(page, 'Next').click();
    await stepButton(page, 'Next').click();
    await expect(
      step(page, 'The entity table').getByText('Step 3 of 3'),
    ).toBeVisible();
    await stepButton(page, 'Done').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // a finished tour stays away on the next visit, the header action replays it
    await page.goto('/catalog');
    await expect(
      page.getByRole('button', { name: 'Restart the guided tour' }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Restart the guided tour' }).click();
    await expect(step(page, 'Pick a kind')).toBeVisible();
    await expect(
      step(page, 'Pick a kind').getByText('Step 1 of 3'),
    ).toBeVisible();
  });

  test('the scaffolder tour has a click-through step and restores pages when going back', async ({
    page,
  }) => {
    await page.goto('/create');
    await expect(step(page, 'Find a template')).toBeVisible();
    await stepButton(page, 'Next').click();
    await expect(step(page, 'A template')).toBeVisible();
    await stepButton(page, 'Next').click();

    // click-through: the hint is shown, the Next button stays, and clicking the
    // highlighted element both opens the template and advances the tour
    const choose = step(page, 'Start it');
    await expect(choose).toBeVisible();
    await expect(
      choose.getByText('Click the highlighted element to continue.'),
    ).toBeVisible();
    await expect(stepButton(page, 'Next')).toBeVisible();
    await page.getByTestId('template-card-actions--create').first().click();
    await expect(page).toHaveURL(
      /\/create\/templates\/default\/example-nodejs-template/,
    );
    await expect(step(page, 'Fill in the form')).toBeVisible();

    await stepButton(page, 'Next').click();
    await expect(page).toHaveURL(/\/create\/tasks/);
    await expect(
      step(page, 'Follow your runs').getByText('Step 5 of 5'),
    ).toBeVisible();

    // Previous returns to the template page of the earlier step
    await stepButton(page, 'Previous').click();
    await expect(page).toHaveURL(
      /\/create\/templates\/default\/example-nodejs-template/,
    );
    await expect(step(page, 'Fill in the form')).toBeVisible();
    await stepButton(page, 'Previous').click();
    await expect(page).toHaveURL(/\/create\/templates/);
    await expect(step(page, 'Start it')).toBeVisible();
  });

  test('the notifications and settings tours spotlight their pages', async ({
    page,
  }) => {
    await page.goto('/notifications');
    await expect(step(page, 'Unread first')).toBeVisible();
    await expect(spotlight(page)).toBeVisible();
    await stepButton(page, 'Next').click();
    await expect(step(page, 'Read, saved, all')).toBeVisible();
    await stepButton(page, 'Next').click();
    await expect(
      step(page, 'Inbox zero').getByText('Step 3 of 3'),
    ).toBeVisible();
    await stepButton(page, 'Done').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.goto('/settings');
    await expect(step(page, 'Who you are')).toBeVisible();
    await stepButton(page, 'Next').click();
    await expect(step(page, 'Logout')).toBeVisible();
    await stepButton(page, 'Next').click();
    await expect(step(page, 'Light or dark')).toBeVisible();
    await stepButton(page, 'Next').click();
    await expect(
      step(page, 'Pin the sidebar').getByText('Step 4 of 4'),
    ).toBeVisible();
    await stepButton(page, 'Done').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
