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

/**
 * Read-only full-stack e2e tests — frontend dev app + rbac-backend dev server.
 * Seed data: tests/fixtures/rbac-policy.csv (loaded via app-config.yaml).
 *
 * For comprehensive mutating UI flows see rbac.spec.ts (mock e2e suite).
 */
import { expect, Page, test } from '@playwright/test';
import { runAccessibilityTests } from './utils/accessibility';
import {
  Common,
  verifyColumnHeading,
  waitForRbacBackend,
} from './utils/rbacHelper';
import {
  RbacMessages,
  getTranslations,
  replaceTemplate,
} from './utils/translations';

const E2E_ROLES = ['guests', 'rbac_admin'] as const;

test.describe('RBAC plugin (full-stack)', () => {
  test.describe.configure({ timeout: 120_000 });

  let page: Page;
  let common: Common;
  let translations: RbacMessages;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180_000);
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);
    await waitForRbacBackend(page);
    await common.loginAsGuest();
    const currentLocale = await page.evaluate(
      () => globalThis.navigator.language,
    );
    translations = getTranslations(currentLocale);
    await common.switchToLocale(currentLocale);
    await common.openRbacPage(translations.page.title);
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('lists roles seeded from the backend policy CSV', async () => {
    await common.verifyHeading(
      replaceTemplate(translations.table.titleWithCount, {
        count: String(E2E_ROLES.length),
      }),
    );
    await runAccessibilityTests(page);

    const columns = [
      translations.table.headers.name,
      translations.table.headers.usersAndGroups,
      translations.table.headers.accessiblePlugins,
      translations.table.headers.actions,
    ];
    await verifyColumnHeading(columns, page);

    for (const role of E2E_ROLES) {
      await expect(
        page.locator('a').filter({ hasText: `role:default/${role}` }),
      ).toBeVisible();
    }
  });

  test('loads role details from the backend API', async () => {
    const roleName = 'role:default/rbac_admin';
    await page.locator('a').filter({ hasText: roleName }).click();
    await common.verifyHeading(roleName);
    await runAccessibilityTests(page);

    await expect(
      page.getByRole('tab', { name: translations.common.overview }),
    ).toBeVisible();
    await expect(page.getByText(translations.common.about)).toBeVisible();

    await verifyColumnHeading(
      [
        translations.common.name,
        translations.common.type,
        translations.common.members,
      ],
      page,
    );

    await expect(
      page.getByRole('heading').filter({
        hasText: translations.permissionPolicies.permissions,
      }),
    ).toBeVisible();

    await page
      .getByTestId('sidebar-root')
      .getByRole('link', { name: translations.page.title })
      .click();
  });

  test('guest role overview is reachable via the backend', async () => {
    const roleName = 'role:default/guests';
    await page.locator('a').filter({ hasText: roleName }).click();
    await common.verifyHeading(roleName);
    await expect(
      page.getByRole('tab', { name: translations.common.overview }),
    ).toBeVisible();

    await page
      .getByTestId('sidebar-root')
      .getByRole('link', { name: translations.page.title })
      .click();
  });
});
