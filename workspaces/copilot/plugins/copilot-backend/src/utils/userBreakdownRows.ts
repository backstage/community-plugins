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
  MetricsScope,
  V2UserMetricsByFeatureRow,
  V2UserMetricsByIdeRow,
  V2UserMetricsByLanguageFeatureRow,
  V2UserMetricsByModelFeatureRow,
  V2UserMetricsByLanguageModelRow,
} from '@backstage-community/plugin-copilot-common';
import { UserBreakdownData } from './reportParser';

export interface UserBreakdownRows {
  byFeature: V2UserMetricsByFeatureRow[];
  byIde: V2UserMetricsByIdeRow[];
  byLanguageFeature: V2UserMetricsByLanguageFeatureRow[];
  byModelFeature: V2UserMetricsByModelFeatureRow[];
  byLanguageModel: V2UserMetricsByLanguageModelRow[];
}

/**
 * Converts the in-memory per-user breakdown data (parsed from the
 * users-1-day report) into DB row shapes for persistence.
 *
 * This is the per-user counterpart to the aggregation done in
 * teamAggregator.ts — instead of folding breakdown rows across all users in
 * a team, it emits one row per (day, entity, user, dimension) so that a
 * single user's own breakdowns can be queried back out later.
 */
export function buildUserBreakdownRows(
  userBreakdowns: UserBreakdownData[],
  day: string,
  metricsType: MetricsScope,
  entityId: string,
): UserBreakdownRows {
  const byFeature: V2UserMetricsByFeatureRow[] = [];
  const byIde: V2UserMetricsByIdeRow[] = [];
  const byLanguageFeature: V2UserMetricsByLanguageFeatureRow[] = [];
  const byModelFeature: V2UserMetricsByModelFeatureRow[] = [];
  const byLanguageModel: V2UserMetricsByLanguageModelRow[] = [];

  for (const bd of userBreakdowns) {
    const base = {
      day,
      metrics_type: metricsType,
      entity_id: entityId,
      user_id: bd.user_id,
      user_login: bd.user_login,
    };

    for (const f of bd.byFeature) {
      byFeature.push({ ...base, ...f });
    }

    for (const i of bd.byIde) {
      byIde.push({ ...base, ...i });
    }

    for (const lf of bd.byLanguageFeature) {
      byLanguageFeature.push({ ...base, ...lf });
    }

    for (const mf of bd.byModelFeature) {
      byModelFeature.push({ ...base, ...mf });
    }

    for (const lm of bd.byLanguageModel) {
      byLanguageModel.push({ ...base, ...lm });
    }
  }

  return {
    byFeature,
    byIde,
    byLanguageFeature,
    byModelFeature,
    byLanguageModel,
  };
}
