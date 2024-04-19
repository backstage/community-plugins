/*
 * Copyright 2020 The Backstage Authors
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
 * A Backstage plugin that helps you keep track of your cloud spend
 *
 * @packageDocumentation
 */

export {
  costInsightsPlugin,
  costInsightsPlugin as plugin,
  CostInsightsPage,
  EntityCostInsightsContent,
  CostInsightsProjectGrowthInstructionsPage,
  CostInsightsLabelDataflowInstructionsPage,
} from './plugin';
export { ExampleCostInsightsClient } from './example';
export {
  BarChart,
  BarChartLegend,
  BarChartTooltip,
  BarChartTooltipItem,
  CostGrowth,
  CostGrowthIndicator,
  LegendItem,
} from './components';
export { MockConfigProvider, MockCurrencyProvider } from './testUtils';
export type {
  MockConfigProviderProps,
  MockCurrencyProviderProps,
} from './testUtils';
export * from './api';
export * from './alerts';
export type { ConfigContextProps, CurrencyContextProps } from './hooks';
export * from './types';

export type {
  BarChartProps,
  BarChartLegendOptions,
  BarChartLegendProps,
  BarChartTooltipProps,
  BarChartTooltipItemProps,
  CostGrowthProps,
  CostGrowthIndicatorProps,
  TooltipItem,
  LegendItemProps,
} from './components';
