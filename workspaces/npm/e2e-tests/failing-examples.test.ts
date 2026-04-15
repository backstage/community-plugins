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

import { test, expect } from '@playwright/test';

import { failingExamples } from '../plugins/npm/dev/examples/failing-examples';

test('failing-examples', async ({ page }) => {
  await page.goto('/');

  // Skip login if appears (old test app)
  if (await page.getByText('Select a sign-in method').isVisible()) {
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Enter' }).click();
  }

  for (const entity of failingExamples) {
    const name = entity.metadata.name;

    await page.getByRole('link', { name }).click();

    if (name === 'no-npm-package-annotation') {
      await expect(page.getByText('Missing Annotation')).toHaveCount(3);
    } else if (name === 'npm-package-not-found') {
      await expect(
        page.getByText('NPM package npm-package-not-found'),
      ).toBeVisible();
      await expect(
        page.getByText('Error: Unexpected status code: 404 Not Found'),
      ).toHaveCount(8);
    } else {
      throw new Error(
        `Unexpected entity ${name} is playwright test failing-examples`,
      );
    }
  }
});
