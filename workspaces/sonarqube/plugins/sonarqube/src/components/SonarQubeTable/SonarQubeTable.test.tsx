import React from 'react';
import { render, screen } from '@testing-library/react';
import { SonarQubeTable } from './SonarQubeTable';

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

  it('should render the table with valid tableContent', () => {
    render(
      <SonarQubeTable
        tableContent={mockTableContent}
        title="Test Table"
        options={{ search: true }}
      />,
    );

    expect(screen.getByText('Mocked Table Component')).toBeInTheDocument();
  });

  it('should render emptyContent when tableContent is empty', () => {
    render(
      <SonarQubeTable
        tableContent={[]}
        title="Empty Table"
        emptyContent={<div>No data available</div>}
      />,
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render ErrorPanel when tableContent is undefined', () => {
    render(<SonarQubeTable tableContent={undefined} title="Error Table" />);

    expect(screen.getByText('Mocked Error Panel')).toBeInTheDocument();
  });
});
