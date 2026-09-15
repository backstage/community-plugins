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
 * Defensively aggregates duplicate day rows (which can occur from team rollups
 * or other edge cases) into a single row per day. This prevents downstream
 * charts from receiving duplicate day labels which breaks MUI x-charts band-scale
 * hover behaviour.
 */
export function aggregateDailyTotals(data: V2DailyTotal[]): V2DailyTotal[] {
  const byDay = new Map<string, V2DailyTotal>();

  for (const row of data) {
    const existing = byDay.get(row.day);
    if (!existing) {
      // When creating a new aggregated row, set team_slug to empty string
      // to indicate this is an aggregated row representing all teams
      byDay.set(row.day, { ...row, team_slug: '' });
    } else {
      existing.daily_active_users += row.daily_active_users;
      // Only aggregate weekly/monthly if both values are defined (not for team-level rows)
      if (
        existing.weekly_active_users !== undefined &&
        row.weekly_active_users !== undefined
      ) {
        existing.weekly_active_users += row.weekly_active_users;
      } else if (existing.weekly_active_users !== undefined) {
        // If we had a value but the new row doesn't, clear it
        existing.weekly_active_users = undefined;
      }
      if (
        existing.monthly_active_users !== undefined &&
        row.monthly_active_users !== undefined
      ) {
        existing.monthly_active_users += row.monthly_active_users;
      } else if (existing.monthly_active_users !== undefined) {
        // If we had a value but the new row doesn't, clear it
        existing.monthly_active_users = undefined;
      }
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
      existing.total_ai_credits_used =
        (existing.total_ai_credits_used ?? 0) +
        (row.total_ai_credits_used ?? 0);
    }
  }

  // Sort by day to ensure deterministic ordering. Charts expect chronologically
  // sorted data for consistent x-axis labeling and hover behavior.
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}
