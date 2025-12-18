/*
 * Copyright 2025 The Backstage Authors
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
import { Common } from './util/helpers';

test.describe('ServiceNow plugin', () => {
  let page: Page;
  let common: Common;

  const columns = [
    'Incident Number',
    'Description',
    'Created',
    'Priority',
    'State',
    'Actions',
  ];

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);

    await common.loginAsGuest();
    await expect(
      page.getByRole('heading', { name: 'ServiceNow tickets' }),
    ).toBeVisible();
  });

  test('All columns are shown', async ({ browser }, testInfo) => {
    const header = page.locator('thead');
    for (const column of columns) {
      await expect(
        header.getByRole('columnheader', { name: column }),
      ).toBeVisible();
    }
    await common.a11yCheck(testInfo);
  });

  test('Control elements are shown', async () => {
    await expect(page.getByLabel('State')).toBeVisible();
    await expect(page.getByLabel('Priority')).toBeVisible();
    await expect(page.getByPlaceholder('Search')).toBeVisible();
    await expect(page.getByText(/\d rows/)).toBeVisible();
  });

  test('Data is visible', async () => {
    const rows = page.getByRole('row').filter({ hasText: 'INC000' });
    await expect(rows).toHaveCount(5);

    const firstRowCells = rows.first().getByRole('cell');
    await expect(firstRowCells).toHaveCount(5);
    await expect(rows.first().locator('th')).toContainText('INC');
    await expect(firstRowCells.nth(0)).toContainText('Email server');
    await expect(firstRowCells.nth(2)).toContainText('Critical');
    await expect(firstRowCells.nth(3)).toContainText('New');
  });

  test('Search works', async () => {
    const search = page.getByPlaceholder('Search');
    const rows = page.getByRole('row').filter({ hasText: 'INC000' });

    await search.fill('unable');
    await expect(rows).toHaveCount(2);

    await page.getByRole('button', { name: 'Clear Search' }).click();
    await expect(rows).toHaveCount(5);
  });

  test('Filtering works', async () => {
    const rows = page.getByRole('row').filter({ hasText: 'INC000' });
    const state = page.getByLabel('State');
    const priority = page.getByLabel('Priority');

    await state.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    await listbox.getByRole('option', { name: 'Resolved' }).click();
    await listbox.press('Escape');
    await expect(rows).toHaveCount(3);

    await priority.click();
    await listbox.getByRole('option', { name: 'Low' }).click();
    await listbox.press('Escape');
    await expect(rows).toHaveCount(1);

    await state.hover();
    await state.getByRole('button', { name: 'Clear' }).click();
    await expect(rows).toHaveCount(2);

    await priority.hover();
    await priority.getByRole('button', { name: 'Clear' }).click();
    await expect(rows).toHaveCount(5);
  });
});
