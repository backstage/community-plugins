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
  V2DailyTotal,
  V2MetricsByModelFeatureRow,
} from '@backstage-community/plugin-copilot-common';
import { getMostUsedChatModel } from './charts/chartUtils';

interface Props {
  dailyTotals: V2DailyTotal[];
  modelFeature: V2MetricsByModelFeatureRow[];
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

export function CopilotUsageSummary({
  dailyTotals,
  modelFeature,
}: Readonly<Props>) {
  const latest = dailyTotals.at(-1) ?? null;

  const ideActiveUsers = latest?.monthly_active_users ?? 0;
  const agentAdoption =
    latest &&
    latest.monthly_active_users !== undefined &&
    latest.monthly_active_users > 0
      ? Math.round(
          ((latest.monthly_active_agent_users ?? 0) /
            latest.monthly_active_users) *
            100,
        )
      : 0;

  const mostUsedModel = getMostUsedChatModel(modelFeature);

  return (
    <Grid.Root columns="12" gap="4">
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="IDE Active Users"
          value={ideActiveUsers.toLocaleString()}
          subtitle="Monthly active"
        />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Agent Adoption"
          value={`${agentAdoption}%`}
          subtitle="of active users"
        />
      </Grid.Item>
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard title="Most Used Chat Model" value={mostUsedModel} />
      </Grid.Item>
    </Grid.Root>
  );
}
