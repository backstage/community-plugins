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

/**
 * @public
 */
export type DependencytrackProject = {
  author: string;
  publisher: string;
  group: string;
  name: string;
  description: string;
  version: string;
  classifier: CLASSIFIER;
  cpe: string;
  swidTagId: string;
  directDependencies: string;
  uuid: string;
  lastBomImport: string;
  lastBomImportFormat: string;
  lastInheritedRiskScore: number;
  active: boolean;
  metrics: ProjectMetrics;
  findings: Finding[];
};

/**
 * @public
 */
export enum CLASSIFIER {
  APPLICATION,
  FRAMEWORK,
  LIBRARY,
  CONTAINER,
  OPERATING_SYSTEM,
  DEVICE,
  FIRMWARE,
  FILE,
}

/**
 * @public
 */
export const metrictypes = [
  'critical',
  'high',
  'medium',
  'low',
  'unassigned',
  'vulnerabilities',
  'vulnerableComponents',
  'components',
  'suppressed',
  'findingsTotal',
  'findingsAudited',
  'findingsUnaudited',
  'inheritedRiskScore',
  'firstOccurrence',
  'lastOccurrence',
] as const;

/**
 * @public
 */
export type ProjectMetrics = {
  [k in (typeof metrictypes)[number]]: number;
};

/**
 * @public
 */
export type Finding = {
  component: Component;
  vulnerability: Vulnerability;
  analysis: Analyis;
  attribution: Attribution;
  matrix: string;
};

/**
 * @public
 */
export type Component = {
  author?: string;
  publisher?: string;
  group?: string;
  classifier?: string;
  uuid: string;
  name: string;
  version: string;
  purl: string;
  project: string;
};

/**
 * @public
 */
export enum SEVERITY {
  CRITICAL,
  HIGH,
  MEDIUM,
  LOW,
  INFO,
  UNASSIGNED,
}

/**
 * @public
 */
export type Vulnerability = {
  uuid: string;
  source: string;
  vulnId: string;
  title?: string;
  severity: SEVERITY;
  severityRank: number;
  epssScore: number;
  epssPercentile: number;
  cweId: number;
  cweName: string;
  cwes: cwe[];
  aliases: string[];
  description: string;
  recommendation: string | null;
  cvssV2BaseScore?: number;
  cvssV2ImpactSubScore?: number;
  cvssV2ExploitabilitySubScore?: number;
  cvssV2Vector?: string;
  cvssV3BaseScore?: number;
  cvssV3ImpactSubScore?: number;
  cvssV3ExploitabilitySubScore?: number;
  cvssV3Vector?: string;
};

/**
 * @public
 */
export type cwe = {
  cweId: number;
  name: string;
};

/**
 * @public
 */
export type Analyis = {
  isSuppressed: boolean;
};

/**
 * @public
 */
export enum ANALYZER_IDENTITY {
  INTERNAL_ANALYZER,
  OSSINDEX_ANALYZER,
  NPM_AUDIT_ANALYZER,
  VULNDB_ANALYZER,
  NONE,
}

/**
 * @public
 */
export type Attribution = {
  analyzerIdentity: ANALYZER_IDENTITY;
  attributedOn: number;
  alternateIdentifier: string;
  referenceUrl: string;
};
