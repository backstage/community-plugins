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
  return dayTotals
    .sort(
      (a, b) =>
        DateTime.fromISO(a.day).toMillis() - DateTime.fromISO(b.day).toMillis(),
    )
    .filter(total => {
      const totalDate = DateTime.fromISO(total.day);
      const lastDayDate = lastDay
        ? DateTime.fromJSDate(new Date(lastDay))
        : null;
      return !lastDay || (lastDayDate?.isValid && totalDate > lastDayDate);
    });
}

export function filterBaseMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotMetricsDb[] {
  return dayTotals.map(total => ({
    day: total.day,
    type,
    team_name: team ?? '',
    total_active_users:
      total.daily_active_users ?? total.monthly_active_users ?? 0,
    total_engaged_users:
      total.daily_active_users ?? total.monthly_active_users ?? 0,
  }));
}

export function filterIdeCompletionMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsDb[] {
  return dayTotals
    .filter(
      total =>
        total.code_generation_activity_count !== undefined ||
        (total.totals_by_ide && total.totals_by_ide.length > 0),
    )
    .map(total => ({
      day: total.day,
      type,
      team_name: team ?? '',
      total_engaged_users: total.daily_active_users ?? 0,
    }))
    .filter(completion => completion.total_engaged_users > 0);
}

export function filterIdeCompletionLanguageMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsLanguageDb[] {
  return dayTotals
    .flatMap(total =>
      (total.totals_by_language_model ?? []).map(lm => ({
        day: total.day,
        type,
        team_name: team ?? '',
        language: lm.language,
        total_engaged_users: lm.code_generation_activity_count ?? 0,
      })),
    )
    .filter(language => language.total_engaged_users > 0);
}

export function filterIdeCompletionEditorMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorsDb[] {
  return dayTotals
    .flatMap(total =>
      (total.totals_by_ide ?? []).map(ide => ({
        day: total.day,
        type,
        team_name: team ?? '',
        editor: ide.ide,
        total_engaged_users: ide.code_generation_activity_count ?? 0,
      })),
    )
    .filter(editor => editor.total_engaged_users > 0);
}

export function filterIdeCompletionEditorModelMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorModelsDb[] {
  return dayTotals
    .flatMap(total =>
      (total.totals_by_language_model ?? []).map(lm => ({
        day: total.day,
        type,
        team_name: team ?? '',
        editor: 'unknown',
        model: lm.model,
        total_engaged_users: lm.code_generation_activity_count ?? 0,
      })),
    )
    .filter(model => model.total_engaged_users > 0);
}

export function filterIdeCompletionEditorModelLanguageMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorModelLanguagesDb[] {
  return dayTotals
    .flatMap(total =>
      (total.totals_by_language_model ?? []).map(lm => ({
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
      })),
    )
    .filter(language => language.total_engaged_users > 0);
}

export function filterIdeChatMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsDb[] {
  return dayTotals
    .filter(
      total =>
        total.monthly_active_chat_users !== undefined ||
        (total.totals_by_feature && total.totals_by_feature.length > 0),
    )
    .map(total => ({
      day: total.day,
      type,
      team_name: team ?? '',
      total_engaged_users: total.monthly_active_chat_users ?? 0,
    }))
    .filter(chat => chat.total_engaged_users > 0);
}

export function filterIdeEditorMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsEditorsDb[] {
  return dayTotals
    .flatMap(total =>
      (total.totals_by_ide ?? []).map(ide => ({
        day: total.day,
        type,
        team_name: team ?? '',
        editor: ide.ide,
        total_engaged_users: ide.user_initiated_interaction_count ?? 0,
      })),
    )
    .filter(editor => editor.total_engaged_users > 0);
}

export function filterIdeChatEditorModelMetrics(
  dayTotals: CopilotOrgDayTotal[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsEditorModelDb[] {
  return dayTotals
    .flatMap(total =>
      (total.totals_by_model_feature ?? []).map(mf => ({
        day: total.day,
        type,
        team_name: team ?? '',
        editor: 'unknown',
        model: mf.model,
        total_engaged_users: mf.user_initiated_interaction_count ?? 0,
        total_chats: mf.user_initiated_interaction_count ?? 0,
        total_chat_copy_events: 0,
        total_chat_insertion_events: 0,
      })),
    )
    .filter(model => model.total_engaged_users > 0);
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
