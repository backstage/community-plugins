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

import { Page } from '@playwright/test';

/** The sidebar of the new frontend system (alpha) dev app. */
function sidebar(page: Page) {
  return page.getByRole('navigation', { name: 'sidebar nav' });
}

export async function skipLoginIfPresent(page: Page) {
  const enterButton = page.getByRole('button', { name: 'Enter' });
  // Wait until the app has rendered either the sign-in page or the sidebar.
  await enterButton.or(page.getByRole('link')).first().waitFor();
  if (await enterButton.isVisible()) {
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await enterButton.click();
  }
}

/** True when the tests run against the new frontend system (alpha) dev app. */
export async function isNewFrontendSystem(page: Page) {
  return sidebar(page).getByRole('link', { name: 'Catalog' }).isVisible();
}

export async function navigateToCatalogIfPresent(page: Page) {
  const catalogLink = sidebar(page).getByRole('link', { name: 'Catalog' });
  if (await catalogLink.isVisible()) {
    await catalogLink.click();
  }
}

/**
 * The entity page of the new frontend system renders the entity contents
 * as tabs. Depending on the Backstage version, they are tabs or links.
 */
export function npmReleasesTab(page: Page) {
  return page
    .getByRole('tab', { name: 'Npm Releases' })
    .or(page.getByRole('link', { name: 'Npm Releases' }));
}

export async function openNpmReleasesTabIfPresent(page: Page) {
  const tab = npmReleasesTab(page);
  if (await tab.isVisible()) {
    await tab.click();
  }
}
