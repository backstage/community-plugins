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
import { readHosts, GrafanaConfigApi } from './config';

function createMockConfigApi(config: Record<string, any>): GrafanaConfigApi {
  return {
    getOptionalString: (key: string) => config[key] as string | undefined,
    getOptionalBoolean: (key: string) => config[key] as boolean | undefined,
    getOptionalNumber: (key: string) => config[key] as number | undefined,
    getOptional: (key: string) => config[key],
  };
}

describe('readHosts', () => {
  it('reads hosts from grafana.hosts config', () => {
    const configApi = createMockConfigApi({
      'grafana.hosts': [
        {
          id: 'prod',
          domain: 'https://grafana-prod.example.com',
          proxyPath: '/grafana/production/api',
        },
        {
          id: 'staging',
          domain: 'https://grafana-staging.example.com',
          proxyPath: '/grafana/staging/api',
        },
      ],
    });

    const hosts = readHosts(configApi);
    expect(hosts).toHaveLength(2);
    expect(hosts[0].id).toBe('prod');
    expect(hosts[1].id).toBe('staging');
  });

  it('creates default host from legacy grafana.domain config', () => {
    const configApi = createMockConfigApi({
      'grafana.domain': 'https://grafana.example.com',
      'grafana.proxyPath': '/grafana/api',
      'grafana.unifiedAlerting': true,
      'grafana.grafanaDashboardSearchLimit': 2000,
      'grafana.grafanaDashboardMaxPages': 3,
    });

    const hosts = readHosts(configApi);
    expect(hosts).toHaveLength(1);
    expect(hosts[0]).toEqual({
      id: 'default',
      domain: 'https://grafana.example.com',
      proxyPath: '/grafana/api',
      unifiedAlerting: true,
      grafanaDashboardSearchLimit: 2000,
      grafanaDashboardMaxPages: 3,
    });
  });

  it('appends default host when both domain and hosts are set', () => {
    const configApi = createMockConfigApi({
      'grafana.domain': 'https://grafana.example.com',
      'grafana.hosts': [
        {
          id: 'prod',
          domain: 'https://grafana-prod.example.com',
          proxyPath: '/grafana/production/api',
        },
      ],
    });

    const hosts = readHosts(configApi);
    expect(hosts).toHaveLength(2);
    expect(hosts[0].id).toBe('prod');
    expect(hosts[1].id).toBe('default');
  });

  it('throws when neither domain nor hosts is defined', () => {
    const configApi = createMockConfigApi({});

    expect(() => readHosts(configApi)).toThrow(
      'At least `grafana.domain` or `grafana.hosts` must be defined',
    );
  });

  it('throws when a host is missing id', () => {
    const configApi = createMockConfigApi({
      'grafana.hosts': [{ domain: 'https://grafana.example.com' }],
    });

    expect(() => readHosts(configApi)).toThrow(
      'Each `grafana.hosts[].id` must be defined',
    );
  });

  it('throws when a host is missing domain', () => {
    const configApi = createMockConfigApi({
      'grafana.hosts': [{ id: 'prod' }],
    });

    expect(() => readHosts(configApi)).toThrow(
      'Each `grafana.hosts[].domain` must be defined',
    );
  });

  it('throws when multiple hosts share the same proxy path', () => {
    const configApi = createMockConfigApi({
      'grafana.hosts': [
        { id: 'prod', domain: 'https://grafana-prod.example.com' },
        { id: 'staging', domain: 'https://grafana-staging.example.com' },
      ],
    });

    // Both default to /grafana/api
    expect(() => readHosts(configApi)).toThrow(
      'share the same proxy path "/grafana/api"',
    );
  });

  it('throws when explicit proxy paths collide', () => {
    const configApi = createMockConfigApi({
      'grafana.hosts': [
        {
          id: 'prod',
          domain: 'https://grafana-prod.example.com',
          proxyPath: '/grafana/shared',
        },
        {
          id: 'staging',
          domain: 'https://grafana-staging.example.com',
          proxyPath: '/grafana/shared',
        },
      ],
    });

    expect(() => readHosts(configApi)).toThrow(
      'hosts "prod" and "staging" share the same proxy path',
    );
  });

  it('allows multiple hosts with distinct proxy paths', () => {
    const configApi = createMockConfigApi({
      'grafana.hosts': [
        {
          id: 'prod',
          domain: 'https://grafana-prod.example.com',
          proxyPath: '/grafana/production/api',
        },
        {
          id: 'staging',
          domain: 'https://grafana-staging.example.com',
          proxyPath: '/grafana/staging/api',
        },
      ],
    });

    const hosts = readHosts(configApi);
    expect(hosts).toHaveLength(2);
  });
});
