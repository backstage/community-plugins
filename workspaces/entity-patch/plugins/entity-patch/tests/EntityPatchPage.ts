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

import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object Model for the entity-patch plugin e2e tests.
 * @see https://playwright.dev/docs/pom
 */
export class EntityPatchPage {
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
    const enterButton = this.page.getByRole('button', { name: 'Enter' });
    if (await enterButton.isVisible()) {
      await enterButton.click();
    }
    await this.waitForSideBarVisible();
  }

  /** Waits for the sidebar navigation to become visible. */
  async waitForSideBarVisible() {
    await this.page.waitForSelector('nav a', { timeout: 120_000 });
  }

  /**
   * Navigates to a catalog entity page, retrying until the entity is ingested.
   * On a cold server start the catalog may not have processed entities yet,
   * resulting in "Entity not found". We poll every 3s for up to 2 minutes.
   */
  async gotoEntity(kind: string, namespace: string, name: string) {
    const url = `/catalog/${namespace}/${kind}/${name}`;
    const deadline = Date.now() + 120_000;

    let found = false;
    while (!found && Date.now() < deadline) {
      await this.page.goto(url);
      await this.page.waitForLoadState('networkidle');

      const notFound = this.page.getByText('Entity not found');
      if (await notFound.isVisible()) {
        await this.page.waitForTimeout(3_000);
      } else {
        found = true;
      }
    }

    if (!found) {
      throw new Error(
        `Entity ${kind}/${namespace}/${name} was not ingested within 2 minutes`,
      );
    }
  }

  /** Opens the entity context menu (three-dot / kebab menu). */
  async openContextMenu() {
    const menuButton = this.page
      .getByRole('button', { name: /more options|context menu|⋮/i })
      .or(this.page.locator('[aria-label*="more" i]'))
      .or(this.page.locator('[aria-label*="context" i]'))
      .first();
    // Wait explicitly for the button — React hydration after cold start can
    // take longer than the default actionTimeout.
    await menuButton.waitFor({ state: 'visible', timeout: 30_000 });
    await menuButton.click();
  }

  /** Clicks the "Edit Entity" item from the context menu. */
  async clickEditEntity() {
    await this.page
      .getByRole('menuitem', { name: /edit entity/i })
      .or(this.page.getByText('Edit Entity'))
      .first()
      .click();
  }

  /** Returns a locator for the Edit Entity dialog. */
  get dialog(): Locator {
    return this.page.getByRole('dialog', { name: /edit entity/i });
  }

  /** Waits for the Edit Entity dialog to be visible. */
  async waitForDialog() {
    await expect(this.dialog).toBeVisible();
  }

  /** Returns the Save button inside the dialog. */
  get saveButton(): Locator {
    return this.dialog.getByRole('button', { name: /^save$/i });
  }

  /** Returns the Close button inside the dialog. */
  get closeButton(): Locator {
    return this.dialog.getByRole('button', { name: /^close$/i });
  }

  /** Fills a text field by its label. */
  async fillField(label: string, value: string) {
    const field = this.dialog.getByLabel(label);
    await field.fill(value);
  }

  /** Clears and fills a textarea by its label. */
  async fillTextarea(label: string, value: string) {
    const field = this.dialog.getByLabel(label);
    await field.fill(value);
  }

  /** Returns whether the Save button is enabled. */
  async isSaveEnabled(): Promise<boolean> {
    return !(await this.saveButton.isDisabled());
  }

  /** Clicks Save and waits for the success toast. */
  async saveAndExpectSuccess() {
    // Wait for async validation to complete and Save to become enabled
    await expect(this.saveButton).toBeEnabled({ timeout: 15_000 });
    await this.saveButton.click();
    await expect(
      this.page.getByText(/patch saved successfully/i),
    ).toBeVisible();
  }

  /** Expects the unsaved-changes warning alert to appear. */
  async expectUnsavedWarning() {
    await expect(this.dialog.getByText(/unsaved changes/i)).toBeVisible();
  }

  /** Clicks "Discard changes" in the unsaved-changes warning. */
  async discardChanges() {
    await this.dialog.getByRole('button', { name: /discard changes/i }).click();
  }

  /** Clicks "Keep editing" in the unsaved-changes warning. */
  async keepEditing() {
    await this.dialog.getByRole('button', { name: /keep editing/i }).click();
  }

  /** Waits for the dialog to be hidden. */
  async waitForDialogClosed() {
    await expect(this.dialog).not.toBeVisible();
  }

  /**
   * Opens the Entity Inspector dialog via the ?inspect= query param,
   * clicks the "Raw YAML" tab, and returns the full YAML string from the
   * <pre> element so tests can assert on persisted field values.
   */
  async getRawYamlFromInspector(
    kind: string,
    namespace: string,
    name: string,
  ): Promise<string> {
    await this.page.goto(`/catalog/${namespace}/${kind}/${name}?inspect=`);
    await this.page.waitForLoadState('networkidle');

    const inspector = this.page.getByRole('dialog').first();
    await expect(inspector).toBeVisible({ timeout: 10_000 });

    await inspector.getByRole('tab', { name: /raw yaml/i }).click();

    const pre = inspector.locator('pre').first();
    await expect(pre).toBeVisible({ timeout: 5_000 });
    return pre.innerText();
  }
}
