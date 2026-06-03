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

import { Grid, Text } from '@backstage/ui';
import { InfoCard } from '@backstage/core-components';
import { V2DailyTotal } from '@backstage-community/plugin-copilot-common';

interface SummaryCardsProps {
  totals: V2DailyTotal[];
  loading: boolean;
}

export const SummaryCards = ({ totals, loading }: SummaryCardsProps) => {
  const latestTotal = totals[totals.length - 1];
  const totalLocAdded = totals.reduce(
    (sum, t) => sum + (t.loc_added_sum ?? 0),
    0,
  );
  const totalLocSuggested = totals.reduce(
    (sum, t) => sum + (t.loc_suggested_to_add_sum ?? 0),
    0,
  );
  const acceptanceRate =
    totalLocSuggested > 0
      ? ((totalLocAdded / totalLocSuggested) * 100).toFixed(1)
      : null;

  const cards = [
    {
      title: 'Daily Active Users',
      value: loading
        ? '…'
        : (latestTotal?.daily_active_users ?? '-').toString(),
    },
    {
      title: 'Monthly Active Users',
      value: loading
        ? '…'
        : (latestTotal?.monthly_active_users ?? '-').toString(),
    },
    {
      title: 'LOC Accepted',
      value: loading ? '…' : totalLocAdded.toLocaleString(),
    },
    {
      title: 'Acceptance Rate',
      value: (() => {
        if (loading) return '…';
        return acceptanceRate ? `${acceptanceRate}%` : '-';
      })(),
    },
  ];

  return (
    <Grid.Root columns="12" gap="4" style={{ alignItems: 'stretch' }}>
      {cards.map(card => (
        <Grid.Item
          colSpan={{ initial: '12', md: '3' }}
          key={card.title}
          style={{ display: 'flex' }}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <InfoCard title={card.title}>
              <Text
                variant="title-large"
                style={{ textAlign: 'center', display: 'block' }}
              >
                {card.value}
              </Text>
            </InfoCard>
          </div>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
};
