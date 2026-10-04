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

/** @public */
export type FlagType = 'boolean' | 'number' | 'string' | 'json' | 'null';

/** @public */
export type FlagRow = {
  key: string;
  type: FlagType;
  valuePreview: string;
  valuePretty?: string;
};

/** @public */
export type ExperimentStatus = 'draft' | 'running' | 'stopped';

/** @public */
export type ExperimentVariation = {
  id: string;
  key: string;
  name: string;
};

/** @public */
export type ExperimentPhase = {
  name: string;
  dateStarted?: string;
  dateEnded?: string;
};

/** @public */
export type ExperimentRow = {
  id: string;
  name: string;
  status: ExperimentStatus;
  type?: string;
  owner?: string;
  tags: string[];
  variations: ExperimentVariation[];
  phases: ExperimentPhase[];
  /** Id of the winning variation, when one was declared. */
  winnerVariationId?: string;
  /** Link to the experiment in the GrowthBook UI. */
  url: string;
};

/** @public */
export type ExperimentVariationResult = {
  id: string;
  name: string;
  users?: number;
  chanceToBeatControl?: number;
  percentChange?: number;
  ciLow?: number;
  ciHigh?: number;
};

/** @public */
export type ExperimentResultSummary = {
  available: boolean;
  metricName?: string;
  variations: ExperimentVariationResult[];
};

/** @public */
export type FlagRuleSummary = {
  type: string;
  description?: string;
  enabled: boolean;
};

/** @public */
export type FlagEnvironmentDetail = {
  name: string;
  enabled: boolean;
  rules: FlagRuleSummary[];
};

/** @public */
export type FlagDetail = {
  key: string;
  dateUpdated?: string;
  archived: boolean;
  owner?: string;
  tags: string[];
  isStale: boolean;
  staleReason?: string;
  environments: FlagEnvironmentDetail[];
};
