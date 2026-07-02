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

import { createDevApp } from '@backstage/dev-utils';
import { devlakePlugin, DoraMetricsPage } from '../src';
import { devlakeApiRef } from '../src/api';
import {
  DoraMetrics,
  DoraMetricsTrend,
  DoraTeam,
} from '@backstage-community/plugin-devlake-common';
import { DevlakeApi } from '../src/api';

const mockTeams: DoraTeam[] = [
  { name: 'Team Alpha', devlakeProjectName: 'project-alpha' },
  { name: 'Team Beta', devlakeProjectName: 'project-beta' },
];

const mockMetrics: DoraMetrics = {
  deploymentFrequency: {
    value: 4.2,
    unit: 'deploys/day',
    level: 'elite',
    trend: 12,
  },
  leadTimeForChanges: {
    value: 2.3,
    unit: 'hours',
    level: 'elite',
    trend: -8,
  },
  changeFailureRate: {
    value: 8.5,
    unit: '%',
    level: 'high',
    trend: -3,
  },
  meanTimeToRecovery: {
    value: 0.75,
    unit: 'hours',
    level: 'elite',
    trend: -15,
  },
};

const generateTrendData = (baseValue: number, days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      value:
        Math.round((baseValue + (Math.random() - 0.5) * baseValue * 0.4) * 10) /
        10,
    });
  }
  return data;
};

const mockTrend: DoraMetricsTrend = {
  deploymentFrequency: generateTrendData(4.2, 30),
  leadTimeForChanges: generateTrendData(2.3, 30),
  changeFailureRate: generateTrendData(8.5, 30),
  meanTimeToRecovery: generateTrendData(0.75, 30),
};

class MockDevlakeApi implements DevlakeApi {
  async getTeams(): Promise<DoraTeam[]> {
    return mockTeams;
  }

  async getDoraMetrics(): Promise<DoraMetrics> {
    return mockMetrics;
  }

  async getDoraTrend(): Promise<DoraMetricsTrend> {
    return mockTrend;
  }
}

createDevApp()
  .registerPlugin(devlakePlugin)
  .registerApi({
    api: devlakeApiRef,
    deps: {},
    factory: () => new MockDevlakeApi(),
  })
  .addPage({
    element: <DoraMetricsPage />,
    title: 'DORA Metrics',
    path: '/devlake/dora',
  })
  .render();
