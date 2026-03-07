/*
 * Copyright 2026 The Backstage Authors
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

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { renderInTestApp } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { VulnerabilitiesCard } from '../index';
import { Entity } from '@backstage/catalog-model';

const mockGetVulnerabilities = jest.fn();

jest.mock('../../../api', () => ({
  useFairwindsInsightsApi: () => ({
    getVulnerabilities: mockGetVulnerabilities,
  }),
}));

jest.mock('@mui/x-charts/BarChart', () => ({
  BarChart: () => <div data-testid="bar-chart" />,
}));
jest.mock('@mui/x-charts/PieChart', () => ({
  PieChart: () => <div data-testid="pie-chart" />,
}));

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    namespace: 'default',
    annotations: {
      'insights.fairwinds.com/app-groups': 'test-app-group',
    },
  },
  spec: {
    type: 'service',
  },
};

const mockVulnerabilitiesResponse = {
  total: 100,
  topByTitle: [
    { title: 'image-a:1.0', count: 10 },
    { title: 'image-b:2.0', count: 8 },
  ],
  topBySeverity: [
    { title: 'HIGH', count: 80 },
    { title: 'CRITICAL', count: 20 },
  ],
  topByPackage: [
    { title: 'pkg-a:1.0', count: 15 },
    { title: 'pkg-b:2.0', count: 12 },
  ],
  summaries: [],
  items: [],
};

describe('VulnerabilitiesCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render missing annotation state when app-groups is not configured', async () => {
    const entityWithoutAppGroups: Entity = {
      ...mockEntity,
      metadata: {
        ...mockEntity.metadata,
        annotations: {},
      },
    };

    await renderInTestApp(
      <EntityProvider entity={entityWithoutAppGroups}>
        <VulnerabilitiesCard />
      </EntityProvider>,
    );

    expect(
      screen.getAllByText(/insights\.fairwinds\.com\/app-groups/).length,
    ).toBeGreaterThan(0);
  });

  it('should render three chart sections when vulnerability data is loaded', async () => {
    mockGetVulnerabilities.mockResolvedValue(mockVulnerabilitiesResponse);

    await renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <VulnerabilitiesCard />
      </EntityProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Top Impacted Images')).toBeInTheDocument();
      expect(screen.getByText('Severity Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Top Impacted Packages')).toBeInTheDocument();
    });

    expect(screen.getByText(/Total: 100 vulnerabilities/)).toBeInTheDocument();
  });

  it('should render "No vulnerabilities found" when total is 0', async () => {
    mockGetVulnerabilities.mockResolvedValue({
      ...mockVulnerabilitiesResponse,
      total: 0,
      topByTitle: [],
      topBySeverity: [],
      topByPackage: [],
    });

    await renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <VulnerabilitiesCard />
      </EntityProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('No vulnerabilities found')).toBeInTheDocument();
    });
  });

  it('should render error state when API fails', async () => {
    mockGetVulnerabilities.mockRejectedValue(new Error('Network error'));

    await renderInTestApp(
      <EntityProvider entity={mockEntity}>
        <VulnerabilitiesCard />
      </EntityProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Error: Network error/ }),
      ).toBeInTheDocument();
    });
  });
});
