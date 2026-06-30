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
  V2UserTeamRow,
  MetricsScope,
} from '@backstage-community/plugin-copilot-common';
import { UserBreakdownData } from '../utils/reportParser';

export interface TeamAggregates {
  dailyTotals: V2DailyTotal[];
  byFeature: V2MetricsByFeatureRow[];
  byIde: V2MetricsByIdeRow[];
  byLanguageFeature: V2MetricsByLanguageFeatureRow[];
  byModelFeature: V2MetricsByModelFeatureRow[];
  byLanguageModel: V2MetricsByLanguageModelRow[];
}

/**
 * Aggregate user metrics by team for a given day.
 * Joins userMetrics with userTeams to produce team-level aggregates.
 * One output row per (day, metrics_type, entity_id, team_slug).
 */
export function aggregateTeamMetrics(
  userMetrics: V2UserMetricRow[],
  userTeams: V2UserTeamRow[],
  userBreakdowns: UserBreakdownData[],
  day: string,
  metricsType: MetricsScope,
  entityId: string,
): TeamAggregates {
  const filteredUserMetrics = userMetrics.filter(
    row =>
      row.day === day &&
      row.metrics_type === metricsType &&
      row.entity_id === entityId,
  );

  if (!filteredUserMetrics.length) {
    return {
      dailyTotals: [],
      byFeature: [],
      byIde: [],
      byLanguageFeature: [],
      byModelFeature: [],
      byLanguageModel: [],
    };
  }

  const metricsByUserId = new Map<number, V2UserMetricRow>();
  for (const metric of filteredUserMetrics) {
    metricsByUserId.set(metric.user_id, metric);
  }

  const breakdownsByUserId = new Map<number, UserBreakdownData>();
  for (const bd of userBreakdowns) {
    breakdownsByUserId.set(bd.user_id, bd);
  }

  const usersByTeam = new Map<string, Set<number>>();
  const filteredUserTeams = userTeams.filter(
    row =>
      row.day === day &&
      row.metrics_type === metricsType &&
      row.entity_id === entityId,
  );

  for (const row of filteredUserTeams) {
    const teamSlug = row.team_slug;
    if (!usersByTeam.has(teamSlug)) {
      usersByTeam.set(teamSlug, new Set<number>());
    }
    usersByTeam.get(teamSlug)?.add(row.user_id);
  }

  const dailyTotals: V2DailyTotal[] = [];
  const byFeature: V2MetricsByFeatureRow[] = [];
  const byIde: V2MetricsByIdeRow[] = [];
  const byLanguageFeature: V2MetricsByLanguageFeatureRow[] = [];
  const byModelFeature: V2MetricsByModelFeatureRow[] = [];
  const byLanguageModel: V2MetricsByLanguageModelRow[] = [];

  for (const [teamSlug, userIds] of [...usersByTeam.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    let locAddedSum = 0;
    let locDeletedSum = 0;
    let locSuggestedToAddSum = 0;
    let locSuggestedToDeleteSum = 0;
    let codeAcceptanceActivityCount = 0;
    let codeGenerationActivityCount = 0;
    let userInitiatedInteractionCount = 0;

    const activeUsers = new Set<number>();
    let agentUsers = 0;
    let chatUsers = 0;
    let aiCreditsUsedSum = 0;

    // Aggregation maps for breakdown dimensions
    const featureMap = new Map<string, V2MetricsByFeatureRow>();
    const ideMap = new Map<string, V2MetricsByIdeRow>();
    const langFeatureMap = new Map<string, V2MetricsByLanguageFeatureRow>();
    const modelFeatureMap = new Map<string, V2MetricsByModelFeatureRow>();
    const langModelMap = new Map<string, V2MetricsByLanguageModelRow>();

    for (const userId of userIds) {
      const metric = metricsByUserId.get(userId);
      if (!metric) {
        continue;
      }

      activeUsers.add(userId);
      if (metric.used_agent) agentUsers++;
      if (metric.used_chat) chatUsers++;
      locAddedSum += metric.loc_added_sum;
      locDeletedSum += metric.loc_deleted_sum;
      locSuggestedToAddSum += metric.loc_suggested_to_add_sum;
      locSuggestedToDeleteSum += metric.loc_suggested_to_delete_sum;
      codeAcceptanceActivityCount += metric.code_acceptance_activity_count;
      codeGenerationActivityCount += metric.code_generation_activity_count;
      userInitiatedInteractionCount += metric.user_initiated_interaction_count;
      aiCreditsUsedSum += metric.ai_credits_used ?? 0;

      const bd = breakdownsByUserId.get(userId);
      if (!bd) continue;

      for (const f of bd.byFeature) {
        const existing = featureMap.get(f.feature);
        if (existing) {
          existing.user_initiated_interaction_count +=
            f.user_initiated_interaction_count;
          existing.code_generation_activity_count +=
            f.code_generation_activity_count;
          existing.code_acceptance_activity_count +=
            f.code_acceptance_activity_count;
          existing.loc_added_sum += f.loc_added_sum;
          existing.loc_deleted_sum += f.loc_deleted_sum;
          existing.loc_suggested_to_add_sum += f.loc_suggested_to_add_sum;
          existing.loc_suggested_to_delete_sum += f.loc_suggested_to_delete_sum;
        } else {
          featureMap.set(f.feature, {
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: teamSlug,
            feature: f.feature,
            user_initiated_interaction_count:
              f.user_initiated_interaction_count,
            code_generation_activity_count: f.code_generation_activity_count,
            code_acceptance_activity_count: f.code_acceptance_activity_count,
            loc_added_sum: f.loc_added_sum,
            loc_deleted_sum: f.loc_deleted_sum,
            loc_suggested_to_add_sum: f.loc_suggested_to_add_sum,
            loc_suggested_to_delete_sum: f.loc_suggested_to_delete_sum,
          });
        }
      }

      for (const i of bd.byIde) {
        const existing = ideMap.get(i.ide);
        if (existing) {
          existing.user_initiated_interaction_count +=
            i.user_initiated_interaction_count;
          existing.code_generation_activity_count +=
            i.code_generation_activity_count;
          existing.code_acceptance_activity_count +=
            i.code_acceptance_activity_count;
          existing.loc_added_sum += i.loc_added_sum;
          existing.loc_deleted_sum += i.loc_deleted_sum;
          existing.loc_suggested_to_add_sum += i.loc_suggested_to_add_sum;
          existing.loc_suggested_to_delete_sum += i.loc_suggested_to_delete_sum;
        } else {
          ideMap.set(i.ide, {
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: teamSlug,
            ide: i.ide,
            user_initiated_interaction_count:
              i.user_initiated_interaction_count,
            code_generation_activity_count: i.code_generation_activity_count,
            code_acceptance_activity_count: i.code_acceptance_activity_count,
            loc_added_sum: i.loc_added_sum,
            loc_deleted_sum: i.loc_deleted_sum,
            loc_suggested_to_add_sum: i.loc_suggested_to_add_sum,
            loc_suggested_to_delete_sum: i.loc_suggested_to_delete_sum,
          });
        }
      }

      for (const lf of bd.byLanguageFeature) {
        const key = `${lf.language}::${lf.feature}`;
        const existing = langFeatureMap.get(key);
        if (existing) {
          existing.code_generation_activity_count +=
            lf.code_generation_activity_count;
          existing.code_acceptance_activity_count +=
            lf.code_acceptance_activity_count;
          existing.loc_added_sum += lf.loc_added_sum;
          existing.loc_deleted_sum += lf.loc_deleted_sum;
          existing.loc_suggested_to_add_sum += lf.loc_suggested_to_add_sum;
          existing.loc_suggested_to_delete_sum +=
            lf.loc_suggested_to_delete_sum;
        } else {
          langFeatureMap.set(key, {
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: teamSlug,
            language: lf.language,
            feature: lf.feature,
            code_generation_activity_count: lf.code_generation_activity_count,
            code_acceptance_activity_count: lf.code_acceptance_activity_count,
            loc_added_sum: lf.loc_added_sum,
            loc_deleted_sum: lf.loc_deleted_sum,
            loc_suggested_to_add_sum: lf.loc_suggested_to_add_sum,
            loc_suggested_to_delete_sum: lf.loc_suggested_to_delete_sum,
          });
        }
      }

      for (const mf of bd.byModelFeature) {
        const key = `${mf.model_id}::${mf.feature}`;
        const existing = modelFeatureMap.get(key);
        if (existing) {
          existing.user_initiated_interaction_count +=
            mf.user_initiated_interaction_count;
          existing.code_generation_activity_count +=
            mf.code_generation_activity_count;
          existing.code_acceptance_activity_count +=
            mf.code_acceptance_activity_count;
          existing.loc_added_sum += mf.loc_added_sum;
          existing.loc_deleted_sum += mf.loc_deleted_sum;
          existing.loc_suggested_to_add_sum += mf.loc_suggested_to_add_sum;
          existing.loc_suggested_to_delete_sum +=
            mf.loc_suggested_to_delete_sum;
        } else {
          modelFeatureMap.set(key, {
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: teamSlug,
            model_id: mf.model_id,
            feature: mf.feature,
            user_initiated_interaction_count:
              mf.user_initiated_interaction_count,
            code_generation_activity_count: mf.code_generation_activity_count,
            code_acceptance_activity_count: mf.code_acceptance_activity_count,
            loc_added_sum: mf.loc_added_sum,
            loc_deleted_sum: mf.loc_deleted_sum,
            loc_suggested_to_add_sum: mf.loc_suggested_to_add_sum,
            loc_suggested_to_delete_sum: mf.loc_suggested_to_delete_sum,
          });
        }
      }

      for (const lm of bd.byLanguageModel) {
        const key = `${lm.language}::${lm.model_id}`;
        const existing = langModelMap.get(key);
        if (existing) {
          existing.request_count += lm.request_count;
          existing.code_generation_activity_count +=
            lm.code_generation_activity_count;
          existing.code_acceptance_activity_count +=
            lm.code_acceptance_activity_count;
          existing.loc_added_sum += lm.loc_added_sum;
          existing.loc_deleted_sum += lm.loc_deleted_sum;
          existing.loc_suggested_to_add_sum += lm.loc_suggested_to_add_sum;
          existing.loc_suggested_to_delete_sum +=
            lm.loc_suggested_to_delete_sum;
        } else {
          langModelMap.set(key, {
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: teamSlug,
            language: lm.language,
            model_id: lm.model_id,
            request_count: lm.request_count,
            code_generation_activity_count: lm.code_generation_activity_count,
            code_acceptance_activity_count: lm.code_acceptance_activity_count,
            loc_added_sum: lm.loc_added_sum,
            loc_deleted_sum: lm.loc_deleted_sum,
            loc_suggested_to_add_sum: lm.loc_suggested_to_add_sum,
            loc_suggested_to_delete_sum: lm.loc_suggested_to_delete_sum,
          });
        }
      }
    }

    if (!activeUsers.size) {
      continue;
    }

    dailyTotals.push({
      day,
      metrics_type: metricsType,
      entity_id: entityId,
      team_slug: teamSlug,
      daily_active_users: activeUsers.size,
      // For team-level aggregates, we don't have rolling window data.
      // V2UserMetricRow only contains daily metrics; per-user weekly/monthly
      // aggregates are not available from the GitHub Copilot Metrics API.
      // The UI should handle undefined weekly/monthly values gracefully
      // (e.g., by not rendering weekly charts for team-scoped views).
      weekly_active_users: undefined,
      monthly_active_users: undefined,
      monthly_active_agent_users: agentUsers,
      monthly_active_chat_users: chatUsers,
      code_acceptance_activity_count: codeAcceptanceActivityCount,
      code_generation_activity_count: codeGenerationActivityCount,
      loc_added_sum: locAddedSum,
      loc_deleted_sum: locDeletedSum,
      loc_suggested_to_add_sum: locSuggestedToAddSum,
      loc_suggested_to_delete_sum: locSuggestedToDeleteSum,
      user_initiated_interaction_count: userInitiatedInteractionCount,
      total_ai_credits_used: aiCreditsUsedSum,
    });

    byFeature.push(...featureMap.values());
    byIde.push(...ideMap.values());
    byLanguageFeature.push(...langFeatureMap.values());
    byModelFeature.push(...modelFeatureMap.values());
    byLanguageModel.push(...langModelMap.values());
  }

  return {
    dailyTotals,
    byFeature,
    byIde,
    byLanguageFeature,
    byModelFeature,
    byLanguageModel,
  };
}
