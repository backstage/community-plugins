/*
 * Copyright 2025 The Backstage Authors
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
import { TechInsightsApi } from '@backstage-community/plugin-tech-insights';
import { Entity } from '@backstage/catalog-model';
import { createApiRef } from '@backstage/core-plugin-api';
import {
  BulkMaturityCheckResponse,
  BulkMaturitySummary,
  MaturityRank,
  MaturityScore,
  MaturitySummary,
} from '@backstage-community/plugin-tech-insights-maturity-common';

/**
 *  {@link @backstage/core-plugin-api#ApiRef} for the {@link MaturityApi}
 *
 * @public
 */
export const maturityApiRef = createApiRef<MaturityApi>({
  id: 'plugin.maturity.service',
});

/**
 * Maturity API client interface extention of TechInsightsApi
 *
 * @public
 */
export type MaturityApi = TechInsightsApi & {
  getMaturityRank(entity: Entity): Promise<MaturityRank>;
  getMaturityScore(entity: Entity): Promise<MaturityScore>;
  getBulkMaturityCheckResults(
    entities: Entity[],
  ): Promise<BulkMaturityCheckResponse>;
  getChildMaturityCheckResults(
    entity: Entity,
  ): Promise<BulkMaturityCheckResponse>;
  getMaturitySummary(entity: Entity): Promise<MaturitySummary>;
  getBulkMaturitySummary(entities: Entity[]): Promise<BulkMaturitySummary>;
};
