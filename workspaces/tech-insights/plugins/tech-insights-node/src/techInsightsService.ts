/*
 * Copyright 2022 The Backstage Authors
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

import { TechInsightsClient } from '@backstage-community/plugin-tech-insights-common/client';
import {
  CheckResult,
  BulkCheckResponse,
  FactSchema,
  Check,
  InsightFacts,
} from '@backstage-community/plugin-tech-insights-common';
import {
  createServiceFactory,
  createServiceRef,
  coreServices,
} from '@backstage/backend-plugin-api';
import { CompoundEntityRef } from '@backstage/catalog-model';

/**
 * A service that provides access to tech insights data.
 *
 * @public
 */
export interface TechInsightsService {
  getFacts(entity: CompoundEntityRef, facts: string[]): Promise<InsightFacts>;
  getAllChecks(): Promise<Check[]>;
  getFactSchemas(): Promise<FactSchema[]>;
  runChecks(
    entityParams: CompoundEntityRef,
    checks?: string[],
  ): Promise<CheckResult[]>;
  runBulkChecks(
    entities: CompoundEntityRef[],
    checks?: Check[],
  ): Promise<BulkCheckResponse>;
}

/**
 * A reference to the tech insights service.
 *
 * @public
 */
export const techInsightsServiceRef = createServiceRef<TechInsightsService>({
  id: 'tech-insights-client',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        auth: coreServices.auth,
        discoveryApi: coreServices.discovery,
      },
      async factory({ auth, discoveryApi }) {
        return new TechInsightsClient({
          discoveryApi,
          identityApi: auth,
        });
      },
    }),
});
