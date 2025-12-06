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

test.describe('RBAC plugin', () => {
  let page: Page;
  let common: Common;
  const RoleOverviewPO = {
    updatePolicies: 'button[data-testid="update-policies"]',
    updateMembers: 'button[data-testid="update-members"]',
  };

  const navigateToRole = async (roleName: string) => {
    await common.verifyHeading(/^All roles \(\d+\)$/);
    await page
      .locator(`a`)
      .filter({ hasText: `role:default/${roleName}` })
      .click();
    await common.verifyHeading(`role:default/${roleName}`);
    await page.getByRole('tab', { name: 'Overview' }).click();
    await page.locator(RoleOverviewPO.updatePolicies).click();
    await common.verifyHeading('Edit Role');
  };

  const finishAndVerifyUpdate = async (button: string, message: string) => {
    await common.clickButton('Next');
    await common.clickButton(button);
    // await verifyText(message, page);
    if (button === 'Save') {
      await page.locator(`a`).filter({ hasText: 'RBAC' }).last().click();
    }
  };

  const navigateToRBAC = async () => {
    const navSelector = 'nav [aria-label="Administration"]';
    const navElement = page.locator(navSelector);
    const isNavSelectorPresent = await navElement
      .isVisible()
      .catch(() => false);

    if (isNavSelectorPresent) {
      await navElement.click();
    } else {
      const rbacNavSelector = page.getByRole('link', { name: 'RBAC' });
      await rbacNavSelector.click();
    }
  };

  const removeRowConditionally = async () => {
    const refreshRowSelector = page.getByRole('row', {
      name: 'catalog.entity.refresh',
    });
    const isRefreshRowPresent = await refreshRowSelector
      .isVisible()
      .catch(() => false);

    if (isRefreshRowPresent) {
      await refreshRowSelector.getByLabel('remove').click();
    } else {
      await page
        .getByRole('row', { name: 'catalog.entity.update' })
        .getByLabel('remove')
        .click();
    }
  };

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);
    await common.loginAsGuest();
    await navigateToRBAC();

    await common.verifyHeading('RBAC');
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('Should show 2 roles in the list, column headings and cells', async () => {
    await common.verifyHeading(/^All roles \(\d+\)$/);
    // await runAccessibilityTests(page);

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
    await common.verifyHeading(roleName);
    // await runAccessibilityTests(page);

    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByText('About')).toBeVisible();

    // verify users and groups table
    await common.verifyHeading(
      new RegExp('(?:d+s+)?(?:user|users)?(s(?:d+s+)?group(?:s)?)?'),
    );
    await verifyColumnHeading(['Name', 'Type', 'Members'], page);

    const name = new RegExp(/^(\w+)$/);
    const type = new RegExp(/^(User|Group)$/);
    const members = /^(-|\d+)$/;
    const userGroupCellIdentifier = [name, type, members];
    await verifyCellsInTable(userGroupCellIdentifier, page);

    // verify permission policy table
    await common.verifyHeading(/^(\d+)\spermissions$/);
    await verifyColumnHeading(['Plugin', 'Permission', 'Policies'], page);
    const policies =
      /^(?:(Read|Create|Update|Delete)(?:, (?:Read|Create|Update|Delete))*|Use)$/;
    await verifyCellsInTable([policies], page);

    // await page.locator(`a`).filter({ hasText: 'RBAC' }).click();
    await page
      .getByLabel('breadcrumb')
      .getByRole('link', { name: 'RBAC' })
      .click();
  });

  test('Edit an existing role', async () => {
    const roleName = 'role:default/rbac_admin';
    await page.locator(`a`).filter({ hasText: roleName }).click();
    await common.verifyHeading(roleName);
    await page.getByRole('tab', { name: 'Overview' }).click();

    await page.locator(RoleOverviewPO.updateMembers).click();
    await common.verifyHeading('Edit Role');
    // await runAccessibilityTests(page);
    await page
      .getByTestId('users-and-groups-text-field')
      .locator('input')
      .fill('Guest User');
    await page
      .getByTestId('users-and-groups-text-field')
      .getByLabel('clear search')
      .click();
    expect(
      await page.getByTestId('users-and-groups-text-field').locator('input'),
    ).toBeEmpty();
    // await common.verifyHeading('1 group, 1 user');
    await expect(
      page.locator('label').filter({ hasText: 'Select users and groups' }),
    ).toBeVisible();
    // await page.getByText('Guest User').click();
    await page
      .getByRole('option', { name: 'guests', exact: false })
      .first()
      .click();
    // await page.keyboard.press(`Escape`);
    // await page.getByText('Team D').click();
    await common.verifyHeading('1 group, 2 users');
    await common.clickButton('Next');
    await common.clickButton('Next');
    await common.clickButton('Save');
    // await verifyText('Role role:default/rbac_admin updated successfully', page);

    // alert doesn't show up after Cancel button is clicked
    // await page.locator(RoleOverviewPO.updateMembers).click();
    await common.verifyHeading('Edit Role');
    await common.clickButton('Cancel');
    await expect(page.getByText('Exit role editing?')).toBeVisible();
    await common.clickButton('Discard');
    await expect(page.getByRole('alert')).toHaveCount(0);

    // edit/update policies
    await page.locator(RoleOverviewPO.updatePolicies).click();
    await common.verifyHeading('Edit Role');

    await page.getByLabel('Select plugins').last().click();
    await page.getByTestId('Scaffolder').click();
    await page.getByTestId('expand-row-scaffolder').click();
    // await page
    //   .getByRole('cell', { name: 'scaffolder.action.use' })
    //   .getByRole('checkbox')
    //   .click();
    await page
      .getByRole('cell', { name: 'scaffolder.action.execute' })
      .getByRole('checkbox')
      .click();
    await page
      .getByRole('row', { name: 'scaffolder.action.execute' })
      .getByLabel('remove')
      .click();
    // await page
    //   .getByRole('cell', { name: 'scaffolder' })
    //   .getByRole('checkbox')
    //   .click();
    // await page
    //   .getByRole('option', { name: 'scaffolder' })
    //   .getByRole('checkbox')
    //   .click();

    // await page
    //   .getByRole('row', { name: 'scaffolder.action.use' })
    //   .getByLabel('remove')
    //   .click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_ACTION_ID').click();
    await page.getByLabel('actionId').fill('temp');
    await page.getByTestId('save-conditions').click();
    await expect(
      page.locator('span[class*="MuiBadge-badge"]').filter({ hasText: '1' }),
    ).toBeVisible();

    await page.getByLabel('Select plugins').first().click();
    await expect(
      page
        .getByRole('option', { name: 'All plugins (3)' })
        .getByRole('checkbox'),
    ).toBeChecked();
    await page
      .getByRole('option', { name: 'Permission' })
      .getByRole('checkbox')
      .click();
    await expect(
      page
        .getByRole('option', { name: 'All plugins (3)' })
        .getByRole('checkbox'),
    ).not.toBeChecked();

    // remove existing conditional policy
    // await page
    //   .getByRole('row', { name: 'scaffolder.template.read info' })
    //   .getByLabel('remove')
    //   .click();
    // await page
    //   .getByRole('cell', { name: 'scaffolder.template.step.read info' })
    //   .getByLabel('remove')
    //   .click();
    // await page.getByTestId('remove-conditions').click();
    // await page.getByTestId('save-conditions').click();

    await common.clickButton('Next');
    await expect(
      page.getByRole('cell', { name: /Permission policies \(\d+\)/ }),
    ).toBeVisible();
    await common.clickButton('Save');
    // await verifyText('Role role:default/rbac_admin updated successfully', page);

    await page.locator(`a`).filter({ hasText: 'RBAC' }).last().click();
  });

  test('Create role from rolelist page with simple/conditional permission policies', async () => {
    await common.verifyHeading(/^All roles \(\d+\)$/);

    // create-role
    await page.getByTestId('create-role').click();
    await common.verifyHeading('Create role');
    // await runAccessibilityTests(page);

    await page.fill('input[name="name"]', 'sample-role-1');
    await page.fill('textarea[name="description"]', 'Test Description data');
    await common.clickButton('Next');

    await page
      .getByTestId('users-and-groups-text-field')
      .locator('input')
      .fill('Guest Use');
    await page
      .getByTestId('users-and-groups-text-field')
      .getByLabel('clear search')
      .click();
    expect(
      await page.getByTestId('users-and-groups-text-field').locator('input'),
    ).toBeEmpty();
    await common.verifyHeading('No users and groups selected');
    // await page.getByText('Guest User').click();
    await page
      .getByRole('option', { name: 'guests', exact: false })
      .first()
      .click();
    // await page.getByText('Team D').click();
    // await common.verifyHeading('1 group, 1 user');
    await common.verifyHeading(
      new RegExp('(?:d+s+)?(?:user|users)?(s(?:d+s+)?group(?:s)?)?'),
    );
    // await page.getByText('infrastructure').click();
    // await page.getByText('Amelia Park').click();
    // await common.verifyHeading('2 groups, 2 users');
    // await common.verifyHeading(
    //   /^(1 group|[2-9]\d* groups)?(, )?(1 user|[2-9]\d* users)?$/,
    // );
    await common.clickButton('Next');

    await page.getByLabel('Select plugins').last().click();
    await page.getByText('scaffolder').click();
    await page.getByTestId('expand-row-scaffolder').click();
    // await page
    //   .getByRole('cell', { name: 'scaffolder.action.use' })
    //   .getByRole('checkbox')
    //   .click();
    // await page
    //   .getByRole('row', { name: 'scaffolder.action.use' })
    //   .getByLabel('remove')
    //   .click();
    await page
      .getByRole('cell', { name: 'scaffolder.action.execute' })
      .getByRole('checkbox')
      .click();
    await page
      .getByRole('row', { name: 'scaffolder.action.execute' })
      .getByLabel('remove')
      .click();

    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_ACTION_ID').click();
    await page.getByLabel('actionId').fill('temp');
    await page.getByTestId('save-conditions').click();
    await expect(
      page.locator('span[class*="MuiBadge-badge"]').filter({ hasText: '1' }),
    ).toBeVisible();

    await page.getByLabel('Select plugins').last().click();
    await page.getByText('catalog').click();
    await page.getByTestId('expand-row-catalog').click();
    await page
      .getByRole('cell', { name: 'scaffolder.template.step.read info' })
      .getByRole('checkbox')
      .click();
    await page
      .getByRole('row', { name: 'scaffolder.template.step.read info' })
      .getByLabel('remove')
      .click();

    // await page
    //   .getByRole('cell', { name: 'catalog.entity.read' })
    //   .getByRole('checkbox')
    //   .click();
    // await page
    //   .getByRole('row', { name: 'catalog.entity.read' })
    //   .getByLabel('remove')
    //   .click();
    await page.getByRole('button', { name: 'AllOf' }).click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_TAG').click();
    await page.getByLabel('tag').fill('temp');
    await page.getByRole('button', { name: 'Add rule' }).click();
    await page.getByPlaceholder('Select a rule').last().click();
    await page.getByText('HAS_TAG').click();
    // await page.getByLabel('tag').fill('test');
    await page
      .locator('form')
      .filter({
        hasText:
          "tag *tag *Name of the tag to match onmust have required property 'tag'",
      })
      .locator('#root_tag')
      .fill('test');
    await page.getByTestId('save-conditions').click();
    await expect(
      page.locator('span[class*="MuiBadge-badge"]').filter({ hasText: '2' }),
    ).toBeVisible();
    await finishAndVerifyUpdate(
      'Create',
      'Role role:default/sample-role-1 created successfully',
    );
    await page.locator(`a`).filter({ hasText: 'RBAC' }).last().click();
  });

  test('Edit role to convert simple policy into conditional policy', async () => {
    navigateToRole('sample-role-1');

    await page.getByRole('combobox', { name: 'Select plugins' }).click();
    const checkbox = page
      .getByRole('option', { name: 'Catalog' })
      .getByRole('checkbox');
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.check();
    }
    await page.getByRole('button', { name: 'Close' }).click();
    // update simple policy to add conditions
    await page.getByTestId('expand-row-catalog').click();
    const checkbox2 = page
      .getByRole('cell', { name: 'catalog.entity.refresh info' })
      .getByRole('checkbox');
    const isChecked2 = await checkbox2.isChecked();
    if (!isChecked2) {
      await checkbox2.click();
    }
    await page
      .getByRole('row', { name: 'catalog.entity.refresh' })
      .getByLabel('remove')
      .click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_ANNOTATION').click();
    // await page.getByLabel('key').fill('status');
    await page.getByRole('textbox', { name: 'annotation' }).fill('dev');
    await page.getByTestId('save-conditions').click();

    await finishAndVerifyUpdate(
      'Save',
      'Role role:default/sample-role-1 updated successfully',
    );
    await page.locator(`a`).filter({ hasText: 'RBAC' }).last().click();
  });

  test('Edit role to convert conditional policy into nested conditional policy', async () => {
    await navigateToRole('sample-role-1');

    await page.getByRole('combobox', { name: 'Select plugins' }).click();
    const checkbox = page
      .getByRole('option', { name: 'Catalog' })
      .getByRole('checkbox');
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.check();
    }
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByTestId('expand-row-catalog').click();
    const checkbox2 = page
      .getByRole('cell', { name: 'catalog.entity.delete info' })
      .getByRole('checkbox');
    const isChecked2 = await checkbox2.isChecked();
    if (!isChecked2) {
      await checkbox2.click();
    }
    await page
      .getByRole('row', { name: 'catalog.entity.delete' })
      .getByLabel('remove')
      .click();
    const buttonActive = page.getByTestId('remove-conditions');
    const isButtonActive = await buttonActive.isEnabled();
    if (isButtonActive) {
      await buttonActive.click();
    }
    await page.getByText('AllOf').last().click();
    await page.getByPlaceholder('Select a rule').first().click();
    await page.getByText('HAS_LABEL').click();
    await page.getByLabel('label').fill('dev');
    await page.getByText('Add nested condition').click();
    await page.getByPlaceholder('Select a rule').last().click();
    await page.getByText('HAS_METADATA').click();
    await page.getByLabel('key').fill('status');
    await page.getByTestId('save-conditions').click();

    await finishAndVerifyUpdate(
      'Save',
      'Role role:default/sample-role-1 updated successfully',
    );
    await page.locator(`a`).filter({ hasText: 'RBAC' }).last().click();
  });

  test('Edit existing nested conditional policy', async () => {
    await navigateToRole('rbac_admin');
    await page.getByRole('combobox', { name: 'Select plugins' }).click();
    const checkbox = page
      .getByRole('option', { name: 'Catalog' })
      .getByRole('checkbox');
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.check();
    }
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByTestId('expand-row-catalog').click();
    const checkbox2 = page
      .getByRole('cell', { name: 'catalog.entity.delete info' })
      .getByRole('checkbox');
    const isChecked2 = await checkbox2.isChecked();
    if (!isChecked2) {
      await checkbox2.click();
    }
    await page
      .getByRole('row', { name: 'catalog.entity.delete' })
      .getByLabel('remove')
      .click();
    // await page.getByText('Add nested condition').click();
    // await page.getByText('Not', { exact: true }).last().click();
    await page.getByRole('button', { name: 'Not' }).last().click();
    await page.getByPlaceholder('Select a rule').last().click();
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
      'Save',
      'Role role:default/rbac_admin updated successfully',
    );
  });

  test('Remove existing nested conditional policy', async () => {
    await navigateToRole('rbac_admin');

    await page.getByRole('combobox', { name: 'Select plugins' }).click();
    const checkbox = page
      .getByRole('option', { name: 'Catalog' })
      .getByRole('checkbox');
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.check();
    }
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByTestId('expand-row-catalog').click();
    const checkbox2 = page
      .getByRole('cell', { name: 'catalog.entity.refresh info' })
      .getByRole('checkbox');
    const isChecked2 = await checkbox2.isChecked();
    if (!isChecked2) {
      await checkbox2.click();
    }
    await removeRowConditionally();

    await page.getByRole('button', { name: 'AllOf' }).click();
    await page.getByRole('button', { name: 'Add nested condition' }).click();
    await page.getByRole('combobox', { name: 'Rule' }).nth(1).click();
    await page.getByRole('option', { name: 'HAS_LABEL' }).click();
    await page.getByRole('textbox', { name: 'label' }).click();
    await page.getByRole('textbox', { name: 'label' }).fill('test');
    await page.getByRole('combobox', { name: 'Rule' }).first().click();
    await page.getByText('HAS_ANNOTATION').click();
    await page.getByRole('textbox', { name: 'annotation' }).click();
    await page.getByRole('textbox', { name: 'annotation' }).fill('task');
    await page.getByTestId('save-conditions').click();
    await removeRowConditionally();
    await page.getByRole('button', { name: 'Remove nested condition' }).click();
    await page.getByTestId('save-conditions').click();

    // await page.getByTestId('remove-nested-condition').last().click();
    // await page.getByTestId('save-conditions').click();

    await finishAndVerifyUpdate(
      'Save',
      'Role role:default/rbac_admin updated successfully',
    );
  });
});
