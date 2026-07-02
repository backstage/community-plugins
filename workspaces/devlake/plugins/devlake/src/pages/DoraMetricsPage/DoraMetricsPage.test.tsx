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
import { DoraMetricsPage } from './DoraMetricsPage';
import { devlakeApiRef } from '../../api';
import {
  DoraMetrics,
  DoraMetricsTrend,
  DoraTeam,
} from '@backstage-community/plugin-devlake-common';

const mockTeams: DoraTeam[] = [
  { name: 'All', devlakeProjectName: '__all__' },
  { name: 'Team Alpha', devlakeProjectName: 'project-alpha' },
];

const mockMetrics: DoraMetrics = {
  deploymentFrequency: {
    value: 2.5,
    unit: 'deploys/day',
    level: 'elite',
    trend: 10,
  },
  leadTimeForChanges: { value: 4.0, unit: 'hours', level: 'high', trend: -5 },
  changeFailureRate: { value: 5.0, unit: '%', level: 'medium', trend: 2 },
  meanTimeToRecovery: { value: 2.0, unit: 'hours', level: 'low', trend: 0 },
};

const mockTrend: DoraMetricsTrend = {
  deploymentFrequency: [{ date: '2024-01-01', value: 2 }],
  leadTimeForChanges: [{ date: '2024-01-01', value: 5 }],
  changeFailureRate: [{ date: '2024-01-01', value: 3 }],
  meanTimeToRecovery: [{ date: '2024-01-01', value: 1 }],
};

const mockApi = {
  getTeams: jest.fn(),
  getDoraMetrics: jest.fn(),
  getDoraTrend: jest.fn(),
};

const renderPage = () =>
  renderInTestApp(
    <TestApiProvider apis={[[devlakeApiRef, mockApi]]}>
      <DoraMetricsPage />
    </TestApiProvider>,
  );

describe('DoraMetricsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getTeams.mockResolvedValue(mockTeams);
    mockApi.getDoraMetrics.mockResolvedValue(mockMetrics);
    mockApi.getDoraTrend.mockResolvedValue(mockTrend);
  });

  it('renders the page title', async () => {
    await renderPage();
    expect(screen.getByText('DORA Metrics')).toBeInTheDocument();
  });

  it('renders the powered-by subtitle', async () => {
    await renderPage();
    expect(screen.getByText('Powered by Apache DevLake')).toBeInTheDocument();
  });

  it('renders all four metric card titles after data loads', async () => {
    await renderPage();

    // Each title appears in both MetricCard and MetricChart, so use getAllByText
    await waitFor(() => {
      expect(
        screen.getAllByText('Deployment Frequency').length,
      ).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('Lead Time for Changes').length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('Change Failure Rate').length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('Mean Time to Recovery').length).toBeGreaterThan(
      0,
    );
  });

  it('calls getDoraMetrics with the first team and default preset', async () => {
    await renderPage();

    await waitFor(() => {
      expect(mockApi.getDoraMetrics).toHaveBeenCalledWith({
        team: 'All',
        preset: '30d',
      });
    });
  });

  it('shows an error panel when getTeams fails', async () => {
    mockApi.getTeams.mockRejectedValue(new Error('Failed to load teams'));

    await renderPage();

    await waitFor(() => {
      expect(
        screen.getAllByText(/Failed to load teams/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it('shows an error panel when getDoraMetrics fails', async () => {
    mockApi.getDoraMetrics.mockRejectedValue(new Error('DB connection failed'));

    await renderPage();

    await waitFor(() => {
      expect(
        screen.getAllByText(/DB connection failed/i).length,
      ).toBeGreaterThan(0);
    });
  });
});
