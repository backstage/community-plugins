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

import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { V2DailyTotal } from '@backstage-community/plugin-copilot-common';
import { CopilotUsageSummary } from './CopilotUsageSummary';

jest.mock('./charts/chartUtils', () => ({
  getMostUsedChatModel: () => 'GPT-4o',
}));

const createDailyTotal = (
  overrides: Partial<V2DailyTotal> = {},
): V2DailyTotal => ({
  day: '2026-11-20',
  metrics_type: 'enterprise',
  entity_id: 'enterprise-1',
  team_slug: '',
  daily_active_users: 0,
  code_acceptance_activity_count: 0,
  code_generation_activity_count: 0,
  loc_added_sum: 0,
  loc_deleted_sum: 0,
  loc_suggested_to_add_sum: 0,
  loc_suggested_to_delete_sum: 0,
  user_initiated_interaction_count: 0,
  ...overrides,
});

const renderSummary = (dailyTotals: V2DailyTotal[]) =>
  renderInTestApp(
    <CopilotUsageSummary dailyTotals={dailyTotals} modelFeature={[]} />,
  );

describe('CopilotUsageSummary', () => {
  it('shows monthly metrics as unavailable when data or either monthly count is missing', async () => {
    const noData = await renderSummary([]);
    expect(screen.getAllByText('N/A')).toHaveLength(2);
    noData.unmount();

    const missingAgentCount = await renderSummary([
      createDailyTotal({ monthly_active_users: 12 }),
    ]);
    expect(screen.getByText('12')).toBeVisible();
    expect(screen.getByText('N/A')).toBeVisible();
    missingAgentCount.unmount();

    await renderSummary([createDailyTotal({ monthly_active_agent_users: 3 })]);
    expect(screen.getAllByText('N/A')).toHaveLength(2);
  });

  it('treats null monthly counts as unavailable', async () => {
    const missingActiveUsers = {
      ...createDailyTotal({ monthly_active_agent_users: 3 }),
      monthly_active_users: null,
    } as unknown as V2DailyTotal;
    await renderSummary([missingActiveUsers]);
    expect(screen.getAllByText('N/A')).toHaveLength(2);
  });

  it('treats a null monthly agent count as unavailable without hiding the active-user count', async () => {
    const missingAgentUsers = {
      ...createDailyTotal({ monthly_active_users: 12 }),
      monthly_active_agent_users: null,
    } as unknown as V2DailyTotal;
    await renderSummary([missingAgentUsers]);
    expect(screen.getByText('12')).toBeVisible();
    expect(screen.getByText('N/A')).toBeVisible();
  });

  it('preserves measured zeroes and computes adoption for known counts', async () => {
    const zeroCounts = await renderSummary([
      createDailyTotal({
        monthly_active_users: 0,
        monthly_active_agent_users: 0,
      }),
    ]);
    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getByText('0%')).toBeVisible();
    zeroCounts.unmount();

    await renderSummary([
      createDailyTotal({
        monthly_active_users: 8,
        monthly_active_agent_users: 2,
      }),
    ]);
    expect(screen.getByText('8')).toBeVisible();
    expect(screen.getByText('25%')).toBeVisible();
  });
});
