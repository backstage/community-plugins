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
  V2CustomizationMetricRow,
  V2DailyTotal,
  V2MetricsByFeatureRow,
  V2MetricsByIdeRow,
  V2MetricsByCliRow,
  V2MetricsByLanguageFeatureRow,
  V2MetricsByModelFeatureRow,
  V2MetricsByLanguageModelRow,
  V2MetricsByVscodeAgentRow,
  V2UserMetricRow,
  V2UserTeamRow,
  MetricsScope,
} from '@backstage-community/plugin-copilot-common';
import { UserBreakdownData } from '../utils/reportParser';

export type CostCenterCustomizationMetricRow = {
  day: string;
  metrics_type: MetricsScope;
  entity_id: string;
  cost_center_id: string;
  without_cost_center: boolean;
  category: string;
  item_name: string;
  interaction_count: number;
};

export interface TeamAggregates {
  dailyTotals: V2DailyTotal[];
  byFeature: V2MetricsByFeatureRow[];
  byIde: V2MetricsByIdeRow[];
  byLanguageFeature: V2MetricsByLanguageFeatureRow[];
  byModelFeature: V2MetricsByModelFeatureRow[];
  byLanguageModel: V2MetricsByLanguageModelRow[];
  customizationMetrics: V2CustomizationMetricRow[];
  costCenterCustomizationMetrics: CostCenterCustomizationMetricRow[];
  byCli?: V2MetricsByCliRow[];
  byVscodeAgent?: V2MetricsByVscodeAgentRow[];
}

type MetricGroup = {
  teamSlug: string;
  costCenterId?: string;
  withoutCostCenter?: boolean;
  userIds: Set<number>;
};

function emptyAggregates(): TeamAggregates {
  return {
    dailyTotals: [],
    byFeature: [],
    byIde: [],
    byLanguageFeature: [],
    byModelFeature: [],
    byLanguageModel: [],
    customizationMetrics: [],
    costCenterCustomizationMetrics: [],
  };
}

function getCostCenterAggregateScope(group: MetricGroup) {
  if (group.costCenterId === undefined && !group.withoutCostCenter) {
    return undefined;
  }
  return {
    cost_center_id: group.costCenterId ?? '',
    without_cost_center: group.withoutCostCenter ?? false,
  };
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

  const groups = [...usersByTeam.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([teamSlug, userIds]) => ({ teamSlug, userIds }));

  return aggregateMetricsByGroups(
    userMetrics,
    userBreakdowns,
    day,
    metricsType,
    entityId,
    groups,
  );
}

/**
 * Aggregate user metrics by cost center, keeping unassigned users in a
 * distinct scope from every real cost-center ID.
 */
export function aggregateCostCenterMetrics(
  userMetrics: V2UserMetricRow[],
  userBreakdowns: UserBreakdownData[],
  costCenterByUserId: ReadonlyMap<number, string>,
  day: string,
  metricsType: MetricsScope,
  entityId: string,
  unassignedComplete: boolean = true,
): TeamAggregates & Pick<Required<TeamAggregates>, 'byCli' | 'byVscodeAgent'> {
  const filteredUserMetrics = userMetrics.filter(
    row =>
      row.day === day &&
      row.metrics_type === metricsType &&
      row.entity_id === entityId,
  );
  if (!filteredUserMetrics.length) {
    return {
      ...emptyAggregates(),
      byCli: [],
      byVscodeAgent: [],
    };
  }

  const usersByCostCenter = new Map<string, Set<number>>();
  const unassignedUsers = new Set<number>();
  for (const metric of filteredUserMetrics) {
    const costCenterId = costCenterByUserId.get(metric.user_id);
    if (costCenterId === undefined) {
      unassignedUsers.add(metric.user_id);
      continue;
    }
    const users = usersByCostCenter.get(costCenterId) ?? new Set<number>();
    users.add(metric.user_id);
    usersByCostCenter.set(costCenterId, users);
  }

  const groups: MetricGroup[] = [...usersByCostCenter.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([costCenterId, userIds]) => ({
      teamSlug: '',
      costCenterId,
      userIds,
    }));
  if (unassignedComplete && unassignedUsers.size > 0) {
    groups.push({
      teamSlug: '',
      costCenterId: '',
      withoutCostCenter: true,
      userIds: unassignedUsers,
    });
  }

  // Per-user CLI and VS Code totals are not persisted for backfill readbacks.
  return {
    ...aggregateMetricsByGroups(
      userMetrics,
      userBreakdowns,
      day,
      metricsType,
      entityId,
      groups,
    ),
    byCli: [],
    byVscodeAgent: [],
  };
}

function aggregateMetricsByGroups(
  userMetrics: V2UserMetricRow[],
  userBreakdowns: UserBreakdownData[],
  day: string,
  metricsType: MetricsScope,
  entityId: string,
  groups: MetricGroup[],
): TeamAggregates {
  const filteredUserMetrics = userMetrics.filter(
    row =>
      row.day === day &&
      row.metrics_type === metricsType &&
      row.entity_id === entityId,
  );
  if (!filteredUserMetrics.length) {
    return emptyAggregates();
  }

  const metricsByUserId = new Map<number, V2UserMetricRow>();
  for (const metric of filteredUserMetrics) {
    metricsByUserId.set(metric.user_id, metric);
  }

  const breakdownsByUserId = new Map<number, UserBreakdownData>();
  for (const bd of userBreakdowns) {
    breakdownsByUserId.set(bd.user_id, bd);
  }

  const dailyTotals: V2DailyTotal[] = [];
  const byFeature: V2MetricsByFeatureRow[] = [];
  const byIde: V2MetricsByIdeRow[] = [];
  const byLanguageFeature: V2MetricsByLanguageFeatureRow[] = [];
  const byModelFeature: V2MetricsByModelFeatureRow[] = [];
  const byLanguageModel: V2MetricsByLanguageModelRow[] = [];
  const customizationMetrics: V2CustomizationMetricRow[] = [];
  const costCenterCustomizationMetrics: CostCenterCustomizationMetricRow[] = [];

  for (const group of groups) {
    const { teamSlug, costCenterId, userIds } = group;
    const costCenterScope = getCostCenterAggregateScope(group);
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
    let cliUsers = 0;
    let vscodeAgentUsers = 0;
    let aiCreditsUsedSum = 0;

    // Aggregation maps for breakdown dimensions
    const featureMap = new Map<string, V2MetricsByFeatureRow>();
    const ideMap = new Map<string, V2MetricsByIdeRow>();
    const langFeatureMap = new Map<string, V2MetricsByLanguageFeatureRow>();
    const modelFeatureMap = new Map<string, V2MetricsByModelFeatureRow>();
    const langModelMap = new Map<string, V2MetricsByLanguageModelRow>();
    const customizationMap = new Map<
      string,
      { category: string; item_name: string; interaction_count: number }
    >();

    for (const userId of userIds) {
      const metric = metricsByUserId.get(userId);
      if (!metric) {
        continue;
      }

      activeUsers.add(userId);
      if (metric.used_agent) agentUsers++;
      if (metric.used_chat) chatUsers++;
      if (costCenterId !== undefined && metric.used_cli) cliUsers++;
      if (metric.used_vscode_agent) vscodeAgentUsers++;
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
            ...costCenterScope,
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
            ...costCenterScope,
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
            ...costCenterScope,
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
            ...costCenterScope,
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
            ...costCenterScope,
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

      for (const customization of bd.customizations) {
        const customizationKey = `${customization.category}\u0000${customization.item_name}`;
        const existingCustomization = customizationMap.get(customizationKey);
        if (existingCustomization) {
          existingCustomization.interaction_count +=
            customization.interaction_count;
        } else {
          customizationMap.set(customizationKey, {
            category: customization.category,
            item_name: customization.item_name,
            interaction_count: customization.interaction_count,
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
      ...costCenterScope,
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
      ...(costCenterId === undefined
        ? {}
        : { daily_active_cli_users: cliUsers }),
      daily_active_vscode_agent_users: vscodeAgentUsers,
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
    for (const customization of customizationMap.values()) {
      if (!costCenterScope) {
        customizationMetrics.push({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          scope: 'team',
          team_slug: teamSlug,
          user_id: 0,
          user_login: '',
          ...customization,
        });
      } else {
        costCenterCustomizationMetrics.push({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          ...costCenterScope,
          ...customization,
        });
      }
    }
  }

  return {
    dailyTotals,
    byFeature,
    byIde,
    byLanguageFeature,
    byModelFeature,
    byLanguageModel,
    customizationMetrics,
    costCenterCustomizationMetrics,
  };
}
