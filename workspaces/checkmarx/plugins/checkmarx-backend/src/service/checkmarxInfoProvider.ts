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
import { Config } from '@backstage/config';
import { NotFoundError, ResponseError } from '@backstage/errors';
import fetch, { Response } from 'node-fetch';
import {
  CheckmarxCounters,
  CheckmarxEntitySummary,
  ContainersCounters,
  GenericEngineCounters,
  ScaPackagesCounters,
  SeverityCounter,
} from '@backstage-community/plugin-checkmarx-react';

type SupportedLocation =
  | 'US'
  | 'US2'
  | 'EU'
  | 'EU2'
  | 'DEU'
  | 'ANZ'
  | 'IND'
  | 'SNG'
  | 'MEA';

const LOCATION_BASE_URLS: Record<
  SupportedLocation,
  { ast: string; iam: string }
> = {
  US: {
    ast: 'https://ast.checkmarx.net',
    iam: 'https://iam.checkmarx.net',
  },
  US2: {
    ast: 'https://us.ast.checkmarx.net',
    iam: 'https://us.iam.checkmarx.net',
  },
  EU: {
    ast: 'https://eu.ast.checkmarx.net',
    iam: 'https://eu.iam.checkmarx.net',
  },
  EU2: {
    ast: 'https://eu-2.ast.checkmarx.net',
    iam: 'https://eu-2.iam.checkmarx.net',
  },
  DEU: {
    ast: 'https://deu.ast.checkmarx.net',
    iam: 'https://deu.iam.checkmarx.net',
  },
  ANZ: {
    ast: 'https://anz.ast.checkmarx.net',
    iam: 'https://anz.iam.checkmarx.net',
  },
  IND: {
    ast: 'https://ind.ast.checkmarx.net',
    iam: 'https://ind.iam.checkmarx.net',
  },
  SNG: {
    ast: 'https://sng.ast.checkmarx.net',
    iam: 'https://sng.iam.checkmarx.net',
  },
  MEA: {
    ast: 'https://mea.ast.checkmarx.net',
    iam: 'https://mea.iam.checkmarx.net',
  },
};

export interface CheckmarxInstanceConfig {
  location: SupportedLocation;
  tenant: string;
  apiKey: string;
  astBaseUrl: string;
  iamBaseUrl: string;
  externalBaseUrl?: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface ScanListResponse {
  scans?: ScanResponse[];
}

interface ScanResponse {
  id: string;
  branch?: string;
  createdAt?: string;
  updatedAt?: string;
  projectId: string;
  projectName?: string;
  engines?: string[];
}

interface ScanSummaryResponse {
  scansSummaries?: ScanSummaryItem[];
}

interface ScanSummaryItem {
  sastCounters?: RawGenericCounters;
  kicsCounters?: RawGenericCounters;
  scaCounters?: RawGenericCounters;
  scaPackagesCounters?: RawScaPackagesCounters;
  apiSecCounters?: RawGenericCounters;
  containersCounters?: RawContainersCounters;
}

interface RawAgeCounter {
  age: string;
  counter: number;
  severityCounters?: SeverityCounter[];
}

interface RawGenericCounters {
  severityCounters?: SeverityCounter[];
  statusCounters?: Array<{ status: string; counter: number }>;
  stateCounters?: Array<{ state: string; counter: number }>;
  ageCounters?: RawAgeCounter[];
  totalCounter?: number;
  filesScannedCounter?: number;
  languageCounters?: Array<{ language: string; counter: number }>;
  complianceCounters?: Array<{ compliance: string; counter: number }>;
}

interface RawScaPackagesCounters extends RawGenericCounters {
  outdatedCounter?: number;
  riskLevelCounters?: Array<{ riskLevel: string; counter: number }>;
  licenseCounters?: Array<{ license: string; counter: number }>;
}

interface RawContainersCounters extends RawGenericCounters {
  totalPackagesCounter?: number;
}

const sanitizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const buildScanUrl = (baseUrl: string, projectId: string) =>
  `${sanitizeBaseUrl(baseUrl)}/projects/${encodeURIComponent(projectId)}/scans`;

const getSeverityCount = (
  counters: SeverityCounter[] | undefined,
  severity: string,
) => counters?.find(counter => counter.severity === severity)?.counter ?? 0;

const normalizeGenericCounters = (
  counters?: RawGenericCounters,
): GenericEngineCounters => ({
  severityCounters: counters?.severityCounters ?? [],
  statusCounters: counters?.statusCounters ?? [],
  stateCounters: counters?.stateCounters ?? [],
  ageCounters: counters?.ageCounters ?? [],
  totalCounter: counters?.totalCounter ?? 0,
  filesScannedCounter: counters?.filesScannedCounter ?? 0,
  languageCounters: counters?.languageCounters ?? [],
  complianceCounters: counters?.complianceCounters ?? [],
});

const normalizeScaPackagesCounters = (
  counters?: RawScaPackagesCounters,
): ScaPackagesCounters => ({
  severityCounters: counters?.severityCounters ?? [],
  statusCounters: counters?.statusCounters ?? [],
  stateCounters: counters?.stateCounters ?? [],
  ageCounters: counters?.ageCounters ?? [],
  totalCounter: counters?.totalCounter ?? 0,
  outdatedCounter: counters?.outdatedCounter ?? 0,
  riskLevelCounters: counters?.riskLevelCounters ?? [],
  licenseCounters: counters?.licenseCounters ?? [],
});

const normalizeContainerCounters = (
  counters?: RawContainersCounters,
): ContainersCounters => ({
  ...normalizeGenericCounters(counters),
  totalPackagesCounter: counters?.totalPackagesCounter ?? 0,
});

const ageBucketWeight = (age: string) => {
  if (age.endsWith('+')) {
    return Number.parseInt(age, 10) + 1000;
  }

  if (age.includes('-')) {
    const [, upperBound] = age.split('-');
    return Number.parseInt(upperBound, 10);
  }

  return Number.parseInt(age, 10) || 0;
};

export const getOldestAgeLabel = (
  ageCounters: Array<{ age: string; counter: number }> = [],
) => {
  const nonEmpty = ageCounters.filter(counter => counter.counter > 0);
  if (nonEmpty.length === 0) {
    return null;
  }

  return [...nonEmpty].sort(
    (left, right) => ageBucketWeight(right.age) - ageBucketWeight(left.age),
  )[0].age;
};

const getRecurrentFindings = (counters: GenericEngineCounters) =>
  counters.statusCounters.find(counter => counter.status === 'RECURRENT')
    ?.counter ?? 0;

const sumCriticalHighFindings = (counters: CheckmarxCounters) =>
  [
    counters.sast.severityCounters,
    counters.kics.severityCounters,
    counters.sca.severityCounters,
    counters.scaPackages.severityCounters,
    counters.apiSec.severityCounters,
    counters.containers.severityCounters,
  ].reduce(
    (total, severityCounters) =>
      total +
      getSeverityCount(severityCounters, 'CRITICAL') +
      getSeverityCount(severityCounters, 'HIGH'),
    0,
  );

export const normalizeCheckmarxSummary = (options: {
  projectId: string;
  projectName?: string;
  branch: string;
  scanId: string;
  scanUrl: string;
  lastUpdated: string;
  engines: string[];
  summary: ScanSummaryItem;
}): CheckmarxEntitySummary => {
  const counters: CheckmarxCounters = {
    sast: normalizeGenericCounters(options.summary.sastCounters),
    kics: normalizeGenericCounters(options.summary.kicsCounters),
    sca: normalizeGenericCounters(options.summary.scaCounters),
    scaPackages: normalizeScaPackagesCounters(
      options.summary.scaPackagesCounters,
    ),
    apiSec: normalizeGenericCounters(options.summary.apiSecCounters),
    containers: normalizeContainerCounters(options.summary.containersCounters),
  };

  const recurrentFindings = getRecurrentFindings(counters.sast);

  return {
    projectId: options.projectId,
    projectName: options.projectName,
    branch: options.branch,
    scanId: options.scanId,
    scanUrl: options.scanUrl,
    lastUpdated: options.lastUpdated,
    engines: options.engines,
    metrics: {
      sastFindings: counters.sast.totalCounter,
      criticalHighFindings: sumCriticalHighFindings(counters),
      scaPackages: counters.scaPackages.totalCounter,
      outdatedPackages: counters.scaPackages.outdatedCounter,
      recurrentFindings,
      recurrentFindingsPercent:
        counters.sast.totalCounter > 0
          ? Math.round((recurrentFindings / counters.sast.totalCounter) * 100)
          : null,
      additionalFindings:
        counters.kics.totalCounter +
        counters.apiSec.totalCounter +
        counters.containers.totalCounter,
      oldestAgeLabel: getOldestAgeLabel(counters.sast.ageCounters),
    },
    counters,
  };
};

export class CheckmarxConfig {
  private constructor(private readonly instance: CheckmarxInstanceConfig) {}

  static fromConfig(config: Config): CheckmarxConfig {
    const checkmarxConfig = config.getConfig('checkmarx');
    const getOptionalNonEmptyString = (key: string) => {
      const value = checkmarxConfig.getOptionalString(key);
      return value?.trim() ? value : undefined;
    };
    const location = checkmarxConfig.getString('location') as SupportedLocation;
    const tenant = checkmarxConfig.getString('tenant');
    const apiKey = checkmarxConfig.getString('apiKey');
    const externalBaseUrl = getOptionalNonEmptyString('externalBaseUrl');
    const astBaseUrlOverride = getOptionalNonEmptyString('astBaseUrlOverride');
    const iamBaseUrlOverride = getOptionalNonEmptyString('iamBaseUrlOverride');
    const baseUrls = LOCATION_BASE_URLS[location];

    if (!baseUrls && !astBaseUrlOverride && !iamBaseUrlOverride) {
      throw new Error(
        `Unsupported Checkmarx location ${location}. Configure astBaseUrlOverride and iamBaseUrlOverride to use a custom region.`,
      );
    }

    return new CheckmarxConfig({
      location,
      tenant,
      apiKey,
      astBaseUrl: sanitizeBaseUrl(astBaseUrlOverride ?? baseUrls?.ast ?? ''),
      iamBaseUrl: sanitizeBaseUrl(iamBaseUrlOverride ?? baseUrls?.iam ?? ''),
      externalBaseUrl: externalBaseUrl
        ? sanitizeBaseUrl(externalBaseUrl)
        : undefined,
    });
  }

  getInstanceConfig(): CheckmarxInstanceConfig {
    return this.instance;
  }
}

export class CheckmarxTokenManager {
  private cachedToken?: { value: string; expiresAt: number };

  private pendingPromise?: Promise<string>;

  constructor(
    private readonly config: CheckmarxInstanceConfig,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt - now > 60_000) {
      return this.cachedToken.value;
    }

    if (!this.pendingPromise) {
      this.pendingPromise = this.refreshAccessToken().finally(() => {
        this.pendingPromise = undefined;
      });
    }

    return this.pendingPromise;
  }

  private async refreshAccessToken(): Promise<string> {
    const tokenUrl = `${
      this.config.iamBaseUrl
    }/auth/realms/${encodeURIComponent(
      this.config.tenant,
    )}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: 'ast-app',
      refresh_token: this.config.apiKey,
    }).toString();

    const response = await this.fetchFn(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response as unknown as Response);
    }

    const token = (await response.json()) as TokenResponse;
    this.cachedToken = {
      value: token.access_token,
      expiresAt: Date.now() + token.expires_in * 1000,
    };

    return token.access_token;
  }
}

export interface CheckmarxInfoProvider {
  getSummary(options: {
    projectId: string;
    defaultBranch?: string;
  }): Promise<CheckmarxEntitySummary>;
}

export class DefaultCheckmarxInfoProvider implements CheckmarxInfoProvider {
  private readonly tokenManager: CheckmarxTokenManager;

  private constructor(
    private readonly config: CheckmarxInstanceConfig,
    fetchFn: typeof fetch = fetch,
  ) {
    this.tokenManager = new CheckmarxTokenManager(config, fetchFn);
    this.fetchFn = fetchFn;
  }

  private readonly fetchFn: typeof fetch;

  static fromConfig(
    config: Config,
    options?: { fetchFn?: typeof fetch },
  ): DefaultCheckmarxInfoProvider {
    const instance = CheckmarxConfig.fromConfig(config).getInstanceConfig();
    return new DefaultCheckmarxInfoProvider(instance, options?.fetchFn);
  }

  private async callApi<T>(
    path: string,
    query: Record<string, string | number | undefined>,
  ): Promise<T> {
    const token = await this.tokenManager.getAccessToken();
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    });

    const url = `${this.config.astBaseUrl}${path}?${params.toString()}`;
    const response = await this.fetchFn(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response as unknown as Response);
    }

    return (await response.json()) as T;
  }

  private async findLatestCompletedScan(options: {
    projectId: string;
    defaultBranch?: string;
  }) {
    const query = options.defaultBranch
      ? {
          'project-id': options.projectId,
          statuses: 'Completed',
          offset: 0,
          limit: 1,
          branch: options.defaultBranch,
        }
      : {
          'project-id': options.projectId,
          statuses: 'Completed',
          offset: 0,
          limit: 1,
          branches: 'main,master',
        };

    const response = await this.callApi<ScanListResponse>('/api/scans', query);
    return response.scans?.[0];
  }

  async getSummary(options: {
    projectId: string;
    defaultBranch?: string;
  }): Promise<CheckmarxEntitySummary> {
    const latestScan = await this.findLatestCompletedScan(options);

    if (!latestScan?.id) {
      throw new NotFoundError(
        options.defaultBranch
          ? `No completed Checkmarx scan found for project ${options.projectId} on branch ${options.defaultBranch}`
          : `No completed Checkmarx scan found for project ${options.projectId} on branches main or master`,
      );
    }

    const scanSummary = await this.callApi<ScanSummaryResponse>(
      '/api/scan-summary',
      {
        'scan-ids': latestScan.id,
        'include-severity-status': 'true',
      },
    );

    const summary = scanSummary.scansSummaries?.[0];
    if (!summary) {
      throw new NotFoundError(
        `Checkmarx scan-summary returned no data for scan ${latestScan.id}`,
      );
    }

    return normalizeCheckmarxSummary({
      projectId: latestScan.projectId,
      projectName: latestScan.projectName,
      branch: latestScan.branch ?? options.defaultBranch ?? 'main',
      scanId: latestScan.id,
      scanUrl: buildScanUrl(
        this.config.externalBaseUrl ?? this.config.astBaseUrl,
        latestScan.projectId,
      ),
      lastUpdated:
        latestScan.updatedAt ??
        latestScan.createdAt ??
        new Date().toISOString(),
      engines: latestScan.engines ?? [],
      summary,
    });
  }
}
