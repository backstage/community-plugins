/*
 * Copyright 2024 The Backstage Authors
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

import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/frontend-plugin-api';
import { QueryEvaluator } from './query';
import { Alert, Dashboard, GrafanaHost } from './types';

/**
 * Interface for the Grafana API
 * @public
 */
export interface GrafanaApi {
  /**
   * Returns the found dashboards in Grafana with the defined query
   * @param query - The query used to list the dashboards
   * @param hostId - Optional identifier for the Grafana instance to query
   */
  listDashboards(query: string, hostId?: string): Promise<Dashboard[]>;
  /**
   * Returns a list of alerts found in Grafana that have any of the defined alert selectors
   * @param selectors - One or multiple alert selectors
   * @param hostId - Optional identifier for the Grafana instance to query
   */
  alertsForSelector(
    selectors: string | string[],
    hostId?: string,
  ): Promise<Alert[]>;
  /**
   * Returns whether a specific Grafana instance uses unified alerting
   * @param hostId - Optional identifier for the Grafana instance to check
   */
  isUnifiedAlerting(hostId?: string): boolean;
}

interface AggregatedAlertState {
  Normal: number;
  Pending: number;
  Alerting: number;
  NoData: number;
  Error: number;
  Invalid: number;
}

type AlertState =
  | 'Normal'
  | 'Pending'
  | 'Alerting'
  | 'NoData'
  | 'Error'
  | 'n/a';

interface AlertInstance {
  labels: Record<string, string>;
  state: AlertState;
}

interface AlertsData {
  data: { alerts: AlertInstance[] };
}

interface AlertRuleGroupConfig {
  name: string;
  rules: AlertRule[];
}

interface GrafanaAlert {
  id: number;
  panelId: number;
  name: string;
  state: string;
  url: string;
}

interface UnifiedGrafanaAlert {
  uid: string;
  title: string;
}

interface AlertRule {
  labels: Record<string, string>;
  grafana_alert: UnifiedGrafanaAlert;
}

/**
 * The grafana API reference
 * @public
 */
export const grafanaApiRef = createApiRef<GrafanaApi>({
  id: 'plugin.grafana.service',
});

/**
 * Options for creating a GrafanaApiClient
 * @public
 */
export type GrafanaApiClientOptions = {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;

  /**
   * List of Grafana host configurations
   */
  hosts: GrafanaHost[];

  /**
   * @deprecated Limit value to pass in Grafana Dashboard search query.
   */
  grafanaDashboardSearchLimit?: number;

  /**
   * @deprecated Max pages of Grafana Dashboard search query to fetch.
   */
  grafanaDashboardMaxPages?: number;
};

const DEFAULT_PROXY_PATH = '/grafana/api';
// upstream default if no limit is specified.
const DEFAULT_DASHBOARDS_LIMIT: number = 1000;
const DEFAULT_PAGES_LIMIT: number = 1;
// upstream limit: https://github.com/grafana/grafana/blob/2ee956192064343c73009ffe106178bf4e983844/pkg/api/search.go#L43
const UPSTREAM_DASHBOARDS_LIMIT_MAX: number = 5000;

const isSingleWord = (input: string): boolean => {
  return input.match(/^[\w-]+$/g) !== null;
};

class Client {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly proxyPath: string;
  private readonly queryEvaluator: QueryEvaluator;
  private readonly grafanaDashboardSearchLimit: number;
  private readonly grafanaDashboardMaxPages: number;

  constructor(
    discoveryApi: DiscoveryApi,
    fetchApi: FetchApi,
    proxyPath: string,
    grafanaDashboardSearchLimit?: number,
    grafanaDashboardMaxPages?: number,
  ) {
    this.discoveryApi = discoveryApi;
    this.fetchApi = fetchApi;
    this.proxyPath = proxyPath;
    this.queryEvaluator = new QueryEvaluator();
    this.grafanaDashboardSearchLimit = Math.min(
      grafanaDashboardSearchLimit ?? DEFAULT_DASHBOARDS_LIMIT,
      UPSTREAM_DASHBOARDS_LIMIT_MAX,
    );
    this.grafanaDashboardMaxPages =
      grafanaDashboardMaxPages ?? DEFAULT_PAGES_LIMIT;
  }

  public async fetch<T = any>(input: string, init?: RequestInit): Promise<T> {
    const apiUrl = await this.apiUrl();
    const resp = await this.fetchApi.fetch(`${apiUrl}${input}`, init);
    if (!resp.ok) {
      throw new Error(`Request failed with ${resp.status} ${resp.statusText}`);
    }

    return await resp.json();
  }

  async listDashboards(domain: string, query: string): Promise<Dashboard[]> {
    if (isSingleWord(query)) {
      return this.dashboardsByTag(domain, query);
    }

    return this.dashboardsForQuery(domain, query);
  }

  private async fetchSomeDashboards(options: {
    domain: string;
    page: number;
    limit: number;
    tag?: string;
  }): Promise<Dashboard[]> {
    const query = `/api/search?type=dash-db&limit=${options.limit}&page=${
      options.page
    }${options.tag !== undefined ? `&tag=${options.tag}` : ''}`;
    const response = await this.fetch<Dashboard[]>(query);
    return this.fullyQualifiedDashboardMetadata(options.domain, response);
  }

  // Grafana Search API does not have pagination metadata in the response body or headers
  // so we have to guess if we are at the end based on number of items in the result
  // https://grafana.com/docs/grafana/latest/developers/http_api/folder_dashboard_search/
  // The API also does not use continuation tokens, so there is no guarantee
  // that dashboards have not been added or deleted since listing the previous
  // page.
  private async fetchAllDashboards(options: {
    domain: string;
    tag?: string;
  }): Promise<Dashboard[]> {
    let page: number = 0;
    const allDashboards: Dashboard[] = [];
    let more: boolean = true;
    do {
      const dashboards: Dashboard[] = await this.fetchSomeDashboards({
        domain: options.domain,
        page: page++,
        limit: this.grafanaDashboardSearchLimit,
        tag: options.tag,
      });
      allDashboards.push(...dashboards);
      // pages limit exists to prevent accidental infinite loops from Grafana
      more =
        dashboards.length >= this.grafanaDashboardSearchLimit &&
        page < this.grafanaDashboardMaxPages;
    } while (more);
    return allDashboards;
  }

  async dashboardsForQuery(
    domain: string,
    query: string,
  ): Promise<Dashboard[]> {
    const parsedQuery = this.queryEvaluator.parse(query);
    const allDashboards = await this.fetchAllDashboards({ domain: domain });
    return allDashboards.filter(dashboard => {
      return this.queryEvaluator.evaluate(parsedQuery, dashboard) === true;
    });
  }

  async dashboardsByTag(domain: string, tag: string): Promise<Dashboard[]> {
    return this.fetchAllDashboards({ domain: domain, tag: tag });
  }

  private fullyQualifiedDashboardMetadata(
    domain: string,
    dashboards: Dashboard[],
  ): Dashboard[] {
    return dashboards.map(dashboard => ({
      ...dashboard,
      url: domain + dashboard.url,
      folderTitle: dashboard.folderTitle ?? '',
      folderUrl: domain + dashboard.folderUrl,
    }));
  }

  private async apiUrl() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return proxyUrl + this.proxyPath;
  }
}

interface ClientHost {
  host: GrafanaHost;
  client: Client;
}

function initClients(opts: GrafanaApiClientOptions): Map<string, ClientHost> {
  const clients = new Map<string, ClientHost>();
  for (const host of opts.hosts) {
    clients.set(host.id, {
      host,
      client: new Client(
        opts.discoveryApi,
        opts.fetchApi,
        host.proxyPath ?? DEFAULT_PROXY_PATH,
        opts.grafanaDashboardSearchLimit,
        opts.grafanaDashboardMaxPages,
      ),
    });
  }
  return clients;
}

/**
 * Grafana API client that supports multiple Grafana instances
 */
export class GrafanaApiClient implements GrafanaApi {
  private readonly clients: Map<string, ClientHost>;

  constructor(opts: GrafanaApiClientOptions) {
    this.clients = initClients(opts);
  }

  private resolveClientHost(hostId?: string): ClientHost {
    const id = hostId || 'default';
    const clientHost = this.clients.get(id);
    if (clientHost) {
      return clientHost;
    }

    // If no exact match and no hostId was specified, fall back to first host
    if (!hostId) {
      const first = this.clients.values().next();
      if (!first.done) {
        return first.value;
      }
    }

    const available = Array.from(this.clients.keys()).join(', ');
    throw new Error(
      `Grafana instance "${id}" not found. Available instances: ${available}`,
    );
  }

  /** {@inheritDoc GrafanaApi.isUnifiedAlerting} */
  isUnifiedAlerting(hostId?: string): boolean {
    const { host } = this.resolveClientHost(hostId);
    return host.unifiedAlerting ?? false;
  }

  /** {@inheritDoc GrafanaApi.listDashboards} */
  async listDashboards(query: string, hostId?: string): Promise<Dashboard[]> {
    const { host, client } = this.resolveClientHost(hostId);
    return client.listDashboards(host.domain, query);
  }

  /** {@inheritDoc GrafanaApi.alertsForSelector} */
  async alertsForSelector(
    selectors: string | string[],
    hostId?: string,
  ): Promise<Alert[]> {
    const { host, client } = this.resolveClientHost(hostId);

    if (host.unifiedAlerting) {
      return this.unifiedAlertsForSelector(host, client, selectors);
    }

    // Legacy alerting
    const dashboardTag =
      typeof selectors === 'string' ? selectors : selectors[0];
    const response = await client.fetch<GrafanaAlert[]>(
      `/api/alerts?dashboardTag=${dashboardTag}`,
    );

    return response.map(alert => ({
      name: alert.name,
      state: alert.state,
      matchingSelector: dashboardTag,
      url: `${host.domain}${alert.url}?panelId=${alert.panelId}&fullscreen&refresh=30s`,
    }));
  }

  private async unifiedAlertsForSelector(
    host: GrafanaHost,
    client: Client,
    selectors: string | string[],
  ): Promise<Alert[]> {
    let labelSelectors: string[] = [];
    if (typeof selectors === 'string') {
      labelSelectors = [selectors];
    } else {
      labelSelectors = selectors;
    }

    const rulesResponse = await client.fetch<
      Record<string, AlertRuleGroupConfig[]>
    >('/api/ruler/grafana/api/v1/rules');
    const rules = Object.values(rulesResponse)
      .flat()
      .map(ruleGroup => ruleGroup.rules)
      .flat();
    const alertsResponse = await client.fetch<AlertsData>(
      '/api/prometheus/grafana/api/v1/alerts',
    );

    return labelSelectors
      .map(selector => {
        const [label, labelValue] = selector.split('=');

        const matchingRules = rules.filter(
          rule => rule.labels && rule.labels[label] === labelValue,
        );
        const alertInstances = alertsResponse.data.alerts.filter(
          alertInstance => alertInstance.labels[label] === labelValue,
        );

        return matchingRules.map(rule => {
          const matchingAlertInstances = alertInstances.filter(
            alertInstance =>
              alertInstance.labels.alertname === rule.grafana_alert.title,
          );

          const aggregatedAlertStates: AggregatedAlertState =
            matchingAlertInstances.reduce(
              (previous, alert) => {
                switch (alert.state) {
                  case 'Normal':
                    previous.Normal += 1;
                    break;
                  case 'Pending':
                    previous.Pending += 1;
                    break;
                  case 'Alerting':
                    previous.Alerting += 1;
                    break;
                  case 'NoData':
                    previous.NoData += 1;
                    break;
                  case 'Error':
                    previous.Error += 1;
                    break;
                  default:
                    previous.Invalid += 1;
                }

                return previous;
              },
              {
                Normal: 0,
                Pending: 0,
                Alerting: 0,
                NoData: 0,
                Error: 0,
                Invalid: 0,
              },
            );

          return {
            name: rule.grafana_alert.title,
            url: `${host.domain}/alerting/grafana/${rule.grafana_alert.uid}/view`,
            matchingSelector: selector,
            state: this.getState(
              aggregatedAlertStates,
              matchingAlertInstances.length,
            ),
          };
        });
      })
      .flat();
  }

  private getState(
    states: AggregatedAlertState,
    totalAlerts: number,
  ): AlertState {
    if (states.Alerting > 0) {
      return 'Alerting';
    } else if (states.Error > 0) {
      return 'Error';
    } else if (states.Pending > 0) {
      return 'Pending';
    }
    if (states.NoData === totalAlerts) {
      return 'NoData';
    } else if (
      states.Normal === totalAlerts ||
      states.Normal + states.NoData === totalAlerts
    ) {
      return 'Normal';
    }

    return 'n/a';
  }
}
