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

import { npmjsExamples } from '../examples/npmjs-examples';
import { navigateToCatalogIfPresent, skipLoginIfPresent } from './test-utils';

test('npmjs-examples', async ({ page }) => {
  await page.goto('/');
  await skipLoginIfPresent(page);

  for (const entity of npmjsExamples) {
    const name = entity.metadata.name;
    const packageName = entity.metadata.annotations!['npm/package'];

    await navigateToCatalogIfPresent(page);
    await page.getByRole('link', { name }).click();

    await expect(page.getByText(`NPM package ${packageName}`)).toBeVisible();
    await expect(page.getByText('Current Tags').first()).toBeVisible();

    if (await page.getByRole('tab', { name: 'Npm Releases' }).isVisible()) {
      await page.getByRole('tab', { name: 'Npm Releases' }).click();
    }

    await expect(page.getByText('Current Tags').last()).toBeVisible();
    await expect(page.getByText('Version History')).toBeVisible();
  }
});
