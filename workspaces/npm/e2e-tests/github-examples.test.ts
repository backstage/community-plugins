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

import { githubExamples } from '../plugins/npm/dev/examples/github-examples';

test('github-examples', async ({ page }) => {
  await page.goto('/');

  // Skip login if appears (old test app)
  if (await page.getByText('Select a sign-in method').isVisible()) {
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Enter' }).click();
  }

  for (const entity of githubExamples) {
    const name = entity.metadata.name;

    await page.getByRole('link', { name, exact: true }).click();
    await expect(
      page.getByText(
        `NPM package ${entity.metadata.annotations!['npm/package']}`,
      ),
    ).toBeVisible();
    // Getting the package information fails without GITHUB_TOKEN, we we ignore that here for now.
  }
});
