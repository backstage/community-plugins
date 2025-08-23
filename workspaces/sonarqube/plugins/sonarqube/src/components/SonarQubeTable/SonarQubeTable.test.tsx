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
import { screen } from '@testing-library/react';
import { SonarQubeTable } from './SonarQubeTable';
import { renderInTestApp } from '@backstage/frontend-test-utils';

jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  Table: jest.fn(({ data, emptyContent }) => (
    <div>{data.length === 0 ? emptyContent : 'Mocked Table Component'}</div>
  )),
  ErrorPanel: jest.fn(() => <div>Mocked Error Panel</div>),
}));

describe('SonarQubeTable', () => {
  const mockTableContent = [
    { id: 1, name: 'Component 1', metric: 'A' },
    { id: 2, name: 'Component 2', metric: 'B' },
  ];

  const mockColumns = [
    { title: 'ID', field: 'id' },
    { title: 'Name', field: 'name' },
    { title: 'Metric', field: 'metric' },
  ];

  jest.mock('./Columns', () => ({
    getColumns: jest.fn(() => mockColumns),
  }));

  it('should render the table with valid tableContent', async () => {
    await renderInTestApp(
      <SonarQubeTable
        tableContent={mockTableContent}
        title="Test Table"
        options={{ search: true }}
      />,
    );

    expect(screen.getByText('Mocked Table Component')).toBeInTheDocument();
  });

  it('should render emptyContent when tableContent is empty', async () => {
    await renderInTestApp(
      <SonarQubeTable
        tableContent={[]}
        title="Empty Table"
        emptyContent={<div>No data available</div>}
      />,
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render ErrorPanel when tableContent is undefined', async () => {
    await renderInTestApp(
      <SonarQubeTable tableContent={undefined} title="Error Table" />,
    );

    expect(screen.getByText('Mocked Error Panel')).toBeInTheDocument();
  });
});
