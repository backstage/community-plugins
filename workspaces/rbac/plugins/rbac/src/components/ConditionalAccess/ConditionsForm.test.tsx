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
import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import { mockTransformedConditionRules } from '../../__fixtures__/mockTransformedConditionRules';
import { ConditionsForm } from './ConditionsForm';
import * as ConditionsFormRowFields from './ConditionsFormRowFields';

jest.mock('../ConditionalAccess/ConditionsFormRowFields');

describe('ConditionsForm', () => {
  const selPluginResourceType = 'catalog-entity';
  const onSaveMock = jest.fn();
  const onCloseMock = jest.fn();

  const spy = jest.spyOn(ConditionsFormRowFields, 'getTextFieldStyles');
  spy.mockReturnValue({} as any);

  const renderComponent = (props = {}) =>
    render(
      <ConditionsForm
        selPluginResourceType={selPluginResourceType}
        conditionRulesData={
          mockTransformedConditionRules.catalog['catalog-entity']
        }
        onClose={onCloseMock}
        onSave={onSaveMock}
        {...props}
      />,
    );

  beforeEach(() => {
    onSaveMock.mockClear();
    onCloseMock.mockClear();
  });

  it('renders without crashing', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('conditions-row')).toBeInTheDocument();
    expect(getByTestId('save-conditions')).toBeInTheDocument();
    expect(getByTestId('cancel-conditions')).toBeInTheDocument();
    expect(getByTestId('remove-conditions')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const { getByTestId } = renderComponent();
    fireEvent.click(getByTestId('cancel-conditions'));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('resets conditions data when Remove all button is clicked', () => {
    const { getByTestId } = renderComponent({
      conditionsFormVal: {
        condition: {
          rule: 'HAS_LABEL',
          resourceType: selPluginResourceType,
          params: {},
        },
      },
    });

    fireEvent.click(getByTestId('remove-conditions'));
    fireEvent.click(getByTestId('save-conditions'));

    expect(onSaveMock).toHaveBeenCalledWith(undefined);
  });

  it('disables Save button if conditions are unchanged or no rule selected', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('save-conditions')).toBeDisabled();
  });

  it('shows Multiple levels of nested conditions warning', () => {
    const { getByTestId } = renderComponent({
      conditionsFormVal: {
        anyOf: [
          {
            rule: 'HAS_ANOTTATION',
            resourceType: selPluginResourceType,
            params: {},
          },
          {
            allOf: [
              {
                rule: 'HAS_ANOTTATION',
                resourceType: selPluginResourceType,
                params: {},
              },
              {
                not: {
                  rule: 'HAS_LABEL',
                  resourceType: selPluginResourceType,
                  params: {
                    label: 'temp',
                  },
                },
              },
            ],
          },
        ],
      },
    });

    expect(
      getByTestId('multi-level-nested-conditions-warning'),
    ).toBeInTheDocument();
  });
});
