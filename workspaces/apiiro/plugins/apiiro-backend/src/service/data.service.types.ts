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
export type RepositoryModule = {
  filePath: string | null;
  name: string | null;
};

export type RepositoryItem = {
  activeSince?: string | null;
  apiCount?: number;
  branchName?: string | null;
  businessImpact?: string | null;
  contributorCount?: number;
  dependencyCount?: number;
  hasDataModels?: boolean;
  hasExternalDependencies?: boolean;
  hasPaymentsData?: boolean;
  hasPhiData?: boolean;
  hasPiiData?: boolean;
  hasSensitiveDependencies?: boolean;
  insights?: string[] | null;
  isActive?: boolean;
  isArchived?: boolean;
  isDeployed?: boolean;
  isInternetExposed?: boolean;
  isPublic?: boolean;
  isDefaultBranch?: boolean;
  key?: string | null;
  languages?: string[] | null;
  languagePercentages?: Record<string, number>;
  lastActivity?: string | null;
  licenses?: string[] | null;
  modules?: RepositoryModule[] | null;
  name?: string | null;
  projectId?: string | null;
  provider?: string | null;
  riskLevel?: string | null;
  riskScore?: number;
  scmRepositoryKey?: string | null;
  serverUrl?: string | null;
  url?: string | null;
  [k: string]: unknown;
};

export type ApiiroRepositoriesPage = {
  next?: string | null;
  items: RepositoryItem[];
};

export type RepositoriesAggregation = {
  repositories: RepositoryItem[];
  totalCount: number;
};

export type RepositoryFilters = {
  repositoryUrl?: string;
};

export type RiskFilters = {
  repositoryId?: string;
  RiskLevel?: string[];
  RiskCategory?: string[];
  RiskInsight?: string[];
  FindingCategory?: string[];
  DiscoveredOn?: {
    start?: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.SSSZ
    end?: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.SSSZ
  };
};

export type RiskInsight = {
  name: string | null;
  reason: string | null;
};

export type RiskSource = {
  name: string | null;
  url: string | null;
};

export type RiskMonitoringStatus = {
  ignoredBy?: string | null;
  ignoredOn?: string | null;
  ignoreReason?: string | null;
  status: string | null;
};

export type RiskEntityDetails = {
  branchName?: string | null;
  businessImpact?: string | null;
  isArchived?: boolean;
  key?: string | null;
  monitoringStatus?: RiskMonitoringStatus | null;
  name?: string | null;
  privacySettings?: string | null;
  profileUrl?: string | null;
  repositoryGroup?: string | null;
  repositoryOwners?: any[] | null;
  riskLevel?: string | null;
  serverUrl?: string | null;
  url?: string | null;
};

export type RiskEntity = {
  details: RiskEntityDetails;
  type: string | null;
};

export type RiskContributor = {
  email: string | null;
  name: string | null;
  reason: string | null;
};

export type RiskSourceCode = {
  filePath: string | null;
  lineNumber: number;
  url: string | null;
};

export type RiskItem = {
  id?: string | null;
  riskLevel?: string | null;
  riskStatus?: string | null;
  ruleName?: string | null;
  riskCategory?: string | null;
  component?: string | null;
  discoveredOn?: string | null;
  dueDate?: string | null;
  insights?: RiskInsight[] | null;
  apiiroRiskUrl?: string | null;
  source?: RiskSource[] | null;
  entity?: RiskEntity | null;
  applications?: any[] | null;
  orgTeams?: any[] | null;
  applicationGroups?: any[] | null;
  sourceCode?: RiskSourceCode | null;
  contributors?: RiskContributor[] | null;
  actionsTaken?: any[] | null;
  findingCategory?: string | null;
  findingName?: string | null;
  policyTags?: string[] | null;
  repositoryTags?: any[] | null;
  applicationTags?: any[] | null;
  orgTeamTags?: any[] | null;
  [k: string]: unknown;
};

export type ApiiroRisksPage = {
  next?: string | null;
  items: RiskItem[];
};

export type RisksAggregation = {
  risks: RiskItem[];
  totalCount: number;
};

/**
 * Represents Mean Time To Resolution (MTTR) statistics for a specific risk level.
 * This type contains performance metrics comparing actual resolution times against SLA targets.
 */
export type MttrStatistic = {
  riskLevel: string | null;
  meanTimeInHours: number;
  slaInHours: number;
};

/**
 * Array of MTTR statistics for different risk levels.
 * Typically contains statistics for all risk levels: Critical, High, Medium, and Low.
 */
export type MttrResponse = MttrStatistic[];

/**
 * Represents a single data point for risk score over time.
 * Contains the date and the risk score count for that specific day.
 */
export type RiskScoreOverTimeDataPoint = {
  date: string | null; // Format: YYYY-MM-DD
  count: number;
};

/**
 * Array of risk score data points over time.
 * Provides historical data showing how risk scores change over time.
 */
export type RiskScoreOverTimeResponse = RiskScoreOverTimeDataPoint[];

/**
 * Represents SLA breach statistics for a specific risk level.
 * Contains metrics for SLA breaches, adherence, and unset due dates.
 */
export type SlaBreachStatistic = {
  riskLevel: string | null;
  slaBreach: number;
  slaAdherence: number;
  unsetDueDate: number;
};

/**
 * Array of SLA breach statistics for different risk levels.
 * Typically contains statistics for all risk levels: Critical, High, Medium, and Low.
 */
export type SlaBreachResponse = SlaBreachStatistic[];

/**
 * Represents a top risk entry with rule information and statistics.
 * Contains details about the most frequent or impactful risks in a repository.
 */
export type TopRiskItem = {
  ruleName: string | null;
  count: number;
  severity: string | null;
  devPhase: string | null;
};

/**
 * Array of top risk items for a repository.
 * Provides ranking of the most significant risks by frequency or impact.
 */
export type TopRisksResponse = TopRiskItem[];

/**
 * Represents a single filter option item.
 * Includes name and displayName fields used for transformation.
 */
export type FilterOption = {
  name: string | null;
  displayName: string | null;
  [key: string]: any; // Allow other fields from API
};

/**
 * Represents a filter category with its available options.
 * Only includes the fields we use for transformation.
 */
export type FilterCategory = {
  name: string | null;
  filterOptions: FilterOption[];
  [key: string]: any; // Allow other fields from API but we only use these two
};

/**
 * Raw response from the Apiiro filter options API.
 * Array of filter categories with their respective options.
 */
export type ApiiroFilterOptionsResponse = FilterCategory[];

/**
 * Transformed filter options response for the frontend.
 * Maps filter category names to arrays of filter option names.
 * Example: { "RiskLevel": ["Critical", "High", "Medium", "Low"] }
 */
export type FilterOptionsResponse = Record<string, string[]>;
