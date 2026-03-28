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

import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen, waitFor } from '@testing-library/react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { configApiRef } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { EntityDoraCard } from './EntityDoraCard';
import { devlakeApiRef } from '../../api';
import { DoraMetrics } from '@backstage-community/plugin-devlake-common';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: jest.fn(),
}));

const mockMetrics: DoraMetrics = {
  deploymentFrequency: {
    value: 2.5,
    unit: 'deploys/day',
    level: 'elite',
    trend: 0,
  },
  leadTimeForChanges: { value: 4.0, unit: 'hours', level: 'high', trend: 0 },
  changeFailureRate: { value: 5.0, unit: '%', level: 'medium', trend: 0 },
  meanTimeToRecovery: { value: 2.0, unit: 'hours', level: 'low', trend: 0 },
};

const mockDevlakeApi = {
  getDoraMetrics: jest.fn().mockResolvedValue(mockMetrics),
  getTeams: jest.fn(),
  getDoraTrend: jest.fn(),
};

const mockConfigApi = {
  getOptionalString: jest.fn().mockReturnValue(undefined),
  getString: jest.fn(),
  getBoolean: jest.fn(),
  getNumber: jest.fn(),
  has: jest.fn(),
  keys: jest.fn(),
  get: jest.fn(),
  getOptionalBoolean: jest.fn(),
  getOptionalNumber: jest.fn(),
  getConfig: jest.fn(),
  getOptionalConfig: jest.fn(),
  getConfigArray: jest.fn(),
  getOptionalConfigArray: jest.fn(),
  getStringArray: jest.fn(),
  getOptionalStringArray: jest.fn(),
};

const makeEntity = (annotations?: Record<string, string>): Entity =>
  ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'my-service', annotations },
  } as Entity);

const renderCard = (entity: Entity) =>
  renderInTestApp(
    <TestApiProvider
      apis={[
        [devlakeApiRef, mockDevlakeApi],
        [configApiRef, mockConfigApi],
      ]}
    >
      <EntityDoraCard />
    </TestApiProvider>,
    { mountedRoutes: { '/devlake': {} as any } },
  ).then(() => {
    (useEntity as jest.Mock).mockReturnValue({ entity });
  });

describe('EntityDoraCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDevlakeApi.getDoraMetrics.mockResolvedValue(mockMetrics);
    mockConfigApi.getOptionalString.mockReturnValue(undefined);
  });

  it('renders the DORA Metrics card title', async () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity({ 'devlake.io/project-name': 'my-project' }),
    });

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [devlakeApiRef, mockDevlakeApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityDoraCard />
      </TestApiProvider>,
    );

    expect(screen.getByText('DORA Metrics')).toBeInTheDocument();
  });

  it('shows MissingAnnotationEmptyState when annotation is absent', async () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity({}),
    });

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [devlakeApiRef, mockDevlakeApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityDoraCard />
      </TestApiProvider>,
    );

    expect(screen.getByText('devlake.io/project-name')).toBeInTheDocument();
    expect(mockDevlakeApi.getDoraMetrics).not.toHaveBeenCalled();
  });

  it('displays metric tiles after data loads', async () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity({ 'devlake.io/project-name': 'my-project' }),
    });

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [devlakeApiRef, mockDevlakeApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityDoraCard />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Deploy Freq')).toBeInTheDocument();
    });

    expect(screen.getByText('Lead Time')).toBeInTheDocument();
    expect(screen.getByText('Change Fail Rate')).toBeInTheDocument();
    expect(screen.getByText('MTTR')).toBeInTheDocument();
  });

  it('displays metric values and DORA level badges', async () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity({ 'devlake.io/project-name': 'my-project' }),
    });

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [devlakeApiRef, mockDevlakeApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityDoraCard />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('2.5')).toBeInTheDocument();
    });

    expect(screen.getByText('Elite')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows N/A when a metric value is zero', async () => {
    mockDevlakeApi.getDoraMetrics.mockResolvedValue({
      ...mockMetrics,
      deploymentFrequency: {
        value: 0,
        unit: 'deploys/day',
        level: 'low',
        trend: 0,
      },
    });

    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity({ 'devlake.io/project-name': 'my-project' }),
    });

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [devlakeApiRef, mockDevlakeApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityDoraCard />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  it('renders the Grafana link when baseUrl is configured', async () => {
    mockConfigApi.getOptionalString.mockImplementation((key: string) => {
      if (key === 'devlake.grafana.baseUrl')
        return 'https://grafana.example.com';
      return undefined;
    });

    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity({ 'devlake.io/project-name': 'my-project' }),
    });

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [devlakeApiRef, mockDevlakeApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityDoraCard />
      </TestApiProvider>,
    );

    await waitFor(() => {
      const grafanaLink = screen.getByTitle('Open in Grafana').closest('a');
      expect(grafanaLink).toHaveAttribute(
        'href',
        expect.stringContaining('grafana.example.com'),
      );
    });
  });

  it('shows an error panel when the API call fails', async () => {
    mockDevlakeApi.getDoraMetrics.mockRejectedValue(new Error('Network error'));

    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity({ 'devlake.io/project-name': 'my-project' }),
    });

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [devlakeApiRef, mockDevlakeApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityDoraCard />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Network error/i).length).toBeGreaterThan(0);
    });
  });

  it('calls getDoraMetrics with the project name annotation value', async () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: makeEntity({ 'devlake.io/project-name': 'my-devlake-project' }),
    });

    await renderInTestApp(
      <TestApiProvider
        apis={[
          [devlakeApiRef, mockDevlakeApi],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityDoraCard />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockDevlakeApi.getDoraMetrics).toHaveBeenCalledWith({
        team: 'my-devlake-project',
        preset: '30d',
      });
    });
  });
});
