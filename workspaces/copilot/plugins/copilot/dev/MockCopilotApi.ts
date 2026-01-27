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
import { CopilotApi } from '../src/api/CopilotApi';
import {
  EngagementMetrics,
  Metric,
  MetricsType,
  PeriodRange,
  SeatAnalysis,
} from '@backstage-community/plugin-copilot-common';
import {
  mockTeams,
  mockOverallMetrics,
  mockTeamMetrics,
  mockOverallEngagementMetrics,
  mockTeamEngagementMetrics,
  mockOverallSeatAnalysis,
  mockTeamSeatAnalysis,
} from './mockData';

export class MockCopilotApi implements CopilotApi {
  async getMetrics(
    _startDate: Date,
    _endDate: Date,
    _type: MetricsType,
    team?: string,
  ): Promise<Metric[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (team && mockTeamMetrics[team]) {
      return mockTeamMetrics[team];
    }
    return mockOverallMetrics;
  }

  async getEngagementMetrics(
    _startDate: Date,
    _endDate: Date,
    _type: MetricsType,
    team?: string,
  ): Promise<EngagementMetrics[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (team && mockTeamEngagementMetrics[team]) {
      return mockTeamEngagementMetrics[team];
    }
    return mockOverallEngagementMetrics;
  }

  async getSeatMetrics(
    _startDate: Date,
    _endDate: Date,
    _type: MetricsType,
    team?: string,
  ): Promise<SeatAnalysis[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (team && mockTeamSeatAnalysis[team]) {
      return mockTeamSeatAnalysis[team];
    }
    return mockOverallSeatAnalysis;
  }

  async fetchTeams(
    _startDate: Date,
    _endDate: Date,
    _type: MetricsType,
  ): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTeams;
  }

  async periodRange(_type: MetricsType): Promise<PeriodRange> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    return {
      minDate: startDate.toISOString().split('T')[0],
      maxDate: endDate.toISOString().split('T')[0],
    };
  }
}
