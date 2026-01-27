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
export { createRepositoriesHandler } from './repositories.handler';
export type { RepositoriesHandlerDependencies } from './repositories.handler';

export { createRisksHandler } from './risks.handler';
export type { RisksHandlerDependencies } from './risks.handler';

export {
  createMttrStatisticsHandler,
  createRiskScoreOverTimeHandler,
  createSlaBreachHandler,
  createTopRisksHandler,
} from './statistics.handler';
export type { StatisticsHandlerDependencies } from './statistics.handler';

export { createHealthHandler } from './health.handler';
export type { HealthHandlerDependencies } from './health.handler';

export { createFilterOptionsHandler } from './filterOptions.handler';
export type { FilterOptionsHandlerDependencies } from './filterOptions.handler';
