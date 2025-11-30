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
import { Config } from '@backstage/config';
import {
  RepositoriesAggregation,
  ApiiroRepositoriesPage,
  RisksAggregation,
  ApiiroRisksPage,
  RiskFilters,
  MttrResponse,
  RiskScoreOverTimeResponse,
  SlaBreachResponse,
  TopRisksResponse,
  ApiiroFilterOptionsResponse,
} from './data.service.types';
import {
  parseApiiroRepositoriesPage,
  parseApiiroRisksPage,
} from './validators';
import {
  APIIRO_DEFAULT_TIMEOUT_MS,
  APIIRO_REPOSITORIES_PATH,
  APIIRO_RISKS_PATH,
  APIIRO_MTTR_PATH,
  APIIRO_RISK_SCORE_OVER_TIME_PATH,
  APIIRO_SLA_BREACH_PATH,
  APIIRO_TOP_RISKS_PATH,
  APIIRO_FILTER_OPTIONS_PATH,
  APIIRO_DEFAULT_PAGE_LIMIT,
} from '../constants';
import { APIIRO_DEFAULT_BASE_URL } from '@backstage-community/plugin-apiiro-common';
import { fetchWithErrorHandling, fetchAllPages } from './utils';

export type ApiiroConfigOptions = {
  baseUrl: string;
  accessToken: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

export class ApiiroConfig {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly fetchFn: typeof fetch;
  private readonly timeoutMs: number;

  static fromConfig(config: Config) {
    const baseUrl = APIIRO_DEFAULT_BASE_URL;

    try {
      const accessToken = config.getString('apiiro.accessToken');
      if (!accessToken || accessToken.trim() === '') {
        throw new Error('Apiiro access token is required but not configured');
      }
      return new ApiiroConfig({ baseUrl, accessToken });
    } catch (error) {
      throw new Error(
        `Failed to load Apiiro configuration: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  constructor(options: ApiiroConfigOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.accessToken = options.accessToken;
    this.fetchFn = options.fetchFn ?? fetch;
    this.timeoutMs = options.timeoutMs ?? APIIRO_DEFAULT_TIMEOUT_MS;
  }

  private buildUrl(pageCursor?: string, repositoryName?: string) {
    const params = new URLSearchParams();
    params.append('limit', APIIRO_DEFAULT_PAGE_LIMIT);
    if (pageCursor) params.append('next', pageCursor);
    if (repositoryName) {
      params.append('filters[RepositoryName][0]', repositoryName);
    }

    return `${this.baseUrl}${APIIRO_REPOSITORIES_PATH}?${params.toString()}`;
  }

  private buildRisksUrl(
    repositoryId: string,
    filters: RiskFilters = {},
    pageCursor?: string,
  ) {
    const params = new URLSearchParams();
    params.append('limit', APIIRO_DEFAULT_PAGE_LIMIT);
    if (pageCursor) params.append('next', pageCursor);

    // Apiiro expects camel-cased RepositoryId and indexed array keys
    params.append('filters[RepositoryId][0]', repositoryId);

    const appendIndexed = (key: string, values?: string[]) => {
      if (!values || values.length === 0) return;
      values.forEach((v, idx) => params.append(`filters[${key}][${idx}]`, v));
    };

    appendIndexed('RiskLevel', filters.RiskLevel);
    appendIndexed('RiskCategory', filters.RiskCategory);
    appendIndexed('RiskInsight', filters.RiskInsight);
    appendIndexed('FindingCategory', filters.FindingCategory);

    // DiscoveredOn requires exactly 2 indexed parameters (start and end)
    if (filters.DiscoveredOn) {
      const { start, end } = filters.DiscoveredOn;
      // Always add both indices, even if one is undefined (Apiiro expects this format)
      params.append('filters[DiscoveredOn][0]', start || '');
      params.append('filters[DiscoveredOn][1]', end || '');
    }

    return `${this.baseUrl}${APIIRO_RISKS_PATH}?${params.toString()}`;
  }

  /**
   * Builds the URL for MTTR statistics API endpoint with repository filter.
   * Constructs URL with filters[RepositoryKeys] parameter as expected by Apiiro API.
   * Also adds a default 30-day date range filter.
   *
   * @param repositoryKey - The repository key to filter MTTR statistics for
   * @returns Complete URL string for the MTTR statistics API endpoint with filters
   */
  private buildMttrUrl(repositoryKey: string) {
    const params = new URLSearchParams();
    params.append('filters[RepositoryKeys]', repositoryKey);

    // Add default 30-day date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    params.append('filters[DashboardDateRange][0]', startDate.toISOString());
    params.append('filters[DashboardDateRange][1]', endDate.toISOString());

    return `${this.baseUrl}${APIIRO_MTTR_PATH}?${params.toString()}`;
  }

  /**
   * Builds the URL for risk score over time API endpoint with repository filter.
   * Constructs URL with filters[RepositoryKeys] parameter as expected by Apiiro API.
   * Also adds a default 30-day date range filter.
   *
   * @param repositoryKey - The repository key to filter risk score over time data for
   * @returns Complete URL string for the risk score over time API endpoint with filters
   */
  private buildRiskScoreOverTimeUrl(repositoryKey: string) {
    const params = new URLSearchParams();
    params.append('filters[RepositoryKeys]', repositoryKey);

    // Add default 30-day date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    params.append('filters[DashboardDateRange][0]', startDate.toISOString());
    params.append('filters[DashboardDateRange][1]', endDate.toISOString());

    return `${
      this.baseUrl
    }${APIIRO_RISK_SCORE_OVER_TIME_PATH}?${params.toString()}`;
  }

  /**
   * Builds the URL for SLA breach statistics API endpoint with repository filter.
   * Constructs URL with filters[RepositoryKeys] parameter as expected by Apiiro API.
   *
   * @param repositoryKey - The repository key to filter SLA breach statistics for
   * @returns Complete URL string for the SLA breach statistics API endpoint with filters
   */
  private buildSlaBreachUrl(repositoryKey: string) {
    return this.buildStatisticsUrl(APIIRO_SLA_BREACH_PATH, repositoryKey);
  }

  /**
   * Builds the URL for top risks statistics API endpoint with repository filter.
   * Constructs URL with filters[RepositoryKeys] parameter as expected by Apiiro API.
   *
   * @param repositoryKey - The repository key to filter top risks statistics for
   * @returns Complete URL string for the top risks statistics API endpoint with filters
   */
  private buildTopRisksUrl(repositoryKey: string) {
    return this.buildStatisticsUrl(APIIRO_TOP_RISKS_PATH, repositoryKey);
  }

  /**
   * Generic helper to build statistics endpoint URLs with repository filter.
   * All statistics endpoints use the same pattern: filters[RepositoryKeys]=value
   *
   * @param path - The API endpoint path
   * @param repositoryKey - The repository key to filter for
   * @returns Complete URL string with filters
   */
  private buildStatisticsUrl(path: string, repositoryKey: string): string {
    const params = new URLSearchParams();
    params.append('filters[RepositoryKeys]', repositoryKey);
    return `${this.baseUrl}${path}?${params.toString()}`;
  }

  async fetchRepositoriesPage(
    pageCursor?: string,
    repositoryName?: string,
  ): Promise<ApiiroRepositoriesPage> {
    const url = this.buildUrl(pageCursor, repositoryName);
    const response = await fetchWithErrorHandling(
      url,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
      this.timeoutMs,
      this.fetchFn,
    );

    try {
      const data = await response.json();
      return parseApiiroRepositoriesPage(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new Error(`Invalid API response format: ${error.message}`);
      }
      throw new Error(
        `Failed to parse API response: ${
          error instanceof Error ? error.message : 'Invalid JSON'
        }`,
      );
    }
  }

  async fetchAllRepositories(
    repositoryName?: string,
  ): Promise<{ items: any[]; totalCount: number }> {
    return fetchAllPages(pageCursor =>
      this.fetchRepositoriesPage(pageCursor, repositoryName),
    );
  }

  async fetchRisksPage(
    repositoryId: string,
    filters: RiskFilters = {},
    pageCursor?: string,
  ): Promise<ApiiroRisksPage> {
    const url = this.buildRisksUrl(repositoryId, filters, pageCursor);
    const response = await fetchWithErrorHandling(
      url,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
      this.timeoutMs,
      this.fetchFn,
    );

    try {
      const data = await response.json();
      return parseApiiroRisksPage(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        throw new Error(`Invalid API response format: ${error.message}`);
      }
      throw new Error(
        `Failed to parse API response: ${
          error instanceof Error ? error.message : 'Invalid JSON'
        }`,
      );
    }
  }

  async fetchAllRisks(
    repositoryId: string,
    filters: RiskFilters = {},
  ): Promise<{ items: any[]; totalCount: number }> {
    return fetchAllPages(pageCursor =>
      this.fetchRisksPage(repositoryId, filters, pageCursor),
    );
  }

  /**
   * Generic helper to fetch statistics data from Apiiro API.
   * All statistics endpoints follow the same pattern: GET request with Bearer token.
   *
   * @param url - The complete URL to fetch from
   * @param errorContext - Context string for error messages (e.g., 'MTTR', 'SLA breach')
   * @returns Promise resolving to the parsed JSON response
   */
  private async fetchStatisticsData<T>(
    url: string,
    errorContext: string,
  ): Promise<T> {
    const response = await fetchWithErrorHandling(
      url,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
      this.timeoutMs,
      this.fetchFn,
    );

    try {
      const data = await response.json();
      return data as T;
    } catch (error) {
      throw new Error(
        `Failed to parse ${errorContext} API response: ${
          error instanceof Error ? error.message : 'Invalid JSON'
        }`,
      );
    }
  }

  /**
   * Fetches MTTR (Mean Time To Resolution) statistics from Apiiro API for a specific repository.
   * This method calls the Apiiro MTTR statistics endpoint and returns data about average resolution
   * times for different risk levels compared to their SLA targets.
   */
  async fetchMttrStatistics(repositoryKey: string): Promise<MttrResponse> {
    const url = this.buildMttrUrl(repositoryKey);
    return this.fetchStatisticsData<MttrResponse>(url, 'MTTR');
  }

  /**
   * Fetches risk score over time statistics from Apiiro API for a specific repository.
   * This method calls the Apiiro risk score over time endpoint and returns historical data
   * showing how risk scores change over time.
   *
   * @param repositoryKey - The unique repository key to fetch risk score over time data for
   * @returns Promise that resolves to RiskScoreOverTimeResponse containing time series data
   * @throws {Error} If the API request fails or returns non-200 status
   */
  async fetchRiskScoreOverTime(
    repositoryKey: string,
  ): Promise<RiskScoreOverTimeResponse> {
    const url = this.buildRiskScoreOverTimeUrl(repositoryKey);
    return this.fetchStatisticsData<RiskScoreOverTimeResponse>(
      url,
      'risk score over time',
    );
  }

  /**
   * Fetches SLA breach statistics from Apiiro API for a specific repository.
   * This method calls the Apiiro SLA breach statistics endpoint and returns data about
   * SLA breaches, adherence, and unset due dates for different risk levels.
   *
   * @param repositoryKey - The unique repository key to fetch SLA breach statistics for
   * @returns Promise that resolves to SlaBreachResponse containing breach statistics
   * @throws {Error} If the API request fails or returns non-200 status
   */
  async fetchSlaBreachStatistics(
    repositoryKey: string,
  ): Promise<SlaBreachResponse> {
    const url = this.buildSlaBreachUrl(repositoryKey);
    return this.fetchStatisticsData<SlaBreachResponse>(url, 'SLA breach');
  }

  /**
   * Fetches top risks statistics from Apiiro API for a specific repository.
   * This method calls the Apiiro top risks statistics endpoint and returns data about
   * the most frequent or impactful risks with their rule names, counts, severity, and development phase.
   *
   * @param repositoryKey - The unique repository key to fetch top risks statistics for
   * @returns Promise that resolves to TopRisksResponse containing top risk items
   * @throws {Error} If the API request fails or returns non-200 status
   */
  async fetchTopRisksStatistics(
    repositoryKey: string,
  ): Promise<TopRisksResponse> {
    const url = this.buildTopRisksUrl(repositoryKey);
    return this.fetchStatisticsData<TopRisksResponse>(url, 'top risks');
  }

  /**
   * Fetches filter options from Apiiro API.
   * Returns the available filter categories and their options.
   *
   * @returns Promise resolving to the filter options response
   */
  async fetchFilterOptions(): Promise<ApiiroFilterOptionsResponse> {
    const url = `${this.baseUrl}${APIIRO_FILTER_OPTIONS_PATH}`;
    return this.fetchStatisticsData<ApiiroFilterOptionsResponse>(
      url,
      'filter options',
    );
  }
}

export class ApiiroDataService {
  private client: ApiiroConfig;

  constructor(client: ApiiroConfig) {
    this.client = client;
  }

  static fromConfig(config: Config) {
    const client = ApiiroConfig.fromConfig(config);
    return new ApiiroDataService(client);
  }

  /**
   * Return a single Apiiro page (keeps `{ next, items }` structure).
   */
  async getRepositoriesPage(
    pageCursor?: string,
    repositoryName?: string,
  ): Promise<ApiiroRepositoriesPage> {
    return this.client.fetchRepositoriesPage(pageCursor, repositoryName);
  }

  /**
   * Return aggregated repositories by fetching all pages until `next` is falsy.
   * Shape: { repositories, totalCount }
   */
  async getAllRepositories(
    pageCursor?: string,
    repositoryName?: string,
  ): Promise<RepositoriesAggregation> {
    if (pageCursor) {
      const page = await this.client.fetchRepositoriesPage(
        pageCursor,
        repositoryName,
      );
      return { repositories: page.items, totalCount: page.items.length };
    }

    const allRepos = await this.client.fetchAllRepositories(repositoryName);
    return { repositories: allRepos.items, totalCount: allRepos.totalCount };
  }

  /**
   * Return a single Apiiro risks page (keeps `{ next, items }` structure).
   */
  async getRisksPage(
    repositoryId: string,
    filters: RiskFilters = {},
    pageCursor?: string,
  ): Promise<ApiiroRisksPage> {
    return this.client.fetchRisksPage(repositoryId, filters, pageCursor);
  }

  /**
   * Return aggregated risks by fetching all pages until `next` is falsy.
   * Shape: { risks, totalCount }
   */
  async getAllRisks(
    repositoryId: string,
    filters: RiskFilters = {},
    pageCursor?: string,
  ): Promise<RisksAggregation> {
    if (pageCursor) {
      const page = await this.client.fetchRisksPage(
        repositoryId,
        filters,
        pageCursor,
      );
      return { risks: page.items, totalCount: page.items.length };
    }

    const allRisks = await this.client.fetchAllRisks(repositoryId, filters);
    return { risks: allRisks.items, totalCount: allRisks.totalCount };
  }

  /**
   * Return MTTR vs SLA statistics for a repository.
   * Uses static mock data for now, ready to be replaced with real API call.
   */
  async getMttrStatistics(repositoryKey: string): Promise<MttrResponse> {
    return this.client.fetchMttrStatistics(repositoryKey);
  }

  /**
   * Return risk score over time statistics for a repository.
   * Uses static mock data for now, ready to be replaced with real API call.
   *
   * @param repositoryKey - The repository key to fetch risk score over time data for
   * @returns Promise that resolves to RiskScoreOverTimeResponse containing mock time series data
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getRiskScoreOverTime(
    repositoryKey: string,
  ): Promise<RiskScoreOverTimeResponse> {
    return this.client.fetchRiskScoreOverTime(repositoryKey);
  }

  /**
   * Return SLA breach statistics for a repository.
   * Fetches data about SLA breaches, adherence, and unset due dates for different risk levels.
   *
   * @param repositoryKey - The repository key to fetch SLA breach statistics for
   * @returns Promise that resolves to SlaBreachResponse containing breach statistics
   */
  async getSlaBreachStatistics(
    repositoryKey: string,
  ): Promise<SlaBreachResponse> {
    return this.client.fetchSlaBreachStatistics(repositoryKey);
  }

  /**
   * Return top risks statistics for a repository.
   * Fetches data about the most frequent or impactful risks with their rule names, counts, severity, and development phase.
   *
   * @param repositoryKey - The repository key to fetch top risks statistics for
   * @returns Promise that resolves to TopRisksResponse containing top risk items
   */
  async getTopRisksStatistics(
    repositoryKey: string,
  ): Promise<TopRisksResponse> {
    return this.client.fetchTopRisksStatistics(repositoryKey);
  }

  /**
   * Return filter options from Apiiro API.
   * Fetches the available filter categories and their options for risk filtering.
   *
   * @returns Promise that resolves to ApiiroFilterOptionsResponse containing all filter categories and options
   */
  async getFilterOptions(): Promise<ApiiroFilterOptionsResponse> {
    return this.client.fetchFilterOptions();
  }
}
