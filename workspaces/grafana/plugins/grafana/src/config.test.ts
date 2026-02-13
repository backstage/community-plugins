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
import { ConfigApi } from '@backstage/core-plugin-api';
import { readHosts } from './config';

function createMockConfigApi(config: Record<string, any>): ConfigApi {
  return {
    has: (key: string) => key in config,
    keys: () => Object.keys(config),
    get: (key?: string) => {
      if (key === undefined) return config;
      if (!(key in config))
        throw new Error(`Missing required config: ${key}`);
      return config[key];
    },
    getOptional: (key?: string) => {
      if (key === undefined) return config;
      return config[key];
    },
    getString: (key: string) => {
      if (!(key in config))
        throw new Error(`Missing required config: ${key}`);
      return config[key] as string;
    },
    getOptionalString: (key: string) => config[key] as string | undefined,
    getNumber: (key: string) => {
      if (!(key in config))
        throw new Error(`Missing required config: ${key}`);
      return config[key] as number;
    },
    getOptionalNumber: (key: string) => config[key] as number | undefined,
    getBoolean: (key: string) => {
      if (!(key in config))
        throw new Error(`Missing required config: ${key}`);
      return config[key] as boolean;
    },
    getOptionalBoolean: (key: string) => config[key] as boolean | undefined,
    getConfig: (key: string) => createMockConfigApi(config[key] ?? {}),
    getOptionalConfig: (key: string) =>
      key in config ? createMockConfigApi(config[key]) : undefined,
    getConfigArray: (key: string) =>
      (config[key] ?? []).map((c: any) => createMockConfigApi(c)),
    getOptionalConfigArray: (key: string) =>
      key in config
        ? (config[key] as any[]).map((c: any) => createMockConfigApi(c))
        : undefined,
    getStringArray: (key: string) => config[key] as string[],
    getOptionalStringArray: (key: string) =>
      config[key] as string[] | undefined,
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
    });

    const hosts = readHosts(configApi);
    expect(hosts).toHaveLength(1);
    expect(hosts[0]).toEqual({
      id: 'default',
      domain: 'https://grafana.example.com',
      proxyPath: '/grafana/api',
      unifiedAlerting: true,
    });
  });

  it('ignores domain and warns when both domain and hosts are set', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
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
    expect(hosts).toHaveLength(1);
    expect(hosts[0].id).toBe('prod');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('will be ignored in favor of `grafana.hosts`'),
    );
    warnSpy.mockRestore();
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
