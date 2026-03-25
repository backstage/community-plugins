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
 * The DevLake plugin provides a DORA Metrics dashboard powered by Apache DevLake.
 *
 * @packageDocumentation
 */

export { devlakePlugin, DoraMetricsPage } from './plugin';
export { devlakeApiRef } from './api';
export type { DevlakeApi } from './api';
export { MetricCard } from './components/MetricCard';
export type { MetricCardProps } from './components/MetricCard/MetricCard';
export { MetricChart } from './components/MetricChart';
export type { MetricChartProps } from './components/MetricChart/MetricChart';
export { TeamSelector } from './components/TeamSelector';
export type { TeamSelectorProps } from './components/TeamSelector/TeamSelector';
export { TimeRangeSelector } from './components/TimeRangeSelector';
export type { TimeRangeSelectorProps } from './components/TimeRangeSelector/TimeRangeSelector';
