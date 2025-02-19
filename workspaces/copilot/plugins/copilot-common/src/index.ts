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

/**
 * Common functionalities for the copilot plugin.
 *
 * @packageDocumentation
 */

/**
 * Represents metrics data for a day in the copilot plugin.
 *
 * This used to be part of an API exposed by GitHub (/usage, see #2828),
 * that was deprecated. At some point we should fully convert to the new CopilotMetrics way.
 *
 * @internal
 */
export interface Breakdown {
  /**
   * The number of times suggestions were accepted.
   */
  acceptances_count: number;

  /**
   * The number of active users.
   */
  active_users: number;

  /**
   * The editor used.
   */
  editor: string;

  /**
   * The programming language.
   */
  language: string;

  /**
   * The number of lines accepted.
   */
  lines_accepted: number;

  /**
   * The number of lines suggested.
   */
  lines_suggested: number;

  /**
   * The number of suggestions made.
   */
  suggestions_count: number;
}

/**
 * Represents the possible types of metrics data.
 *
 * @public
 */
export type MetricsType = 'enterprise' | 'organization';

/**
 * Represents a detailed breakdown of metrics by language and editor.
 *
 * This used to be part of an API exposed by GitHub (/usage, see #2828),
 * that was deprecated. At some point we should fully convert to the new CopilotMetrics way.
 *
 * @internal
 */
export interface Metric {
  /**
   * Detailed breakdown of metrics by language and editor.
   */
  breakdown: Breakdown[];

  /**
   * The date for the metrics reported.
   */
  day: string;

  /**
   * The type of the metrics data.
   * Can be 'enterprise', 'organization'.
   */
  type: MetricsType;

  /**
   * The name of the team, applicable when the metric is for a specific team.
   * When null, it indicates metrics for all teams, aggregated at the 'enterprise' or 'organization' level.
   */
  team_name?: string;

  /**
   * The total number of suggestions accepted.
   */
  total_acceptances_count: number;

  /**
   * The total number of active chat users.
   */
  total_active_chat_users: number;

  /**
   * The total number of active users.
   */
  total_active_users: number;

  /**
   * The total number of chat acceptances.
   */
  total_chat_acceptances: number;

  /**
   * The total number of chat turns.
   */
  total_chat_turns: number;

  /**
   * The total number of lines accepted.
   */
  total_lines_accepted: number;

  /**
   * The total number of lines suggested.
   */
  total_lines_suggested: number;

  /**
   * The total number of suggestions made.
   */
  total_suggestions_count: number;
}

/**
 * Represents a range of dates for a reporting period.
 *
 * @public
 */
export interface PeriodRange {
  /**
   * The maximum date of the reporting period.
   */
  maxDate: string;

  /**
   * The minimum date of the reporting period.
   */
  minDate: string;
}

/**
 * Represents information about a team.
 *
 * @public
 */
export interface TeamInfo {
  /**
   * The unique identifier of the team.
   */
  id: number;

  /**
   * The slug of the team, used for URL-friendly identifiers.
   */
  slug: string;

  /**
   * The name of the team.
   */
  name: string;
}

/**
 * Thin wrapper for the CopilotMetrics type
 * @public
 */
export interface CopilotLanguages {
  /**
   * The language name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * total number of code suggestions
   */
  total_code_suggestions: number;
  /**
   * total number of code acceptances
   */
  total_code_acceptances: number;
  /**
   * total number of code lines suggested
   */
  total_code_lines_suggested: number;
  /**
   * total number of code lines accepted
   */
  total_code_lines_accepted: number;
}

/**
 * Thin wrapper for the CopilotMetrics type
 * @public
 */
export interface CopilotModels {
  /**
   * The model name
   */
  name: string;
  /**
   * List of languages this model was used in
   */
  languages: CopilotLanguages[];
}

/**
 * Thin wrapper for the CopilotMetrics type
 * @public
 */
export interface CopilotEditors {
  /**
   * The editor name
   */
  name: string;
  /**
   * List of models this editor was used in
   */
  models: CopilotModels[];
}

/**
 * Thin wrapper for the CopilotMetrics type
 * @public
 */
export interface CopilotIdeCodeCompletions {
  editors: CopilotEditors[];
}

/**
 * Represents the metrics data for copilot
 *
 * Not entirely implemented. Only the stuff we needed to satisfy #2828
 *
 * https://docs.github.com/en/rest/copilot/copilot-metrics?apiVersion=2022-11-28
 *
 * @public
 */
export interface CopilotMetrics {
  /**
   * The date for the metrics reported.
   */
  date: string;

  /**
   * The total number of active users.
   */
  total_active_users: number;

  /**
   * The total number of engaged users.
   */
  total_engaged_users: number;

  /**
   * The total number of code suggestions for IDE users.
   */
  copilot_ide_code_completions: CopilotIdeCodeCompletions;
}
