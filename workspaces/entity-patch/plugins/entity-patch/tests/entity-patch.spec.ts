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
import { Browser, expect, Page, test } from '@playwright/test';
import { EntityPatchPage } from './EntityPatchPage';

// The "guests" group is always present in the Backstage example catalog.
const GROUP_KIND = 'group';
const GROUP_NAMESPACE = 'default';
const GROUP_NAME = 'guests';

test.describe('Entity Patch Plugin', () => {
  let page: Page;
  let entityPatchPage: EntityPatchPage;

  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    entityPatchPage = new EntityPatchPage(page);
    await entityPatchPage.loginAsGuest();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Edit Entity dialog — open and close', () => {
    test.beforeEach(async () => {
      await entityPatchPage.gotoEntity(GROUP_KIND, GROUP_NAMESPACE, GROUP_NAME);
    });

    test.afterEach(async () => {
      // Navigate away to reliably reset dialog state between tests
      if (await entityPatchPage.dialog.isVisible()) {
        await page.goto('/');
        await entityPatchPage.waitForSideBarVisible();
      }
    });

    test('opens Edit Entity dialog from context menu', async () => {
      await entityPatchPage.openContextMenu();
      await entityPatchPage.clickEditEntity();
      await entityPatchPage.waitForDialog();

      await expect(entityPatchPage.dialog).toBeVisible();
      await expect(
        entityPatchPage.dialog.getByRole('heading', { name: /edit entity/i }),
      ).toBeVisible();
    });

    test('shows form sections inside the dialog', async () => {
      await entityPatchPage.openContextMenu();
      await entityPatchPage.clickEditEntity();
      await entityPatchPage.waitForDialog();

      // The group-details patch should render at least a Description field
      await expect(
        entityPatchPage.dialog.getByLabel('Description'),
      ).toBeVisible();
    });

    test('Save button is visible inside the dialog', async () => {
      await entityPatchPage.openContextMenu();
      await entityPatchPage.clickEditEntity();
      await entityPatchPage.waitForDialog();

      await expect(entityPatchPage.saveButton).toBeVisible();
      await expect(entityPatchPage.closeButton).toBeVisible();
    });
  });

  test.describe('Edit Entity dialog — editing and saving', () => {
    test.beforeEach(async () => {
      await entityPatchPage.gotoEntity(GROUP_KIND, GROUP_NAMESPACE, GROUP_NAME);
      await entityPatchPage.openContextMenu();
      await entityPatchPage.clickEditEntity();
      await entityPatchPage.waitForDialog();
    });

    test.afterEach(async () => {
      // Always navigate away to reset dialog state reliably
      await page.goto('/');
      await entityPatchPage.waitForSideBarVisible();
    });

    test('Save button is enabled after editing a field', async () => {
      await entityPatchPage.fillTextarea(
        'Description',
        'E2E test description update',
      );
      await expect(entityPatchPage.saveButton).toBeEnabled();
    });

    test('saves changes and shows success toast', async () => {
      // Fill all required fields so the form is valid:
      // group-details requires description; team-ownership requires owner
      await entityPatchPage.fillTextarea(
        'Description',
        'E2E test description — saved',
      );
      await entityPatchPage.fillField('Owner', 'group:default/guests');
      await entityPatchPage.saveAndExpectSuccess();
      await entityPatchPage.waitForDialogClosed();
    });

    test('shows unsaved-changes warning when closing with dirty form', async () => {
      await entityPatchPage.fillTextarea(
        'Description',
        'Unsaved change warning test',
      );
      await entityPatchPage.closeButton.click();
      await entityPatchPage.expectUnsavedWarning();
    });

    test('"Keep editing" dismisses the unsaved-changes warning', async () => {
      await entityPatchPage.fillTextarea('Description', 'Keep editing test');
      await entityPatchPage.closeButton.click();
      await entityPatchPage.expectUnsavedWarning();

      await entityPatchPage.keepEditing();
      // Warning is gone, dialog still open
      await expect(
        entityPatchPage.dialog.getByText(/unsaved changes/i),
      ).not.toBeVisible();
      await expect(entityPatchPage.dialog).toBeVisible();
    });

    test('"Discard changes" closes the dialog without saving', async () => {
      await entityPatchPage.fillTextarea('Description', 'Will be discarded');
      await entityPatchPage.closeButton.click();
      await entityPatchPage.expectUnsavedWarning();

      await entityPatchPage.discardChanges();
      await entityPatchPage.waitForDialogClosed();
    });
  });

  test.describe('Edit Entity dialog — persistence after save', () => {
    // Use a unique description so we can be certain the value came from this run
    const uniqueDescription = `E2E persist test ${Date.now()}`;
    // Owner used to exercise the Nunjucks template mapping:
    //   spec.owner → owner field
    //   "{{ owner | parseEntityRef | pick('name') }}" → custom/owner-name annotation
    //   "{{ owner | parseEntityRef | pick('namespace') }}" → custom/owner-namespace annotation
    const ownerRef = 'group:default/platform-team';

    test('saved values are reflected in the entity raw YAML after reload', async () => {
      // 1. Open the edit dialog
      await entityPatchPage.gotoEntity(GROUP_KIND, GROUP_NAMESPACE, GROUP_NAME);
      await entityPatchPage.openContextMenu();
      await entityPatchPage.clickEditEntity();
      await entityPatchPage.waitForDialog();

      // 2. Fill a unique description and an owner (exercises template mapping)
      await entityPatchPage.fillTextarea('Description', uniqueDescription);
      await entityPatchPage.fillField('Owner', ownerRef);

      // 3. Save — dialog closes automatically
      await entityPatchPage.saveAndExpectSuccess();
      await entityPatchPage.waitForDialogClosed();

      // 4. Reload the entity page to confirm the backend persisted the patch
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 5. Open the Entity Inspector → Raw YAML tab
      const yaml = await entityPatchPage.getRawYamlFromInspector(
        GROUP_KIND,
        GROUP_NAMESPACE,
        GROUP_NAME,
      );

      // 6. Assert the description was persisted
      expect(yaml).toContain(`description: ${uniqueDescription}`);

      // 7. Assert the Nunjucks template mapping derived the owner name/namespace
      expect(yaml).toContain('custom/owner-name: platform-team');
      expect(yaml).toContain('custom/owner-namespace: default');
    });

    test.afterAll(async () => {
      // Restore owner to guests so subsequent test runs start from a known state
      await entityPatchPage.gotoEntity(GROUP_KIND, GROUP_NAMESPACE, GROUP_NAME);
      await entityPatchPage.openContextMenu();
      await entityPatchPage.clickEditEntity();
      await entityPatchPage.waitForDialog();
      await entityPatchPage.fillField('Owner', 'group:default/guests');
      await entityPatchPage.saveAndExpectSuccess();
      await entityPatchPage.waitForDialogClosed();
    });
  });

  test.describe('Edit Entity dialog — validation', () => {
    test.beforeEach(async () => {
      await entityPatchPage.gotoEntity(GROUP_KIND, GROUP_NAMESPACE, GROUP_NAME);
      await entityPatchPage.openContextMenu();
      await entityPatchPage.clickEditEntity();
      await entityPatchPage.waitForDialog();
    });

    test.afterEach(async () => {
      // Navigate away to reset dialog state reliably
      await page.goto('/');
      await entityPatchPage.waitForSideBarVisible();
    });

    test('disables Save when email field has invalid format', async () => {
      await entityPatchPage.fillField('Contact Email', 'not-a-valid-email');
      // Trigger validation by blurring the field
      await entityPatchPage.dialog.getByLabel('Description').click();
      await expect(entityPatchPage.saveButton).toBeDisabled();
    });

    test('shows validation error message for invalid email', async () => {
      await entityPatchPage.fillField('Contact Email', 'bad-email');
      // Blur to trigger validation
      await entityPatchPage.dialog.getByLabel('Description').click();
      await expect(
        entityPatchPage.dialog
          .getByText('Must be a valid email address')
          .first(),
      ).toBeVisible();
    });

    test('enables Save after fixing an invalid email', async () => {
      await entityPatchPage.fillField('Contact Email', 'bad-email');
      await entityPatchPage.dialog.getByLabel('Description').click();
      await expect(entityPatchPage.saveButton).toBeDisabled();

      await entityPatchPage.fillField('Contact Email', 'valid@example.com');
      await entityPatchPage.dialog.getByLabel('Description').click();
      await expect(entityPatchPage.saveButton).toBeEnabled();
    });
  });
});
