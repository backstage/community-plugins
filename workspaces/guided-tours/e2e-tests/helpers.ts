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
import { expect, Page } from '@playwright/test';

/** The button inside the step card; the dev pages have other Next/Previous buttons. */
export const stepButton = (page: Page, name: 'Previous' | 'Next' | 'Done') =>
  page.getByRole('dialog').getByRole('button', { name, exact: true });

/** The step card: a centered dialog named after its heading, or an anchored popover. */
export const step = (page: Page, title: string) =>
  page.getByRole('dialog', { name: title });

export const spotlight = (page: Page) =>
  page.getByTestId('guided-tour-spotlight');

/** Closes a running tour, if any. Tours start a moment after the page loads. */
export async function closeTour(page: Page) {
  const close = page.getByRole('button', { name: 'Close tour' });
  await close
    .first()
    .waitFor({ state: 'visible', timeout: 3000 })
    .catch(() => undefined);
  if (await close.count()) {
    await close.first().click();
  }
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

/**
 * Clears all progress through the guided tours page. The welcome tour then
 * starts again on the next page load, as it does for a new user.
 */
export async function resetAllTours(page: Page) {
  await page.goto('/guided-tours');
  await closeTour(page);
  await page.getByRole('button', { name: 'Reset all tours' }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
