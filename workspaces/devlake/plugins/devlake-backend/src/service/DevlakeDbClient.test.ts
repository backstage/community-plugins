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

import mysql from 'mysql2/promise';
import { DevlakeDbClient } from './DevlakeDbClient';
import { mockServices } from '@backstage/backend-test-utils';
import { DevlakeDbConfig } from '../types';

jest.mock('mysql2/promise');

const mockExecute = jest.fn();
const mockPool = {
  execute: mockExecute,
  end: jest.fn().mockResolvedValue(undefined),
};

const dbConfig: DevlakeDbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'test',
  password: 'test',
  database: 'devlake',
  ssl: false,
};

describe('DevlakeDbClient', () => {
  let client: DevlakeDbClient;

  beforeEach(() => {
    jest.clearAllMocks();
    (mysql.createPool as jest.Mock).mockReturnValue(mockPool);
    client = new DevlakeDbClient(dbConfig, mockServices.logger.mock());
  });

  describe('constructor', () => {
    it('creates a connection pool with the provided config', () => {
      expect(mysql.createPool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          port: 3306,
          user: 'test',
          password: 'test',
          database: 'devlake',
        }),
      );
    });
  });

  describe('getDoraMetrics', () => {
    const from = '2024-01-01';
    const to = '2024-01-31';

    beforeEach(() => {
      // 4 queries run in parallel: df, lt, cfr, mttr
      mockExecute
        .mockResolvedValueOnce([[{ deploys_per_day: '2.5' }]])
        .mockResolvedValueOnce([[{ median_lead_time_hours: '48.0' }]])
        .mockResolvedValueOnce([[{ change_failure_rate: '5.0' }]])
        .mockResolvedValueOnce([[{ median_recovery_hours: '2.0' }]]);
    });

    it('returns all four DORA metrics with correct values', async () => {
      const result = await client.getDoraMetrics({
        projectName: 'my-project',
        from,
        to,
      });

      expect(result.deploymentFrequency.value).toBe(2.5);
      expect(result.deploymentFrequency.unit).toBe('deploys/day');

      expect(result.leadTimeForChanges.value).toBe(48);
      expect(result.leadTimeForChanges.unit).toBe('hours');

      expect(result.changeFailureRate.value).toBe(5);
      expect(result.changeFailureRate.unit).toBe('%');

      expect(result.meanTimeToRecovery.value).toBe(2);
      expect(result.meanTimeToRecovery.unit).toBe('hours');
    });

    it('assigns correct DORA levels', async () => {
      const result = await client.getDoraMetrics({
        projectName: 'my-project',
        from,
        to,
      });

      // 2.5 deploys/day → elite (≥ 1/day)
      expect(result.deploymentFrequency.level).toBe('elite');
    });

    it('returns zero values when the DB returns null/missing rows', async () => {
      mockExecute.mockReset();
      mockExecute
        .mockResolvedValueOnce([[{ deploys_per_day: null }]])
        .mockResolvedValueOnce([[{}]])
        .mockResolvedValueOnce([[{ change_failure_rate: null }]])
        .mockResolvedValueOnce([[{}]]);

      const result = await client.getDoraMetrics({
        projectName: null,
        from,
        to,
      });

      expect(result.deploymentFrequency.value).toBe(0);
      expect(result.leadTimeForChanges.value).toBe(0);
      expect(result.changeFailureRate.value).toBe(0);
      expect(result.meanTimeToRecovery.value).toBe(0);
    });

    it('executes 4 SQL queries in parallel', async () => {
      await client.getDoraMetrics({ projectName: 'my-project', from, to });
      expect(mockExecute).toHaveBeenCalledTimes(4);
    });
  });

  describe('getDoraTrend', () => {
    const from = '2024-01-01';
    const to = '2024-01-31';

    const trendRows = [
      [{ date: '2024-01-01', value: '2' }],
      [{ date: '2024-01-08', value: '3' }],
    ];

    beforeEach(() => {
      // 4 trend queries in parallel
      mockExecute
        .mockResolvedValueOnce([trendRows])
        .mockResolvedValueOnce([trendRows])
        .mockResolvedValueOnce([trendRows])
        .mockResolvedValueOnce([trendRows]);
    });

    it('executes 4 SQL queries in parallel', async () => {
      await client.getDoraTrend({ projectName: 'my-project', from, to });
      expect(mockExecute).toHaveBeenCalledTimes(4);
    });

    it('returns trend arrays for all four metrics', async () => {
      // Return simple arrays for each trend query
      mockExecute.mockReset();
      mockExecute
        .mockResolvedValueOnce([[{ date: '2024-01-01', value: '3' }]])
        .mockResolvedValueOnce([[{ date: '2024-01-01', value: '5' }]])
        .mockResolvedValueOnce([[{ date: '2024-01-01', value: '2' }]])
        .mockResolvedValueOnce([[{ date: '2024-01-01', value: '1' }]]);

      const result = await client.getDoraTrend({
        projectName: 'my-project',
        from,
        to,
      });

      expect(result.deploymentFrequency).toHaveLength(1);
      expect(result.deploymentFrequency[0]).toEqual({
        date: '2024-01-01',
        value: 3,
      });
      expect(result.leadTimeForChanges).toHaveLength(1);
      expect(result.changeFailureRate).toHaveLength(1);
      expect(result.meanTimeToRecovery).toHaveLength(1);
    });

    it('returns empty arrays when there is no trend data', async () => {
      mockExecute.mockReset();
      mockExecute
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]]);

      const result = await client.getDoraTrend({
        projectName: null,
        from,
        to,
      });

      expect(result.deploymentFrequency).toHaveLength(0);
      expect(result.leadTimeForChanges).toHaveLength(0);
      expect(result.changeFailureRate).toHaveLength(0);
      expect(result.meanTimeToRecovery).toHaveLength(0);
    });
  });

  describe('close', () => {
    it('ends the connection pool', async () => {
      await client.close();
      expect(mockPool.end).toHaveBeenCalled();
    });
  });
});
