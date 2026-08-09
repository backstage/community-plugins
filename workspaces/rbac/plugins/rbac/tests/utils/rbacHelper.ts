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

/** Matches APP_MODE in playwright.config.ts / package.json e2e scripts. */
export function isLegacyAppMode(): boolean {
  return process.env.APP_MODE === 'legacy';
}

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

export async function searchForRole(
  page: Page,
  roleEntityRef: string,
  options?: { timeout?: number },
) {
  const timeout = options?.timeout ?? 30_000;
  const search = page.getByRole('textbox', { name: 'Search' });
  await expect(search).toBeVisible({ timeout });
  await search.fill(roleEntityRef);
  const link = page.locator('a').filter({ hasText: roleEntityRef });
  await expect(link).toBeVisible({ timeout });
  return link;
}

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
    // await this.page.waitForSelector('nav a');
    // await expect(this.page.getByTestId('sidebar-root')).toBeVisible({
    //   timeout: 60_000,
    // });
    await expect(this.page.locator('nav a').last()).toBeVisible({
      timeout: 60_000,
    });
  }

  async loginAsGuest() {
    await this.page.goto('/');
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const enterButton = this.page.getByRole('button', { name: 'Enter' });
    if (isLegacyAppMode()) {
      await expect(this.page.getByText('Enter as a Guest User.')).toBeVisible();
    }
    await expect(enterButton).toBeVisible();
    await enterButton.click();
    await this.waitForSideBarVisible();
  }

  async switchToLocale(locale: string): Promise<void> {
    if (locale !== 'en') {
      const names = new Intl.DisplayNames([locale], { type: 'language' });
      const localeString = names.of(locale) || locale;
      await this.page.getByRole('button', { name: 'Language' }).click();
      await this.page.getByRole('menuitem', { name: localeString }).click();
    }
  }

  async openRbacPage(title: string) {
    await this.page
      .getByTestId('sidebar-root')
      .getByRole('link', { name: 'RBAC' })
      .click();
    await expect(
      this.page.getByRole('progressbar', { name: 'Loading' }),
    ).toBeHidden({ timeout: 60_000 });
    await this.verifyHeading(title);
  }
}
