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
import { ApiiroApi } from '../api';

export interface ApiError extends Error {
  details?: {
    status: number;
    error: string;
    [key: string]: any;
  };
}

export type Query = {
  connectApi: ApiiroApi;
  fetchApi: typeof fetch;
  signal: AbortSignal;
};

export type RepositoryType = {
  activeSince?: string;
  apiCount: number;
  branchName: string;
  businessImpact: string;
  contributorCount: number;
  dependencyCount: number;
  hasDataModels: boolean;
  hasExternalDependencies: boolean;
  hasPaymentsData: boolean;
  hasPhiData: boolean;
  hasPiiData: boolean;
  hasSensitiveDependencies: boolean;
  insights: string[];
  isActive: boolean;
  isArchived: boolean;
  isDeployed: boolean;
  isInternetExposed: boolean;
  isPublic: boolean;
  languages: string[];
  languagePercentages?: Record<string, number>;
  lastActivity?: string;
  licenses: string[];
  modules: {
    filePath: string;
    name: string;
  }[];
  name: string;
  projectId: string;
  provider: string;
  riskLevel: string;
  riskScore: number;
  scmRepositoryKey: string;
  serverUrl: string;
  url: string;
  key: string;
  entityUrl: string;
  apiiroUrl?: string;
};

export type RepositorySuccessResponseData = {
  repositories: RepositoryType[] | undefined;
  totalCount: number;
};

export type MttrStatistic = {
  riskLevel: string;
  meanTimeInHours: number;
  slaInHours: number;
};

export type MttrStatisticsSuccessResponseData = MttrStatistic[];

export type RiskScoreOverTimeDataPoint = {
  date: string;
  count: number;
};

export type RiskScoreOverTimeSuccessResponseData = RiskScoreOverTimeDataPoint[];

export type SlaBreachDataPoint = {
  riskLevel: string;
  slaBreach: number;
  slaAdherence: number;
  unsetDueDate: number;
};

export type SlaBreachSuccessResponseData = SlaBreachDataPoint[];

export type TopRiskDataPoint = {
  ruleName: string;
  count: number;
  severity: string;
  devPhase: string;
};

export type TopRiskSuccessResponseData = TopRiskDataPoint[];
