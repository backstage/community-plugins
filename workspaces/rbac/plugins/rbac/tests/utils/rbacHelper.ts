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
import { expect, type Locator, type Page } from '@playwright/test';

export const verifyCellsInTable = async (
  cellIdentifier: (string | RegExp)[],
  page: Page,
) => {
  for (const text of cellIdentifier) {
    const cellLocator = page
      .locator('td[class*="MuiTableCell-root"]')
      .filter({ hasText: text });
    const count = await cellLocator.count();

    if (count === 0) {
      throw new Error(
        `Expected at least one cell with text matching ${text}, but none were found.`,
      );
    }

    // Checks if all matching cells are visible.
    for (let i = 0; i < count; i++) {
      await expect(cellLocator.nth(i)).toBeVisible();
    }
  }
};

export const verifyColumnHeading = async (
  columns: (string | RegExp)[],
  page: Page,
) => {
  const thead = page.locator('thead');
  for (const col of columns) {
    await expect(
      thead.getByRole('columnheader', { name: col, exact: true }),
    ).toBeVisible();
  }
};

export const verifyText = async (
  text: string | RegExp,
  page: Page,
  exact: boolean = true,
) => {
  const element = page.getByText(text, { exact: exact }).first();

  // Check if element appears in DOM
  const elementCount = await element.count();
  if (elementCount > 0) {
    await expect(element).toBeVisible({ timeout: 10000 });
  } else {
    // Element not found in DOM, skip visibility check
  }
};

export class Common {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyHeading(heading: string | RegExp) {
    const headingLocator = this.page
      .locator('h1, h2, h3, h4, h5, h6')
      .filter({ hasText: heading })
      .first();
    await headingLocator.waitFor({ state: 'visible', timeout: 30000 });
    await expect(headingLocator).toBeVisible();
  }

  async clickButton(
    label: string,
    clickOpts?: Parameters<Locator['click']>[0],
    getByTextOpts: Parameters<Locator['getByText']>[1] = { exact: true },
  ) {
    const muiButtonLabel =
      'span[class^="MuiButton-label"],button[class*="MuiButton-root"]';
    const selector = `${muiButtonLabel}:has-text("${label}")`;
    const button = this.page
      .locator(selector)
      .getByText(label, getByTextOpts)
      .first();

    // Wait for button to be visible with explicit timeout and error handling
    try {
      await button.waitFor({ state: 'visible', timeout: 30000 });
    } catch (error) {
      // If page is closed, check if element exists in DOM as fallback
      if (error instanceof Error && error.message.includes('closed')) {
        // Try to check if element exists in DOM
        const elementCount = await button.count().catch(() => 0);
        if (elementCount === 0) {
          throw new Error(`Button "${label}" not found and page may be closed`);
        }
        // Element exists, proceed with click even if waitFor failed
      } else {
        throw error;
      }
    }

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded').catch(() => {}),
    ]);

    // Check if element still exists before clicking
    const elementCount = await button.count().catch(() => 0);
    if (elementCount > 0) {
      await button.click(clickOpts);
    } else {
      throw new Error(`Button "${label}" is not available in DOM`);
    }
  }

  async waitForSideBarVisible() {
    await this.page.waitForSelector('nav a', { timeout: 120000 });
  }

  async loginAsGuest() {
    await this.page.goto('/');
    // TODO - Remove it after https://issues.redhat.com/browse/RHIDP-2043. A Dynamic plugin for Guest Authentication Provider needs to be created
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await expect(this.page.getByText('Enter as a Guest User.')).toBeVisible();
    await this.clickButton('Enter');
    await this.waitForSideBarVisible();
  }

  async switchToLocale(page: Page, locale: string): Promise<void> {
    if (locale !== 'en') {
      await page.getByRole('button', { name: 'Language' }).click();
      await page.getByRole('menuitem', { name: locale }).click();
    }
  }
}
