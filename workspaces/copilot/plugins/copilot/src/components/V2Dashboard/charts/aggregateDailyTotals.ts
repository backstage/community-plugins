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

import { V2DailyTotal } from '@backstage-community/plugin-copilot-common';

/**
 * Aggregate V2DailyTotal rows by day, summing all numeric fields.
 *
 * When "all teams" is selected the API returns one row per (day, team_slug).
 * Charts that build an x-axis from `data.map(d => d.day)` end up with
 * duplicate day labels, which breaks MUI x-charts band-scale hover behaviour.
 * This function collapses those duplicate rows into a single row per day so
 * every chart sees exactly one entry per date.
 */
export function aggregateDailyTotals(data: V2DailyTotal[]): V2DailyTotal[] {
  const byDay = new Map<string, V2DailyTotal>();

  for (const row of data) {
    const existing = byDay.get(row.day);
    if (!existing) {
      byDay.set(row.day, { ...row });
    } else {
      existing.daily_active_users += row.daily_active_users;
      existing.weekly_active_users += row.weekly_active_users;
      existing.monthly_active_users += row.monthly_active_users;
      existing.daily_active_cli_users =
        (existing.daily_active_cli_users ?? 0) +
        (row.daily_active_cli_users ?? 0);
      existing.monthly_active_agent_users =
        (existing.monthly_active_agent_users ?? 0) +
        (row.monthly_active_agent_users ?? 0);
      existing.monthly_active_chat_users =
        (existing.monthly_active_chat_users ?? 0) +
        (row.monthly_active_chat_users ?? 0);
      existing.code_acceptance_activity_count +=
        row.code_acceptance_activity_count;
      existing.code_generation_activity_count +=
        row.code_generation_activity_count;
      existing.loc_added_sum += row.loc_added_sum;
      existing.loc_deleted_sum += row.loc_deleted_sum;
      existing.loc_suggested_to_add_sum += row.loc_suggested_to_add_sum;
      existing.loc_suggested_to_delete_sum += row.loc_suggested_to_delete_sum;
      existing.user_initiated_interaction_count +=
        row.user_initiated_interaction_count;
    }
  }

  return [...byDay.values()];
}
