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
import PermissionPoliciesFormRow from './PermissionPoliciesFormRow';

jest.mock('../../hooks/useLanguage', () => ({
  useLanguage: mockUseLanguage,
}));

jest.mock('../ConditionalAccess/ConditionsFormRowFields');

describe('PermissionPoliciesFormRow', () => {
  const mockProps = {
    rowData: {
      name: 'Catalog',
      plugin: 'catalog',
      permissionPolicies: [
        {
          permission: 'catalog.entity.read',
          actions: ['Read'],
          isResourced: true,
          resourceType: 'catalog-entity',
        },
      ],
    },
    permissionPoliciesRows: [],
    conditionRulesData: mockTransformedConditionRules,
    onRemovePermission: jest.fn(),
    onRemovePlugin: jest.fn(),
    onSelectPermission: jest.fn(),
    onSelectPolicy: jest.fn(),
    handleBlur: jest.fn(),
    getPermissionDisabled: jest.fn().mockReturnValue(false),
    onAddConditions: jest.fn(),
    open: false,
    setOpen: jest.fn(),
  };

  const spy = jest.spyOn(ConditionsFormRowFields, 'getTextFieldStyles');
  spy.mockReturnValue({} as any);

  it('renders without crashing', () => {
    render(<PermissionPoliciesFormRow {...mockProps} />);
    expect(
      screen.getByRole('cell', {
        name: /catalog/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', {
        name: /select/i,
      }),
    ).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const { getByLabelText } = render(
      <PermissionPoliciesFormRow {...mockProps} />,
    );
    screen.logTestingPlaygroundURL();
    const removeButton = getByLabelText('remove');
    fireEvent.click(removeButton);
    expect(mockProps.onRemovePlugin).toHaveBeenCalled();
  });

  it('expands nested row when expand button is clicked', async () => {
    const { getByTestId } = render(
      <PermissionPoliciesFormRow {...mockProps} />,
    );

    fireEvent.mouseDown(getByTestId(/expand-row-catalog/));

    expect(getByTestId(/nested-row-catalog/)).toBeInTheDocument();
  });
});
