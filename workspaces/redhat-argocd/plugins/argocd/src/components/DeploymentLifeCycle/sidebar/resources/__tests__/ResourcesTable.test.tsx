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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ResourcesTable } from '../ResourcesTable';
import { Resource } from '@backstage-community/plugin-redhat-argocd-common';
import { useArgoResources } from '../../rollouts/RolloutContext';
import { mockUseTranslation } from '../../../../../test-utils/mockTranslations';

jest.mock('../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));
jest.mock('../../../sidebar/rollouts/RolloutContext', () => ({
  ...jest.requireActual('../../../sidebar/rollouts/RolloutContext'),
  useArgoResources: jest.fn(),
}));

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

jest.mock('../filters/ResourcesFilterBy', () => ({
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

describe('ResourcesTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useArgoResources as jest.Mock).mockReturnValue({ argoResources: [] });
  });

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

  it('should render the filter dropdown, and pagination', () => {
    setup();

    expect(screen.getByTestId('filter-by')).toBeInTheDocument();
    expect(screen.getByText('5 rows')).toBeInTheDocument();
  });

  it('should render the ResourcesTableHeader and ResourcesTableBody', () => {
    setup();

    expect(screen.getByText('Health status')).toBeInTheDocument();
    expect(screen.getByText('Deployment')).toBeInTheDocument();
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

  it('should update sort order when handleRequestSort is triggered', async () => {
    setup();
    fireEvent.click(screen.getByText('Health status'));
    await waitFor(() => {
      expect(screen.getByText('Deployment')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Health status'));
  });
});
