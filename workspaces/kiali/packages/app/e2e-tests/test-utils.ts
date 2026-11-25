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

import { expect, type Page } from '@playwright/test';

export async function signInAsGuestIfNeeded(page: Page) {
  const enterButton = page.getByRole('button', { name: 'Enter' });
  await enterButton
    .or(page.getByRole('heading', { name: 'Kiali Community Catalog' }))
    .first()
    .waitFor({ timeout: 60_000 });

  if (await enterButton.isVisible()) {
    page.once('dialog', dialog => dialog.accept());
    await enterButton.click();
    await expect(
      page.getByRole('heading', { name: 'Kiali Community Catalog' }),
    ).toBeVisible({ timeout: 60_000 });
  }
}

const BOOKINFO_ENTITY = '/catalog/default/component/bookinfo-kubernetes';
const BOOKINFO_KIALI_TAB = `${BOOKINFO_ENTITY}/kiali`;

/** Opens the bookinfo-kubernetes entity Kiali tab (catalog index or direct URL). */
export async function openBookinfoKubernetesKialiTab(page: Page) {
  await page.goto('/');
  await signInAsGuestIfNeeded(page);

  const bookinfoLink = page.getByRole('link', { name: 'bookinfo-kubernetes' });

  await page.goto('/catalog');
  const foundInCatalog = await bookinfoLink
    .isVisible({ timeout: 90_000 })
    .catch(() => false);

  if (foundInCatalog) {
    await bookinfoLink.click();
  } else {
    await page.goto(BOOKINFO_ENTITY);
  }

  await expect(page).toHaveURL(
    new RegExp(BOOKINFO_ENTITY.replace(/\//g, '\\/')),
  );

  const kialiTab = page.getByTestId('header-tab-1');
  await expect(kialiTab).toBeVisible({ timeout: 30_000 });
  await kialiTab.click();
  await expect(page).toHaveURL(
    new RegExp(`${BOOKINFO_KIALI_TAB.replace(/\//g, '\\/')}`),
  );
}

/** Opens standalone Kiali at /kiali/overview (full plugin shell). */
export async function navigateToKialiOverview(page: Page) {
  await page.goto('/');
  await signInAsGuestIfNeeded(page);
  await page.goto('/kiali/overview');
  await expect(page.getByText('Provider:', { exact: false })).toBeVisible({
    timeout: 30_000,
  });
}
