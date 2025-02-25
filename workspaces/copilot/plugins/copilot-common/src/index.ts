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
 * This used to be part of an API exposed by GitHub (/usage),
 * that was deprecated. At some point we should fully convert to the new CopilotMetrics way.
 * Until the frontend is fully converted, we need to keep this type, since the new metrics converts its result to this type.
 *
 * @public
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
 * This represents data from the old usage API
 * Until the frontend is fully converted to the new CopilotMetrics way,
 * we need to keep this type, since the new metrics converts its result to this type.
 *
 * @public
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
 * Represents the metrics data for copilot ide language metrics
 *
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
 * Represents the metrics data for copilot ide languages
 *
 * @public
 */
export interface CopilotIdeLanguages {
  /**
   * The language name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
}

/**
 * Represents the metrics data for copilot models
 *
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
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
}

/**
 * Represents the metrics data for copilot ide chat models
 *
 * @public
 */
export interface CopilotChatModels {
  /**
   * The model name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * Total number of chat turns
   */
  total_chats: number;
  /**
   * Total number of chat copy events
   */
  total_chat_copy_events: number;
  /**
   * Total number of chat insertion events
   */
  total_chat_insertion_events: number;
}

/**
 * Represents the metrics data for copilot ide chats
 *
 * @public
 */
export interface CopilotChats {
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of editors
   */
  editors: CopilotChatEditors[];
}

/**
 * Represents the metrics data for copilot chat editors
 *
 * @public
 */
export interface CopilotChatEditors {
  /**
   * The Editor name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of models used in this editor
   */
  models: CopilotChatModels[];
}

/**
 * Represents the metrics data for copilot github chats
 *
 * @public
 */
export interface DotcomChat {
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of models used in dotcom chat
   */
  models: DotcomChatModels[];
}

/**
 * Represents the metrics data for copilot models
 *
 * @public
 */
export interface DotcomChatModels {
  /**
   * The model name
   */
  name: string;
  /**
   * The number of engaged users
   */
  total_engaged_users: number;
  /**
   * Total number of chat turns
   */
  total_chats: number;
  /**
   * Indicates if it is a custom model
   */
  is_custom_model: boolean;
}

/**
 * Represents the metrics data for copilot editors
 *
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
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
}

/**
 * Represents the metrics data for copilot ide completions
 *
 * @public
 */
export interface CopilotIdeCodeCompletions {
  /**
   * List of editors
   */
  editors: CopilotEditors[];
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of languages used in IDE
   */
  languages: CopilotIdeLanguages[];
}

/**
 * Represents the metrics data for copilot pull requests
 *
 * @public
 */
export interface DotcomPullRequests {
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of repositories
   */
  repositories: CopilotRepository[];
}

/**
 * Represents the metrics data for copilot repos
 *
 * @public
 */
export interface CopilotRepository {
  /**
   * The repository name
   */
  name: string;
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
  /**
   * List of models used in this repository
   */
  models: CopilotRepositoryModels[];
}

/**
 * Represents the metrics data for copilot repo models
 *
 * @public
 */
export interface CopilotRepositoryModels {
  /**
   * The model name
   */
  name: string;
  /**
   * The total number of engaged users
   */
  total_engaged_users: number;
  /**
   * The total number of PR summaries created
   */
  total_pr_summaries_created: number;
  /**
   * Indicates if it is a custom model
   */
  is_custom_model: boolean;
  /**
   * The date when the custom model was trained
   */
  custom_model_training_date: string;
}

/**
 * Represents the metrics data for copilot
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

  /**
   * The total number of chats for IDE users.
   */
  copilot_ide_chat: CopilotChats;

  /**
   * The total number of chats for dotcom users.
   */
  copilot_dotcom_chat: DotcomChat;

  /**
   * The total number of pull requests for dotcom users.
   */
  copilot_dotcom_pull_requests: DotcomPullRequests;
}
