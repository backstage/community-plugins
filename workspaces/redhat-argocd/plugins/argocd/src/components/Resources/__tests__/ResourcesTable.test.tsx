import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ResourcesTable } from '../ResourcesTable';
import { Resource } from '../../../types';

jest.mock('../ResourcesSearchBar', () => ({
  ResourcesSearchBar: jest.fn(({ value, onChange, onSearchClear }) => (
    <div>
      <input
        data-testid="search-input"
        value={value}
        onChange={onChange}
        placeholder="Search"
      />
      <button onClick={onSearchClear}>Clear</button>
    </div>
  )),
}));

jest.mock('../ResourcesFilterBy', () => ({
  ResourcesFilterBy: jest.fn(({ setFilterValue }) => (
    <select
      data-testid="filter-by"
      onChange={e => setFilterValue(e.target.value)}
    >
      <option value="All">All</option>
      <option value="Synced">Synced</option>
      <option value="OutOfSync">OutOfSync</option>
    </select>
  )),
}));

describe('ResourcesTable', () => {
  const resources = [
    {
      kind: 'Rollout',
      status: 'Syncing',
      health: { status: 'Degraded' },
      version: 'v1',
      namespace: 'default',
      name: 'my-deployment',
    },
    {
      kind: 'Deployment',
      status: 'Synced',
      health: { status: 'Healthy' },
      version: 'v1',
      namespace: 'default',
      name: 'my-service',
    },
    {
      kind: 'Configmap',
      status: 'Synced',
      health: { status: 'Healthy' },
      version: 'v1',
      namespace: 'default',
      name: 'my-deployment',
    },
    {
      kind: 'Secret',
      status: 'Synced',
      health: { status: 'Healthy' },
      version: 'v1',
      namespace: 'default',
      name: 'my-service',
    },
    {
      kind: 'Stateful set',
      status: 'Synced',
      health: { status: 'Healthy' },
      version: 'v1',
      namespace: 'default',
      name: 'my-deployment',
    },
    {
      kind: 'Configmap',
      status: 'Synced',
      health: { status: 'Degraded' },
      version: 'v1',
      namespace: 'default',
      name: 'my-service',
    },
    {
      kind: 'Deployment',
      status: 'Synced',
      health: { status: 'Healthy' },
      version: 'v1',
      namespace: 'default',
      name: 'my-deployment',
    },
    {
      kind: 'Service',
      status: 'OutOfSync',
      health: { status: 'Degraded' },
      version: 'v1',
      namespace: 'default',
      name: 'my-service',
    },
  ];

  const createdAt = '2024-08-27T12:34:56Z';

  const setup = () =>
    render(<ResourcesTable resources={resources} createdAt={createdAt} />);

  it('should render the search bar, filter dropdown, and pagination', () => {
    setup();

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('filter-by')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByText('5 rows')).toBeInTheDocument();
  });

  it('should render the ResourcesTableHeader and ResourcesTableBody', () => {
    setup();

    expect(screen.getByText('Health status')).toBeInTheDocument();
    expect(screen.getByText('Deployment')).toBeInTheDocument();
  });

  it('should handle search input changes correctly', () => {
    setup();

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'deployment' } });
    expect(searchInput).toHaveValue('deployment');
  });

  it('should handle filter changes correctly', () => {
    setup();

    const filterDropdown = screen.getByTestId('filter-by');
    fireEvent.change(filterDropdown, { target: { value: 'Synced' } });
    expect(filterDropdown).toHaveValue('Synced');
  });

  it('should display "No Resources found" when there are no visible rows', () => {
    const emptyResources: Resource[] = [];
    render(<ResourcesTable resources={emptyResources} createdAt={createdAt} />);

    expect(screen.getByTestId('no-resources')).toHaveTextContent(
      'No Resources found',
    );
  });

  it('should handle pagination correctly', async () => {
    render(<ResourcesTable resources={resources} createdAt={createdAt} />);

    fireEvent.mouseDown(screen.getByText('5 rows'));
    fireEvent.click(screen.getByText('10 rows'));

    await waitFor(() => {
      expect(screen.getByText('10 rows')).toBeInTheDocument();
    });
  });

  it('should handle pagination "Next page" button correctly', async () => {
    // Add more resources to ensure multiple pages
    const paginatedResources: Resource[] = Array(12).fill({
      kind: 'Deployment',
      status: 'Synced',
      health: { status: 'Healthy' },
      version: 'v1',
      namespace: 'default',
      name: 'my-deployment',
    });

    render(
      <ResourcesTable resources={paginatedResources} createdAt={createdAt} />,
    );

    const initialResources = screen.getAllByText('Deployment');
    expect(initialResources.length).toBe(5);

    const nextPageButton = screen.getByLabelText('Next page');
    expect(nextPageButton).toBeInTheDocument();
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      const newPageResources = screen.getAllByText('Deployment');
      expect(newPageResources.length).toBe(5);
    });
  });

  it('should handle search clear correctly', () => {
    setup();

    const searchInput = screen.getByTestId('search-input');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    fireEvent.change(searchInput, { target: { value: 'deployment' } });
    expect(searchInput).toHaveValue('deployment');

    fireEvent.click(clearButton);
    expect(searchInput).toHaveValue('');
  });

  it('should update sort order when handleRequestSort is triggered', async () => {
    setup();
    fireEvent.click(screen.getByText('Health status'));
    await waitFor(() => {
      expect(screen.getByText('Deployment')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Health status'));
  });
});
