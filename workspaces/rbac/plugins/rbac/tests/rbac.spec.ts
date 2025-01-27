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

import {
  Common,
  verifyCellsInTable,
  verifyColumnHeading,
  verifyText,
} from './rbacHelper';

test.describe('RBAC plugin', () => {
  let page: Page;
  let common: Common;
  const RoleOverviewPO = {
    updatePolicies: 'span[data-testid="update-policies"]',
    updateMembers: 'span[data-testid="update-members"]',
  };

  const navigateToRole = async (roleName: string) => {
    await expect(
      page.getByRole('heading', { name: 'All roles (2)' }),
    ).toBeVisible({ timeout: 20000 });
    await page
      .locator(`a`)
      .filter({ hasText: `role:default/${roleName}` })
      .click();
    await expect(
      page.getByRole('heading', { name: `role:default/${roleName}` }),
    ).toBeVisible({ timeout: 20000 });
    await page.getByRole('tab', { name: 'Overview' }).click();
    await page.locator(RoleOverviewPO.updatePolicies).click();
    await expect(page.getByRole('heading', { name: 'Edit Role' })).toBeVisible({
      timeout: 20000,
    });
  };

  const finishAndVerifyUpdate = async (button: string, message: string) => {
    await common.clickButton('Next');
    await common.clickButton(button);
    await verifyText(message, page);
    if (button === 'Save') {
      await page.locator(`a`).filter({ hasText: 'RBAC' }).click();
    }
  };

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);
    await common.loginAsGuest();
    const navSelector = 'nav [aria-label="Administration"]';
    await page.locator(navSelector).click();
    await expect(page.getByRole('heading', { name: 'RBAC' })).toBeVisible({
      timeout: 20000,
    });
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('Should show 2 roles in the list, column headings and cells', async () => {
    await expect(
      page.getByRole('heading', { name: 'All roles (2)' }),
    ).toBeVisible({ timeout: 20000 });

    const columns = [
      'Name',
      'Users and groups',
      'Accessible plugins',
      'Actions',
    ];
    await verifyColumnHeading(columns, page);

    const roleName = new RegExp(/^(role|user|group):[a-zA-Z]+\/[\w@*.~-]+$/);
    const usersAndGroups = new RegExp(
      /^(1\s(user|group)|[2-9]\s(users|groups))(, (1\s(user|group)|[2-9]\s(users|groups)))?$/,
    );
    const accessiblePlugins = /\d/;
    const cellIdentifier = [roleName, usersAndGroups, accessiblePlugins];

    await verifyCellsInTable(cellIdentifier, page);
  });

  test('View details of role', async () => {
    const roleName = 'role:default/rbac_admin';
    await page.locator(`a`).filter({ hasText: roleName }).click();
    await expect(page.getByRole('heading', { name: roleName })).toBeVisible({
      timeout: 20000,
    });

    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('About')).toBeVisible();

    // verify users and groups table
    await expect(
      page.getByRole('heading', { name: '1 group, 1 user' }),
    ).toBeVisible({ timeout: 20000 });

    await verifyColumnHeading(['Name', 'Type', 'Members'], page);

    const name = new RegExp(/^(\w+)$/);
    const type = new RegExp(/^(User|Group)$/);
    const members = /^(-|\d+)$/;
    const userGroupCellIdentifier = [name, type, members];
    await verifyCellsInTable(userGroupCellIdentifier, page);

    // verify permission policy table
    await expect(
      page.getByRole('heading', { name: 'Permission policies (10)' }),
    ).toBeVisible({ timeout: 20000 });
    await verifyColumnHeading(['Plugin', 'Permission', 'Policies'], page);
    const policies =
      /^(?:(Read|Create|Update|Delete)(?:, (?:Read|Create|Update|Delete))*|Use)$/;
    await verifyCellsInTable([policies], page);

    await page.locator(`a`).filter({ hasText: 'RBAC' }).click();
  });

  test('Edit an existing role', async () => {
    const roleName = 'role:default/rbac_admin';
    await page.locator(`a`).filter({ hasText: roleName }).click();
    await expect(page.getByRole('heading', { name: roleName })).toBeVisible({
      timeout: 20000,
    });
    await page.getByRole('tab', { name: 'Overview' }).click();

    await page.locator(RoleOverviewPO.updateMembers).click();
    await expect(page.getByRole('heading', { name: 'Edit Role' })).toBeVisible({
      timeout: 20000,
    });
    await page
      .getByTestId('users-and-groups-text-field')
      .locator('input')
      .fill('Guest User');
    await page.getByText('Guest User').click();
    await expect(
      page.getByRole('heading', {
        name: '1 group, 2 users',
      }),
    ).toBeVisible({
      timeout: 20000,
    });
    await common.clickButton('Next');
    await common.clickButton('Next');
    await common.clickButton('Save');
    await verifyText('Role role:default/rbac_admin updated successfully', page);

    // alert doesn't show up after Cancel button is clicked
    await page.locator(RoleOverviewPO.updateMembers).click();
    await expect(page.getByRole('heading', { name: 'Edit Role' })).toBeVisible({
      timeout: 20000,
    });
    await common.clickButton('Cancel');
    await expect(page.getByRole('alert')).toHaveCount(0);

    // edit/update policies
    await page.locator(RoleOverviewPO.updatePolicies).click();
    await expect(page.getByRole('heading', { name: 'Edit Role' })).toBeVisible({
      timeout: 20000,
    });

    await page.getByTestId('AddIcon').click();
    await page.getByPlaceholder('Select a plugin').last().click();
    await page.getByText('scaffolder').click();
    await page.getByPlaceholder('Select a resource type').last().click();
    await page.getByText('scaffolder-action').click();

    // update existing conditional policy
    await page
      .getByText('Configure access (1 rule)', { exact: true })
      .first()
      .click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_METADATA').click();
    await page.getByLabel('key').fill('status');
    await page.getByTestId('save-conditions').click();

    // remove existing conditional policy
    await page.getByTestId('permissionPoliciesRows[1]-remove').first().click();
    expect(
      page.getByText('Configure access (2 rules)', { exact: true }),
    ).toBeHidden();

    await common.clickButton('Next');
    await common.clickButton('Save');
    await verifyText('Role role:default/rbac_admin updated successfully', page);

    await page.locator(`a`).filter({ hasText: 'RBAC' }).click();
  });

  test('Create role from rolelist page with simple/conditional permission policies', async () => {
    await expect(
      page.getByRole('heading', { name: 'All roles (2)' }),
    ).toBeVisible({ timeout: 20000 });

    // create-role
    await page.getByTestId('create-role').click();
    await expect(
      page.getByRole('heading', { name: 'Create role' }),
    ).toBeVisible({ timeout: 20000 });

    await page.fill('input[name="name"]', 'sample-role-1');
    await page.fill('textarea[name="description"]', 'Test Description data');
    await common.clickButton('Next');

    await page
      .getByTestId('users-and-groups-text-field')
      .locator('input')
      .fill('Guest Use');
    await page.getByText('Guest User').click();
    await expect(
      page.getByRole('heading', {
        name: '1 user',
      }),
    ).toBeVisible({
      timeout: 20000,
    });
    await common.clickButton('Next');

    await page.getByPlaceholder('Select a plugin').first().click();
    await page.getByRole('option', { name: 'permission' }).click();
    await page.getByPlaceholder('Select a resource type').first().click();
    await page.getByText('policy-entity').click();

    await page.getByRole('button', { name: 'Add' }).click();

    await page.getByPlaceholder('Select a plugin').last().click();
    await page.getByText('scaffolder').click();
    await page.getByPlaceholder('Select a resource type').last().click();
    await page.getByText('scaffolder-action').click();
    await page.getByText('Configure access').first().click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_ACTION_ID').click();
    await page.getByLabel('actionId').fill('temp');
    await page.getByTestId('save-conditions').click();
    await expect(page.getByText('Configure access (1 rule)')).toBeVisible({
      timeout: 20000,
    });

    await page.getByRole('button', { name: 'Add' }).click();

    await page.getByPlaceholder('Select a plugin').last().click();
    await page.getByText('catalog').click();
    await page.getByPlaceholder('Select a resource type').last().click();
    await page.getByText('catalog-entity').click();
    await page.getByText('Configure access').last().click();
    await page.getByRole('button', { name: 'AllOf' }).click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_LABEL').click();
    await page.getByLabel('label').fill('temp');
    await page.getByRole('button', { name: 'Add rule' }).click();
    await page.getByPlaceholder('Select a rule').last().click();
    await page.getByText('HAS_SPEC').click();
    await page.getByLabel('key').fill('test');
    await page.getByTestId('save-conditions').click();
    await expect(page.getByText('Configure access (2 rules)')).toBeVisible({
      timeout: 20000,
    });
    await finishAndVerifyUpdate(
      'Create',
      'Role role:default/sample-role-1 created successfully',
    );
  });

  test('Edit role to convert simple policy into conditional policy', async () => {
    navigateToRole('guests');

    // update simple policy to add conditions
    await page.getByText('Configure access', { exact: true }).click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_METADATA').click();
    await page.getByLabel('key').fill('status');
    await page.getByTestId('save-conditions').click();

    expect(
      page.getByText('Configure access (1 rule)', { exact: true }),
    ).toBeVisible();

    finishAndVerifyUpdate(
      'Save',
      'Role role:default/guests updated successfully',
    );
  });

  test('Edit role to convert conditional policy into nested conditional policy', async () => {
    await navigateToRole('guests');

    await page.getByText('Configure access', { exact: true }).click();
    await page.getByText('AllOf', { exact: true }).click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_LABEL').click();
    await page.getByLabel('label').fill('dev');
    await page.getByText('Add nested condition').click();
    await page.getByPlaceholder('Select a rule').last().click();
    await page.getByText('HAS_METADATA').click();
    await page.getByLabel('key').fill('status');
    await page.getByTestId('save-conditions').click();

    await expect(
      page.getByText('Configure access (2 rules)', { exact: true }),
    ).toBeVisible();

    await finishAndVerifyUpdate(
      'Save',
      'Role role:default/guests updated successfully',
    );
  });

  test('Edit existing nested conditional policy', async () => {
    await navigateToRole('rbac_admin');

    await page.getByText('Configure access (9 rules)', { exact: true }).click();
    await expect(page.getByText('AllOf')).toHaveCount(2, { timeout: 20000 });
    await page.getByText('Add nested condition').click();
    await page.getByText('Not', { exact: true }).last().click();
    await page.getByPlaceholder('Select a rule').last().click();
    await page.getByText('HAS_LABEL').last().click();
    await page.getByLabel('label').last().fill('test');
    await page.getByTestId('save-conditions').click();

    await expect(
      page.getByText('Configure access (10 rules)', { exact: true }),
    ).toBeVisible();

    await finishAndVerifyUpdate(
      'Save',
      'Role role:default/rbac_admin updated successfully',
    );
  });

  test('Remove existing nested conditional policy', async () => {
    await navigateToRole('rbac_admin');

    await expect(
      page.getByText('Configure access (9 rules)', { exact: true }),
    ).toHaveCount(1);
    await page.getByText('Configure access (9 rules)', { exact: true }).click();
    await expect(page.getByText('AllOf')).toHaveCount(2, { timeout: 20000 });
    await page.getByTestId('remove-nested-condition').last().click();
    await page.getByTestId('save-conditions').click();

    await expect(
      page.getByText('Configure access (2 rules)', { exact: true }),
    ).toHaveCount(2);

    await finishAndVerifyUpdate(
      'Save',
      'Role role:default/rbac_admin updated successfully',
    );
  });
});
