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

import { ACR_TEST_DATA, Common } from './utils/acrHelper';
import {
  AcrMessages,
  getTranslations,
  replaceTemplate,
} from './utils/translations';

test.describe('ACR plugin', () => {
  let page: Page;
  let common: Common;
  let translations: AcrMessages;

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

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test.describe('ACR Images view', () => {
    test.beforeEach(async () => {
      await page.goto('/');
    });

    test('displays the ACR images page with correct structure', async ({}, testInfo) => {
      const pageTitle = replaceTemplate(translations.page.title, {
        image: ACR_TEST_DATA.repository,
      });
      const { tag, created, lastModified, manifest } =
        translations.table.columns;

      await expect(page.getByRole('heading', { level: 1 })).toContainText(
        'ACR demo application',
      );
      await expect(page.getByRole('article')).toMatchAriaSnapshot(`
        - article:
          - 'heading "${pageTitle}" [level=2]'
          - textbox "Search"
          - button "Clear Search" [disabled]
          - table:
            - rowgroup:
              - row "${tag} ${created} ${lastModified} ${manifest}":
                - columnheader "${tag}":
                  - button "${tag}":
                    - button "${tag}"
                - columnheader "${created}":
                  - button "${created}":
                    - button "${created}"
                - columnheader "${lastModified}":
                  - button "${lastModified}":
                    - button "${lastModified}"
                - columnheader "${manifest}":
                  - button "${manifest}":
                    - button "${manifest}"
      `);
      await common.a11yCheck(testInfo);
    });

    test('displays correct data in the table', async ({}, testInfo) => {
      const [image1, image2] = ACR_TEST_DATA.images;

      // Dates are locale-formatted by the browser, so use regex patterns
      await expect(page.getByRole('article')).toMatchAriaSnapshot(`
        - article:
          - table:
            - rowgroup:
              - row:
                - cell "${image1.tag}"
                - cell /.*2023.*/
                - cell /.*2023.*/
                - cell "sha256 ${image1.manifestShort}"
              - row:
                - cell "${image2.tag}"
                - cell /.*2023.*/
                - cell /.*2023.*/
                - cell "sha256 ${image2.manifestShort}"
      `);
      await common.a11yCheck(testInfo);
    });

    test('filters results by search', async ({}, testInfo) => {
      const [image1, image2] = ACR_TEST_DATA.images;

      await common.expectManifestVisible(image1.manifest);
      await common.expectManifestVisible(image2.manifest);

      await common.searchImages(image2.manifestShort);

      await common.expectManifestVisible(image1.manifest, false);
      await common.expectManifestVisible(image2.manifest);

      await common.clearSearch();
      await common.expectManifestVisible(image1.manifest);
      await common.expectManifestVisible(image2.manifest);

      await common.a11yCheck(testInfo);
    });

    test('Verify clicking on a Row Header works as expected', async () => {
      const [image1, image2] = ACR_TEST_DATA.images;

      const lastCell = page.locator('tbody').getByRole('cell').last();
      await expect(lastCell).toHaveText(image2.manifest);
      await page.getByText(translations.table.columns.manifest).click();
      await expect(lastCell).toHaveText(image1.manifest);
    });
  });
});
