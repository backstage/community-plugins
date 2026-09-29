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
import { Flex, Grid, Text } from '@backstage/ui';
import { InfoCard } from '@backstage/core-components';
import {
  V2UserMetricRow,
  V2UserMetricsByModelFeatureRow,
} from '@backstage-community/plugin-copilot-common';
import { getMostUsedChatModel } from '../../components/V2Dashboard/charts/chartUtils';

interface Props {
  daily: V2UserMetricRow[];
  byModelFeature: V2UserMetricsByModelFeatureRow[];
}

function StatCard({
  title,
  value,
  subtitle,
}: Readonly<{
  title: string;
  value: string | number;
  subtitle?: string;
}>) {
  return (
    <InfoCard title={title}>
      <Flex direction="row">
        <Text variant="title-large">{value}</Text>
        {subtitle && (
          <Text variant="body-small" color="secondary">
            {subtitle}
          </Text>
        )}
      </Flex>
    </InfoCard>
  );
}

/**
 * Summary stat cards for an individual's own Copilot usage. Unlike
 * {@link CopilotUsageSummary} (org/team-scoped), this has no concept of
 * "active users" — every stat here is derived purely from the caller's own
 * daily rows.
 */
export function MyUsageSummary({ daily, byModelFeature }: Readonly<Props>) {
  const activeDays = daily.length;
  const daysUsedChat = daily.filter(row => row.used_chat).length;
  const daysUsedAgent = daily.filter(row => row.used_agent).length;
  const daysUsedCli = daily.filter(row => row.used_cli).length;
  const totalInteractions = daily.reduce(
    (sum, row) => sum + (row.user_initiated_interaction_count ?? 0),
    0,
  );
  const mostUsedModel = getMostUsedChatModel(byModelFeature);

  return (
    <Grid.Root columns="12" gap="4">
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Active Days"
          value={activeDays.toLocaleString()}
          subtitle="In the selected period"
        />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Total Interactions"
          value={totalInteractions.toLocaleString()}
          subtitle="Chat, completions and agent combined"
        />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard title="Most Used Chat Model" value={mostUsedModel} />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Days Used Chat"
          value={daysUsedChat.toLocaleString()}
        />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Days Used Agent Mode"
          value={daysUsedAgent.toLocaleString()}
        />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Days Used Copilot CLI"
          value={daysUsedCli.toLocaleString()}
        />
      </Grid.Item>
    </Grid.Root>
  );
}
