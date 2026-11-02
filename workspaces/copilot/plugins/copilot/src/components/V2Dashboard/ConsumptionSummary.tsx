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
import { V2DailyTotal } from '@backstage-community/plugin-copilot-common';

interface Props {
  dailyTotals: V2DailyTotal[];
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

export function ConsumptionSummary({ dailyTotals }: Readonly<Props>) {
  const totalCredits = dailyTotals.reduce(
    (sum, row) => sum + (row.total_ai_credits_used ?? 0),
    0,
  );

  return (
    <Grid.Root columns="12" gap="4">
      <Grid.Item colSpan={{ initial: '12', md: '4' }}>
        <StatCard
          title="Total AI Credits Used"
          value={totalCredits.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
          subtitle="Selected timeframe"
        />
      </Grid.Item>
    </Grid.Root>
  );
}
