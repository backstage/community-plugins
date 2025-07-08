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

import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectItem } from '@backstage/core-components';

import { IncidentEnumFilter } from './IncidentEnumFilter';

const mockSet = jest.fn();
const mockFilter = {
  current: [] as SelectItem[],
  set: mockSet,
};

jest.mock('../../hooks/useQueryArrayFilter', () => ({
  useQueryArrayFilter: () => mockFilter,
}));

jest.mock('../../utils/incidentUtils', () => {
  return {
    PRIORITY_MAP: {
      1: { label: 'Critical' },
      2: { label: 'High' },
    },
    INCIDENT_STATE_MAP: {
      1: { label: 'New' },
      2: { label: 'In Progress' },
    },
    renderStatusLabel: (data: { label: string }) =>
      createElement('span', {}, data.label),
  };
});

describe('IncidentEnumFilter', () => {
  beforeEach(() => {
    mockSet.mockClear();
  });

  it('renders label and input', () => {
    render(
      <IncidentEnumFilter
        label="Priority"
        filterKey="priority"
        dataMap={{
          1: { label: 'Critical' },
          2: { label: 'High' },
        }}
        value={[]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByTestId('select-priority')).toBeInTheDocument();
  });

  it('displays options and checkbox when dropdown opens', async () => {
    render(
      <IncidentEnumFilter
        label="State"
        filterKey="incident_state"
        dataMap={{
          1: { label: 'New' },
          2: { label: 'In Progress' },
        }}
        value={[]}
        onChange={() => {}}
      />,
    );

    const combo = screen.getByRole('combobox');
    await userEvent.click(combo);

    expect(await screen.findByText('New')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    const newItem = screen.getByText('New').closest('li')!;
    const checkbox = within(newItem).getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls filter.set on selection', async () => {
    const mockOnChange = jest.fn();
    render(
      <IncidentEnumFilter
        label="Priority"
        filterKey="priority"
        dataMap={{
          1: { label: 'Critical' },
          2: { label: 'High' },
        }}
        value={[]}
        onChange={mockOnChange}
      />,
    );

    const combo = screen.getByRole('combobox');
    await userEvent.click(combo);

    const item = await screen.findByText('Critical');
    await userEvent.click(item);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.anything(),
      [{ label: 'Critical', value: '1' }],
      'selectOption',
      { option: { label: 'Critical', value: '1' } },
    );
  });

  it('marks checkbox as checked if item is in current filter', async () => {
    mockFilter.current = [{ value: '2', label: 'High' }];

    render(
      <IncidentEnumFilter
        label="Priority"
        filterKey="priority"
        dataMap={{
          1: { label: 'Critical' },
          2: { label: 'High' },
        }}
        value={[{ label: 'High', value: '2' }]}
        onChange={() => {}}
      />,
    );

    const combo = screen.getByRole('combobox');
    await userEvent.click(combo);

    const listbox = screen.getByRole('listbox');
    const highItem = within(listbox).getByText('High').closest('li')!;

    const checkbox = within(highItem).getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});
