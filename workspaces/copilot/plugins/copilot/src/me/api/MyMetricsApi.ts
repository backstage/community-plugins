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
import { createApiRef } from '@backstage/frontend-plugin-api';
import {
  MetricsScope,
  V2MyDashboardResponse,
} from '@backstage-community/plugin-copilot-common';

/**
 * Parameters accepted by {@link MyMetricsApi.getMyDashboard}.
 *
 * Deliberately has no `user` or `team` field: the caller's own login is
 * always resolved server-side from their credentials, so this client can
 * never be used to request another user's metrics.
 *
 * @public
 */
export interface MyDashboardParams {
  type: MetricsScope;
  entityId: string;
  from: string;
  to: string;
}

/**
 * Client API for the individual ("me") Copilot metrics view. Calls only the
 * privacy-scoped `/v2/me/*` routes on the `copilot` backend plugin.
 *
 * @public
 */
export interface MyMetricsApi {
  /**
   * Fetches the signed-in caller's own Copilot dashboard data for the given
   * scope and date range.
   */
  getMyDashboard(params: MyDashboardParams): Promise<V2MyDashboardResponse>;
}

/**
 * @public
 */
export const myMetricsApiRef = createApiRef<MyMetricsApi>({
  id: 'plugin.copilot-my-metrics.service',
});
