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

import { render, screen } from '@testing-library/react';
import type { IncidentsData } from '../../types';

import { IncidentsTableBody } from './IncidentsTableBody';

const mockRows: IncidentsData[] = [
  {
    sysId: '46e8219ba9fe1981013806b6e04fed06',
    number: 'INC0000001',
    shortDescription: 'Test incident',
    description: 'This is a test incident',
    priority: 2,
    incidentState: 2,
    sysCreatedOn: '2022-01-01',
    url: 'https://dev-test.servicenow.com/nav_to.do?uri=incident.do?sys_id=46e8219ba9fe1981013806b6e04fed06',
  },
];

describe('IncidentsTableBody', () => {
  it('renders incident rows when data is provided', () => {
    render(
      <table>
        <IncidentsTableBody rows={mockRows} />
      </table>,
    );

    const tableBody = screen.getByTestId('incidents');
    expect(tableBody).toBeInTheDocument();
    expect(screen.queryByTestId('no-incidents-found')).not.toBeInTheDocument();
  });

  it('renders "No records found" when rows is empty', () => {
    render(
      <table>
        <IncidentsTableBody rows={[]} />
      </table>,
    );

    const emptyState = screen.getByTestId('no-incidents-found');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveTextContent('No records found');
    expect(screen.queryByTestId('incidents')).not.toBeInTheDocument();
  });
});
