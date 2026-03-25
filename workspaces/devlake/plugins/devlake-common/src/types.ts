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

/**
 * DORA performance level classification.
 *
 * @public
 */
export type DoraLevel = 'elite' | 'high' | 'medium' | 'low';

/**
 * A single DORA metric with its value, unit, performance level, and trend.
 *
 * @public
 */
export interface DoraMetric {
  value: number;
  unit: string;
  level: DoraLevel;
  /** Percentage change vs previous period */
  trend: number;
}

/**
 * All four DORA metrics.
 *
 * @public
 */
export interface DoraMetrics {
  deploymentFrequency: DoraMetric;
  leadTimeForChanges: DoraMetric;
  changeFailureRate: DoraMetric;
  meanTimeToRecovery: DoraMetric;
}

/**
 * A single data point in a DORA metric trend.
 *
 * @public
 */
export interface DoraMetricTrendPoint {
  date: string;
  value: number;
}

/**
 * Trend data for all four DORA metrics.
 *
 * @public
 */
export interface DoraMetricsTrend {
  deploymentFrequency: DoraMetricTrendPoint[];
  leadTimeForChanges: DoraMetricTrendPoint[];
  changeFailureRate: DoraMetricTrendPoint[];
  meanTimeToRecovery: DoraMetricTrendPoint[];
}

/**
 * A team configured for DORA metrics.
 *
 * @public
 */
export interface DoraTeam {
  name: string;
  devlakeProjectName: string;
}

/**
 * Supported time range presets.
 *
 * @public
 */
export type TimeRangePreset = '7d' | '30d' | '90d' | 'quarter' | '1y';
