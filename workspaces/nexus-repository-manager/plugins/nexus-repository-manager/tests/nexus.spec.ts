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
import { Common } from './utils/helpers';
import {
  getTranslations,
  NexusMessages,
  replaceTemplate,
} from './utils/translations';

test.describe('Nexus Repository Manager plugin', () => {
  let page: Page;
  let common: Common;
  let translations: NexusMessages;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);
    await common.loginAsGuest();
    const currentLocale = await page.evaluate(
      () => globalThis.navigator.language,
    );
    translations = getTranslations(currentLocale);
    await common.switchToLocale(currentLocale);
  });

  test('Heading is visible', async ({ browser }, testInfo) => {
    const headingText = replaceTemplate(translations.table.title, {
      title: 'janus-idp/backstage-showcase',
    });

    await expect(
      page.getByRole('heading', { name: headingText }),
    ).toBeVisible();
    await common.a11yCheck(testInfo);
  });

  test('Table columns check out', async () => {
    const header = page.locator('thead');
    for (const column of Object.values(translations.table.columns)) {
      await expect(
        header.getByRole('columnheader', { name: column }),
      ).toBeVisible();
    }
  });

  test('Filters work', async () => {
    const filter = page.getByPlaceholder(translations.table.searchPlaceholder);
    const tableRow = page.getByRole('row').filter({ hasText: 'sha256' });

    await expect(tableRow).toHaveCount(3);
    await filter.fill('latest');
    await expect(tableRow).toHaveCount(1);
    await page.getByRole('button', { name: 'Clear Search' }).click();
    await expect(tableRow).toHaveCount(3);
  });
});
