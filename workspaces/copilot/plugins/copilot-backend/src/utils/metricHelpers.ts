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
import { DateTime } from 'luxon';
import { MetricDbRow } from '../db/DatabaseHandler';
import {
  Metric,
  MetricsType,
} from '@backstage-community/plugin-copilot-common';

export function filterNewMetrics(
  metrics: Metric[],
  lastDay?: string,
): Metric[] {
  return metrics
    .sort(
      (a, b) =>
        DateTime.fromISO(a.day).toMillis() - DateTime.fromISO(b.day).toMillis(),
    )
    .filter(metric => {
      const metricDate = DateTime.fromISO(metric.day);

      const lastDayDate = lastDay
        ? DateTime.fromJSDate(new Date(lastDay))
        : null;

      return !lastDay || (lastDayDate?.isValid && metricDate > lastDayDate);
    });
}

export function prepareMetricsForInsert(
  metrics: Metric[],
  type: MetricsType,
  team_name?: string,
): MetricDbRow[] {
  return metrics.map(({ breakdown, ...rest }) => ({
    ...rest,
    type,
    team_name,
    breakdown: JSON.stringify(breakdown),
  })) as MetricDbRow[];
}
