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

import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { Metric } from '@backstage-community/plugin-copilot-common';
import { copilotApiRef } from '../api';
import { useSharedTeam } from '../contexts';
import { useSetMetricsTypeFromRoute } from './useSetMetricsTypeFromRoute';

export function useMetricsByTeam(
  startDate: Date,
  endDate: Date,
): {
  items?: Metric[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(copilotApiRef);
  const [team] = useSharedTeam();
  const type = useSetMetricsTypeFromRoute();

  const { value, loading, error } = useAsync(() => {
    if (type && team) {
      return api.getMetrics(startDate, endDate, type, team);
    }
    return Promise.resolve([]);
  }, [api, type, team, startDate, endDate]);

  return {
    items: value,
    loading,
    error,
  };
}
