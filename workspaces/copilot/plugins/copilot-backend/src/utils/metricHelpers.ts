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
  CopilotMetrics,
  CopilotSeats,
  SeatAnalysis,
} from '@backstage-community/plugin-copilot-common';

export function filterNewMetricsV2(
  metrics: CopilotMetrics[],
  lastDay?: string,
): CopilotMetrics[] {
  return metrics
    .sort(
      (a, b) =>
        DateTime.fromISO(a.date).toMillis() -
        DateTime.fromISO(b.date).toMillis(),
    )
    .filter(metric => {
      const metricDate = DateTime.fromISO(metric.date);

      const lastDayDate = lastDay
        ? DateTime.fromJSDate(new Date(lastDay))
        : null;

      return !lastDay || (lastDayDate?.isValid && metricDate > lastDayDate);
    });
}

export function filterBaseMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotMetricsDb[] {
  return metrics
    .map(metric => ({
      day: metric.date,
      type: type,
      team_name: team ?? '',
      total_engaged_users: metric.total_engaged_users,
      total_active_users: metric.total_active_users,
    }))
    .filter(metric => metric.total_engaged_users > 0);
}

export function filterIdeCompletionMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsDb[] {
  return metrics
    .map(metric => ({
      day: metric.date,
      type: type,
      team_name: team ?? '',
      total_engaged_users:
        metric.copilot_ide_code_completions.total_engaged_users,
    }))
    .filter(completion => completion.total_engaged_users > 0);
}

export function filterIdeCompletionLanguageMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsLanguageDb[] {
  return metrics
    .flatMap(
      (metric: CopilotMetrics) =>
        metric.copilot_ide_code_completions.languages?.map(language => ({
          day: metric.date,
          type: type,
          team_name: team ?? '',
          language: language.name,
          total_engaged_users: language.total_engaged_users,
        })) || [],
    )
    .filter(language => language.total_engaged_users > 0);
}
export function filterIdeCompletionEditorMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorsDb[] {
  return metrics
    .flatMap(
      (metric: CopilotMetrics) =>
        metric.copilot_ide_code_completions.editors?.map(editor => ({
          day: metric.date,
          type: type,
          team_name: team ?? '',
          editor: editor.name,
          total_engaged_users: editor.total_engaged_users,
        })) || [],
    )
    .filter(editor => editor.total_engaged_users > 0);
}

export function filterIdeCompletionEditorModelMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorModelsDb[] {
  return metrics
    .flatMap(
      (metric: CopilotMetrics) =>
        metric.copilot_ide_code_completions.editors?.flatMap(editor =>
          editor.models.map(model => ({
            day: metric.date,
            type: type,
            team_name: team ?? '',
            editor: editor.name,
            model: model.name,
            total_engaged_users: model.total_engaged_users,
          })),
        ) || [],
    )
    .filter(model => model.total_engaged_users > 0);
}
export function filterIdeCompletionEditorModelLanguageMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotIdeCodeCompletionsEditorModelLanguagesDb[] {
  return metrics
    .flatMap(
      (metric: CopilotMetrics) =>
        metric.copilot_ide_code_completions.editors?.flatMap(editor =>
          editor.models.flatMap(model =>
            model.languages.map(language => ({
              day: metric.date,
              type: type,
              team_name: team ?? '',
              editor: editor.name,
              model: model.name,
              language: language.name,
              total_engaged_users: language.total_engaged_users,
              total_code_acceptances: language.total_code_acceptances,
              total_code_suggestions: language.total_code_suggestions,
              total_code_lines_accepted: language.total_code_lines_accepted,
              total_code_lines_suggested: language.total_code_lines_suggested,
            })),
          ),
        ) || [],
    )
    .filter(language => language.total_engaged_users > 0);
}

export function filterIdeChatMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsDb[] {
  return metrics
    .map((metric: CopilotMetrics) => ({
      day: metric.date,
      type: type,
      team_name: team ?? '',
      total_engaged_users: metric.copilot_ide_chat.total_engaged_users,
    }))
    .filter(chat => chat.total_engaged_users > 0);
}

export function filterIdeEditorMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsEditorsDb[] {
  return metrics
    .flatMap(
      (metric: CopilotMetrics) =>
        metric.copilot_ide_chat.editors?.map(editor => ({
          day: metric.date,
          type: type,
          team_name: team ?? '',
          editor: editor.name,
          total_engaged_users: editor.total_engaged_users,
        })) || [],
    )
    .filter(editor => editor.total_engaged_users > 0);
}

export function filterIdeChatEditorModelMetrics(
  metrics: CopilotMetrics[],
  type: MetricsType,
  team?: string,
): CopilotIdeChatsEditorModelDb[] {
  return metrics
    .flatMap(
      (metric: CopilotMetrics) =>
        metric.copilot_ide_chat.editors?.flatMap(editor =>
          editor.models.map(model => ({
            day: metric.date,
            type: type,
            team_name: team ?? '',
            editor: editor.name,
            model: model.name,
            total_engaged_users: model.total_engaged_users,
            total_chat_copy_events: model.total_chat_copy_events,
            total_chats: model.total_chats,
            total_chat_insertion_events: model.total_chat_insertion_events,
          })),
        ) || [],
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
