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

import { expect, Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TEST_IDS } from '../../src/consts/testids';

/**
 * Page Object Model for the Bookmarks plugin single page application.
 * @see https://playwright.dev/docs/pom
 */
export class BookmarksPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Logs in as a guest user and waits for the sidebar to load. */
  async loginAsGuest() {
    await this.page.goto('/');
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await this.page.getByRole('button', { name: 'Enter' }).click();
    await this.waitForSideBarVisible();
  }

  /** Waits for the sidebar navigation to become visible. */
  async waitForSideBarVisible() {
    await this.page.waitForSelector('nav a', { timeout: 120000 });
  }

  /** Navigates to the bookmarks page and waits for it to load. */
  async goto() {
    await this.page.goto('/bookmarks');
    await this.waitForBookmarksLoaded();
  }

  /** Waits for the bookmarks iframe to be present in the DOM. */
  async waitForBookmarksLoaded() {
    await this.page.waitForSelector(
      `[data-testid="${TEST_IDS.BookmarkViewerFrame.iframe}"]`,
      { timeout: 30000 },
    );
  }

  /** Returns the src attribute of the bookmarks iframe. */
  async getIframeSrc(): Promise<string | null> {
    const iframe = this.page.getByTestId(TEST_IDS.BookmarkViewerFrame.iframe);
    return iframe.getAttribute('src');
  }

  /** Clicks the next navigation button. */
  async clickNextButton() {
    await this.page.getByTestId(TEST_IDS.NavButton.next).click();
  }

  /** Clicks the previous navigation button. */
  async clickPreviousButton() {
    await this.page.getByTestId(TEST_IDS.NavButton.previous).click();
  }

  /** Asserts that the next button is visible or hidden. */
  async expectNextButtonVisible(visible = true) {
    const nextButton = this.page.getByTestId(TEST_IDS.NavButton.next);
    if (visible) {
      await expect(nextButton).toBeVisible();
    } else {
      await expect(nextButton).not.toBeVisible();
    }
  }

  /** Asserts that the previous button is visible or hidden. */
  async expectPreviousButtonVisible(visible = true) {
    const prevButton = this.page.getByTestId(TEST_IDS.NavButton.previous);
    if (visible) {
      await expect(prevButton).toBeVisible();
    } else {
      await expect(prevButton).not.toBeVisible();
    }
  }

  /** Clicks a tree item in the table of contents by its label. */
  async clickTreeItem(label: string) {
    const toc = this.page.getByTestId(TEST_IDS.TableOfContents.wrapper);
    await toc.getByText(label).click();
  }

  /** Asserts that a tree item with the given label is visible or hidden. */
  async expectTreeItemVisible(label: string, visible = true) {
    const toc = this.page.getByTestId(TEST_IDS.TableOfContents.wrapper);
    const item = toc.getByText(label);
    if (visible) {
      await expect(item).toBeVisible();
    } else {
      await expect(item).not.toBeVisible();
    }
  }

  /** Expands all collapsed tree items in the table of contents. */
  async expandAllTreeItems() {
    const toc = this.page.getByTestId(TEST_IDS.TableOfContents.wrapper);
    // Find all collapsed tree items (folders) and expand them using keyboard
    // MUI TreeView items can be expanded by clicking on them or using arrow keys
    const treeItems = toc.locator('[role="treeitem"]');
    const count = await treeItems.count();

    for (let i = 0; i < count; i++) {
      const item = treeItems.nth(i);
      const ariaExpanded = await item.getAttribute('aria-expanded');
      // If aria-expanded exists and is 'false', it's a collapsed folder
      if (ariaExpanded === 'false') {
        await item.click();
        await this.page.waitForTimeout(50);
      }
    }
  }

  /** Expands a specific tree item by its label if it is collapsed. */
  async expandTreeItem(label: string) {
    const toc = this.page.getByTestId(TEST_IDS.TableOfContents.wrapper);
    const treeItem = toc.getByRole('treeitem', { name: label });
    const ariaExpanded = await treeItem.getAttribute('aria-expanded');
    if (ariaExpanded === 'false') {
      await treeItem.click();
    }
  }

  /** Sets the viewport to desktop dimensions (1280x720). */
  async setViewportDesktop() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  /** Sets the viewport to mobile dimensions (375x667). */
  async setViewportMobile() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /** Opens the table of contents drawer in mobile view. */
  async openMobileTocDrawer() {
    await this.page.getByTestId(TEST_IDS.BookmarkMobileView.toggleToc).click();
  }

  /** Closes the table of contents drawer by pressing Escape. */
  async closeMobileTocDrawer() {
    // Use Escape key to close the drawer - more reliable than clicking backdrop
    await this.page.keyboard.press('Escape');
  }

  /** Runs an accessibility check and attaches results to the test report. */
  async a11yCheck(testInfo: TestInfo) {
    const accessibilityScanResults = await new AxeBuilder({
      page: this.page as any,
    })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Exclude iframe since we can't control external content
      .exclude(`[data-testid="${TEST_IDS.BookmarkViewerFrame.iframe}"]`)
      // Exclude Backstage sidebar navigation (dev-utils infrastructure)
      .exclude('nav')
      .analyze();

    await testInfo.attach('accessibility-scan-results.json', {
      body: JSON.stringify(accessibilityScanResults.violations, null, 2),
      contentType: 'application/json',
    });

    expect(
      accessibilityScanResults.violations,
      'Accessibility violations found',
    ).toEqual([]);
  }
}
