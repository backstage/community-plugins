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
    ).toBeEnabled();
  });

  test('All necessary elements are visible', async ({ browser }, testInfo) => {
    const columns = [
      'Tag',
      'Last Modified',
      'Security Scan',
      'Size',
      'Expires',
      'Manifest',
    ];
    const table = page.getByTestId('quay-repo-table');

    await expect(table).toBeVisible();
    await expect(table.getByPlaceholder('Filter')).toBeVisible();

    for (const column of columns) {
      await expect(
        table.getByRole('columnheader', { name: column }),
      ).toBeVisible();
    }
    await common.a11yCheck(testInfo);
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

  test('Different scan results exist', async () => {
    await expect(page.getByRole('link', { name: 'Passed' })).toBeVisible();
    await expect(page.getByText('Queued')).toBeVisible();
    await expect(page.getByText('Unsupported')).toBeVisible();
  });

  test.describe('Vulnerability details', () => {
    test.beforeAll(async () => {
      await page.getByRole('link', { name: 'High' }).first().click();
    });

    test('Vulnerability details are accessible', async ({
      browser,
    }, testInfo) => {
      await expect(page.getByText('Vulnerabilities for')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: `Vulnerabilities for` }),
      ).toBeVisible();
      await expect(page.getByPlaceholder('Filter')).toBeVisible();
      await common.a11yCheck(testInfo);
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
      await expect(tbody.getByRole('row')).toHaveCount(5);
      await expect(tbody.getByText('High')).toHaveCount(2);
      await expect(tbody.getByText('Medium')).toHaveCount(2);
      await expect(tbody.getByText(/^Low$/)).toHaveCount(1);
    });

    test('Link back to repository works', async () => {
      await page.getByRole('link', { name: 'Back to repository' }).click();
      await expect(
        page.getByRole('link', { name: 'backstage-test/test-images' }),
      ).toBeEnabled();
    });
  });
});
