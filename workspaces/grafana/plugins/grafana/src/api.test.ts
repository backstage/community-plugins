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
  GrafanaApiClient,
  UnifiedAlertingGrafanaApiClient,
  Options,
} from './api';
import { DiscoveryApi, FetchApi } from '@backstage/frontend-plugin-api';

const PROXY_URL = 'http://localhost:7007/api/proxy';
const DOMAIN = 'https://grafana.example.com';

function createMockDiscoveryApi(): DiscoveryApi {
  return {
    getBaseUrl: jest.fn().mockResolvedValue(PROXY_URL),
  };
}

function createMockFetchApi(handler: (url: string) => any): FetchApi {
  return {
    fetch: jest.fn(async (input: RequestInfo | URL) => {
      const body = handler(String(input));
      return new Response(JSON.stringify(body), { status: 200 });
    }),
  };
}

function createMockFetchApiWithStatus(
  status: number,
  statusText: string,
): FetchApi {
  return {
    fetch: jest.fn(async () => {
      return new Response('', { status, statusText });
    }),
  };
}

function defaultOpts(overrides: Partial<Options> = {}): Options {
  return {
    discoveryApi: createMockDiscoveryApi(),
    fetchApi: createMockFetchApi(() => []),
    domain: DOMAIN,
    ...overrides,
  };
}

const sampleDashboards = [
  {
    title: 'Service Overview',
    url: '/d/abc123/service-overview',
    folderTitle: 'Production',
    folderUrl: '/dashboards/f/prod',
    tags: ['my-service', 'generated'],
  },
  {
    title: 'SLO Dashboard',
    url: '/d/def456/slo-dashboard',
    folderTitle: undefined,
    folderUrl: '/dashboards/f/slo',
    tags: ['my-service-slo', 'generated'],
  },
];

const sampleLegacyAlerts = [
  {
    id: 1,
    panelId: 10,
    name: 'High CPU Usage',
    state: 'alerting',
    url: '/d/abc123/overview',
  },
  {
    id: 2,
    panelId: 20,
    name: 'Memory Warning',
    state: 'ok',
    url: '/d/def456/memory',
  },
];

describe('GrafanaApiClient', () => {
  describe('listDashboards', () => {
    it('searches by tag for a single-word query', async () => {
      const fetchApi = createMockFetchApi(url => {
        if (url.includes('/api/search') && url.includes('tag=my-service')) {
          return [sampleDashboards[0]];
        }
        return [];
      });

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const dashboards = await client.listDashboards('my-service');
      expect(dashboards).toHaveLength(1);
      expect(dashboards[0].title).toBe('Service Overview');

      const fetchCall = (fetchApi.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('tag=my-service');
    });

    it('evaluates query expression for multi-word queries', async () => {
      const fetchApi = createMockFetchApi(url => {
        if (url.includes('/api/search')) {
          return sampleDashboards;
        }
        return [];
      });

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const dashboards = await client.listDashboards(
        "tags @> 'my-service' && tags @> 'generated'",
      );

      expect(dashboards).toHaveLength(1);
      expect(dashboards[0].title).toBe('Service Overview');
    });

    it('qualifies dashboard URLs with the configured domain', async () => {
      const fetchApi = createMockFetchApi(() => [sampleDashboards[0]]);

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const dashboards = await client.listDashboards('my-service');
      expect(dashboards[0].url).toBe(`${DOMAIN}/d/abc123/service-overview`);
      expect(dashboards[0].folderUrl).toBe(`${DOMAIN}/dashboards/f/prod`);
    });

    it('defaults folderTitle to empty string when undefined', async () => {
      const fetchApi = createMockFetchApi(() => [sampleDashboards[1]]);

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const dashboards = await client.listDashboards('my-service-slo');
      expect(dashboards[0].folderTitle).toBe('');
    });

    it('supports hyphenated tags as single-word queries', async () => {
      const fetchApi = createMockFetchApi(url => {
        if (url.includes('tag=my-service-slo')) {
          return [sampleDashboards[1]];
        }
        return [];
      });

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const dashboards = await client.listDashboards('my-service-slo');
      expect(dashboards).toHaveLength(1);

      const fetchCall = (fetchApi.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('tag=my-service-slo');
    });
  });

  describe('alertsForSelector', () => {
    it('returns alerts mapped with correct fields', async () => {
      const fetchApi = createMockFetchApi(() => sampleLegacyAlerts);

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('my-service');
      expect(alerts).toHaveLength(2);
      expect(alerts[0]).toEqual({
        name: 'High CPU Usage',
        state: 'alerting',
        matchingSelector: 'my-service',
        url: `${DOMAIN}/d/abc123/overview?panelId=10&fullscreen&refresh=30s`,
      });
    });

    it('builds alert URL with panelId and fullscreen params', async () => {
      const fetchApi = createMockFetchApi(() => [sampleLegacyAlerts[1]]);

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('my-service');
      expect(alerts[0].url).toBe(
        `${DOMAIN}/d/def456/memory?panelId=20&fullscreen&refresh=30s`,
      );
    });

    it('passes the selector as dashboardTag query parameter', async () => {
      const fetchApi = createMockFetchApi(() => []);

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      await client.alertsForSelector('production-alerts');

      const fetchCall = (fetchApi.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('/api/alerts?dashboardTag=production-alerts');
    });

    it('returns empty array when no alerts match', async () => {
      const client = new GrafanaApiClient(defaultOpts());

      const alerts = await client.alertsForSelector('no-match');
      expect(alerts).toEqual([]);
    });
  });

  describe('fetch error handling', () => {
    it('throws on non-ok HTTP response', async () => {
      const fetchApi = createMockFetchApiWithStatus(403, 'Forbidden');

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      await expect(client.alertsForSelector('test')).rejects.toThrow(
        'Request failed with 403 Forbidden',
      );
    });

    it('throws on server error', async () => {
      const fetchApi = createMockFetchApiWithStatus(
        500,
        'Internal Server Error',
      );

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      await expect(client.listDashboards('test')).rejects.toThrow(
        'Request failed with 500 Internal Server Error',
      );
    });
  });

  describe('proxy path configuration', () => {
    it('uses default proxy path /grafana/api', async () => {
      const fetchApi = createMockFetchApi(() => []);

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      await client.alertsForSelector('test');

      const fetchCall = (fetchApi.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('/grafana/api/');
    });

    it('uses custom proxy path when configured', async () => {
      const fetchApi = createMockFetchApi(() => []);

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
        proxyPath: '/custom-grafana',
      });

      await client.alertsForSelector('test');

      const fetchCall = (fetchApi.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('/custom-grafana/');
      expect(fetchCall).not.toContain('/grafana/api/');
    });
  });

  describe('pagination', () => {
    it('fetches only one page by default', async () => {
      const fetchApi = createMockFetchApi(() =>
        Array.from({ length: 1000 }, (_, i) => ({
          title: `Dashboard ${i}`,
          url: `/d/${i}/dash`,
          folderTitle: 'Folder',
          folderUrl: '/f/folder',
          tags: ['tag'],
        })),
      );

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      await client.listDashboards('tag');

      expect(fetchApi.fetch).toHaveBeenCalledTimes(1);
    });

    it('fetches multiple pages when configured', async () => {
      let callCount = 0;
      const fetchApi: FetchApi = {
        fetch: jest.fn(async () => {
          callCount++;
          const dashboards =
            callCount <= 2
              ? Array.from({ length: 100 }, (_, i) => ({
                  title: `Dashboard ${callCount}-${i}`,
                  url: `/d/${callCount}-${i}/dash`,
                  folderTitle: 'Folder',
                  folderUrl: '/f/folder',
                  tags: ['tag'],
                }))
              : [];

          return new Response(JSON.stringify(dashboards), { status: 200 });
        }),
      };

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
        grafanaDashboardSearchLimit: 100,
        grafanaDashboardMaxPages: 5,
      });

      const dashboards = await client.listDashboards('tag');

      // Page 1: 100 results, Page 2: 100 results, Page 3: 0 results (stops)
      expect(fetchApi.fetch).toHaveBeenCalledTimes(3);
      expect(dashboards).toHaveLength(200);
    });

    it('stops fetching when a page returns fewer results than the limit', async () => {
      let callCount = 0;
      const fetchApi: FetchApi = {
        fetch: jest.fn(async () => {
          callCount++;
          const count = callCount === 1 ? 50 : 0;
          const dashboards = Array.from({ length: count }, (_, i) => ({
            title: `Dashboard ${i}`,
            url: `/d/${i}/dash`,
            folderTitle: 'Folder',
            folderUrl: '/f/folder',
            tags: ['tag'],
          }));

          return new Response(JSON.stringify(dashboards), { status: 200 });
        }),
      };

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
        grafanaDashboardSearchLimit: 100,
        grafanaDashboardMaxPages: 10,
      });

      const dashboards = await client.listDashboards('tag');

      expect(fetchApi.fetch).toHaveBeenCalledTimes(1);
      expect(dashboards).toHaveLength(50);
    });

    it('caps search limit at upstream maximum of 5000', async () => {
      const fetchApi = createMockFetchApi(() => []);

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
        grafanaDashboardSearchLimit: 10000,
      });

      await client.listDashboards('tag');

      const fetchCall = (fetchApi.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('limit=5000');
    });

    it('respects max pages limit to prevent infinite loops', async () => {
      const fetchApi: FetchApi = {
        fetch: jest.fn(async () => {
          const dashboards = Array.from({ length: 100 }, (_, i) => ({
            title: `Dashboard ${i}`,
            url: `/d/${i}/dash`,
            folderTitle: 'Folder',
            folderUrl: '/f/folder',
            tags: ['tag'],
          }));
          return new Response(JSON.stringify(dashboards), { status: 200 });
        }),
      };

      const client = new GrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
        grafanaDashboardSearchLimit: 100,
        grafanaDashboardMaxPages: 3,
      });

      await client.listDashboards('tag');

      expect(fetchApi.fetch).toHaveBeenCalledTimes(3);
    });
  });
});

describe('UnifiedAlertingGrafanaApiClient', () => {
  const sampleRulesResponse = {
    'folder-1': [
      {
        name: 'rule-group-1',
        rules: [
          {
            labels: { service: 'my-service' },
            grafana_alert: {
              uid: 'alert-uid-1',
              title: 'High CPU',
            },
          },
          {
            labels: { service: 'my-service' },
            grafana_alert: {
              uid: 'alert-uid-2',
              title: 'High Memory',
            },
          },
        ],
      },
    ],
    'folder-2': [
      {
        name: 'rule-group-2',
        rules: [
          {
            labels: { team: 'platform' },
            grafana_alert: {
              uid: 'alert-uid-3',
              title: 'Disk Usage',
            },
          },
        ],
      },
    ],
  };

  function createUnifiedFetchApi(
    alertInstances: Array<{ labels: Record<string, string>; state: string }>,
    rules: Record<
      string,
      Array<{
        name: string;
        rules: Array<{
          labels: any;
          grafana_alert: { uid: string; title: string };
        }>;
      }>
    > = sampleRulesResponse,
  ): FetchApi {
    return {
      fetch: jest.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/api/ruler/grafana/api/v1/rules')) {
          return new Response(JSON.stringify(rules), { status: 200 });
        }
        if (url.includes('/api/prometheus/grafana/api/v1/alerts')) {
          return new Response(
            JSON.stringify({ data: { alerts: alertInstances } }),
            { status: 200 },
          );
        }
        // Dashboard search
        return new Response(JSON.stringify([]), { status: 200 });
      }),
    };
  }

  describe('listDashboards', () => {
    it('delegates to the same dashboard search logic', async () => {
      const fetchApi: FetchApi = {
        fetch: jest.fn(async (input: RequestInfo | URL) => {
          const url = String(input);
          if (url.includes('/api/search')) {
            return new Response(JSON.stringify([sampleDashboards[0]]), {
              status: 200,
            });
          }
          return new Response(JSON.stringify([]), { status: 200 });
        }),
      };

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const dashboards = await client.listDashboards('my-service');
      expect(dashboards).toHaveLength(1);
      expect(dashboards[0].title).toBe('Service Overview');
      expect(dashboards[0].url).toContain(DOMAIN);
    });
  });

  describe('alertsForSelector', () => {
    it('returns alerts for a single string selector', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Normal',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');

      expect(alerts).toHaveLength(2);
      expect(alerts[0].name).toBe('High CPU');
      expect(alerts[0].matchingSelector).toBe('service=my-service');
      expect(alerts[0].url).toBe(`${DOMAIN}/alerting/grafana/alert-uid-1/view`);
    });

    it('returns alerts for multiple selectors as array', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Normal',
        },
        {
          labels: { alertname: 'Disk Usage', team: 'platform' },
          state: 'Alerting',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector([
        'service=my-service',
        'team=platform',
      ]);

      const serviceAlerts = alerts.filter(
        a => a.matchingSelector === 'service=my-service',
      );
      const teamAlerts = alerts.filter(
        a => a.matchingSelector === 'team=platform',
      );

      expect(serviceAlerts.length).toBeGreaterThan(0);
      expect(teamAlerts.length).toBeGreaterThan(0);
      expect(teamAlerts[0].name).toBe('Disk Usage');
    });

    it('fetches both rules and alert instances endpoints', async () => {
      const fetchApi = createUnifiedFetchApi([]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      await client.alertsForSelector('service=my-service');

      const fetchCalls = (fetchApi.fetch as jest.Mock).mock.calls.map(
        c => c[0],
      );
      expect(
        fetchCalls.some((url: string) =>
          url.includes('/api/ruler/grafana/api/v1/rules'),
        ),
      ).toBe(true);
      expect(
        fetchCalls.some((url: string) =>
          url.includes('/api/prometheus/grafana/api/v1/alerts'),
        ),
      ).toBe(true);
    });

    it('returns empty array when no rules match the selector', async () => {
      const fetchApi = createUnifiedFetchApi([]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector(
        'service=nonexistent-service',
      );
      expect(alerts).toEqual([]);
    });

    it('handles rules without labels gracefully', async () => {
      const rulesWithNoLabels = {
        folder: [
          {
            name: 'group',
            rules: [
              {
                labels: undefined as any,
                grafana_alert: { uid: 'uid-1', title: 'No Labels Alert' },
              },
            ],
          },
        ],
      };

      const fetchApi = createUnifiedFetchApi([], rulesWithNoLabels);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      expect(alerts).toEqual([]);
    });
  });

  describe('alert state aggregation', () => {
    it('returns Alerting when any instance is alerting', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Normal',
        },
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Alerting',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('Alerting');
    });

    it('returns Error when any instance is in error and none alerting', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Normal',
        },
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Error',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('Error');
    });

    it('returns Pending when any instance is pending and none alerting or error', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Normal',
        },
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Pending',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('Pending');
    });

    it('returns NoData when all instances are NoData', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'NoData',
        },
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'NoData',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('NoData');
    });

    it('returns Normal when all instances are Normal', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Normal',
        },
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Normal',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('Normal');
    });

    it('returns Normal when instances are mix of Normal and NoData', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Normal',
        },
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'NoData',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('Normal');
    });

    it('returns NoData when no alert instances match a rule', async () => {
      const fetchApi = createUnifiedFetchApi([]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('NoData');
    });

    it('returns n/a for unrecognized alert states', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'SomeUnknownState',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('n/a');
    });

    it('prioritizes Alerting over Error', async () => {
      const fetchApi = createUnifiedFetchApi([
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Error',
        },
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Alerting',
        },
        {
          labels: { alertname: 'High CPU', service: 'my-service' },
          state: 'Pending',
        },
      ]);

      const client = new UnifiedAlertingGrafanaApiClient({
        ...defaultOpts(),
        fetchApi,
      });

      const alerts = await client.alertsForSelector('service=my-service');
      const highCpu = alerts.find(a => a.name === 'High CPU');
      expect(highCpu?.state).toBe('Alerting');
    });
  });
});
