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
  V2EnterpriseDocument,
  V2MetricsByCliRow,
  V2MetricsByFeatureRow,
  V2MetricsByIdeRow,
  V2MetricsByLanguageFeatureRow,
  V2MetricsByModelFeatureRow,
  V2MetricsByLanguageModelRow,
  V2PrMetricsRow,
  V2UserMetric,
  V2UserMetricRow,
  V2UserTeam,
  V2UserTeamRow,
  MetricsScope,
} from '@backstage-community/plugin-copilot-common';

export interface ParsedEnterpriseDocument {
  dailyTotals: V2DailyTotal[];
  prMetrics: V2PrMetricsRow[];
  byFeature: V2MetricsByFeatureRow[];
  byIde: V2MetricsByIdeRow[];
  byLanguageFeature: V2MetricsByLanguageFeatureRow[];
  byModelFeature: V2MetricsByModelFeatureRow[];
  byLanguageModel: V2MetricsByLanguageModelRow[];
  byCli: V2MetricsByCliRow[];
}

/**
 * Per-user breakdown data (in-memory only; aggregated into team rows before DB storage).
 */
export interface UserBreakdownData {
  user_id: number;
  byFeature: Array<{
    feature: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
  }>;
  byIde: Array<{
    ide: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
  }>;
  byLanguageFeature: Array<{
    language: string;
    feature: string;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
  }>;
  byModelFeature: Array<{
    model_id: string;
    feature: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
  }>;
  byLanguageModel: Array<{
    language: string;
    model_id: string;
    request_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
  }>;
}

export interface ParsedUserDocument {
  userMetrics: V2UserMetricRow[];
  userBreakdowns: UserBreakdownData[];
}

function logWarn(message: string): void {
  // eslint-disable-next-line no-console
  console.warn(`[reportParser] ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toStringValue(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/**
 * Parse an enterprise or org report document (array of EnterpriseDocument items).
 * The document is the downloaded JSON from a signed enterprise-1-day or organization-1-day URL.
 */
export function parseEnterpriseDocument(
  doc: unknown,
  metricsType: MetricsScope,
  entityId: string,
): ParsedEnterpriseDocument {
  const parsed: ParsedEnterpriseDocument = {
    dailyTotals: [],
    prMetrics: [],
    byFeature: [],
    byIde: [],
    byLanguageFeature: [],
    byModelFeature: [],
    byLanguageModel: [],
    byCli: [],
  };

  if (!Array.isArray(doc)) {
    logWarn('Expected enterprise document array, received non-array payload.');
    return parsed;
  }

  for (const enterpriseDoc of doc as V2EnterpriseDocument[]) {
    if (!isRecord(enterpriseDoc) || !Array.isArray(enterpriseDoc.day_totals)) {
      logWarn(
        'Skipping enterprise document item with missing day_totals array.',
      );
      continue;
    }

    for (const dayTotal of enterpriseDoc.day_totals) {
      if (!isRecord(dayTotal)) {
        logWarn('Skipping day_totals item because it is not an object.');
        continue;
      }

      const day = toStringValue(dayTotal.day);
      if (!day) {
        logWarn('Skipping day_totals item with missing day field.');
        continue;
      }

      parsed.dailyTotals.push({
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        team_slug: '',
        daily_active_users: toNumber(dayTotal.daily_active_users),
        weekly_active_users: toNumber(dayTotal.weekly_active_users),
        monthly_active_users: toNumber(dayTotal.monthly_active_users),
        daily_active_cli_users: toNumber(dayTotal.daily_active_cli_users),
        monthly_active_agent_users: toNumber(
          dayTotal.monthly_active_agent_users,
        ),
        monthly_active_chat_users: toNumber(dayTotal.monthly_active_chat_users),
        code_acceptance_activity_count: toNumber(
          dayTotal.code_acceptance_activity_count,
        ),
        code_generation_activity_count: toNumber(
          dayTotal.code_generation_activity_count,
        ),
        loc_added_sum: toNumber(dayTotal.loc_added_sum),
        loc_deleted_sum: toNumber(dayTotal.loc_deleted_sum),
        loc_suggested_to_add_sum: toNumber(dayTotal.loc_suggested_to_add_sum),
        loc_suggested_to_delete_sum: toNumber(
          dayTotal.loc_suggested_to_delete_sum,
        ),
        user_initiated_interaction_count: toNumber(
          dayTotal.user_initiated_interaction_count,
        ),
      });

      if (isRecord(dayTotal.pull_requests)) {
        parsed.prMetrics.push({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          team_slug: '',
          total_created: toNumber(dayTotal.pull_requests.total_created),
          total_merged: toNumber(dayTotal.pull_requests.total_merged),
          total_reviewed: toNumber(dayTotal.pull_requests.total_reviewed),
          total_created_by_copilot: toNumber(
            dayTotal.pull_requests.total_created_by_copilot,
          ),
          total_merged_created_by_copilot: toNumber(
            dayTotal.pull_requests.total_merged_created_by_copilot,
          ),
          total_merged_reviewed_by_copilot: toNumber(
            dayTotal.pull_requests.total_merged_reviewed_by_copilot,
          ),
          total_reviewed_by_copilot: toNumber(
            dayTotal.pull_requests.total_reviewed_by_copilot,
          ),
          total_suggestions: toNumber(dayTotal.pull_requests.total_suggestions),
          total_applied_suggestions: toNumber(
            dayTotal.pull_requests.total_applied_suggestions,
          ),
          total_copilot_suggestions: toNumber(
            dayTotal.pull_requests.total_copilot_suggestions,
          ),
          total_copilot_applied_suggestions: toNumber(
            dayTotal.pull_requests.total_copilot_applied_suggestions,
          ),
          median_minutes_to_merge: toNumber(
            dayTotal.pull_requests.median_minutes_to_merge,
          ),
          median_minutes_to_merge_copilot_authored: toNumber(
            dayTotal.pull_requests.median_minutes_to_merge_copilot_authored,
          ),
          median_minutes_to_merge_copilot_reviewed: toNumber(
            dayTotal.pull_requests.median_minutes_to_merge_copilot_reviewed,
          ),
        });
      }

      if (Array.isArray(dayTotal.totals_by_feature)) {
        for (const row of dayTotal.totals_by_feature) {
          if (!isRecord(row) || !toStringValue(row.feature)) {
            logWarn('Skipping totals_by_feature row with missing feature.');
            continue;
          }

          parsed.byFeature.push({
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: '',
            feature: row.feature,
            code_acceptance_activity_count: toNumber(
              row.code_acceptance_activity_count,
            ),
            code_generation_activity_count: toNumber(
              row.code_generation_activity_count,
            ),
            loc_added_sum: toNumber(row.loc_added_sum),
            loc_deleted_sum: toNumber(row.loc_deleted_sum),
            loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
            loc_suggested_to_delete_sum: toNumber(
              row.loc_suggested_to_delete_sum,
            ),
            user_initiated_interaction_count: toNumber(
              row.user_initiated_interaction_count,
            ),
          });
        }
      }

      if (Array.isArray(dayTotal.totals_by_ide)) {
        for (const row of dayTotal.totals_by_ide) {
          if (!isRecord(row) || !toStringValue(row.ide)) {
            logWarn('Skipping totals_by_ide row with missing ide.');
            continue;
          }

          parsed.byIde.push({
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: '',
            ide: row.ide,
            code_acceptance_activity_count: toNumber(
              row.code_acceptance_activity_count,
            ),
            code_generation_activity_count: toNumber(
              row.code_generation_activity_count,
            ),
            loc_added_sum: toNumber(row.loc_added_sum),
            loc_deleted_sum: toNumber(row.loc_deleted_sum),
            loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
            loc_suggested_to_delete_sum: toNumber(
              row.loc_suggested_to_delete_sum,
            ),
            user_initiated_interaction_count: toNumber(
              row.user_initiated_interaction_count,
            ),
          });
        }
      }

      if (Array.isArray(dayTotal.totals_by_language_feature)) {
        for (const row of dayTotal.totals_by_language_feature) {
          if (
            !isRecord(row) ||
            !toStringValue(row.language) ||
            !toStringValue(row.feature)
          ) {
            logWarn(
              'Skipping totals_by_language_feature row with missing language or feature.',
            );
            continue;
          }

          parsed.byLanguageFeature.push({
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: '',
            language: row.language,
            feature: row.feature,
            code_acceptance_activity_count: toNumber(
              row.code_acceptance_activity_count,
            ),
            code_generation_activity_count: toNumber(
              row.code_generation_activity_count,
            ),
            loc_added_sum: toNumber(row.loc_added_sum),
            loc_deleted_sum: toNumber(row.loc_deleted_sum),
            loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
            loc_suggested_to_delete_sum: toNumber(
              row.loc_suggested_to_delete_sum,
            ),
          });
        }
      }

      if (Array.isArray(dayTotal.totals_by_model_feature)) {
        for (const row of dayTotal.totals_by_model_feature) {
          // API uses "model" field name, not "model_id"
          if (
            !isRecord(row) ||
            !toStringValue(row.model) ||
            !toStringValue(row.feature)
          ) {
            logWarn(
              'Skipping totals_by_model_feature row with missing model or feature.',
            );
            continue;
          }
          parsed.byModelFeature.push({
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: '',
            model_id: toStringValue(row.model) as string,
            feature: toStringValue(row.feature) as string,
            user_initiated_interaction_count: toNumber(
              row.user_initiated_interaction_count,
            ),
            code_generation_activity_count: toNumber(
              row.code_generation_activity_count,
            ),
            code_acceptance_activity_count: toNumber(
              row.code_acceptance_activity_count,
            ),
            loc_added_sum: toNumber(row.loc_added_sum),
            loc_deleted_sum: toNumber(row.loc_deleted_sum),
            loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
            loc_suggested_to_delete_sum: toNumber(
              row.loc_suggested_to_delete_sum,
            ),
          });
        }
      }

      if (Array.isArray(dayTotal.totals_by_language_model)) {
        for (const row of dayTotal.totals_by_language_model) {
          // API uses "model" field name, not "model_id"; no "request_count" — use code_generation_activity_count
          if (
            !isRecord(row) ||
            !toStringValue(row.language) ||
            !toStringValue(row.model)
          ) {
            logWarn(
              'Skipping totals_by_language_model row with missing language or model.',
            );
            continue;
          }
          parsed.byLanguageModel.push({
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            team_slug: '',
            language: toStringValue(row.language) as string,
            model_id: toStringValue(row.model) as string,
            request_count: toNumber(row.code_generation_activity_count),
            code_generation_activity_count: toNumber(
              row.code_generation_activity_count,
            ),
            code_acceptance_activity_count: toNumber(
              row.code_acceptance_activity_count,
            ),
            loc_added_sum: toNumber(row.loc_added_sum),
            loc_deleted_sum: toNumber(row.loc_deleted_sum),
            loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
            loc_suggested_to_delete_sum: toNumber(
              row.loc_suggested_to_delete_sum,
            ),
          });
        }
      }

      if (isRecord(dayTotal.totals_by_cli)) {
        const cli = dayTotal.totals_by_cli;
        parsed.byCli.push({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          team_slug: '',
          prompt_count: toNumber(cli.prompt_count),
          request_count: toNumber(cli.request_count),
          session_count: toNumber(cli.session_count),
          avg_tokens_per_request: toNumber(
            isRecord(cli.token_usage)
              ? cli.token_usage.avg_tokens_per_request
              : undefined,
          ),
          output_tokens_sum: toNumber(
            isRecord(cli.token_usage)
              ? cli.token_usage.output_tokens_sum
              : undefined,
          ),
          prompt_tokens_sum: toNumber(
            isRecord(cli.token_usage)
              ? cli.token_usage.prompt_tokens_sum
              : undefined,
          ),
        });
      }
    }
  }

  return parsed;
}

/**
 * Parse an organization report document (single flat object per downloaded file).
 * Unlike enterprise documents, org documents are not wrapped in an array with day_totals;
 * the downloaded file IS the day's metrics object. LOC totals are not present at the top
 * level and must be summed from totals_by_ide when absent.
 */
export function parseOrganizationDocument(
  doc: unknown,
  metricsType: MetricsScope,
  entityId: string,
): ParsedEnterpriseDocument {
  const parsed: ParsedEnterpriseDocument = {
    dailyTotals: [],
    prMetrics: [],
    byFeature: [],
    byIde: [],
    byLanguageFeature: [],
    byModelFeature: [],
    byLanguageModel: [],
    byCli: [],
  };

  // Normalize: the API downloads a single flat object per file, but accept arrays too.
  let orgDocs: unknown[];
  if (Array.isArray(doc)) {
    orgDocs = doc;
  } else if (isRecord(doc)) {
    orgDocs = [doc];
  } else {
    orgDocs = [];
  }

  if (orgDocs.length === 0) {
    logWarn('Expected organization document object, received invalid payload.');
    return parsed;
  }

  for (const orgDoc of orgDocs) {
    if (!isRecord(orgDoc)) {
      logWarn(
        'Skipping organization document item because it is not an object.',
      );
      continue;
    }

    const day = toStringValue(orgDoc.day);
    if (!day) {
      logWarn('Skipping organization document item with missing day field.');
      continue;
    }

    const ideRows = Array.isArray(orgDoc.totals_by_ide)
      ? orgDoc.totals_by_ide
      : [];

    // LOC fields are not present at the top level in org documents — sum from IDE rows.
    const hasTopLevelLoc = orgDoc.loc_added_sum !== undefined;
    let locAddedSum = hasTopLevelLoc ? toNumber(orgDoc.loc_added_sum) : 0;
    let locDeletedSum = hasTopLevelLoc ? toNumber(orgDoc.loc_deleted_sum) : 0;
    let locSuggestedToAddSum = hasTopLevelLoc
      ? toNumber(orgDoc.loc_suggested_to_add_sum)
      : 0;
    let locSuggestedToDeleteSum = hasTopLevelLoc
      ? toNumber(orgDoc.loc_suggested_to_delete_sum)
      : 0;

    if (!hasTopLevelLoc) {
      for (const ideRow of ideRows) {
        if (isRecord(ideRow)) {
          locAddedSum += toNumber(ideRow.loc_added_sum);
          locDeletedSum += toNumber(ideRow.loc_deleted_sum);
          locSuggestedToAddSum += toNumber(ideRow.loc_suggested_to_add_sum);
          locSuggestedToDeleteSum += toNumber(
            ideRow.loc_suggested_to_delete_sum,
          );
        }
      }
    }

    parsed.dailyTotals.push({
      day,
      metrics_type: metricsType,
      entity_id: entityId,
      team_slug: '',
      daily_active_users: toNumber(orgDoc.daily_active_users),
      weekly_active_users: toNumber(orgDoc.weekly_active_users),
      monthly_active_users: toNumber(orgDoc.monthly_active_users),
      daily_active_cli_users: toNumber(orgDoc.daily_active_cli_users),
      monthly_active_agent_users: toNumber(orgDoc.monthly_active_agent_users),
      monthly_active_chat_users: toNumber(orgDoc.monthly_active_chat_users),
      code_acceptance_activity_count: toNumber(
        orgDoc.code_acceptance_activity_count,
      ),
      code_generation_activity_count: toNumber(
        orgDoc.code_generation_activity_count,
      ),
      loc_added_sum: locAddedSum,
      loc_deleted_sum: locDeletedSum,
      loc_suggested_to_add_sum: locSuggestedToAddSum,
      loc_suggested_to_delete_sum: locSuggestedToDeleteSum,
      user_initiated_interaction_count: toNumber(
        orgDoc.user_initiated_interaction_count,
      ),
    });

    // No pull_requests field at the org level.

    if (Array.isArray(orgDoc.totals_by_feature)) {
      for (const row of orgDoc.totals_by_feature) {
        if (!isRecord(row) || !toStringValue(row.feature)) {
          logWarn('Skipping totals_by_feature row with missing feature.');
          continue;
        }

        parsed.byFeature.push({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          team_slug: '',
          feature: toStringValue(row.feature) as string,
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
          user_initiated_interaction_count: toNumber(
            row.user_initiated_interaction_count,
          ),
        });
      }
    }

    for (const row of ideRows) {
      if (!isRecord(row) || !toStringValue(row.ide)) {
        logWarn('Skipping totals_by_ide row with missing ide.');
        continue;
      }

      parsed.byIde.push({
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        team_slug: '',
        ide: toStringValue(row.ide) as string,
        code_acceptance_activity_count: toNumber(
          row.code_acceptance_activity_count,
        ),
        code_generation_activity_count: toNumber(
          row.code_generation_activity_count,
        ),
        loc_added_sum: toNumber(row.loc_added_sum),
        loc_deleted_sum: toNumber(row.loc_deleted_sum),
        loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
        loc_suggested_to_delete_sum: toNumber(row.loc_suggested_to_delete_sum),
        user_initiated_interaction_count: toNumber(
          row.user_initiated_interaction_count,
        ),
      });
    }

    if (Array.isArray(orgDoc.totals_by_language_feature)) {
      for (const row of orgDoc.totals_by_language_feature) {
        if (
          !isRecord(row) ||
          !toStringValue(row.language) ||
          !toStringValue(row.feature)
        ) {
          logWarn(
            'Skipping totals_by_language_feature row with missing language or feature.',
          );
          continue;
        }

        parsed.byLanguageFeature.push({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          team_slug: '',
          language: toStringValue(row.language) as string,
          feature: toStringValue(row.feature) as string,
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
        });
      }
    }

    if (Array.isArray(orgDoc.totals_by_model_feature)) {
      for (const row of orgDoc.totals_by_model_feature) {
        // API uses "model" field name, not "model_id"
        if (
          !isRecord(row) ||
          !toStringValue(row.model) ||
          !toStringValue(row.feature)
        ) {
          logWarn(
            'Skipping totals_by_model_feature row with missing model or feature.',
          );
          continue;
        }
        parsed.byModelFeature.push({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          team_slug: '',
          model_id: toStringValue(row.model) as string,
          feature: toStringValue(row.feature) as string,
          user_initiated_interaction_count: toNumber(
            row.user_initiated_interaction_count,
          ),
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
        });
      }
    }

    if (Array.isArray(orgDoc.totals_by_language_model)) {
      for (const row of orgDoc.totals_by_language_model) {
        // API uses "model" field name, not "model_id"; no "request_count" — use code_generation_activity_count
        if (
          !isRecord(row) ||
          !toStringValue(row.language) ||
          !toStringValue(row.model)
        ) {
          logWarn(
            'Skipping totals_by_language_model row with missing language or model.',
          );
          continue;
        }
        parsed.byLanguageModel.push({
          day,
          metrics_type: metricsType,
          entity_id: entityId,
          team_slug: '',
          language: toStringValue(row.language) as string,
          model_id: toStringValue(row.model) as string,
          request_count: toNumber(row.code_generation_activity_count),
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
        });
      }
    }

    if (isRecord(orgDoc.totals_by_cli)) {
      const cli = orgDoc.totals_by_cli;
      parsed.byCli.push({
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        team_slug: '',
        prompt_count: toNumber(cli.prompt_count),
        request_count: toNumber(cli.request_count),
        session_count: toNumber(cli.session_count),
        avg_tokens_per_request: toNumber(
          isRecord(cli.token_usage)
            ? cli.token_usage.avg_tokens_per_request
            : undefined,
        ),
        output_tokens_sum: toNumber(
          isRecord(cli.token_usage)
            ? cli.token_usage.output_tokens_sum
            : undefined,
        ),
        prompt_tokens_sum: toNumber(
          isRecord(cli.token_usage)
            ? cli.token_usage.prompt_tokens_sum
            : undefined,
        ),
      });
    }
  }

  return parsed;
}

/**
 * Parse a users-1-day document (flat array of user metric objects).
 */
export function parseUserDocument(
  doc: unknown,
  metricsType: MetricsScope,
  entityId: string,
): ParsedUserDocument {
  if (!Array.isArray(doc)) {
    logWarn(
      'Expected user metrics document array, received non-array payload.',
    );
    return { userMetrics: [], userBreakdowns: [] };
  }

  const userMetrics: V2UserMetricRow[] = [];
  const userBreakdowns: UserBreakdownData[] = [];

  for (const metric of doc as V2UserMetric[]) {
    if (!isRecord(metric)) {
      logWarn('Skipping user metrics row because it is not an object.');
      continue;
    }

    const day = toStringValue(metric.day);
    const userLogin = toStringValue(metric.user_login);
    const userId = toNumber(metric.user_id);

    if (!day || !userLogin || userId <= 0) {
      logWarn('Skipping user metrics row with missing required fields.');
      continue;
    }

    userMetrics.push({
      day,
      metrics_type: metricsType,
      entity_id: entityId,
      user_id: userId,
      user_login: userLogin,
      used_agent: Boolean(metric.used_agent),
      used_chat: Boolean(metric.used_chat),
      used_cli: Boolean(metric.used_cli),
      code_acceptance_activity_count: toNumber(
        metric.code_acceptance_activity_count,
      ),
      code_generation_activity_count: toNumber(
        metric.code_generation_activity_count,
      ),
      loc_added_sum: toNumber(metric.loc_added_sum),
      loc_deleted_sum: toNumber(metric.loc_deleted_sum),
      loc_suggested_to_add_sum: toNumber(metric.loc_suggested_to_add_sum),
      loc_suggested_to_delete_sum: toNumber(metric.loc_suggested_to_delete_sum),
      user_initiated_interaction_count: toNumber(
        metric.user_initiated_interaction_count,
      ),
    });

    const breakdown: UserBreakdownData = {
      user_id: userId,
      byFeature: [],
      byIde: [],
      byLanguageFeature: [],
      byModelFeature: [],
      byLanguageModel: [],
    };

    if (Array.isArray(metric.totals_by_feature)) {
      for (const row of metric.totals_by_feature) {
        if (!isRecord(row) || !toStringValue(row.feature)) continue;
        breakdown.byFeature.push({
          feature: toStringValue(row.feature) as string,
          user_initiated_interaction_count: toNumber(
            row.user_initiated_interaction_count,
          ),
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
        });
      }
    }

    if (Array.isArray(metric.totals_by_ide)) {
      for (const row of metric.totals_by_ide) {
        if (!isRecord(row) || !toStringValue(row.ide)) continue;
        breakdown.byIde.push({
          ide: toStringValue(row.ide) as string,
          user_initiated_interaction_count: toNumber(
            row.user_initiated_interaction_count,
          ),
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
        });
      }
    }

    if (Array.isArray(metric.totals_by_language_feature)) {
      for (const row of metric.totals_by_language_feature) {
        if (
          !isRecord(row) ||
          !toStringValue(row.language) ||
          !toStringValue(row.feature)
        )
          continue;
        breakdown.byLanguageFeature.push({
          language: toStringValue(row.language) as string,
          feature: toStringValue(row.feature) as string,
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
        });
      }
    }

    if (Array.isArray(metric.totals_by_model_feature)) {
      for (const row of metric.totals_by_model_feature) {
        // API uses "model" field name, not "model_id"
        if (
          !isRecord(row) ||
          !toStringValue(row.model) ||
          !toStringValue(row.feature)
        )
          continue;
        breakdown.byModelFeature.push({
          model_id: toStringValue(row.model) as string,
          feature: toStringValue(row.feature) as string,
          user_initiated_interaction_count: toNumber(
            row.user_initiated_interaction_count,
          ),
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
        });
      }
    }

    if (Array.isArray(metric.totals_by_language_model)) {
      for (const row of metric.totals_by_language_model) {
        // API uses "model" field name, not "model_id"; no "request_count" — use code_generation_activity_count
        if (
          !isRecord(row) ||
          !toStringValue(row.language) ||
          !toStringValue(row.model)
        )
          continue;
        breakdown.byLanguageModel.push({
          language: toStringValue(row.language) as string,
          model_id: toStringValue(row.model) as string,
          request_count: toNumber(row.code_generation_activity_count),
          code_generation_activity_count: toNumber(
            row.code_generation_activity_count,
          ),
          code_acceptance_activity_count: toNumber(
            row.code_acceptance_activity_count,
          ),
          loc_added_sum: toNumber(row.loc_added_sum),
          loc_deleted_sum: toNumber(row.loc_deleted_sum),
          loc_suggested_to_add_sum: toNumber(row.loc_suggested_to_add_sum),
          loc_suggested_to_delete_sum: toNumber(
            row.loc_suggested_to_delete_sum,
          ),
        });
      }
    }

    userBreakdowns.push(breakdown);
  }

  return { userMetrics, userBreakdowns };
}

/**
 * Parse a user-teams-1-day document (flat array of user-team membership rows).
 */
export function parseUserTeamsDocument(
  doc: unknown,
  metricsType: MetricsScope,
  entityId: string,
): V2UserTeamRow[] {
  if (!Array.isArray(doc)) {
    logWarn('Expected user teams document array, received non-array payload.');
    return [];
  }

  const parsed: V2UserTeamRow[] = [];

  for (const teamMembership of doc as V2UserTeam[]) {
    if (!isRecord(teamMembership)) {
      logWarn('Skipping user teams row because it is not an object.');
      continue;
    }

    const day = toStringValue(teamMembership.day);
    const userLogin = toStringValue(teamMembership.user_login);
    const teamSlug = toStringValue(teamMembership.slug);
    const userId = toNumber(teamMembership.user_id);
    const teamId = toNumber(teamMembership.team_id);

    if (!day || !userLogin || !teamSlug || userId <= 0 || teamId <= 0) {
      logWarn('Skipping user teams row with missing required fields.');
      continue;
    }

    parsed.push({
      day,
      metrics_type: metricsType,
      entity_id: entityId,
      user_id: userId,
      user_login: userLogin,
      team_id: teamId,
      team_slug: teamSlug,
    });
  }

  return parsed;
}
