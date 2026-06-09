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
import { expect, Page, test } from '@playwright/test';
import { runAccessibilityTests } from './utils/accessibility';
import {
  Common,
  verifyCellsInTable,
  verifyColumnHeading,
  verifyText,
} from './utils/rbacHelper';
import {
  RbacMessages,
  getTranslations,
  replaceTemplate,
} from './utils/translations';

test.describe('RBAC plugin', () => {
  let page: Page;
  let common: Common;
  let translations: RbacMessages;
  const RoleOverviewPO = {
    updatePolicies: 'button[data-testid="update-policies"]',
    updateMembers: 'button[data-testid="update-members"]',
  };

  const navigateToRole = async (roleName: string) => {
    await common.verifyHeading(
      replaceTemplate(translations.table.titleWithCount, { count: '2' }),
    );
    await page
      .locator(`a`)
      .filter({ hasText: `role:default/${roleName}` })
      .click();
    await common.verifyHeading(`role:default/${roleName}`);
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

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);
    await common.loginAsGuest();
    const currentLocale = await page.evaluate(
      () => globalThis.navigator.language,
    );
    translations = getTranslations(currentLocale);
    await common.switchToLocale(currentLocale);
    const navSelector = 'nav [aria-label="RBAC"]';
    await page.locator(navSelector).click();
    await common.verifyHeading(translations.page.title);
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('Should show 2 roles in the list, column headings and cells', async () => {
    await common.verifyHeading(
      replaceTemplate(translations.table.titleWithCount, { count: '2' }),
    );
    await runAccessibilityTests(page);
    const columns = [
      translations.table.headers.name,
      translations.table.headers.usersAndGroups,
      translations.table.headers.accessiblePlugins,
      translations.table.headers.actions,
    ];
    await verifyColumnHeading(columns, page);

    const roleName = new RegExp(/^(role|user|group):[a-zA-Z]+\/[\w@*.~-]+$/);
    const user = translations.common.user.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const users = translations.common.users.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const group = translations.common.group.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const groups = translations.common.groups.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
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
    const roleName = 'role:default/rbac_admin';
    await page.locator(`a`).filter({ hasText: roleName }).click();
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
    const type = new RegExp(/^(User|Group)$/);
    const members = /^(-|\d+)$/;
    const userGroupCellIdentifier = [name, type, members];
    await verifyCellsInTable(userGroupCellIdentifier, page);

    // verify permission policy table
    await common.verifyHeading(
      `9 ${translations.permissionPolicies.permissions}`,
    );
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
    const roleName = 'role:default/rbac_admin';
    await page.locator(`a`).filter({ hasText: roleName }).click();
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
    await page.getByText('Guest User').click();
    await page.getByText('Team D').click();
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
        roleName: 'role:default/rbac_admin',
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

    // edit/update policies
    await page.locator(RoleOverviewPO.updatePolicies).click();
    await common.verifyHeading(translations.roleForm.titles.editRole);

    await page
      .getByLabel(translations.permissionPolicies.selectPlugins)
      .last()
      .click();
    await page.getByTestId('expand-row-scaffolder').click();
    await page
      .getByRole('cell', { name: 'scaffolder.action.use' })
      .getByRole('checkbox')
      .click();
    await page
      .getByRole('row', { name: 'scaffolder.action.use' })
      .getByLabel('remove')
      .click();
    await page.getByPlaceholder(translations.common.selectRule).first().click();
    await page.getByText('HAS_ACTION_ID').click();
    await page.getByLabel('actionId').fill('temp');
    await page.getByTestId('save-conditions').click();
    await expect(
      page.locator('span[class*="MuiBadge-badge"]').filter({ hasText: '1' }),
    ).toBeVisible();

    await page
      .getByLabel(translations.permissionPolicies.selectPlugins)
      .first()
      .click();
    await expect(
      page
        .getByRole('option', {
          name: replaceTemplate(translations.permissionPolicies.allPlugins, {
            count: '3',
          }),
        })
        .getByRole('checkbox'),
    ).toBeChecked();
    await page
      .getByRole('option', { name: 'Permission' })
      .getByRole('checkbox')
      .click();
    await expect(
      page
        .getByRole('option', {
          name: replaceTemplate(translations.permissionPolicies.allPlugins, {
            count: '3',
          }),
        })
        .getByRole('checkbox'),
    ).not.toBeChecked();

    // remove existing conditional policy
    await page
      .getByRole('row', { name: 'scaffolder.template.read info' })
      .getByLabel('remove')
      .click();
    await page.getByTestId('remove-conditions').click();
    await page.getByTestId('save-conditions').click();

    await common.clickButton(translations.roleForm.steps.next);
    await expect(
      page.getByRole('cell', {
        name: replaceTemplate(
          translations.roleForm.review.permissionPoliciesWithCount,
          { count: '7' },
        ),
      }),
    ).toBeVisible();
    await page
      .getByText(translations.permissionPolicies.helperText)
      .waitFor({ state: 'hidden' });
    await common.clickButton(translations.roleForm.steps.save);
    await verifyText(
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName: 'role:default/rbac_admin',
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
    await common.verifyHeading(
      replaceTemplate(translations.table.titleWithCount, { count: '2' }),
    );

    // create-role
    await page.getByTestId('create-role').click();
    await common.verifyHeading(translations.roleForm.titles.createRole);
    await runAccessibilityTests(page);
    await page.fill('input[name="name"]', 'sample-role-1');
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
    await page.getByText('Guest User').click();
    await page.getByText('Team D').click();
    await common.verifyHeading(
      `1 ${translations.common.group}, 1 ${translations.common.user}`,
    );
    await page.getByText('infrastructure').click();
    await page.getByText('Amelia Park').click();
    await common.verifyHeading(
      `2 ${translations.common.groups}, 2 ${translations.common.users}`,
    );
    const user = translations.common.user.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const users = translations.common.users.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const group = translations.common.group.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const groups = translations.common.groups.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const groupsAndUsers = new RegExp(
      `^(1 ${group}|[2-9]\\d* ${groups})?(, )?(1 ${user}|[2-9]\\d* ${users})?$`,
    );
    await common.verifyHeading(groupsAndUsers);
    await common.clickButton(translations.roleForm.steps.next);

    await page
      .getByLabel(translations.permissionPolicies.selectPlugins)
      .last()
      .click();
    await page.getByText('scaffolder').click();
    await page.getByTestId('expand-row-scaffolder').click();
    await page
      .getByRole('cell', { name: 'scaffolder.action.use' })
      .getByRole('checkbox')
      .click();
    await page
      .getByRole('row', { name: 'scaffolder.action.use' })
      .getByLabel('remove')
      .click();
    await page.getByPlaceholder(translations.common.selectRule).first().click();
    await page.getByText('HAS_ACTION_ID').click();
    await page.getByLabel('actionId').fill('temp');
    await page.getByTestId('save-conditions').click();
    await expect(
      page.locator('span[class*="MuiBadge-badge"]').filter({ hasText: '1' }),
    ).toBeVisible();

    await page
      .getByLabel(translations.permissionPolicies.selectPlugins)
      .last()
      .click();
    await page.getByText('catalog').click();
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
        roleName: 'role:default/sample-role-1',
        action: 'created',
      }),
    );
  });

  test('Edit role to convert simple policy into conditional policy', async () => {
    await navigateToRole('guests');

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
        roleName: 'role:default/guests',
        action: 'updated',
      }),
    );
  });

  test('Edit role to convert conditional policy into nested conditional policy', async () => {
    await navigateToRole('guests');

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
        roleName: 'role:default/guests',
        action: 'updated',
      }),
    );
  });

  test('Edit existing nested conditional policy', async () => {
    await navigateToRole('rbac_admin');

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
        roleName: 'role:default/rbac_admin',
        action: 'updated',
      }),
    );
  });

  test('Remove existing nested conditional policy', async () => {
    await navigateToRole('rbac_admin');

    await page.getByTestId('expand-row-catalog').click();
    await page
      .getByRole('row', { name: 'catalog.entity.update' })
      .getByLabel('remove')
      .click();
    await page.getByTestId('remove-nested-condition').last().click();
    await page.getByTestId('save-conditions').click();

    await finishAndVerifyUpdate(
      translations.roleForm.steps.save,
      replaceTemplate(translations.common.roleActionSuccessfully, {
        roleName: 'role:default/rbac_admin',
        action: 'updated',
      }),
    );
  });
});
