/*
 * Copyright 2026 The Backstage Authors
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

import { InfoCard } from '@backstage/core-components';
import { Flex, Grid, Text } from '@backstage/ui';
import {
  V2CustomizationMetricRow,
  V2CustomizationSummaryRow,
} from '@backstage-community/plugin-copilot-common';
import {
  CustomizationUsageByDayChart,
  CustomizationUsageDonutChart,
} from './charts';

type Props = {
  metrics: V2CustomizationMetricRow[];
  summaries: V2CustomizationSummaryRow[];
  from: string;
  to: string;
};

function displayCategory(category: string): string {
  return category
    .split('_')
    .map(word =>
      word === 'mcp'
        ? 'MCP'
        : `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
    )
    .join(' ');
}

function pluralizeCategory(category: string): string {
  const displayName = displayCategory(category);
  return category.endsWith('s') ? displayName : `${displayName}s`;
}

/**
 * Renders every customization category returned by the backend. Categories
 * are report data, so GitHub can add another one without a frontend release.
 */
export function CustomizationMetrics({
  metrics,
  summaries,
  from,
  to,
}: Readonly<Props>) {
  const categories = new Map<string, V2CustomizationMetricRow[]>();
  for (const metric of metrics) {
    if (metric.interaction_count <= 0) {
      continue;
    }

    const categoryMetrics = categories.get(metric.category) ?? [];
    categoryMetrics.push(metric);
    categories.set(metric.category, categoryMetrics);
  }

  if (!categories.size) {
    return (
      <Text variant="body-small" color="secondary">
        No customization usage was recorded for this date range.
      </Text>
    );
  }

  const latestDistinctCounts = new Map<string, V2CustomizationSummaryRow>();
  for (const summary of summaries) {
    const existing = latestDistinctCounts.get(summary.category);
    if (!existing || summary.day > existing.day) {
      latestDistinctCounts.set(summary.category, summary);
    }
  }

  return (
    <Grid.Root columns="12" gap="4">
      {[...categories.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([category, categoryMetrics]) => {
          const distinctCount = latestDistinctCounts.get(category);

          return (
            <Grid.Item key={category} colSpan="12">
              <InfoCard
                title={pluralizeCategory(category)}
                variant="fullHeight"
              >
                <Flex direction="column" gap="2">
                  {distinctCount && (
                    <Text variant="body-small" color="secondary">
                      {distinctCount.distinct_item_count} distinct items on{' '}
                      {distinctCount.day}
                    </Text>
                  )}
                  <Grid.Root columns="12" gap="4">
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <CustomizationUsageDonutChart data={categoryMetrics} />
                    </Grid.Item>
                    <Grid.Item colSpan={{ initial: '12', md: '6' }}>
                      <CustomizationUsageByDayChart
                        data={categoryMetrics}
                        from={from}
                        to={to}
                      />
                    </Grid.Item>
                  </Grid.Root>
                </Flex>
              </InfoCard>
            </Grid.Item>
          );
        })}
    </Grid.Root>
  );
}
