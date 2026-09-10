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
 * Full-stack e2e — frontend + rbac-backend (no in-browser mockRBACApi).
 * Roles are seeded via REST in beforeAll (editable source), scoped with
 * `-${locale}` so locale projects can share one in-memory backend.
 * Catalog members come from tests/fixtures/catalog-org.yaml + examples/org.yaml.
 */
import { expect, Page, test } from '@playwright/test';
import { runAccessibilityTests } from './utils/accessibility';
import {
  Common,
  searchForRole,
  verifyCellsInTable,
  verifyColumnHeading,
  verifyText,
} from './utils/rbacHelper';
import {
  seedE2eRolesViaRest,
  getE2eRoles,
  type E2eRoles,
} from './utils/seedE2eRoles';
import {
  RbacMessages,
  getTranslations,
  replaceTemplate,
} from './utils/translations';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('RBAC plugin', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });

  let page: Page;
  let common: Common;
  let translations: RbacMessages;
  let locale: string;
  let e2eRoles: E2eRoles;
  const RoleOverviewPO = {
    updatePolicies: 'button[data-testid="update-policies"]',
    updateMembers: 'button[data-testid="update-members"]',
  };

  const navigateToRole = async (roleShortName: string) => {
    await page
      .getByTestId('sidebar-root')
      .getByRole('link', { name: translations.page.title })
      .click();
    const roleEntityRef = `role:default/${roleShortName}`;
    const roleLink = await searchForRole(page, roleEntityRef);
    await roleLink.click();
    await common.verifyHeading(roleEntityRef);
    await page.getByRole('tab', { name: translations.common.overview }).click();
    await page.locator(RoleOverviewPO.updatePolicies).click();
    await common.verifyHeading(translations.roleForm.titles.editRole);
  };

  const finishAndVerifyUpdate = async (button: string, message: string) => {
    await common.clickButton(translations.roleForm.steps.next);
    await page
      .getByText(translations.permissionPolicies.helperText)
      .waitFor({ state: 'hidden' });
    await common.clickButton(button);

    await verifyText(message, page);
    if (button === translations.roleForm.steps.save) {
      await page
        .getByTestId('sidebar-root')
        .getByRole('link', { name: translations.page.title })
        .click();
    }
  };

  test.beforeAll(async ({ browser }, testInfo) => {
    test.setTimeout(180_000);
    locale = testInfo.project.name;
    e2eRoles = getE2eRoles(locale);
    translations = getTranslations(locale);

    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);
    await common.loginAsGuest();
    await common.switchToLocale(locale);
    await seedE2eRolesViaRest(page, locale);
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test('Should show seeded roles in the list, column headings and cells', async () => {
    const titlePattern = escapeRegExp(
      replaceTemplate(translations.table.titleWithCount, {
        count: '__COUNT__',
      }),
    ).replace('__COUNT__', '\\d+');
    await expect(
      page.getByRole('heading', { name: new RegExp(`^${titlePattern}$`) }),
    ).toBeVisible();
    await searchForRole(page, e2eRoles.guests);
    await searchForRole(page, e2eRoles.rbacAdmin);
    await page.getByRole('button', { name: 'Clear Search' }).click();
    await expect(page.getByRole('textbox', { name: 'Search' })).toBeEmpty();
    await runAccessibilityTests(page);
    const columns = [
      translations.table.headers.name,
      translations.table.headers.usersAndGroups,
      translations.table.headers.accessiblePlugins,
      translations.table.headers.actions,
    ];
    await verifyColumnHeading(columns, page);

    const roleName = new RegExp(/^(role|user|group):[a-zA-Z]+\/[\w@*.~-]+$/);
    const user = escapeRegExp(translations.common.user);
    const users = escapeRegExp(translations.common.users);
    const group = escapeRegExp(translations.common.group);
    const groups = escapeRegExp(translations.common.groups);
    const usersAndGroups = new RegExp(
      `^(1\\s(${user}|${group})|[2-9]\\d*\\s(${users}|${groups}))(, (1\\s(${user}|${group})|[2-9]\\d*\\s(${users}|${groups})))?$`,
    );
    const accessiblePlugins = /\d/;
    const cellIdentifier = [roleName, usersAndGroups, accessiblePlugins];

    await verifyCellsInTable(cellIdentifier, page);
  });

  test('View details of role', async ({}, testInfo) => {
    // Skipping Japanese tests due to https://issues.redhat.com/browse/RHDHBUGS-2598
    test.fixme(testInfo.project.name === 'ja', 'Skip Japanese test');
    const roleName = e2eRoles.rbacAdmin;
    await (await searchForRole(page, roleName)).click();
    await common.verifyHeading(roleName);
    await runAccessibilityTests(page);
    await expect(
      page.getByRole('tab', { name: translations.common.overview }),
    ).toBeVisible();
    await expect(page.getByText(translations.common.about)).toBeVisible();

    // verify users and groups table
    await common.verifyHeading(
      `1 ${translations.common.group}, 1 ${translations.common.user}`,
    );

    await verifyColumnHeading(
      [
        translations.common.name,
        translations.common.type,
        translations.common.members,
      ],
      page,
    );

    const name = new RegExp(/^(\w+)$/);
    // Member type comes from catalog kind labels (not i18n'd in the table).
    const type = new RegExp(/^(User|Group)$/);
    const members = /^(-|\d+)$/;
    const userGroupCellIdentifier = [name, type, members];
    await verifyCellsInTable(userGroupCellIdentifier, page);

    // verify permission policy table (count depends on REST seed + conditions)
    await expect(
      page.getByRole('heading').filter({
        hasText: translations.permissionPolicies.permissions,
      }),
    ).toBeVisible();
    await verifyColumnHeading(
      [
        translations.permissionPolicies.plugin,
        translations.permissionPolicies.permission,
        translations.permissionPolicies.policies,
      ],
      page,
    );
    const policies =
      /^(?:(Read|Create|Update|Delete)(?:, (?:Read|Create|Update|Delete))*|Use)$/;
    await verifyCellsInTable([policies], page);

    await page
      .getByTestId('sidebar-root')
      .getByRole('link', { name: translations.page.title })
      .click();
  });

  test('Edit an existing role', async () => {
    const roleName = e2eRoles.rbacAdmin;
    await (await searchForRole(page, roleName)).click();
    await common.verifyHeading(roleName);
    await page.getByRole('tab', { name: translations.common.overview }).click();

    await page.locator(RoleOverviewPO.updateMembers).click();
    await common.verifyHeading(translations.roleForm.titles.editRole);
    await runAccessibilityTests(page);
    await page
      .getByTestId('users-and-groups-text-field')
      .locator('input')
      .fill('Guest User');
    await page
      .getByTestId('users-and-groups-text-field')
      .getByLabel(translations.common.clearSearch)
      .click();
    await expect(
      page.getByTestId('users-and-groups-text-field').locator('input'),
    ).toBeEmpty();
    await common.verifyHeading(
      `1 ${translations.common.group}, 1 ${translations.common.user}`,
    );
    const memberOptions = page.getByRole('listbox');
    await memberOptions.getByText('Guest User').click();
    await memberOptions.getByText('Team D').click();
    await common.verifyHeading(
      `2 ${translations.common.groups}, 2 ${translations.common.users}`,
    );
    await common.clickButton(translations.roleForm.steps.next);
    await common.clickButton(translations.roleForm.steps.next);
    await page
      .getByText(translations.permissionPolicies.helperText)
      .waitFor({ state: 'hidden' });
    await common.clickButton(translations.roleForm.steps.save);
    await verifyText(
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName,
        action: 'updated',
      }),
      page,
    );

    // alert doesn't show up after Cancel button is clicked
    await page.locator(RoleOverviewPO.updateMembers).click();
    await common.verifyHeading(translations.roleForm.titles.editRole);
    await common.clickButton(translations.roleForm.steps.cancel);
    await expect(
      page.getByText(translations.dialog.exitRoleEditing),
    ).toBeVisible();
    await common.clickButton(translations.dialog.discard);
    await expect(page.getByRole('alert')).toHaveCount(0);

    // edit/update policies — catalog only (no scaffolder backend in rbac-backend dev)
    await page.locator(RoleOverviewPO.updatePolicies).click();
    await common.verifyHeading(translations.roleForm.titles.editRole);

    // remove existing catalog.entity.read conditional policy
    await page.getByTestId('expand-row-catalog').click();
    await page
      .getByRole('row', { name: 'catalog.entity.read' })
      .getByLabel('remove')
      .click();
    await page.getByTestId('remove-conditions').click();
    await page.getByTestId('save-conditions').click();

    await common.clickButton(translations.roleForm.steps.next);
    await expect(
      page.getByRole('cell', {
        name: new RegExp(
          replaceTemplate(
            translations.roleForm.review.permissionPoliciesWithCount,
            { count: '\\d+' },
          ).replace(/[()]/g, '\\$&'),
        ),
      }),
    ).toBeVisible();
    await page
      .getByText(translations.permissionPolicies.helperText)
      .waitFor({ state: 'hidden' });
    await common.clickButton(translations.roleForm.steps.save);
    await verifyText(
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName,
        action: 'updated',
      }),
      page,
    );

    await page
      .getByTestId('sidebar-root')
      .getByRole('link', { name: translations.page.title })
      .click();
  });

  test('Create role from rolelist page with simple/conditional permission policies', async () => {
    await searchForRole(page, e2eRoles.guests);

    // create-role
    await page.getByTestId('create-role').click();
    await common.verifyHeading(translations.roleForm.titles.createRole);
    await runAccessibilityTests(page);
    await page.fill('input[name="name"]', e2eRoles.sampleRoleName);
    await page.fill('textarea[name="description"]', 'Test Description data');
    await common.clickButton(translations.roleForm.steps.next);

    await page
      .getByTestId('users-and-groups-text-field')
      .locator('input')
      .fill('Guest Use');
    await page
      .getByTestId('users-and-groups-text-field')
      .getByLabel(translations.common.clearSearch)
      .click();
    await expect(
      page.getByTestId('users-and-groups-text-field').locator('input'),
    ).toBeEmpty();
    await common.verifyHeading(translations.common.noUsersAndGroupsSelected);
    const memberOptions = page.getByRole('listbox');
    await memberOptions.getByText('Guest User').click();
    await memberOptions.getByText('Team D').click();
    await common.verifyHeading(
      `1 ${translations.common.group}, 1 ${translations.common.user}`,
    );
    await memberOptions.getByText('infrastructure').click();
    await memberOptions.getByText('Amelia Park').click();
    await common.verifyHeading(
      `2 ${translations.common.groups}, 2 ${translations.common.users}`,
    );
    const user = escapeRegExp(translations.common.user);
    const users = escapeRegExp(translations.common.users);
    const group = escapeRegExp(translations.common.group);
    const groups = escapeRegExp(translations.common.groups);
    const groupsAndUsers = new RegExp(
      `^(1 ${group}|[2-9]\\d* ${groups})?(, )?(1 ${user}|[2-9]\\d* ${users})?$`,
    );
    await common.verifyHeading(groupsAndUsers);
    await common.clickButton(translations.roleForm.steps.next);

    // Catalog conditional policies only (scaffolder backend not in rbac-backend dev)
    await page
      .getByLabel(translations.permissionPolicies.selectPlugins)
      .last()
      .click();
    await page.getByTestId('Catalog').click();
    await page.getByTestId('expand-row-catalog').click();
    await page
      .getByRole('cell', { name: 'catalog.entity.read' })
      .getByRole('checkbox')
      .click();
    await page
      .getByRole('row', { name: 'catalog.entity.read' })
      .getByLabel('remove')
      .click();
    await page
      .getByRole('button', { name: translations.conditionalAccess.allOf })
      .click();
    await page.getByPlaceholder(translations.common.selectRule).first().click();
    await page.getByText('HAS_LABEL').click();
    await page.getByLabel('label').fill('temp');
    await page
      .getByRole('button', { name: translations.common.addRule })
      .click();
    await page.getByPlaceholder(translations.common.selectRule).last().click();
    await page.getByText('HAS_SPEC').click();
    await page.getByLabel('key').fill('test');
    await page.getByTestId('save-conditions').click();
    await expect(
      page.locator('span[class*="MuiBadge-badge"]').filter({ hasText: '2' }),
    ).toBeVisible();
    await finishAndVerifyUpdate(
      translations.roleForm.steps.create,
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName: e2eRoles.sampleRole,
        action: 'created',
      }),
    );
    await page
      .getByTestId('sidebar-root')
      .getByRole('link', { name: translations.page.title })
      .click();
  });

  test('Edit role to convert simple policy into conditional policy', async () => {
    await navigateToRole(e2eRoles.guestsName);

    // update simple policy to add conditions
    await page.getByTestId('expand-row-catalog').click();
    await page
      .getByRole('row', { name: 'catalog.entity.read' })
      .getByLabel('remove')
      .click();
    await page.getByPlaceholder(translations.common.selectRule).first().click();
    await page.getByText('HAS_METADATA').click();
    await page.getByLabel('key').fill('status');
    await page.getByTestId('save-conditions').click();

    await finishAndVerifyUpdate(
      translations.roleForm.steps.save,
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName: e2eRoles.guests,
        action: 'updated',
      }),
    );
  });

  test('Edit role to convert conditional policy into nested conditional policy', async () => {
    await navigateToRole(e2eRoles.guestsName);

    await page.getByTestId('expand-row-catalog').click();
    await page
      .getByRole('row', { name: 'catalog.entity.read' })
      .getByLabel('remove')
      .click();
    await page
      .getByText(translations.conditionalAccess.allOf, { exact: true })
      .click();
    await page.getByPlaceholder(translations.common.selectRule).first().click();
    await page.getByText('HAS_LABEL').click();
    await page.getByLabel('label').fill('dev');
    await page
      .getByText(translations.conditionalAccess.addNestedCondition)
      .click();
    await page.getByPlaceholder(translations.common.selectRule).last().click();
    await page.getByText('HAS_METADATA').click();
    await page.getByLabel('key').fill('status');
    await page.getByTestId('save-conditions').click();

    await finishAndVerifyUpdate(
      translations.roleForm.steps.save,
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName: e2eRoles.guests,
        action: 'updated',
      }),
    );
  });

  test('Edit existing nested conditional policy', async () => {
    await navigateToRole(e2eRoles.rbacAdminName);

    await page.getByTestId('expand-row-catalog').click();
    await page
      .getByRole('row', { name: 'catalog.entity.delete' })
      .getByLabel('remove')
      .click();
    await page
      .getByText(translations.conditionalAccess.addNestedCondition)
      .click();
    await page
      .getByText(translations.conditionalAccess.not, { exact: true })
      .last()
      .click();
    await page.getByPlaceholder(translations.common.selectRule).last().click();
    await page.getByText('HAS_LABEL').last().click();
    await page
      .locator('form')
      .filter({
        hasText:
          "label *label *Name of the label to match onmust have required property 'label'",
      })
      .locator('#root_label')
      .fill('test');
    await page.getByTestId('save-conditions').click();

    await finishAndVerifyUpdate(
      translations.roleForm.steps.save,
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName: e2eRoles.rbacAdmin,
        action: 'updated',
      }),
    );
  });

  test('Remove existing nested conditional policy', async () => {
    // Continues from previous test which added a nested condition on delete
    await navigateToRole(e2eRoles.rbacAdminName);

    await page.getByTestId('expand-row-catalog').click();
    await page
      .getByRole('row', { name: /catalog\.entity\.delete/ })
      .getByLabel('remove')
      .click();
    await page.getByTestId('remove-nested-condition').last().click();
    await page.getByTestId('save-conditions').click();

    await finishAndVerifyUpdate(
      translations.roleForm.steps.save,
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName: e2eRoles.rbacAdmin,
        action: 'updated',
      }),
    );
  });
});
