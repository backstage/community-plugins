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
import { expect, type Locator, type Page } from '@playwright/test';
import type { RbacMessages } from './translations';
import { replaceTemplate } from './translations';

/** Members modal dialog (excludes BUI Select popovers that also use role=dialog). */
export function membersModal(page: Page, translations: RbacMessages): Locator {
  return page.getByRole('dialog', {
    name: translations.common.addMembersAndGroups,
  });
}

export async function openAddMembersModal(
  page: Page,
  translations: RbacMessages,
) {
  await page.getByTestId('add-members-button').click();
  const dialog = membersModal(page, translations);
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await expect(
    dialog.getByRole('heading', {
      name: translations.common.addMembersAndGroups,
    }),
  ).toBeVisible();
  return dialog;
}

export async function searchInMembersModal(
  dialog: Locator,
  term: string,
  translations?: RbacMessages,
) {
  // Prefer translated accessible name; fall back to the sole searchbox in the dialog
  // (English-only /search/i breaks fr/de/es/it/ja).
  const field = translations
    ? dialog
        .getByRole('searchbox', { name: translations.common.searchByName })
        .or(dialog.getByRole('searchbox', { name: translations.common.search }))
        .or(dialog.getByRole('searchbox'))
        .first()
    : dialog.getByRole('searchbox').first();
  await expect(field).toBeVisible({ timeout: 10_000 });
  await field.fill(term);
}

export async function selectMemberRowsByName(dialog: Locator, names: string[]) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // BUI Table exposes row checkboxes as "Select row <label>"
    const checkbox = dialog.getByRole('checkbox', {
      name: new RegExp(`Select row ${escaped}`),
    });
    await expect(checkbox).toBeVisible({ timeout: 15_000 });
    if (!(await checkbox.isChecked())) {
      // Label/indicator overlays the input in BUI Checkbox
      await checkbox.click({ force: true });
      await expect(checkbox).toBeChecked({ timeout: 5_000 });
    }
  }
}

export async function addSelectedMembers(
  dialog: Locator,
  translations: RbacMessages,
) {
  await dialog
    .getByRole('button', { name: translations.common.add, exact: true })
    .click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
}

export async function cancelMembersModal(
  dialog: Locator,
  translations: RbacMessages,
) {
  // Dismiss any open Select popover first (also role=dialog while animating)
  await dialog.page().keyboard.press('Escape');
  await dialog
    .getByRole('button', { name: translations.dialog.cancel, exact: true })
    .click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
}

/**
 * Opens the modal, checks the given member display names, and clicks Add.
 * Existing modal selections (edit reopen) are left as-is unless unchecked.
 */
export async function selectMembersViaModal(
  page: Page,
  translations: RbacMessages,
  memberNames: string[],
) {
  const dialog = await openAddMembersModal(page, translations);
  for (const name of memberNames) {
    await searchInMembersModal(dialog, name, translations);
    await selectMemberRowsByName(dialog, [name]);
  }
  await addSelectedMembers(dialog, translations);
}

export function selectedCountText(
  translations: RbacMessages,
  count: number,
): string {
  return replaceTemplate(translations.common.selectedCount, { count });
}

/** Open a BUI Select inside the members modal by its field label. */
export async function chooseMembersModalSelectOption(
  dialog: Locator,
  label: string,
  option: string,
) {
  // Trigger is a button like "All Kind" / "All Namespace"
  await dialog.getByRole('button', { name: new RegExp(label) }).click();
  await dialog
    .page()
    .getByRole('option', { name: option, exact: true })
    .click();
}
