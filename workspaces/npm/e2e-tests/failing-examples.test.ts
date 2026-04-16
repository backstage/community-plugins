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

import { failingExamples } from '../examples/failing-examples';
import { navigateToCatalogIfPresent, skipLoginIfPresent } from './test-utils';

test('failing-examples', async ({ page }) => {
  await page.goto('/');
  await skipLoginIfPresent(page);

  for (const entity of failingExamples) {
    const name = entity.metadata.name;
    const packageName = entity.metadata.annotations?.['npm/package'];

    await navigateToCatalogIfPresent(page);
    await page.getByRole('link', { name }).click();

    if (name === 'no-npm-package-annotation') {
      if (await page.getByRole('link', { name: 'Catalog' }).isVisible()) {
        // NFS
        await expect(page.getByText('About')).toBeVisible();
        await expect(page.getByRole('tab')).toHaveCount(1);
        await expect(
          page.getByText(`NPM package ${packageName}`),
        ).not.toBeVisible();
      } else {
        await expect(page.getByText('Missing Annotation')).toHaveCount(3);
      }
    } else if (name === 'npm-package-not-found') {
      await expect(page.getByText(`NPM package ${packageName}`)).toBeVisible();
      if (await page.getByRole('link', { name: 'Catalog' }).isVisible()) {
        // NFS
        await expect(page.getByText('About')).toBeVisible();
        await expect(page.getByRole('tab')).toHaveCount(2);
        await expect(
          page.getByText('Error: Unexpected status code: 404 Not Found'),
        ).toHaveCount(4);
        await page.getByRole('tab', { name: 'Npm Releases' }).click();
        await expect(
          page.getByText('Error: Unexpected status code: 404 Not Found'),
        ).toHaveCount(4);
      } else {
        await expect(
          page.getByText('Error: Unexpected status code: 404 Not Found'),
        ).toHaveCount(8);
      }
    } else {
      throw new Error(`Unexpected entity ${name} in the Playwright test`);
    }
  }
});
