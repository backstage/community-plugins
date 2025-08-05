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
import { expect, Page, test } from '@playwright/test';

import { Common } from './quayHelper';

test.describe('Quay plugin', () => {
  let page: Page;
  let common: Common;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);

    await common.loginAsGuest();
    await expect(
      page.getByRole('link', { name: 'backstage-test/test-images' }),
    ).toBeEnabled({ timeout: 20000 });
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('All columns are shown in the table', async () => {
    const columns = [
      'Tag',
      'Last Modified',
      'Security Scan',
      'Size',
      'Expires',
      'Manifest',
    ];
    const thead = page.locator('thead');

    for (const col of columns) {
      await expect(thead.getByText(col)).toBeVisible();
    }
  });

  test('Vulnerabilities are listed', async () => {
    const severity = ['High:', 'Medium:', 'Low:'];
    for (const lvl of severity) {
      const tagWithAllVulnerabilities = page.getByTestId(
        'latest-linux-arm64-security-scan',
      );
      await expect(tagWithAllVulnerabilities).toContainText(lvl);
    }
  });

  test('Vulnerability details are accessible', async () => {
    await page.getByRole('link', { name: 'High' }).first().click();
    await expect(page.getByText('Vulnerabilities for')).toBeVisible({
      timeout: 15000,
    });
  });

  test('Vulnerability columns are shown', async () => {
    const columns = [
      'Advisory',
      'Severity',
      'Package Name',
      'Current Version',
      'Fixed By',
    ];

    for (const col of columns) {
      await expect(page.getByText(col)).toBeVisible();
    }
  });

  test('Vulnerability rows are shown', async () => {
    const tbody = page.locator('tbody');
    await expect(tbody.locator('tr')).toHaveCount(5);
  });

  test('Link back to repository works', async () => {
    await page.getByRole('link', { name: 'Back to repository' }).click();
    await expect(
      page.getByRole('link', { name: 'backstage-test/test-images' }),
    ).toBeEnabled();
  });
});
