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

import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { copilotApiV2Ref } from '../../../api';
import {
  MetricsScope,
  V2CostCenterOption,
} from '@backstage-community/plugin-copilot-common';

type CostCentersResult = {
  queryKey: string;
  costCenters: V2CostCenterOption[];
  hasUsersWithoutCostCenter: boolean;
  error?: Error;
};

export function useV2CostCenters(
  type: MetricsScope,
  entityId: string,
  from?: string,
  to?: string,
) {
  const api = useApi(copilotApiV2Ref);
  const queryKey = JSON.stringify([type, entityId, from, to]);
  const { value, loading } = useAsync(async (): Promise<CostCentersResult> => {
    try {
      return {
        queryKey,
        ...(await api.fetchCostCenters({ type, entityId, from, to })),
      };
    } catch (error) {
      return {
        queryKey,
        costCenters: [],
        hasUsersWithoutCostCenter: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }, [api, type, entityId, from, to]);
  const hasCurrentResult = value?.queryKey === queryKey;

  return {
    items: hasCurrentResult ? value.costCenters : [],
    hasUsersWithoutCostCenter: hasCurrentResult
      ? value.hasUsersWithoutCostCenter
      : false,
    loading: loading || !hasCurrentResult,
    error: hasCurrentResult ? value.error : undefined,
  };
}
