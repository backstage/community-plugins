/*
 * Copyright 2024 The Backstage Authors
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
import { DateTime } from 'luxon';
import {
  CopilotIdeChatsDb,
  CopilotIdeChatsEditorModelDb,
  CopilotIdeChatsEditorsDb,
  CopilotIdeCodeCompletionsDb,
  CopilotIdeCodeCompletionsEditorModelLanguagesDb,
  CopilotIdeCodeCompletionsEditorModelsDb,
  CopilotIdeCodeCompletionsEditorsDb,
  CopilotIdeCodeCompletionsLanguageDb,
  CopilotMetricsDb,
} from '../db/DatabaseHandler';
import {
  MetricsType,
  CopilotOrgDayTotal,
  CopilotSeats,
  SeatAnalysis,
} from '@backstage-community/plugin-copilot-common';

export function filterNewDayTotals(
  dayTotals: CopilotOrgDayTotal[],
  lastDay?: string,
): CopilotOrgDayTotal[] {
  return [...dayTotals]
    .sort(
      (a, b) =>
        DateTime.fromISO(a.day, { zone: 'utc' }).toMillis() -
        DateTime.fromISO(b.day, { zone: 'utc' }).toMillis(),
    )
    .filter(total => {
      const totalDate = DateTime.fromISO(total.day, { zone: 'utc' });
      const lastDayDate = lastDay
        ? DateTime.fromISO(lastDay, { zone: 'utc' })
        : null;
      return !lastDay || (lastDayDate?.isValid && totalDate > lastDayDate);
    });
}

export function filterBaseMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotMetricsDb[] {
  // Multiple CopilotOrgDayTotal entries may share the same day (enterprise
  // multi-org). Group by the DB conflict key (day, type, team_name) and sum.
  const grouped = new Map<string, CopilotMetricsDb>();
  for (const total of dayTotals) {
    const key = `${total.day}|${type}|${team ?? ''}`;
    const users = total.daily_active_users ?? total.monthly_active_users ?? 0;
    const existing = grouped.get(key);
    if (existing) {
      existing.total_active_users += users;
      existing.total_engaged_users += users;
    } else {
      grouped.set(key, {
        day: total.day,
        type,
        team_name: team ?? '',
        total_active_users: users,
        total_engaged_users: users,
      });
    }
  }
  return [...grouped.values()];
}

export function filterIdeCompletionMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsDb[] {
  // Multiple CopilotOrgDayTotal entries may share the same day (enterprise
  // multi-org). Group by the DB conflict key (day, type, team_name) and sum.
  const grouped = new Map<string, CopilotIdeCodeCompletionsDb>();
  for (const total of dayTotals) {
    if (
      total.code_generation_activity_count === undefined &&
      !(total.totals_by_ide && total.totals_by_ide.length > 0)
    ) {
      continue;
    }
    const key = `${total.day}|${type}|${team ?? ''}`;
    const users = total.daily_active_users ?? 0;
    const existing = grouped.get(key);
    if (existing) {
      existing.total_engaged_users += users;
    } else {
      grouped.set(key, {
        day: total.day,
        type,
        team_name: team ?? '',
        total_engaged_users: users,
      });
    }
  }
  return [...grouped.values()].filter(r => r.total_engaged_users > 0);
}

export function filterIdeCompletionLanguageMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsLanguageDb[] {
  // totals_by_language_model is keyed (language, model). Grouping by language
  // before returning avoids duplicate (day, type, team_name, language) rows that
  // would be silently dropped by the DB's onConflict().ignore().
  const grouped = new Map<string, CopilotIdeCodeCompletionsLanguageDb>();
  for (const total of dayTotals) {
    for (const lm of total.totals_by_language_model ?? []) {
      const key = `${total.day}|${type}|${team ?? ''}|${lm.language}`;
      const existing = grouped.get(key);
      const count = lm.code_generation_activity_count ?? 0;
      if (existing) {
        existing.total_engaged_users += count;
      } else {
        grouped.set(key, {
          day: total.day,
          type,
          team_name: team ?? '',
          language: lm.language,
          total_engaged_users: count,
        });
      }
    }
  }
  return [...grouped.values()].filter(r => r.total_engaged_users > 0);
}

export function filterIdeCompletionEditorMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorsDb[] {
  // Multiple CopilotOrgDayTotal entries may share the same day (enterprise
  // multi-org). Group by the DB conflict key (day, type, team_name, editor) and sum.
  const grouped = new Map<string, CopilotIdeCodeCompletionsEditorsDb>();
  for (const total of dayTotals) {
    for (const ide of total.totals_by_ide ?? []) {
      const key = `${total.day}|${type}|${team ?? ''}|${ide.ide}`;
      const existing = grouped.get(key);
      const count = ide.code_generation_activity_count ?? 0;
      if (existing) {
        existing.total_engaged_users += count;
      } else {
        grouped.set(key, {
          day: total.day,
          type,
          team_name: team ?? '',
          editor: ide.ide,
          total_engaged_users: count,
        });
      }
    }
  }
  return [...grouped.values()].filter(r => r.total_engaged_users > 0);
}

export function filterIdeCompletionEditorModelMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorModelsDb[] {
  // totals_by_language_model is keyed (language, model). Grouping by model
  // before returning avoids duplicate (day, type, team_name, editor, model) rows
  // that would be silently dropped by the DB's onConflict().ignore().
  const grouped = new Map<string, CopilotIdeCodeCompletionsEditorModelsDb>();
  for (const total of dayTotals) {
    for (const lm of total.totals_by_language_model ?? []) {
      const key = `${total.day}|${type}|${team ?? ''}|unknown|${lm.model}`;
      const existing = grouped.get(key);
      const count = lm.code_generation_activity_count ?? 0;
      if (existing) {
        existing.total_engaged_users += count;
      } else {
        grouped.set(key, {
          day: total.day,
          type,
          team_name: team ?? '',
          editor: 'unknown',
          model: lm.model,
          total_engaged_users: count,
        });
      }
    }
  }
  return [...grouped.values()].filter(r => r.total_engaged_users > 0);
}

export function filterIdeCompletionEditorModelLanguageMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorModelLanguagesDb[] {
  // Multiple CopilotOrgDayTotal entries may share the same day (enterprise
  // multi-org). Group by the DB conflict key (day, type, team_name, editor,
  // model, language) and sum all numeric fields.
  const grouped = new Map<
    string,
    CopilotIdeCodeCompletionsEditorModelLanguagesDb
  >();
  for (const total of dayTotals) {
    for (const lm of total.totals_by_language_model ?? []) {
      const key = `${total.day}|${type}|${team ?? ''}|unknown|${lm.model}|${
        lm.language
      }`;
      const existing = grouped.get(key);
      if (existing) {
        existing.total_engaged_users += lm.code_generation_activity_count ?? 0;
        existing.total_code_acceptances +=
          lm.code_acceptance_activity_count ?? 0;
        existing.total_code_suggestions +=
          lm.code_generation_activity_count ?? 0;
        existing.total_code_lines_accepted += lm.loc_added_sum ?? 0;
        existing.total_code_lines_suggested += lm.loc_suggested_to_add_sum ?? 0;
      } else {
        grouped.set(key, {
          day: total.day,
          type,
          team_name: team ?? '',
          editor: 'unknown',
          model: lm.model,
          language: lm.language,
          total_engaged_users: lm.code_generation_activity_count ?? 0,
          total_code_acceptances: lm.code_acceptance_activity_count ?? 0,
          total_code_suggestions: lm.code_generation_activity_count ?? 0,
          total_code_lines_accepted: lm.loc_added_sum ?? 0,
          total_code_lines_suggested: lm.loc_suggested_to_add_sum ?? 0,
        });
      }
    }
  }
  return [...grouped.values()].filter(r => r.total_engaged_users > 0);
}

export function filterIdeChatMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsDb[] {
  // Multiple CopilotOrgDayTotal entries may share the same day (enterprise
  // multi-org). Group by the DB conflict key (day, type, team_name) and sum.
  const grouped = new Map<string, CopilotIdeChatsDb>();
  for (const total of dayTotals) {
    if (
      total.monthly_active_chat_users === undefined &&
      !(total.totals_by_feature && total.totals_by_feature.length > 0)
    ) {
      continue;
    }
    const key = `${total.day}|${type}|${team ?? ''}`;
    const users = total.monthly_active_chat_users ?? 0;
    const existing = grouped.get(key);
    if (existing) {
      existing.total_engaged_users += users;
    } else {
      grouped.set(key, {
        day: total.day,
        type,
        team_name: team ?? '',
        total_engaged_users: users,
      });
    }
  }
  return [...grouped.values()].filter(r => r.total_engaged_users > 0);
}

export function filterIdeEditorMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsEditorsDb[] {
  // Multiple CopilotOrgDayTotal entries may share the same day (enterprise
  // multi-org). Group by the DB conflict key (day, type, team_name, editor) and sum.
  const grouped = new Map<string, CopilotIdeChatsEditorsDb>();
  for (const total of dayTotals) {
    for (const ide of total.totals_by_ide ?? []) {
      const key = `${total.day}|${type}|${team ?? ''}|${ide.ide}`;
      const existing = grouped.get(key);
      const count = ide.user_initiated_interaction_count ?? 0;
      if (existing) {
        existing.total_engaged_users += count;
      } else {
        grouped.set(key, {
          day: total.day,
          type,
          team_name: team ?? '',
          editor: ide.ide,
          total_engaged_users: count,
        });
      }
    }
  }
  return [...grouped.values()].filter(r => r.total_engaged_users > 0);
}

export function filterIdeChatEditorModelMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsEditorModelDb[] {
  // totals_by_model_feature is keyed (model, feature). Grouping by model before
  // returning avoids duplicate (day, type, team_name, editor, model) rows that
  // would be silently dropped by the DB's onConflict().ignore().
  const grouped = new Map<string, CopilotIdeChatsEditorModelDb>();
  for (const total of dayTotals) {
    for (const mf of total.totals_by_model_feature ?? []) {
      const key = `${total.day}|${type}|${team ?? ''}|unknown|${mf.model}`;
      const existing = grouped.get(key);
      const count = mf.user_initiated_interaction_count ?? 0;
      if (existing) {
        existing.total_engaged_users += count;
        existing.total_chats += count;
      } else {
        grouped.set(key, {
          day: total.day,
          type,
          team_name: team ?? '',
          editor: 'unknown',
          model: mf.model,
          total_engaged_users: count,
          total_chats: count,
          total_chat_copy_events: 0,
          total_chat_insertion_events: 0,
        });
      }
    }
  }
  return [...grouped.values()].filter(r => r.total_engaged_users > 0);
}

export function convertToSeatAnalysis(
  metrics: CopilotSeats,
  type: MetricsType,
  team?: string,
): SeatAnalysis {
  const totalSeats = metrics.total_seats;
  const today = DateTime.now().startOf('day');

  // Count seats with no activity
  const seatsNeverUsed = metrics.seats.filter(
    seat => !seat.last_activity_at,
  ).length;

  // Count seats with no activity in the last 7, 14, and 28 days
  const seatsInactive7Days = metrics.seats.filter(seat => {
    if (!seat.last_activity_at) return false;
    const lastActivityDate = DateTime.fromISO(seat.last_activity_at);
    return today.diff(lastActivityDate, 'days').days >= 7;
  }).length;

  const seatsInactive14Days = metrics.seats.filter(seat => {
    if (!seat.last_activity_at) return false;
    const lastActivityDate = DateTime.fromISO(seat.last_activity_at);
    return today.diff(lastActivityDate, 'days').days >= 14;
  }).length;

  const seatsInactive28Days = metrics.seats.filter(seat => {
    if (!seat.last_activity_at) return false;
    const lastActivityDate = DateTime.fromISO(seat.last_activity_at);
    return today.diff(lastActivityDate, 'days').days >= 28;
  }).length;

  return {
    day: today.toISODate(),
    type,
    team_name: team ?? '',
    total_seats: totalSeats,
    seats_never_used: seatsNeverUsed,
    seats_inactive_7_days: seatsInactive7Days,
    seats_inactive_14_days: seatsInactive14Days,
    seats_inactive_28_days: seatsInactive28Days,
  };
}

export function convertToTeamSeatAnalysis(
  metrics: CopilotSeats,
  type: MetricsType,
  team: string,
): SeatAnalysis {
  const teamSeatMetrics = metrics.seats.filter(
    seat => seat.assigning_team?.slug === team,
  );
  const teamMetrics = {
    total_seats: teamSeatMetrics.length,
    seats: teamSeatMetrics,
  };

  return convertToSeatAnalysis(teamMetrics, type, team);
}
