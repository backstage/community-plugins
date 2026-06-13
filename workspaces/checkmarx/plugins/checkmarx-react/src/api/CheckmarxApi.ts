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
import { Entity } from '@backstage/catalog-model';

/** @public */
export interface SeverityCounter {
  severity: string;
  counter: number;
}

/** @public */
export interface StatusCounter {
  status: string;
  counter: number;
}

/** @public */
export interface StateCounter {
  state: string;
  counter: number;
}

/** @public */
export interface AgeCounter {
  age: string;
  counter: number;
  severityCounters?: SeverityCounter[];
}

/** @public */
export interface LanguageCounter {
  language: string;
  counter: number;
}

/** @public */
export interface ComplianceCounter {
  compliance: string;
  counter: number;
}

/** @public */
export interface RiskLevelCounter {
  riskLevel: string;
  counter: number;
}

/** @public */
export interface LicenseCounter {
  license: string;
  counter: number;
}

/** @public */
export interface GenericEngineCounters {
  severityCounters: SeverityCounter[];
  statusCounters: StatusCounter[];
  stateCounters: StateCounter[];
  ageCounters: AgeCounter[];
  totalCounter: number;
  filesScannedCounter?: number;
  languageCounters?: LanguageCounter[];
  complianceCounters?: ComplianceCounter[];
}

/** @public */
export interface ScaPackagesCounters {
  severityCounters: SeverityCounter[];
  statusCounters: StatusCounter[];
  stateCounters: StateCounter[];
  ageCounters: AgeCounter[];
  totalCounter: number;
  outdatedCounter: number;
  riskLevelCounters: RiskLevelCounter[];
  licenseCounters: LicenseCounter[];
}

/** @public */
export interface ContainersCounters extends GenericEngineCounters {
  totalPackagesCounter?: number;
}

/** @public */
export interface CheckmarxCounters {
  sast: GenericEngineCounters;
  kics: GenericEngineCounters;
  sca: GenericEngineCounters;
  scaPackages: ScaPackagesCounters;
  apiSec: GenericEngineCounters;
  containers: ContainersCounters;
}

/** @public */
export interface CheckmarxMetrics {
  sastFindings: number;
  criticalHighFindings: number;
  scaPackages: number;
  outdatedPackages: number;
  recurrentFindings: number;
  recurrentFindingsPercent: number | null;
  additionalFindings: number;
  oldestAgeLabel: string | null;
}

/** @public */
export interface CheckmarxEntitySummary {
  projectId: string;
  projectName?: string;
  branch: string;
  scanId: string;
  scanUrl: string;
  lastUpdated: string;
  engines: string[];
  metrics: CheckmarxMetrics;
  counters: CheckmarxCounters;
}

/** @public */
export interface CheckmarxApi {
  getEntitySummary(entity: Entity): Promise<CheckmarxEntitySummary | undefined>;
  getEntitySummaries(
    entities: Entity[],
  ): Promise<(CheckmarxEntitySummary | undefined)[]>;
}
