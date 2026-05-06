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
import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import { mockUseLanguage } from '../../test-utils/mockTranslations';
import { mockTransformedConditionRules } from '../../__fixtures__/mockTransformedConditionRules';
import * as ConditionsFormRowFields from '../ConditionalAccess/ConditionsFormRowFields';
import PermissionPoliciesFormNestedRow from './PermissionPoliciesFormNestedRow';

jest.mock('../../hooks/useLanguage', () => ({
  useLanguage: mockUseLanguage,
}));

jest.mock('../ConditionalAccess/ConditionsFormRowFields');

describe('PermissionPoliciesFormNestedRow', () => {
  const spy = jest.spyOn(ConditionsFormRowFields, 'getTextFieldStyles');
  spy.mockReturnValue({} as any);

  const Table = ({ children }: { children: React.ReactNode }) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  );

  const baseProps = {
    plugin: 'catalog',
    permissionPolicy: {
      permission: 'catalog.entity.read',
      isResourced: true,
      resourceType: 'catalog-entity',
      actions: ['Read'],
    },
    permissionPolicyRowIndex: -1,
    policies: [
      { policy: 'Read', effect: 'deny' },
      { policy: 'Update', effect: 'deny' },
    ],
    conditionRulesLength: 2,
    totalRulesCount: 0,
    conditionRulesData: mockTransformedConditionRules,
    conditionsData: undefined,
    onSelectPermission: jest.fn(),
    onSelectPolicy: jest.fn(),
    onRemovePermission: jest.fn(),
    onAddConditions: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls onSelectPermission when the permission label text is clicked', () => {
    render(
      <Table>
        <PermissionPoliciesFormNestedRow {...baseProps} />
      </Table>,
    );

    fireEvent.click(screen.getByText('catalog.entity.read'));

    expect(baseProps.onSelectPermission).toHaveBeenCalledWith(
      'catalog',
      'catalog.entity.read',
      true,
      ['Read'],
      'catalog-entity',
    );
  });

  it('calls onRemovePermission when the permission label text is clicked and already selected', () => {
    const props = { ...baseProps, permissionPolicyRowIndex: 0 };
    render(
      <Table>
        <PermissionPoliciesFormNestedRow {...props} />
      </Table>,
    );

    fireEvent.click(screen.getByText('catalog.entity.read'));

    expect(baseProps.onRemovePermission).toHaveBeenCalledWith(0);
  });

  it('calls onSelectPolicy when a policy label text is clicked', () => {
    const props = { ...baseProps, permissionPolicyRowIndex: 0 };
    render(
      <Table>
        <PermissionPoliciesFormNestedRow {...props} />
      </Table>,
    );

    fireEvent.click(screen.getByText('Read'));

    expect(baseProps.onSelectPolicy).toHaveBeenCalledWith(true, 0, 0);
  });

  it('auto-selects the permission when a policy checkbox is clicked and permission is not selected', () => {
    render(
      <Table>
        <PermissionPoliciesFormNestedRow {...baseProps} />
      </Table>,
    );

    const readCheckbox = screen.getByRole('checkbox', { name: 'Read' });
    expect(readCheckbox).not.toBeDisabled();

    fireEvent.click(screen.getByText('Read'));

    expect(baseProps.onSelectPolicy).not.toHaveBeenCalled();
    expect(baseProps.onSelectPermission).toHaveBeenCalledWith(
      'catalog',
      'catalog.entity.read',
      true,
      ['Read'],
      'catalog-entity',
    );
  });
});
