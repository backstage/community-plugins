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

import { Router as ExpressRouter } from 'express';
import Router from 'express-promise-router';
import { CatalogApi } from '@backstage/catalog-client';
import { parseEntityRef } from '@backstage/catalog-model';
import fetch from 'node-fetch';
import {
  ActionItemRow,
  ActionItemsListResponse,
  ActionItemsTopItem,
  ActionItemsTopResponse,
  CostsMtdResponse,
  FairwindsInsightsApiConfig,
  ResourcesSummaryTimeseriesResponse,
  ResourcesTotalCostsResponse,
  severityNumericToLabel,
  VulnerabilitiesResponse,
} from '@backstage-community/plugin-fairwinds-insights-common';
import {
  AuthService,
  CacheService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';

export interface RouterOptions {
  config: RootConfigService;
  catalogApi: CatalogApi;
  logger: LoggerService;
  auth: AuthService;
  cache: CacheService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<ExpressRouter> {
  const { config, catalogApi, logger, auth, cache } = options;

  const router = Router();

  const apiConfig: FairwindsInsightsApiConfig = {
    apiUrl:
      config.getOptionalString('fairwindsInsights.apiUrl') ??
      'https://insights.fairwinds.com',
    apiKey: config.getString('fairwindsInsights.apiKey'),
    organization: config.getString('fairwindsInsights.organization'),
    cacheTTL: config.getOptionalNumber('fairwindsInsights.cacheTTL') ?? 300,
  };

  function buildInsightsUiUrl(
    path: string,
    queryParams?: URLSearchParams,
  ): string {
    const base = apiConfig.apiUrl!.endsWith('/')
      ? apiConfig.apiUrl!.slice(0, -1)
      : apiConfig.apiUrl!;
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const baseUrl = `${base}/orgs/${apiConfig.organization}/`;
    const url = new URL(normalizedPath, baseUrl);
    if (queryParams) {
      url.search = queryParams.toString();
    }

    return url.toString();
  }

  async function getAppGroupsFromEntity(
    entityRef: string,
  ): Promise<string[] | null> {
    try {
      const parsedRef = parseEntityRef(entityRef);
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const entity = await catalogApi.getEntityByRef(parsedRef, { token });

      if (!entity) {
        logger.warn(`Entity not found: ${entityRef}`);
        return null;
      }

      // Try annotation first (preferred)
      const appGroupsFromAnnotation =
        entity.metadata.annotations?.['insights.fairwinds.com/app-groups'];
      if (appGroupsFromAnnotation) {
        // Parse comma-separated values and trim whitespace
        const groups = appGroupsFromAnnotation
          .split(',')
          .map(g => g.trim())
          .filter(g => g.length > 0);
        if (groups.length > 0) {
          return groups;
        }
      }

      // Fallback to spec (support both single value and comma-separated)
      const appGroupsFromSpec =
        (entity.spec as any)?.['app-groups'] ||
        (entity.spec as any)?.['app-group'];
      if (appGroupsFromSpec) {
        const specValue =
          typeof appGroupsFromSpec === 'string'
            ? appGroupsFromSpec
            : String(appGroupsFromSpec);
        const groups = specValue
          .split(',')
          .map(g => g.trim())
          .filter(g => g.length > 0);
        if (groups.length > 0) {
          return groups;
        }
      }

      logger.warn(
        `No app-groups found for entity ${entityRef}. Expected annotation 'insights.fairwinds.com/app-groups' or spec.app-groups`,
      );
      return null;
    } catch (error) {
      logger.error(`Error fetching entity ${entityRef}:`, error);
      return null;
    }
  }

  type AppGroupKey = 'app-groups' | 'appGroups' | 'appGroup' | 'AppGroup';

  function buildAppGroupsQuery(
    appGroups: string[],
    appGroupKey: AppGroupKey = 'app-groups',
  ): URLSearchParams {
    const params = new URLSearchParams();
    appGroups.forEach(g => {
      params.append(appGroupKey, encodeURIComponent(g));
    });
    return params;
  }

  async function fetchFromInsightsApi<T>(
    endpoint: string,
    appGroups: string[],
    appGroupKey: AppGroupKey = 'app-groups',
  ): Promise<T> {
    const separator = endpoint.includes('?') ? '&' : '?';
    const appGroupsQuery = buildAppGroupsQuery(
      appGroups,
      appGroupKey,
    ).toString();
    const url = `${apiConfig.apiUrl}${endpoint}${separator}${appGroupsQuery}`;

    const headers = {
      Authorization: `Bearer ${apiConfig.apiKey}`,
      'Content-Type': 'application/json',
    };

    logger.debug(
      `Fetching from Insights API: ${url} with appGroups: ${appGroups.join(
        ', ',
      )}`,
    );

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Fairwinds Insights API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  interface ActionItem {
    Category: string;
    Cluster: string;
    Description: string;
    EventType: string;
    FirstSeen: string;
    Fixed: boolean;
    ID: number;
    ImageName: string;
    ImageSHA: string;
    ImageTag: string;
    IsCustom: boolean;
    LastReportedAt: string;
    Annotations: Record<string, string>;
    NamespaceLabels: Record<string, string>;
    PodLabels: Record<string, string>;
    ResourceLabels: Record<string, string>;
    Remediation: string;
    ReportType: string;
    Resolution: string;
    ResourceContainer: string;
    ResourceKind: string;
    ResourceName: string;
    ResourceNamespace: string;
    Severity: number;
    Tags: string[] | null;
    Title: string;
  }

  async function fetchFromInsightsApiWithHeaders(
    endpoint: string,
    appGroups: string[],
    appGroupKey: AppGroupKey = 'AppGroup',
  ): Promise<{ data: ActionItem[]; totalSize: number }> {
    const separator = endpoint.includes('?') ? '&' : '?';
    const appGroupsQuery = buildAppGroupsQuery(
      appGroups,
      appGroupKey,
    ).toString();
    const url = `${apiConfig.apiUrl}${endpoint}${separator}${appGroupsQuery}`;
    const headers = {
      Authorization: `Bearer ${apiConfig.apiKey}`,
      'Content-Type': 'application/json',
    };
    logger.debug(
      `Fetching from Insights API (with headers): ${url} with appGroups: ${appGroups.join(
        ', ',
      )}`,
    );
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Fairwinds Insights API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }
    const data = (await response.json()) as ActionItem[];
    const totalHeader = response.headers.get('total-size') ?? data.length;
    return { data, totalSize: Number(totalHeader) };
  }

  function formatLabelsOrAnnotations(obj: Record<string, string>): string {
    return Object.entries(obj)
      .map(([k, v]) => `${k}=${String(v)}`)
      .join(', ');
  }

  function normalizeActionItemRow(item: ActionItem): ActionItemRow {
    const resourceLabels = item.ResourceLabels;
    const annotations = item.Annotations;
    return {
      id: String(item.ID),
      title: item.Title,
      severity: severityNumericToLabel(item.Severity),
      category: item.Category,
      report: item.ReportType,
      cluster: item.Cluster,
      name: item.ResourceName,
      namespace: item.ResourceNamespace,
      container: item.ResourceContainer,
      labels: formatLabelsOrAnnotations(resourceLabels),
      annotations: formatLabelsOrAnnotations(annotations),
    };
  }

  async function getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    const cached = await cache.get(cacheKey);
    if (cached !== undefined) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return cached as T;
    }

    logger.debug(`Cache miss for ${cacheKey}, fetching...`);
    const data = await fetchFn();
    await cache.set(cacheKey, data as any, {
      ttl: apiConfig.cacheTTL * 1000,
    });
    return data;
  }

  type VulnerabilitiesSummaryResponse = {
    summaries: any[];
    total: number;
  };

  type VulnerabilitiesTopResponse = {
    count: number;
    value: string;
  };

  /**
   * GET /vulnerabilities?entityRef=...
   */
  router.get('/vulnerabilities', async (req, res) => {
    const { entityRef } = req.query;

    if (!entityRef || typeof entityRef !== 'string') {
      res.status(400).json({
        error: 'Missing required query parameter: entityRef',
      });
      return;
    }

    try {
      const appGroups = await getAppGroupsFromEntity(entityRef);

      if (!appGroups || appGroups.length === 0) {
        res.status(404).json({
          error: 'Entity does not have app-groups configured',
          details:
            'Entity must have insights.fairwinds.com/app-groups annotation or spec.app-groups',
        });
        return;
      }

      const cacheKey = `vulnerabilities:${appGroups.sort().join(',')}`;

      const response = await getCachedOrFetch<VulnerabilitiesResponse>(
        cacheKey,
        async () => {
          const baseUrl = `/v0/organizations/${apiConfig.organization}/images/vulnerabilities`;
          const queryParams =
            'resolved=false&onlyCriticalAndHighSeverities=true';

          const [summaries, topByTitle, topBySeverity, topByPackage] =
            await Promise.all([
              fetchFromInsightsApi<VulnerabilitiesSummaryResponse>(
                `${baseUrl}/summaries?page=0&pageSize=25&${queryParams}`,
                appGroups,
              ),
              fetchFromInsightsApi<VulnerabilitiesTopResponse[]>(
                `${baseUrl}/top?groupBy=title&${queryParams}`,
                appGroups,
              ),
              fetchFromInsightsApi<VulnerabilitiesTopResponse[]>(
                `${baseUrl}/top?groupBy=severity&${queryParams}`,
                appGroups,
              ),
              fetchFromInsightsApi<VulnerabilitiesTopResponse[]>(
                `${baseUrl}/top?groupBy=package&${queryParams}`,
                appGroups,
              ),
            ]);

          return {
            topByTitle: topByTitle.map(item => ({
              count: item.count,
              title: item.value || '',
            })),
            topBySeverity: topBySeverity.map(item => ({
              count: item.count,
              title: item.value || '',
            })),
            topByPackage: topByPackage.map(item => ({
              count: item.count,
              title: item.value || '',
            })),
            items: [], // Full items list would come from a different endpoint
            total: summaries.total || 0,
          };
        },
      );

      const queryParams = buildAppGroupsQuery(appGroups, 'appGroups');

      res.json({
        ...response,
        insightsUrl: buildInsightsUiUrl(
          '/vulnerabilities/all-images',
          queryParams,
        ),
      });
    } catch (error: any) {
      logger.error('Error fetching vulnerabilities:', error);
      res.status(500).json({
        error: 'Failed to fetch vulnerabilities',
        message: error.message,
      });
    }
  });

  /**
   * GET /action-items?entityRef=...&page=0&pageSize=25&orderBy=Severity.desc&Search=&ReportType=&Fixed=false&Resolution=None
   * List-only; total from response header total-size.
   */
  router.get('/action-items', async (req, res) => {
    const {
      entityRef,
      page = '0',
      pageSize = '25',
      orderBy = 'Severity.desc',
      Search = '',
      ReportType = '',
      Fixed = 'false',
      Resolution = 'None',
    } = req.query;

    if (!entityRef || typeof entityRef !== 'string') {
      res.status(400).json({
        error: 'Missing required query parameter: entityRef',
      });
      return;
    }

    try {
      const appGroups = await getAppGroupsFromEntity(entityRef);

      if (!appGroups || appGroups.length === 0) {
        res.status(404).json({
          error: 'Entity does not have app-groups configured',
          details:
            'Entity must have insights.fairwinds.com/app-groups annotation or spec.app-groups',
        });
        return;
      }

      const basePath = `/v0/organizations/${apiConfig.organization}/action-items`;
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('orderBy', String(orderBy));
      params.set('Fixed', String(Fixed));
      params.set('Resolution', String(Resolution));
      if (Search) params.set('Search', String(Search));
      if (ReportType) params.set('ReportType', String(ReportType));
      const listUrl = `${basePath}?${params.toString()}`;

      const cacheKey = `action-items:${[...appGroups]
        .sort()
        .join(
          ',',
        )}:${page}:${pageSize}:${orderBy}:${Search}:${ReportType}:${Fixed}:${Resolution}`;
      const { data: items, totalSize } = await getCachedOrFetch<{
        data: ActionItem[];
        totalSize: number;
      }>(cacheKey, () => fetchFromInsightsApiWithHeaders(listUrl, appGroups));

      const queryParams = buildAppGroupsQuery(appGroups, 'AppGroup');
      queryParams.append('page', String(page));
      queryParams.append('orderBy', String(orderBy));
      queryParams.append('pageSize', String(pageSize));
      queryParams.append('Fixed', String(Fixed));
      queryParams.append('Resolution', String(Resolution));
      if (Search) queryParams.append('Search', String(Search));
      if (ReportType) queryParams.append('ReportType', String(ReportType));

      const response: ActionItemsListResponse = {
        data: items.map(normalizeActionItemRow),
        total: totalSize,
        insightsUrl: buildInsightsUiUrl('/action-items', queryParams),
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Error fetching action items:', error);
      res.status(500).json({
        error: 'Failed to fetch action items',
        message: error.message,
      });
    }
  });

  /**
   * GET /action-item-filters?entityRef=...&Fixed=false&Resolution=None&Field=ReportType
   */
  router.get('/action-item-filters', async (req, res) => {
    const {
      entityRef,
      Fixed = 'false',
      Resolution = 'None',
      Field = 'ReportType',
    } = req.query;

    if (!entityRef || typeof entityRef !== 'string') {
      res.status(400).json({
        error: 'Missing required query parameter: entityRef',
      });
      return;
    }

    try {
      const appGroups = await getAppGroupsFromEntity(entityRef);

      if (!appGroups || appGroups.length === 0) {
        res.status(404).json({
          error: 'Entity does not have app-groups configured',
          details:
            'Entity must have insights.fairwinds.com/app-groups annotation or spec.app-groups',
        });
        return;
      }

      const basePath = `/v0/organizations/${apiConfig.organization}/action-item-filters`;
      const params = new URLSearchParams();
      params.set('Fixed', String(Fixed));
      params.set('Resolution', String(Resolution));
      params.set('Field', String(Field));
      const filtersUrl = `${basePath}?${params.toString()}`;

      const cacheKey = `action-item-filters:${[...appGroups]
        .sort()
        .join(',')}:${Fixed}:${Resolution}:${Field}`;
      const data = await getCachedOrFetch<{ ReportType: string[] }>(
        cacheKey,
        () =>
          fetchFromInsightsApi<{ ReportType: string[] }>(
            filtersUrl,
            appGroups,
            'AppGroup',
          ),
      );

      res.json(data ?? { ReportType: [] });
    } catch (error: any) {
      logger.error('Error fetching action item filters:', error);
      res.status(500).json({
        error: 'Failed to fetch action item filters',
        message: error.message,
      });
    }
  });

  function normalizeActionItemsTop(
    items: any[],
    labelKey: string,
  ): ActionItemsTopItem[] {
    const arr = Array.isArray(items) ? items : [];
    return arr.map((item: any) => {
      const count = item.Count ?? 0;
      const title = item[labelKey] ?? '';
      return { count, title };
    });
  }

  /**
   * GET /action-items/top?entityRef=...
   * Returns four top datasets for charts (severity, title, namespace, resource).
   */
  router.get('/action-items/top', async (req, res) => {
    const { entityRef } = req.query;

    if (!entityRef || typeof entityRef !== 'string') {
      res.status(400).json({
        error: 'Missing required query parameter: entityRef',
      });
      return;
    }

    try {
      const appGroups = await getAppGroupsFromEntity(entityRef);

      if (!appGroups || appGroups.length === 0) {
        res.status(404).json({
          error: 'Entity does not have app-groups configured',
          details:
            'Entity must have insights.fairwinds.com/app-groups annotation or spec.app-groups',
        });
        return;
      }

      const cacheKey = `action-items-top:${appGroups.sort().join(',')}`;
      const basePath = `/v0/organizations/${apiConfig.organization}/action-items/top`;
      const query = 'page=0&pageSize=6&Fixed=false&Resolution=None';

      const response = await getCachedOrFetch<ActionItemsTopResponse>(
        cacheKey,
        async () => {
          const [bySeverity, byTitle, byNamespace, byResource] =
            await Promise.all([
              fetchFromInsightsApi<any[]>(
                `${basePath}?groupBy=severity&${query}`,
                appGroups,
              ),
              fetchFromInsightsApi<any[]>(
                `${basePath}?groupBy=title&${query}`,
                appGroups,
              ),
              fetchFromInsightsApi<any[]>(
                `${basePath}?groupBy=namespace&${query}`,
                appGroups,
              ),
              fetchFromInsightsApi<any[]>(
                `${basePath}?groupBy=resource&${query}`,
                appGroups,
              ),
            ]);

          return {
            topBySeverity: normalizeActionItemsTop(bySeverity, 'Severity'),
            topByTitle: normalizeActionItemsTop(byTitle, 'Title'),
            topByNamespace: normalizeActionItemsTop(byNamespace, 'Namespace'),
            topByResource: normalizeActionItemsTop(byResource, 'Resource'),
          };
        },
      );

      const queryParams = buildAppGroupsQuery(appGroups, 'AppGroup');
      queryParams.append('page', '0');
      queryParams.append('pageSize', '6');
      queryParams.append('Fixed', 'false');
      queryParams.append('Resolution', 'None');

      res.json({
        ...response,
        insightsUrl: buildInsightsUiUrl('/action-items', queryParams),
      });
    } catch (error: any) {
      logger.error('Error fetching action items top:', error);
      res.status(500).json({
        error: 'Failed to fetch action items top',
        message: error.message,
      });
    }
  });

  /** Downsample granularity: daily = no averaging, weekly/monthly = average into that bucket */
  type DownsampleGranularity = 'daily' | 'weekly' | 'monthly';

  function getDownsampleGranularity(preset: string): DownsampleGranularity {
    switch (preset) {
      case '7d':
      case '30d':
      case 'last_month':
      case 'mtd':
        return 'daily';
      case '365d':
      case 'last_quarter':
      case 'qtd':
        return 'weekly';
      case 'last_year':
      case 'ytd':
        return 'monthly';
      default:
        return 'daily';
    }
  }

  /** Monday (UTC) of the week containing date YYYY-MM-DD */
  function getWeekStart(isoDateStr: string): string {
    const d = new Date(`${isoDateStr}T00:00:00Z`);
    const day = d.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + mondayOffset);
    return d.toISOString().slice(0, 10);
  }

  /** First day of month for date YYYY-MM-DD */
  function getMonthStart(isoDateStr: string): string {
    return `${isoDateStr.slice(0, 7)}-01`;
  }

  function getCalendarDaysInRange(
    startDate: string,
    endDate: string,
  ): string[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: string[] = [];
    const cursor = new Date(
      Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const endDay = new Date(
      Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    while (cursor <= endDay) {
      days.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }

  function getDateRangeForPreset(preset: string): {
    startDate: string;
    endDate: string;
  } {
    const now = new Date();
    const endOfToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();

    switch (preset) {
      case '7d': {
        const start = new Date(endOfToday);
        start.setUTCDate(start.getUTCDate() - 6);
        start.setUTCHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString(),
          endDate: endOfToday.toISOString(),
        };
      }
      case '30d': {
        const start = new Date(endOfToday);
        start.setUTCDate(start.getUTCDate() - 29);
        start.setUTCHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString(),
          endDate: endOfToday.toISOString(),
        };
      }
      case '365d': {
        const start = new Date(endOfToday);
        start.setUTCDate(start.getUTCDate() - 364);
        start.setUTCHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString(),
          endDate: endOfToday.toISOString(),
        };
      }
      case 'last_month': {
        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
      }
      case 'mtd': {
        const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        return {
          startDate: startDate.toISOString(),
          endDate: endOfToday.toISOString(),
        };
      }
      case 'last_quarter': {
        const q = Math.floor(month / 3) + 1;
        const prevQ = q === 1 ? 4 : q - 1;
        const prevYear = prevQ === 4 ? year - 1 : year;
        const startMonth = (prevQ - 1) * 3;
        const startDate = new Date(
          Date.UTC(prevYear, startMonth, 1, 0, 0, 0, 0),
        );
        const endDate = new Date(
          Date.UTC(prevYear, startMonth + 3, 0, 23, 59, 59, 999),
        );
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
      }
      case 'qtd': {
        const q = Math.floor(month / 3) + 1;
        const startMonth = (q - 1) * 3;
        const startDate = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0));
        return {
          startDate: startDate.toISOString(),
          endDate: endOfToday.toISOString(),
        };
      }
      case 'last_year': {
        const startDate = new Date(Date.UTC(year - 1, 0, 1, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year - 1, 11, 31, 23, 59, 59, 999));
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
      }
      case 'ytd': {
        const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
        return {
          startDate: startDate.toISOString(),
          endDate: endOfToday.toISOString(),
        };
      }
      default:
        return getDateRangeForPreset('30d');
    }
  }

  function getCurrentMtdRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    );
    const endDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  function getPreviousMtdRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0),
    );
    const endDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
    );
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  /**
   * GET /costs-mtd-summary?entityRef=...
   * Returns current and previous MTD from resources-total-costs API.
   */
  router.get('/costs-mtd-summary', async (req, res) => {
    const { entityRef } = req.query;

    if (!entityRef || typeof entityRef !== 'string') {
      res.status(400).json({
        error: 'Missing required query parameter: entityRef',
      });
      return;
    }

    try {
      const appGroups = await getAppGroupsFromEntity(entityRef);

      if (!appGroups || appGroups.length === 0) {
        res.status(404).json({
          error: 'Entity does not have app-groups configured',
          details:
            'Entity must have insights.fairwinds.com/app-groups annotation or spec.app-groups',
        });
        return;
      }

      const cacheKey = `resources-total-costs:mtd:${appGroups
        .sort()
        .join(',')}:${new Date().toISOString().slice(0, 7)}`;

      const currentRange = getCurrentMtdRange();
      const previousRange = getPreviousMtdRange();

      const response = await getCachedOrFetch<CostsMtdResponse>(
        cacheKey,
        async () => {
          const basePath = `/v0/organizations/${apiConfig.organization}/resources-total-costs`;
          const params = 'addNetworkAndStorage=true&skipSavingsAvailable=true';

          const [currentMtd, previousMtd] = await Promise.all([
            fetchFromInsightsApi<ResourcesTotalCostsResponse>(
              `${basePath}?startDate=${encodeURIComponent(
                currentRange.startDate,
              )}&endDate=${encodeURIComponent(currentRange.endDate)}&${params}`,
              appGroups,
              'appGroups',
            ),
            fetchFromInsightsApi<ResourcesTotalCostsResponse>(
              `${basePath}?startDate=${encodeURIComponent(
                previousRange.startDate,
              )}&endDate=${encodeURIComponent(
                previousRange.endDate,
              )}&${params}`,
              appGroups,
              'appGroups',
            ),
          ]);

          return { currentMtd, previousMtd };
        },
      );

      const queryParams = buildAppGroupsQuery(appGroups, 'appGroups');

      queryParams.append('endDate', currentRange.endDate);
      queryParams.append('startDate', currentRange.startDate);
      queryParams.append('orderBy', 'totalCost');
      queryParams.append('orderByDesc', 'true');
      queryParams.append('addNetworkAndStorage', 'true');
      queryParams.append('pageSize', '10');
      queryParams.append('page', '0');
      queryParams.append('aggregators', 'cluster');

      res.json({
        ...response,
        insightsUrl: buildInsightsUiUrl(
          `/efficiency/cumulative-costs`,
          queryParams,
        ),
      });
    } catch (error: any) {
      logger.error('Error fetching costs:', error);
      res.status(500).json({
        error: 'Failed to fetch costs',
        message: error.message,
      });
    }
  });

  type Usage = {
    cpuRaw?: number;
    memoryRaw?: number;
  };

  interface TimeseriesResources {
    averagePodCount?: number;
    minUsage?: Usage;
    averageUsage?: Usage;
    maxUsage?: Usage;
    recommendation?: {
      limits?: Usage;
      requests?: Usage;
    };
    settings?: {
      limits?: Usage;
      requests?: Usage;
    };
  }
  interface TimeseriesEntry {
    time: string;
    resources?: TimeseriesResources;
  }
  interface ResourcesSummaryTimeseriesRawResource {
    timeseries: TimeseriesEntry[];
  }
  interface ResourcesSummaryTimeseriesRawResponse {
    resources: ResourcesSummaryTimeseriesRawResource[];
  }

  /**
   * GET /resources-summary-timeseries?entityRef=...&datePreset=30d
   * Returns aggregated pod count, CPU, and memory series for the three history cards.
   */
  router.get('/resources-summary-timeseries', async (req, res) => {
    const { entityRef, datePreset = '30d' } = req.query;

    if (!entityRef || typeof entityRef !== 'string') {
      res.status(400).json({
        error: 'Missing required query parameter: entityRef',
      });
      return;
    }

    const preset = typeof datePreset === 'string' ? datePreset : '30d';

    try {
      const appGroups = await getAppGroupsFromEntity(entityRef);

      if (!appGroups || appGroups.length === 0) {
        res.status(404).json({
          error: 'Entity does not have app-groups configured',
          details:
            'Entity must have insights.fairwinds.com/app-groups annotation or spec.app-groups',
        });
        return;
      }

      const { startDate, endDate } = getDateRangeForPreset(preset);
      const cacheKey = `resources-summary-timeseries:${appGroups
        .slice()
        .sort()
        .join(',')}:${preset}:${startDate}:${endDate}`;

      const response =
        await getCachedOrFetch<ResourcesSummaryTimeseriesResponse>(
          cacheKey,
          async () => {
            const basePath = `/v0/organizations/${apiConfig.organization}/resources-summary-timeseries`;
            const params = new URLSearchParams();
            params.set('startDate', startDate);
            params.set('endDate', endDate);
            params.set('aggregators', 'cluster');
            params.set('addNetworkAndStorage', 'true');
            params.set('pageSize', '500');
            params.set('page', '0');
            const url = `${basePath}?${params.toString()}`;

            const data =
              await fetchFromInsightsApi<ResourcesSummaryTimeseriesRawResponse>(
                url,
                appGroups,
                'appGroups',
              );

            const byDate = new Map<
              string,
              {
                podSum: number;
                podCount: number;
                cpu: TimeseriesResources;
                memory: TimeseriesResources;
              }
            >();

            function getNum(
              o: { cpuRaw?: number; memoryRaw?: number } | undefined,
              key: 'cpuRaw' | 'memoryRaw',
            ): number {
              return o?.[key] ?? 0;
            }

            for (const resource of data.resources) {
              for (const entry of resource.timeseries) {
                const t = entry.time.slice(0, 10);
                const r = entry.resources;
                if (!t) continue;

                const existing = byDate.get(t);
                if (!existing) {
                  byDate.set(t, {
                    podSum: r?.averagePodCount ?? 0,
                    podCount: 1,
                    cpu: {
                      averagePodCount: r?.averagePodCount,
                      minUsage: r?.minUsage,
                      averageUsage: r?.averageUsage,
                      maxUsage: r?.maxUsage,
                      recommendation: r?.recommendation,
                      settings: r?.settings,
                    },
                    memory: {
                      averagePodCount: r?.averagePodCount,
                      minUsage: r?.minUsage,
                      averageUsage: r?.averageUsage,
                      maxUsage: r?.maxUsage,
                      recommendation: r?.recommendation,
                      settings: r?.settings,
                    },
                  });
                } else {
                  existing.podSum += r?.averagePodCount ?? 0;
                  existing.podCount += 1;
                  existing.cpu = {
                    minUsage: {
                      cpuRaw:
                        (existing.cpu.minUsage?.cpuRaw ?? 0) +
                        getNum(r?.minUsage, 'cpuRaw'),
                    },
                    averageUsage: {
                      cpuRaw:
                        (existing.cpu.averageUsage?.cpuRaw ?? 0) +
                        getNum(r?.averageUsage, 'cpuRaw'),
                    },
                    maxUsage: {
                      cpuRaw:
                        (existing.cpu.maxUsage?.cpuRaw ?? 0) +
                        getNum(r?.maxUsage, 'cpuRaw'),
                    },
                    recommendation: {
                      limits: {
                        cpuRaw:
                          (existing.cpu.recommendation?.limits?.cpuRaw ?? 0) +
                          getNum(r?.recommendation?.limits, 'cpuRaw'),
                      },
                      requests: {
                        cpuRaw:
                          (existing.cpu.recommendation?.requests?.cpuRaw ?? 0) +
                          getNum(r?.recommendation?.requests, 'cpuRaw'),
                      },
                    },
                    settings: {
                      limits: {
                        cpuRaw:
                          (existing.cpu.settings?.limits?.cpuRaw ?? 0) +
                          getNum(r?.settings?.limits, 'cpuRaw'),
                      },
                      requests: {
                        cpuRaw:
                          (existing.cpu.settings?.requests?.cpuRaw ?? 0) +
                          getNum(r?.settings?.requests, 'cpuRaw'),
                      },
                    },
                  };
                  existing.memory = {
                    minUsage: {
                      memoryRaw:
                        (existing.memory.minUsage?.memoryRaw ?? 0) +
                        getNum(r?.minUsage, 'memoryRaw'),
                    },
                    averageUsage: {
                      memoryRaw:
                        (existing.memory.averageUsage?.memoryRaw ?? 0) +
                        getNum(r?.averageUsage, 'memoryRaw'),
                    },
                    maxUsage: {
                      memoryRaw:
                        (existing.memory.maxUsage?.memoryRaw ?? 0) +
                        getNum(r?.maxUsage, 'memoryRaw'),
                    },
                    recommendation: {
                      limits: {
                        memoryRaw:
                          (existing.memory.recommendation?.limits?.memoryRaw ??
                            0) + getNum(r?.recommendation?.limits, 'memoryRaw'),
                      },
                      requests: {
                        memoryRaw:
                          (existing.memory.recommendation?.requests
                            ?.memoryRaw ?? 0) +
                          getNum(r?.recommendation?.requests, 'memoryRaw'),
                      },
                    },
                    settings: {
                      limits: {
                        memoryRaw:
                          (existing.memory.settings?.limits?.memoryRaw ?? 0) +
                          getNum(r?.settings?.limits, 'memoryRaw'),
                      },
                      requests: {
                        memoryRaw:
                          (existing.memory.settings?.requests?.memoryRaw ?? 0) +
                          getNum(r?.settings?.requests, 'memoryRaw'),
                      },
                    },
                  };
                }
              }
            }

            const granularity = getDownsampleGranularity(preset);
            const allDaysInRange = getCalendarDaysInRange(startDate, endDate);
            const getVal = (d: string) => byDate.get(d);

            let sortedDates: string[];
            if (granularity === 'daily') {
              sortedDates = allDaysInRange;
            } else {
              const bucketToDays = new Map<string, string[]>();
              const getBucket = (d: string) =>
                granularity === 'weekly' ? getWeekStart(d) : getMonthStart(d);
              for (const d of allDaysInRange) {
                const bucket = getBucket(d);
                if (!bucketToDays.has(bucket)) bucketToDays.set(bucket, []);
                bucketToDays.get(bucket)!.push(d);
              }
              sortedDates = Array.from(bucketToDays.keys()).sort();
            }

            function avgPod(bucketDates: string[]): number | null {
              let sum = 0;
              let n = 0;
              for (const d of bucketDates) {
                const v = getVal(d);
                if (v && v.podCount) {
                  sum += v.podSum / v.podCount;
                  n += 1;
                }
              }
              return n === 0 ? null : sum / n;
            }
            function avgCpuRaw(
              bucketDates: string[],
              getter: (r: TimeseriesResources) => number | undefined,
            ): number | null {
              let sum = 0;
              let n = 0;
              for (const d of bucketDates) {
                const raw = getVal(d)?.cpu && getter(getVal(d)!.cpu);
                if (raw !== undefined && raw !== null) {
                  sum += raw;
                  n += 1;
                }
              }
              return n === 0 ? null : sum / n;
            }
            function avgMemRaw(
              bucketDates: string[],
              getter: (r: TimeseriesResources) => number | undefined,
            ): number | null {
              let sum = 0;
              let n = 0;
              for (const d of bucketDates) {
                const raw = getVal(d)?.memory && getter(getVal(d)!.memory);
                if (raw !== undefined && raw !== null) {
                  sum += raw;
                  n += 1;
                }
              }
              return n === 0 ? null : sum / n;
            }

            const getBucketDays = (() => {
              if (granularity === 'daily')
                return (d: string) => [d] as string[];
              const weekToDays = new Map<string, string[]>();
              const monthToDays = new Map<string, string[]>();
              for (const day of allDaysInRange) {
                const b = getWeekStart(day);
                if (!weekToDays.has(b)) weekToDays.set(b, []);
                weekToDays.get(b)!.push(day);
              }
              for (const day of allDaysInRange) {
                const b = getMonthStart(day);
                if (!monthToDays.has(b)) monthToDays.set(b, []);
                monthToDays.get(b)!.push(day);
              }
              return (bucketKey: string) =>
                granularity === 'weekly'
                  ? weekToDays.get(bucketKey) ?? []
                  : monthToDays.get(bucketKey) ?? [];
            })();

            const podAvg = sortedDates.map(d =>
              granularity === 'daily'
                ? (() => {
                    const v = getVal(d);
                    if (!v || !v.podCount) return null;
                    return v.podSum / v.podCount;
                  })()
                : avgPod(getBucketDays(d)),
            );
            const GB = 1e9;
            const milliToCpu = (v: number | null | undefined) =>
              v === undefined || v === null ? null : v / 1000;
            const cpu = {
              minUsage: sortedDates.map(d =>
                milliToCpu(
                  granularity === 'daily'
                    ? getVal(d)?.cpu.minUsage?.cpuRaw
                    : avgCpuRaw(getBucketDays(d), r => r.minUsage?.cpuRaw),
                ),
              ),
              avgUsage: sortedDates.map(d =>
                milliToCpu(
                  granularity === 'daily'
                    ? getVal(d)?.cpu.averageUsage?.cpuRaw
                    : avgCpuRaw(getBucketDays(d), r => r.averageUsage?.cpuRaw),
                ),
              ),
              maxUsage: sortedDates.map(d =>
                milliToCpu(
                  granularity === 'daily'
                    ? getVal(d)?.cpu.maxUsage?.cpuRaw
                    : avgCpuRaw(getBucketDays(d), r => r.maxUsage?.cpuRaw),
                ),
              ),
              recommendedLimits: sortedDates.map(d =>
                milliToCpu(
                  granularity === 'daily'
                    ? getVal(d)?.cpu.recommendation?.limits?.cpuRaw
                    : avgCpuRaw(
                        getBucketDays(d),
                        r => r.recommendation?.limits?.cpuRaw,
                      ),
                ),
              ),
              recommendedRequests: sortedDates.map(d =>
                milliToCpu(
                  granularity === 'daily'
                    ? getVal(d)?.cpu.recommendation?.requests?.cpuRaw
                    : avgCpuRaw(
                        getBucketDays(d),
                        r => r.recommendation?.requests?.cpuRaw,
                      ),
                ),
              ),
              actualLimits: sortedDates.map(d =>
                milliToCpu(
                  granularity === 'daily'
                    ? getVal(d)?.cpu.settings?.limits?.cpuRaw
                    : avgCpuRaw(
                        getBucketDays(d),
                        r => r.settings?.limits?.cpuRaw,
                      ),
                ),
              ),
              actualRequests: sortedDates.map(d =>
                milliToCpu(
                  granularity === 'daily'
                    ? getVal(d)?.cpu.settings?.requests?.cpuRaw
                    : avgCpuRaw(
                        getBucketDays(d),
                        r => r.settings?.requests?.cpuRaw,
                      ),
                ),
              ),
            };
            const memory = {
              minUsage: sortedDates.map(d => {
                const raw =
                  granularity === 'daily'
                    ? getVal(d)?.memory.minUsage?.memoryRaw
                    : avgMemRaw(getBucketDays(d), r => r.minUsage?.memoryRaw);
                return raw === undefined || raw === null ? null : raw / GB;
              }),
              avgUsage: sortedDates.map(d => {
                const raw =
                  granularity === 'daily'
                    ? getVal(d)?.memory.averageUsage?.memoryRaw
                    : avgMemRaw(
                        getBucketDays(d),
                        r => r.averageUsage?.memoryRaw,
                      );
                return raw === undefined || raw === null ? null : raw / GB;
              }),
              maxUsage: sortedDates.map(d => {
                const raw =
                  granularity === 'daily'
                    ? getVal(d)?.memory.maxUsage?.memoryRaw
                    : avgMemRaw(getBucketDays(d), r => r.maxUsage?.memoryRaw);
                return raw === undefined || raw === null ? null : raw / GB;
              }),
              recommendedLimits: sortedDates.map(d => {
                const raw =
                  granularity === 'daily'
                    ? getVal(d)?.memory.recommendation?.limits?.memoryRaw
                    : avgMemRaw(
                        getBucketDays(d),
                        r => r.recommendation?.limits?.memoryRaw,
                      );
                return raw === undefined || raw === null ? null : raw / GB;
              }),
              recommendedRequests: sortedDates.map(d => {
                const raw =
                  granularity === 'daily'
                    ? getVal(d)?.memory.recommendation?.requests?.memoryRaw
                    : avgMemRaw(
                        getBucketDays(d),
                        r => r.recommendation?.requests?.memoryRaw,
                      );
                return raw === undefined || raw === null ? null : raw / GB;
              }),
              actualLimits: sortedDates.map(d => {
                const raw =
                  granularity === 'daily'
                    ? getVal(d)?.memory.settings?.limits?.memoryRaw
                    : avgMemRaw(
                        getBucketDays(d),
                        r => r.settings?.limits?.memoryRaw,
                      );
                return raw === undefined || raw === null ? null : raw / GB;
              }),
              actualRequests: sortedDates.map(d => {
                const raw =
                  granularity === 'daily'
                    ? getVal(d)?.memory.settings?.requests?.memoryRaw
                    : avgMemRaw(
                        getBucketDays(d),
                        r => r.settings?.requests?.memoryRaw,
                      );
                return raw === undefined || raw === null ? null : raw / GB;
              }),
            };

            return {
              dates: sortedDates,
              podCount: { avg: podAvg },
              cpu: {
                minUsage: cpu.minUsage,
                avgUsage: cpu.avgUsage,
                maxUsage: cpu.maxUsage,
                recommendedLimits: cpu.recommendedLimits,
                recommendedRequests: cpu.recommendedRequests,
                actualLimits: cpu.actualLimits,
                actualRequests: cpu.actualRequests,
              },
              memory: {
                minUsage: memory.minUsage,
                avgUsage: memory.avgUsage,
                maxUsage: memory.maxUsage,
                recommendedLimits: memory.recommendedLimits,
                recommendedRequests: memory.recommendedRequests,
                actualLimits: memory.actualLimits,
                actualRequests: memory.actualRequests,
              },
            };
          },
        );

      const queryParams = buildAppGroupsQuery(appGroups, 'appGroups');
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);
      queryParams.append('aggregators', 'cluster');
      queryParams.append('addNetworkAndStorage', 'true');

      res.json({
        ...response,
        insightsUrl: buildInsightsUiUrl(
          '/efficiency/cumulative-costs',
          queryParams,
        ),
      });
    } catch (error: any) {
      logger.error('Error fetching resources-summary-timeseries:', error);
      res.status(500).json({
        error: 'Failed to fetch resources summary timeseries',
        message: error.message,
      });
    }
  });

  return router;
}
