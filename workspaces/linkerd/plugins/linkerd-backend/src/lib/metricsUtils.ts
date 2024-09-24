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
import { StatRow, StatsResponse } from '../types';
import parse from 'parse-duration';

const getTotalRequests = (row: StatRow) => {
  const success = Number(row.stats?.successCount ?? 0);
  const failure = Number(row.stats?.failureCount ?? 0);

  return success + failure;
};

const getRequestRate = (row: StatRow) => {
  if (!row.stats) {
    return 0;
  }

  const seconds = parse(row.timeWindow, 's');

  if (!seconds) {
    return 0;
  }

  return getTotalRequests(row) / seconds;
};

const getSuccessRate = (row: StatRow) => {
  if (!row.stats) {
    return 0;
  }

  const total = getTotalRequests(row);

  if (total === 0) {
    return 0;
  }

  return Number(row.stats.successCount) / total;
};

const getTcpStats = (row: StatRow) => {
  if (!row.tcpStats) {
    return undefined;
  }

  const seconds = parse(row.timeWindow, 's');

  if (!seconds) {
    return undefined;
  }

  const readBytes = Number(row.tcpStats.readBytesTotal);
  const writeBytes = Number(row.tcpStats.writeBytesTotal);

  return {
    openConnections: Number(row.tcpStats.openConnections),
    readBytes,
    writeBytes,
    readRate: readBytes / seconds,
    writeRate: writeBytes / seconds,
  };
};

export const processStats = (stats: StatsResponse) => {
  if (!stats.ok) {
    throw new Error('Failed to fetch stats');
  }

  return stats.ok.statTables
    .filter(table => table.podGroup.rows.length)
    .flatMap(table => table.podGroup.rows)
    .map(row => ({
      name: row.resource.name,
      namespace: row.resource.namespace,
      type: row.resource.type,
      totalRequests: getTotalRequests(row),
      requestRate: getRequestRate(row),
      successRate: getSuccessRate(row),
      pods: {
        totalPods: Number(row.runningPodCount ?? 0),
        meshedPods: Number(row.meshedPodCount ?? 0),
        meshedPodsPercentage: isNaN(Number(row.meshedPodCount))
          ? 0
          : Number(row.meshedPodCount) / Number(row.runningPodCount),
      },
      tcpStats: getTcpStats(row),
      latency: row.stats
        ? {
            p50: Number(row.stats.latencyMsP50),
            p95: Number(row.stats.latencyMsP95),
            p99: Number(row.stats.latencyMsP99),
          }
        : undefined,
    }));
};
