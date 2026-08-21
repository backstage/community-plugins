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
import {
  V2DailyTotal,
  V2MetricsByFeatureRow,
  V2MetricsByIdeRow,
  V2MetricsByLanguageFeatureRow,
  V2MetricsByModelFeatureRow,
  V2MetricsByLanguageModelRow,
  V2UserMetricRow,
  V2UserMetricsByFeatureRow,
  V2UserMetricsByIdeRow,
  V2UserMetricsByLanguageFeatureRow,
  V2UserMetricsByModelFeatureRow,
  V2UserMetricsByLanguageModelRow,
} from '@backstage-community/plugin-copilot-common';

/**
 * Adapters that reshape the individually-scoped `V2User*Row` types returned
 * by the `/v2/me/*` API into the structurally-equivalent team/org-scoped
 * `V2*Row` types that the shared chart components (exported from
 * `@backstage-community/plugin-copilot`) expect as props.
 *
 * This lets the individual metrics view reuse the exact same chart
 * implementations as the main dashboard, without duplicating them, while
 * still keeping the underlying data fetched and scoped per-user.
 *
 * Fields that only exist on the team-shaped rows (e.g. `team_slug`) are
 * filled with placeholder values that are never read by the shared charts.
 * Rolling-window "active users" fields (`weekly_active_users`,
 * `monthly_active_users`, etc.) are intentionally left `undefined`, since
 * they represent org-wide concepts that don't apply to a single user; charts
 * that rely on them (e.g. IDEActiveUsersChart) are not reused here.
 */

/** Adapts per-user daily rows for use with daily-total-shaped charts. */
export function toDailyTotals(rows: V2UserMetricRow[]): V2DailyTotal[] {
  return rows.map(row => ({
    day: row.day,
    metrics_type: row.metrics_type,
    entity_id: row.entity_id,
    team_slug: '',
    // The individual was active on this day, by definition of the row
    // existing — represented as a single active user.
    daily_active_users: 1,
    daily_active_cli_users: row.used_cli ? 1 : 0,
    monthly_active_agent_users: row.used_agent ? 1 : 0,
    monthly_active_chat_users: row.used_chat ? 1 : 0,
    code_acceptance_activity_count: row.code_acceptance_activity_count,
    code_generation_activity_count: row.code_generation_activity_count,
    loc_added_sum: row.loc_added_sum,
    loc_deleted_sum: row.loc_deleted_sum,
    loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
    user_initiated_interaction_count: row.user_initiated_interaction_count,
    total_ai_credits_used: row.ai_credits_used,
  }));
}

/** Adapts per-user, per-feature rows for use with feature-shaped charts. */
export function toFeatureRows(
  rows: V2UserMetricsByFeatureRow[],
): V2MetricsByFeatureRow[] {
  return rows.map(row => ({
    day: row.day,
    metrics_type: row.metrics_type,
    entity_id: row.entity_id,
    team_slug: '',
    feature: row.feature,
    code_acceptance_activity_count: row.code_acceptance_activity_count,
    code_generation_activity_count: row.code_generation_activity_count,
    loc_added_sum: row.loc_added_sum,
    loc_deleted_sum: row.loc_deleted_sum,
    loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
    user_initiated_interaction_count: row.user_initiated_interaction_count,
  }));
}

/** Adapts per-user, per-IDE rows for use with IDE-shaped charts. */
export function toIdeRows(rows: V2UserMetricsByIdeRow[]): V2MetricsByIdeRow[] {
  return rows.map(row => ({
    day: row.day,
    metrics_type: row.metrics_type,
    entity_id: row.entity_id,
    team_slug: '',
    ide: row.ide,
    code_acceptance_activity_count: row.code_acceptance_activity_count,
    code_generation_activity_count: row.code_generation_activity_count,
    loc_added_sum: row.loc_added_sum,
    loc_deleted_sum: row.loc_deleted_sum,
    loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
    user_initiated_interaction_count: row.user_initiated_interaction_count,
  }));
}

/**
 * Adapts per-user, per-language/feature rows for use with
 * language/feature-shaped charts.
 */
export function toLanguageFeatureRows(
  rows: V2UserMetricsByLanguageFeatureRow[],
): V2MetricsByLanguageFeatureRow[] {
  return rows.map(row => ({
    day: row.day,
    metrics_type: row.metrics_type,
    entity_id: row.entity_id,
    team_slug: '',
    language: row.language,
    feature: row.feature,
    code_acceptance_activity_count: row.code_acceptance_activity_count,
    code_generation_activity_count: row.code_generation_activity_count,
    loc_added_sum: row.loc_added_sum,
    loc_deleted_sum: row.loc_deleted_sum,
    loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
  }));
}

/**
 * Adapts per-user, per-model/feature rows for use with model/feature-shaped
 * charts.
 */
export function toModelFeatureRows(
  rows: V2UserMetricsByModelFeatureRow[],
): V2MetricsByModelFeatureRow[] {
  return rows.map(row => ({
    day: row.day,
    metrics_type: row.metrics_type,
    entity_id: row.entity_id,
    team_slug: '',
    model_id: row.model_id,
    feature: row.feature,
    user_initiated_interaction_count: row.user_initiated_interaction_count,
    code_generation_activity_count: row.code_generation_activity_count,
    code_acceptance_activity_count: row.code_acceptance_activity_count,
    loc_added_sum: row.loc_added_sum,
    loc_deleted_sum: row.loc_deleted_sum,
    loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
  }));
}

/**
 * Adapts per-user, per-language/model rows for use with
 * language/model-shaped charts.
 */
export function toLanguageModelRows(
  rows: V2UserMetricsByLanguageModelRow[],
): V2MetricsByLanguageModelRow[] {
  return rows.map(row => ({
    day: row.day,
    metrics_type: row.metrics_type,
    entity_id: row.entity_id,
    team_slug: '',
    language: row.language,
    model_id: row.model_id,
    request_count: row.request_count,
    code_generation_activity_count: row.code_generation_activity_count,
    code_acceptance_activity_count: row.code_acceptance_activity_count,
    loc_added_sum: row.loc_added_sum,
    loc_deleted_sum: row.loc_deleted_sum,
    loc_suggested_to_add_sum: row.loc_suggested_to_add_sum,
    loc_suggested_to_delete_sum: row.loc_suggested_to_delete_sum,
  }));
}
