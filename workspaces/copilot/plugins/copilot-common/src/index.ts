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
 * @public @deprecated Should not be used in new code.
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
export type MetricsType = MetricsScope;

/**
 * Represents a detailed breakdown of metrics by language and editor.
 * This represents data from the old usage API
 * Until the frontend is fully converted to the new CopilotMetrics way,
 * we need to keep this type, since the new metrics converts its result to this type.
 *
 * @public @deprecated Should not be used in new code.
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

/**
 * Represents the engagement metrics for copilot.
 *
 * @public
 */
export interface EngagementMetrics {
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
   * The total number of users who have used Copilot.
   */
  total_active_users: number;

  /**
   * The total number of users who have meaningfully interacted with Copilot features.
   */
  total_engaged_users: number;

  /**
   * The number of users who have engaged with IDE code completions.
   */
  ide_completions_engaged_users: number;

  /**
   * The number of users who have engaged with IDE chat features.
   */
  ide_chats_engaged_users: number;

  /**
   * The number of users who have engaged with GitHub.com chat features.
   */
  dotcom_chats_engaged_users: number;

  /**
   * The number of users who have engaged with pull request features.
   */
  dotcom_prs_engaged_users: number;
}

/**
 * Represents the assignee for a copilot seat
 *
 * @public
 */
export interface CopilotAssignee {
  /**
   * The unique identifier of the assignee.
   */
  id: number;
  /**
   * The login username of the assignee.
   */
  login: string;
}

/**
 * Represents the assigning team for a copilot seat
 *
 * @public
 */
export interface CopilotAssigningTeam {
  /**
   * The unique identifier of the team.
   */
  id: number;
  /**
   * The slug of the team, used for URL-friendly identifiers.
   */
  slug: string;
}
/**
 * Represents the a seat for copilot
 *
 * @public
 */
export interface CopilotSeat {
  /**
   * The date when the seat was created.
   */
  created_at: string;
  /**
   * The date when the seat was last updated.
   */
  updated_at: string;
  /**
   * The date when the seat was last active.
   */
  last_activity_at: string;
  /**
   * The editor used in the last activity.
   */
  last_activity_editor: string;
  /**
   * The type of plan for this seat.
   */
  plan_type: string;
  /**
   * The user assigned to this seat.
   */
  assignee: CopilotAssignee;
  /**
   * The team that assigned this seat.
   */
  assigning_team: CopilotAssigningTeam;
}
/**
 * Represents the base seat data for copilot
 *
 * @public
 */
export interface CopilotSeats {
  /**
   * The total number of seats available.
   */
  total_seats: number;
  /**
   * The list of individual seats.
   */
  seats: CopilotSeat[];
}
/**
 * Represents the seat analysis data for copilot
 *
 * @public
 */
export interface SeatAnalysis {
  /**
   * The date for the analysis.
   */
  day: string;
  /**
   * The type of the seat data (enterprise or organization).
   */
  type: MetricsType;
  /**
   * The name of the team for this analysis.
   */
  team_name: string;
  /**
   * The total number of seats available.
   */
  total_seats: number;
  /**
   * The number of seats that have never been used.
   */
  seats_never_used: number;
  /**
   * The number of seats inactive for 7 days.
   */
  seats_inactive_7_days: number;
  /**
   * The number of seats inactive for 14 days.
   */
  seats_inactive_14_days: number;
  /**
   * The number of seats inactive for 28 days.
   */
  seats_inactive_28_days: number;
}

// ============================================================
// V2 Types — New GitHub Copilot Metrics API (2026-03-10)
// ============================================================

/**
 * Envelope returned by the new GitHub report API.
 * Contains signed download URLs that expire — fetch immediately.
 * @public
 */
export interface ReportEnvelope {
  download_links: string[];
  report_day?: string;
  report_start_day?: string;
  report_end_day?: string;
}

/** @public */
export interface V2PrMetrics {
  total_created: number;
  total_merged: number;
  total_reviewed: number;
  total_created_by_copilot: number;
  total_merged_created_by_copilot: number;
  total_merged_reviewed_by_copilot: number;
  total_reviewed_by_copilot: number;
  total_suggestions: number;
  total_applied_suggestions: number;
  total_copilot_suggestions: number;
  total_copilot_applied_suggestions: number;
  median_minutes_to_merge?: number;
  median_minutes_to_merge_copilot_authored?: number;
  median_minutes_to_merge_copilot_reviewed?: number;
}

/** @public */
export interface V2MetricsByFeature {
  feature: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count?: number;
}

/** @public */
export interface V2MetricsByIde {
  ide: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count?: number;
}

/** @public */
export interface V2MetricsByLanguageFeature {
  language: string;
  feature: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
}

/** @public */
export interface V2CliTotals {
  prompt_count: number;
  request_count: number;
  session_count: number;
  token_usage?: {
    avg_tokens_per_request: number;
    output_tokens_sum: number;
    prompt_tokens_sum: number;
  };
}

/** @public */
export interface V2EnterpriseDayTotal {
  day: string;
  enterprise_id: string;
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  daily_active_cli_users?: number;
  monthly_active_agent_users?: number;
  monthly_active_chat_users?: number;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
  pull_requests?: V2PrMetrics;
  totals_by_cli?: V2CliTotals;
  totals_by_feature?: V2MetricsByFeature[];
  totals_by_ide?: V2MetricsByIde[];
  totals_by_language_feature?: V2MetricsByLanguageFeature[];
}

/** @public */
export interface V2EnterpriseDocument {
  enterprise_id: string;
  report_start_day: string;
  report_end_day: string;
  day_totals: V2EnterpriseDayTotal[];
}

/** @public */
export interface V2UserMetric {
  user_id: number;
  user_login: string;
  day: string;
  enterprise_id?: string;
  organization_id?: string;
  used_agent: boolean;
  used_chat: boolean;
  used_cli: boolean;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
  /**
   * Total AI credits consumed by the user for the day.
   * Added by GitHub on 2026-06-19. Only present in the user-level report.
   */
  ai_credits_used?: number;
  totals_by_feature?: V2MetricsByFeature[];
  totals_by_ide?: V2MetricsByIde[];
  totals_by_language_feature?: V2MetricsByLanguageFeature[];
  totals_by_model_feature?: Array<{
    model: string;
    feature: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
  }>;
  totals_by_language_model?: Array<{
    language: string;
    model: string;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
  }>;
}

/** @public */
export interface V2UserTeam {
  user_id: number;
  user_login: string;
  day: string;
  enterprise_id?: string;
  organization_id?: string;
  team_id: number;
  slug: string;
}

/** @public */
export interface V2DailyTotal {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  team_slug: string;
  daily_active_users: number;
  /**
   * Weekly rolling window active users count.
   * Only available for organization/enterprise-level aggregates.
   * Undefined for team-level aggregates (which use daily user data only).
   */
  weekly_active_users?: number;
  /**
   * Monthly rolling window active users count.
   * Only available for organization/enterprise-level aggregates.
   * Undefined for team-level aggregates (which use daily user data only).
   */
  monthly_active_users?: number;
  daily_active_cli_users?: number;
  monthly_active_agent_users?: number;
  monthly_active_chat_users?: number;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
  /**
   * Total AI credits consumed across all users in the aggregate, summed from
   * per-user data. Added by GitHub on 2026-06-19. Only populated for
   * team-level rows (org/enterprise reports do not expose AI credits).
   */
  total_ai_credits_used?: number;
}

/** @public */
export interface V2PrMetricsRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  team_slug: string;
  total_created: number;
  total_merged: number;
  total_reviewed: number;
  total_created_by_copilot: number;
  total_merged_created_by_copilot: number;
  total_merged_reviewed_by_copilot: number;
  total_reviewed_by_copilot: number;
  total_suggestions: number;
  total_applied_suggestions: number;
  total_copilot_suggestions: number;
  total_copilot_applied_suggestions: number;
  median_minutes_to_merge?: number;
  median_minutes_to_merge_copilot_authored?: number;
  median_minutes_to_merge_copilot_reviewed?: number;
}

/** @public */
export interface V2MetricsByFeatureRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  team_slug: string;
  feature: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
}

/** @public */
export interface V2MetricsByIdeRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  team_slug: string;
  ide: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
}

/** @public */
export interface V2MetricsByLanguageFeatureRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  team_slug: string;
  language: string;
  feature: string;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
}

/** @public */
export interface V2MetricsByModelFeatureRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  team_slug: string;
  model_id: string;
  feature: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
}

/** @public */
export interface V2MetricsByLanguageModelRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  team_slug: string;
  language: string;
  model_id: string;
  /** @deprecated use code_generation_activity_count */
  request_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
}

/** @public */
export interface V2MetricsByCliRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  team_slug: string;
  prompt_count: number;
  request_count: number;
  session_count: number;
  avg_tokens_per_request: number;
  output_tokens_sum: number;
  prompt_tokens_sum: number;
}

/** @public */
export interface V2UserMetricRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  user_id: number;
  user_login: string;
  used_agent: boolean;
  used_chat: boolean;
  used_cli: boolean;
  code_acceptance_activity_count: number;
  code_generation_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  user_initiated_interaction_count: number;
  /**
   * Total AI credits consumed by the user for the day.
   * Added by GitHub on 2026-06-19. Only present in the user-level report.
   */
  ai_credits_used?: number;
}

/** @public */
export interface V2UserTeamRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  user_id: number;
  user_login: string;
  team_id: number;
  team_slug: string;
}

/** @public */
export interface V2IngestionLogRow {
  id?: number;
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  ingested_at?: string;
  status: 'success' | 'error' | 'partial';
  components_loaded: string; // JSON array stored as string for SQLite compat: e.g. '["totals","users","teams"]'
  error_message?: string | null;
  source: 'scheduled' | 'backfill' | 'manual';
}

/** @public */
export interface V2BackfillStatus {
  day: string;
  metrics_type: string;
  entity_id: string;
  status: string;
  components_loaded: string[];
  error_message?: string | null;
  ingested_at?: string;
  source: string;
}

/**
 * Aggregated dashboard data returned by the /v2/dashboard BFF endpoint.
 * Contains all chart data needed for the V2 dashboard in a single response.
 *
 * @public
 */
export interface V2DashboardData {
  daily: V2DailyTotal[];
  byFeature: V2MetricsByFeatureRow[];
  byLanguage: V2MetricsByLanguageFeatureRow[];
  byModelFeature: V2MetricsByModelFeatureRow[];
  byLanguageModel: V2MetricsByLanguageModelRow[];
  prMetrics: V2PrMetricsRow[];
}

/**
 * Represents the scope of metrics data, either at the enterprise level or organization level.
 *
 * @public
 */
export type MetricsScope = 'enterprise' | 'organization';
