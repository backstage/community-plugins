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

import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useApi } from '@backstage/core-plugin-api';
import type { V2DashboardData } from '@backstage-community/plugin-copilot-common';
import { copilotApiV2Ref } from '../../../api';
import type { V2MetricsParams } from '../../../api';

const EMPTY_DASHBOARD: V2DashboardData = {
  daily: [],
  byFeature: [],
  byLanguage: [],
  byModelFeature: [],
  byLanguageModel: [],
  prMetrics: [],
  customizationMetrics: [],
  customizationSummaries: [],
};

export function useV2DashboardData(
  params: V2MetricsParams,
  withoutCostCenter = false,
) {
  const api = useApi(copilotApiV2Ref);
  const queryKey = JSON.stringify([
    params.type,
    params.entityId,
    params.from,
    params.to,
    params.team,
    params.costCenter,
    withoutCostCenter,
  ]);
  const { value, loading, retry } = useAsyncRetry(async () => {
    try {
      const data = withoutCostCenter
        ? await api.getNoCostCenterDashboardData({
            type: params.type,
            entityId: params.entityId,
            from: params.from,
            to: params.to,
          })
        : await api.getDashboardData(params);
      return { queryKey, data, error: undefined };
    } catch (error) {
      return {
        queryKey,
        data: undefined,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }, [api, queryKey]);
  const hasCurrentResult = value?.queryKey === queryKey;

  return {
    data: hasCurrentResult ? value.data ?? EMPTY_DASHBOARD : EMPTY_DASHBOARD,
    loading: loading || !hasCurrentResult,
    error: hasCurrentResult ? value.error : undefined,
    retry,
  };
}
