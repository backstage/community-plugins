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

type Props = {
  metrics: V2CustomizationMetricRow[];
  summaries: V2CustomizationSummaryRow[];
};

function displayCategory(category: string): string {
  return category
    .split('_')
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

/**
 * Renders every customization category returned by the backend. Categories
 * are report data, so GitHub can add another one without a frontend release.
 */
export function CustomizationMetrics({ metrics, summaries }: Props) {
  const categories = new Map<string, Map<string, number>>();
  for (const metric of metrics) {
    const items = categories.get(metric.category) ?? new Map<string, number>();
    items.set(
      metric.item_name,
      (items.get(metric.item_name) ?? 0) + metric.interaction_count,
    );
    categories.set(metric.category, items);
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
        .map(([category, items]) => {
          const distinctCount = latestDistinctCounts.get(category);
          const rankedItems = [...items.entries()].sort(
            ([leftName, leftCount], [rightName, rightCount]) =>
              rightCount - leftCount || leftName.localeCompare(rightName),
          );

          return (
            <Grid.Item key={category} colSpan={{ initial: '12', md: '6' }}>
              <InfoCard title={displayCategory(category)} variant="fullHeight">
                <Flex direction="column" gap="2">
                  {distinctCount && (
                    <Text variant="body-small" color="secondary">
                      {distinctCount.distinct_item_count} distinct items on{' '}
                      {distinctCount.day}
                    </Text>
                  )}
                  <ol style={{ margin: 0, paddingLeft: '24px' }}>
                    {rankedItems.map(([itemName, interactionCount]) => (
                      <li key={itemName}>
                        <Text variant="body-small">
                          {itemName}: {interactionCount.toLocaleString()}
                        </Text>
                      </li>
                    ))}
                  </ol>
                </Flex>
              </InfoCard>
            </Grid.Item>
          );
        })}
    </Grid.Root>
  );
}
