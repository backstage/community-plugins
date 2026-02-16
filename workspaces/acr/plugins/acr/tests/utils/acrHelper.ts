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
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, TestInfo } from '@playwright/test';

export const ACR_TEST_DATA = {
  repository: 'janus-idp/redhat-backstage-image',
  images: [
    {
      tag: '1.0.0',
      created: 'Jun 30, 2023, 10:33 AM',
      lastModified: 'Jun 30, 2023, 10:33 AM',
      manifest: 'sha256d859263f0d93',
      manifestShort: 'd859263f0d93',
    },
    {
      tag: 'latest',
      created: 'Jun 27, 2023, 9:30 PM',
      lastModified: 'Jun 27, 2023, 9:30 PM',
      manifest: 'sha256ad859263f0d9',
      manifestShort: 'ad859263f0d9',
    },
  ],
} as const;

export class Common {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForSideBarVisible() {
    await this.page.waitForSelector('nav a', { timeout: 120000 });
  }

  async loginAsGuest() {
    await this.page.goto('/');
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await this.page.getByRole('button', { name: 'Enter' }).click();
    await this.waitForSideBarVisible();
  }

  async switchToLocale(locale: string): Promise<void> {
    if (locale !== 'en') {
      const localeString = locale === 'ja' ? '日本語' : locale;
      await this.page.getByRole('button', { name: 'Language' }).click();
      await this.page.getByRole('menuitem', { name: localeString }).click();
    }
  }

  async a11yCheck(testInfo: TestInfo) {
    const accessibilityScanResults = await new AxeBuilder({
      page: this.page as any,
    })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    await testInfo.attach('accessibility-scan-results.json', {
      body: JSON.stringify(accessibilityScanResults.violations, null, 2),
      contentType: 'application/json',
    });
  }

  async searchImages(searchTerm: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Search' }).fill(searchTerm);
  }

  async clearSearch(): Promise<void> {
    await this.page.getByRole('button', { name: 'Clear Search' }).click();
  }

  async expectManifestVisible(manifest: string, visible = true): Promise<void> {
    const locator = this.page.getByText(manifest);
    if (visible) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).not.toBeVisible();
    }
  }
}
