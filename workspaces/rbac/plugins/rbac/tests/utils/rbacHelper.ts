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
import { expect, type Page } from '@playwright/test';

export const verifyCellsInTable = async (
  cellIdentifier: (string | RegExp)[],
  page: Page,
) => {
  for (const text of cellIdentifier) {
    const cellLocator = page.getByRole('cell').filter({ hasText: text });
    expect(await cellLocator.count()).toBeGreaterThan(0);

    // Checks if all matching cells are visible.
    for (const cell of await cellLocator.all()) {
      await expect(cell).toBeVisible();
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
  await expect(element).toBeVisible();
};

export class Common {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyHeading(heading: string | RegExp) {
    const headingLocator = this.page
      .getByRole('heading', { name: heading })
      .first();
    await expect(headingLocator).toBeVisible();
  }

  async clickButton(label: string) {
    const button = this.page.getByRole('button', { name: label, exact: true });
    await expect(button).toHaveCount(1);
    await button.click();
  }

  async waitForSideBarVisible() {
    await this.page.waitForSelector('nav a');
  }

  async loginAsGuest() {
    await this.page.goto('/');
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await expect(this.page.getByText('Enter as a Guest User.')).toBeVisible();
    await this.clickButton('Enter');
    await this.waitForSideBarVisible();
  }

  async switchToLocale(locale: string): Promise<void> {
    if (locale !== 'en') {
      const localeString = locale === 'ja' ? '日本語' : locale;
      await this.page.getByRole('button', { name: 'Language' }).click();
      await this.page.getByRole('menuitem', { name: localeString }).click();
    }
  }
}
