/*
 * Copyright 2025 The Backstage Authors
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

import type { Order } from '@backstage-community/plugin-servicenow-common';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidentsTableHeader } from './IncidentsTableHeader';
import { IncidentsListColumns } from './IncidentsListColumns';
import { IncidentTableFieldEnum, IncidentTableField } from '../../types';

describe('IncidentsTableHeader', () => {
  const mockOnRequestSort = jest.fn();

  const renderComponent = (
    order: Order,
    orderBy: IncidentTableField | undefined,
  ) => {
    return render(
      <table>
        <thead>
          <IncidentsTableHeader
            order={order}
            orderBy={orderBy}
            onRequestSort={mockOnRequestSort}
          />
        </thead>
      </table>,
    );
  };

  beforeEach(() => {
    mockOnRequestSort.mockClear();
  });

  it('renders all column headers with titles', () => {
    renderComponent('asc', undefined);
    IncidentsListColumns.filter(c => c.title).forEach(column => {
      expect(screen.getByText(column.title as string)).toBeInTheDocument();
    });
  });

  it('activates sort only for the selected column', () => {
    renderComponent('desc', IncidentTableFieldEnum.Number);
    const activeSortLabel = screen.getByText('Incident Number').closest('th');
    expect(activeSortLabel).toHaveAttribute('aria-sort', 'descending');
  });

  it('calls onRequestSort when a sortable column is clicked', () => {
    renderComponent('asc', IncidentTableFieldEnum.Number);
    const header = screen.getByText('Incident Number');
    fireEvent.click(header);
    expect(mockOnRequestSort).toHaveBeenCalledWith(
      expect.any(Object),
      'number',
    );
  });

  it('does not call onRequestSort for non-sortable columns', () => {
    renderComponent('asc', IncidentTableFieldEnum.Number);
    const header = screen.getByText('Actions');
    fireEvent.click(header);
    expect(mockOnRequestSort).not.toHaveBeenCalledWith(
      expect.anything(),
      'actions',
    );
  });
});
