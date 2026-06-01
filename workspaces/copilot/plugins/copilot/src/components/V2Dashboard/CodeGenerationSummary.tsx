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
import { Grid, Text, Flex } from '@backstage/ui';
import {
  V2DailyTotal,
  V2MetricsByFeatureRow,
} from '@backstage-community/plugin-copilot-common';

interface Props {
  dailyTotals: V2DailyTotal[];
  byFeature: V2MetricsByFeatureRow[];
}

function formatLOC(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <InfoCard title={title} noPadding>
      <Flex
        direction="row"
        style={{ gap: 'var(--bui-space-2, 8px)', padding: '16px' }}
      >
        <Text variant="title-large">{value}</Text>
        <Text variant="body-small" color="secondary">
          {subtitle}
        </Text>
      </Flex>
    </InfoCard>
  );
}

function isAgentFeature(feature: string): boolean {
  return feature.includes('agent');
}

export function CodeGenerationSummary({ dailyTotals, byFeature }: Props) {
  // Lines of code changed with AI = sum(loc_added + loc_deleted) across period
  const totalChanged = dailyTotals.reduce(
    (sum, d) => sum + (d.loc_added_sum ?? 0) + (d.loc_deleted_sum ?? 0),
    0,
  );

  // Agent contribution % = agent LOC / total LOC
  const agentLOC = byFeature
    .filter(r => isAgentFeature(r.feature))
    .reduce(
      (sum, r) => sum + (r.loc_added_sum ?? 0) + (r.loc_deleted_sum ?? 0),
      0,
    );
  const totalFeatureLOC = byFeature.reduce(
    (sum, r) => sum + (r.loc_added_sum ?? 0) + (r.loc_deleted_sum ?? 0),
    0,
  );
  const agentContribution =
    totalFeatureLOC > 0
      ? `${((agentLOC / totalFeatureLOC) * 100).toFixed(2)}%`
      : 'N/A';

  // Average lines deleted by agent = total agent loc_deleted / count of days with agent activity
  const agentDeletedTotal = byFeature
    .filter(r => isAgentFeature(r.feature))
    .reduce((sum, r) => sum + (r.loc_deleted_sum ?? 0), 0);
  const activeDays = dailyTotals.filter(
    d => (d.daily_active_users ?? 0) > 0,
  ).length;
  const avgDeletedByAgent =
    activeDays > 0
      ? formatLOC(Math.round(agentDeletedTotal / activeDays))
      : 'N/A';

  return (
    <Grid.Root columns="12" gap="4">
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Lines of Code Changed with AI"
          value={formatLOC(totalChanged)}
          subtitle="Lines added and deleted across all modes in the selected period"
        />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Agent Contribution"
          value={agentContribution}
          subtitle="Percentage of lines added and deleted by agents in the selected period"
        />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Avg Lines Deleted by Agent"
          value={avgDeletedByAgent}
          subtitle="Average lines deleted by agents per active day in the selected period"
        />
      </Grid.Item>
    </Grid.Root>
  );
}
