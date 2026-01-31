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

import { expect, Page, test } from '@playwright/test';
import { TEST_IDS } from '../src/consts/testids';
import { testData } from '../dev/testData';
import { UrlTree } from '../src/types';
import { BookmarksPage } from './utils/BookmarksPage';
import { translations } from './utils/translations';

/** Flattens a UrlTree into an array of expected bookmarks in depth-first order. */
const flattenUrlTree = (
  tree: UrlTree,
): { label: string; urlContains: string }[] =>
  Object.entries(tree).flatMap(([label, value]) =>
    typeof value === 'string'
      ? [{ label, urlContains: value.slice(-30) }]
      : flattenUrlTree(value),
  );

const expectedBookmarks = flattenUrlTree(testData);

/** Parent folder names from testData for tree view tests */
const parentFolders = Object.keys(testData).filter(key => {
  const value = testData[key];
  return value !== null && typeof value === 'object' && !Array.isArray(value);
});

test.describe('Bookmarks Plugin', () => {
  let page: Page;
  let bookmarksPage: BookmarksPage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    bookmarksPage = new BookmarksPage(page);

    await bookmarksPage.loginAsGuest();
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test.describe('Page Rendering', () => {
    test.beforeEach(async () => {
      await bookmarksPage.goto();
    });

    test('renders the iframe viewer', async ({}, testInfo) => {
      const iframe = page.getByTestId(TEST_IDS.BookmarkViewerFrame.iframe);
      await expect(iframe).toBeVisible();
      await bookmarksPage.a11yCheck(testInfo);
    });

    test('renders the table of contents', async () => {
      const toc = page.getByTestId(TEST_IDS.TableOfContents.wrapper);
      await expect(toc).toBeVisible();
    });

    test('renders the open in new tab button', async () => {
      const newTabButton = page.getByTestId(TEST_IDS.BookmarksViewer.newTab);
      await expect(newTabButton).toBeVisible();
      await expect(newTabButton).toHaveAttribute('target', '_blank');
    });

    test('initially shows next button but not previous button', async () => {
      await bookmarksPage.expectNextButtonVisible(true);
      await bookmarksPage.expectPreviousButtonVisible(false);
    });

    test('iframe has a valid src attribute', async () => {
      const src = await bookmarksPage.getIframeSrc();
      expect(src).toBeTruthy();
      expect(src).toContain('http');
    });
  });

  test.describe('Navigation - Next/Previous Buttons', () => {
    test.beforeEach(async () => {
      await bookmarksPage.goto();
    });

    test('clicking next button shows previous button', async () => {
      await bookmarksPage.expectPreviousButtonVisible(false);
      await bookmarksPage.clickNextButton();
      await bookmarksPage.expectPreviousButtonVisible(true);
    });

    test('clicking next button updates iframe src', async () => {
      const initialSrc = await bookmarksPage.getIframeSrc();
      await bookmarksPage.clickNextButton();
      const newSrc = await bookmarksPage.getIframeSrc();
      expect(newSrc).not.toBe(initialSrc);
    });

    test('clicking previous returns to previous bookmark', async () => {
      const initialSrc = await bookmarksPage.getIframeSrc();

      await bookmarksPage.clickNextButton();
      const secondSrc = await bookmarksPage.getIframeSrc();
      expect(secondSrc).not.toBe(initialSrc);

      await bookmarksPage.clickPreviousButton();
      const returnedSrc = await bookmarksPage.getIframeSrc();
      expect(returnedSrc).toBe(initialSrc);
    });

    test('navigating to last bookmark hides next button', async () => {
      for (let i = 0; i < expectedBookmarks.length - 1; i++) {
        await bookmarksPage.expectNextButtonVisible(true);
        await bookmarksPage.clickNextButton();
      }
      await bookmarksPage.expectNextButtonVisible(false);
    });

    test('navigating back to first bookmark hides previous button', async () => {
      await bookmarksPage.clickNextButton();
      await bookmarksPage.clickNextButton();
      await bookmarksPage.expectPreviousButtonVisible(true);

      await bookmarksPage.clickPreviousButton();
      await bookmarksPage.clickPreviousButton();
      await bookmarksPage.expectPreviousButtonVisible(false);
    });

    test('next button shows upcoming bookmark label', async () => {
      const nextButton = page.getByTestId(TEST_IDS.NavButton.next);
      await expect(nextButton).toContainText(expectedBookmarks[1].label);
    });
  });

  test.describe('Iframe Source', () => {
    test.beforeEach(async () => {
      await bookmarksPage.goto();
    });

    test('iframe src updates correctly when navigating', async () => {
      const firstSrc = await bookmarksPage.getIframeSrc();
      expect(firstSrc).toContain(expectedBookmarks[0].urlContains);

      await bookmarksPage.clickNextButton();
      const secondSrc = await bookmarksPage.getIframeSrc();
      expect(secondSrc).toContain(expectedBookmarks[1].urlContains);

      await bookmarksPage.clickNextButton();
      const thirdSrc = await bookmarksPage.getIframeSrc();
      expect(thirdSrc).toContain(expectedBookmarks[2].urlContains);
    });

    test('open in new tab button has correct href', async () => {
      const newTabButton = page.getByTestId(TEST_IDS.BookmarksViewer.newTab);

      const initialHref = await newTabButton.getAttribute('href');
      expect(initialHref).toBeTruthy();

      await bookmarksPage.clickNextButton();
      const newHref = await newTabButton.getAttribute('href');
      expect(newHref).not.toBe(initialHref);
    });
  });

  test.describe('Tree View (Table of Contents)', () => {
    test.beforeEach(async () => {
      await bookmarksPage.goto();
    });

    test('displays parent folder names in the tree', async () => {
      for (const folder of parentFolders) {
        await bookmarksPage.expectTreeItemVisible(folder, true);
      }
    });

    test('clicking tree item updates iframe src', async () => {
      const initialSrc = await bookmarksPage.getIframeSrc();

      // Expand parent folder first since 'notepad' is nested
      await bookmarksPage.expandTreeItem('My cool gadgets and gizmos');
      await bookmarksPage.clickTreeItem(expectedBookmarks[3].label);

      const newSrc = await bookmarksPage.getIframeSrc();
      expect(newSrc).not.toBe(initialSrc);
      expect(newSrc).toContain(expectedBookmarks[3].urlContains);
    });

    test('clicking tree item updates navigation buttons', async () => {
      await bookmarksPage.expectPreviousButtonVisible(false);

      // Expand parent folder first since 'notepad' is nested
      await bookmarksPage.expandTreeItem('My cool gadgets and gizmos');
      await bookmarksPage.clickTreeItem(expectedBookmarks[3].label);

      await bookmarksPage.expectPreviousButtonVisible(true);
      await bookmarksPage.expectNextButtonVisible(true);
    });

    test('tree items can be expanded and collapsed', async () => {
      const toc = page.getByTestId(TEST_IDS.TableOfContents.wrapper);

      const folderItem = toc.getByRole('treeitem', {
        name: /My cool gadgets and gizmos/i,
      });
      await expect(folderItem).toBeVisible();

      const expandIcon = folderItem
        .locator(
          '[data-testid="ExpandMoreIcon"], [data-testid="ChevronRightIcon"]',
        )
        .first();
      if (await expandIcon.isVisible()) {
        await expandIcon.click();
      }
    });

    test('selecting a bookmark highlights it in the tree', async () => {
      const toc = page.getByTestId(TEST_IDS.TableOfContents.wrapper);

      await bookmarksPage.clickNextButton();
      await bookmarksPage.clickNextButton();

      const selectedItem = toc.locator('.Mui-selected');
      await expect(selectedItem).toBeVisible();
    });
  });

  test.describe('Responsive Layout', () => {
    test.afterEach(async () => {
      // Reset to desktop viewport after each test to avoid affecting other tests
      await bookmarksPage.setViewportDesktop();
    });

    test('shows desktop view on large viewport', async ({}, testInfo) => {
      await bookmarksPage.setViewportDesktop();
      await bookmarksPage.goto();

      const desktopView = page.getByTestId(
        TEST_IDS.BookmarkDesktopView.wrapper,
      );
      await expect(desktopView).toBeVisible();
      await bookmarksPage.a11yCheck(testInfo);
    });

    test('shows mobile view on small viewport', async ({}, testInfo) => {
      await bookmarksPage.setViewportMobile();
      await bookmarksPage.goto();

      const mobileView = page.getByTestId(TEST_IDS.BookmarkMobileView.wrapper);
      await expect(mobileView).toBeVisible();
      await bookmarksPage.a11yCheck(testInfo);
    });

    test('mobile view has toggle button for TOC drawer', async () => {
      await bookmarksPage.setViewportMobile();
      await bookmarksPage.goto();

      const toggleButton = page.getByTestId(
        TEST_IDS.BookmarkMobileView.toggleToc,
      );
      await expect(toggleButton).toBeVisible();
    });

    test('mobile TOC drawer opens and closes', async () => {
      await bookmarksPage.setViewportMobile();
      await bookmarksPage.goto();

      const toc = page.getByTestId(TEST_IDS.TableOfContents.wrapper);

      await expect(toc).not.toBeVisible();

      await bookmarksPage.openMobileTocDrawer();
      await expect(toc).toBeVisible();

      await bookmarksPage.closeMobileTocDrawer();
      await expect(toc).not.toBeVisible();
    });

    test('mobile view does not show previous button', async () => {
      await bookmarksPage.setViewportMobile();
      await bookmarksPage.goto();

      await bookmarksPage.clickNextButton();
      await bookmarksPage.expectPreviousButtonVisible(false);
    });
  });

  test.describe('Full Navigation Flow', () => {
    test.beforeEach(async () => {
      await bookmarksPage.goto();
    });

    test('can navigate through all bookmarks using next button', async () => {
      for (let i = 0; i < expectedBookmarks.length - 1; i++) {
        const currentSrc = await bookmarksPage.getIframeSrc();
        expect(currentSrc).toContain(expectedBookmarks[i].urlContains);
        await bookmarksPage.clickNextButton();
      }

      const finalSrc = await bookmarksPage.getIframeSrc();
      expect(finalSrc).toContain(
        expectedBookmarks[expectedBookmarks.length - 1].urlContains,
      );
    });

    test('can navigate backwards through all bookmarks using previous button', async () => {
      for (let i = 0; i < expectedBookmarks.length - 1; i++) {
        await bookmarksPage.clickNextButton();
      }

      for (let i = expectedBookmarks.length - 1; i > 0; i--) {
        const currentSrc = await bookmarksPage.getIframeSrc();
        expect(currentSrc).toContain(expectedBookmarks[i].urlContains);
        await bookmarksPage.clickPreviousButton();
      }

      const firstSrc = await bookmarksPage.getIframeSrc();
      expect(firstSrc).toContain(expectedBookmarks[0].urlContains);
    });
  });

  test.describe('Error States', () => {
    test('shows empty state for entity without bookmarks', async () => {
      await page.goto('/catalog/default/component/no-bookmarks');
      await page.waitForLoadState('networkidle');

      const bookmarksTab = page.getByRole('tab', { name: /bookmarks/i });
      if (await bookmarksTab.isVisible()) {
        await bookmarksTab.click();

        const emptyState = page.getByText(
          translations['entityBookmarksContent.notFound.title'],
        );
        await expect(emptyState).toBeVisible();
      }
    });

    test('shows error state for entity with invalid bookmarks', async () => {
      await page.goto('/catalog/default/component/invalid-bookmarks');
      await page.waitForLoadState('networkidle');

      const bookmarksTab = page.getByRole('tab', { name: /bookmarks/i });
      if (await bookmarksTab.isVisible()) {
        await bookmarksTab.click();

        const errorState = page.getByText(
          translations['entityBookmarksContent.invalid.title'],
        );
        await expect(errorState).toBeVisible();
      }
    });
  });
});
