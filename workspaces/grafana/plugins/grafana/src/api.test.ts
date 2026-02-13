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
import { GrafanaApiClient } from './api';
import { DiscoveryApi, FetchApi } from '@backstage/frontend-plugin-api';

const mockDiscoveryApi: DiscoveryApi = {
  getBaseUrl: async () => 'http://localhost:7007/api',
};

const mockFetchApi: FetchApi = {
  fetch: async () => new Response(JSON.stringify([]), { status: 200 }),
};

describe('GrafanaApiClient', () => {
  describe('isUnifiedAlerting', () => {
    it('returns true when host has unifiedAlerting enabled', () => {
      const client = new GrafanaApiClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
        hosts: [
          {
            id: 'prod',
            domain: 'https://grafana-prod.example.com',
            unifiedAlerting: true,
          },
        ],
      });

      expect(client.isUnifiedAlerting('prod')).toBe(true);
    });

    it('returns false when host has unifiedAlerting disabled', () => {
      const client = new GrafanaApiClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
        hosts: [
          {
            id: 'staging',
            domain: 'https://grafana-staging.example.com',
            unifiedAlerting: false,
          },
        ],
      });

      expect(client.isUnifiedAlerting('staging')).toBe(false);
    });

    it('returns false when unifiedAlerting is not set', () => {
      const client = new GrafanaApiClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
        hosts: [{ id: 'default', domain: 'https://grafana.example.com' }],
      });

      expect(client.isUnifiedAlerting('default')).toBe(false);
    });

    it('resolves per-host in multi-instance setup', () => {
      const client = new GrafanaApiClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
        hosts: [
          {
            id: 'prod',
            domain: 'https://grafana-prod.example.com',
            unifiedAlerting: true,
          },
          {
            id: 'staging',
            domain: 'https://grafana-staging.example.com',
            unifiedAlerting: false,
          },
        ],
      });

      expect(client.isUnifiedAlerting('prod')).toBe(true);
      expect(client.isUnifiedAlerting('staging')).toBe(false);
    });
  });

  describe('host resolution', () => {
    it('falls back to default host when no hostId is provided', () => {
      const client = new GrafanaApiClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
        hosts: [
          {
            id: 'default',
            domain: 'https://grafana.example.com',
            unifiedAlerting: true,
          },
        ],
      });

      expect(client.isUnifiedAlerting()).toBe(true);
    });

    it('falls back to first host when no default and no hostId', () => {
      const client = new GrafanaApiClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
        hosts: [
          {
            id: 'prod',
            domain: 'https://grafana-prod.example.com',
            unifiedAlerting: true,
          },
        ],
      });

      // No hostId, no 'default' host, should fall back to first
      expect(client.isUnifiedAlerting()).toBe(true);
    });

    it('throws when hostId does not match any host', () => {
      const client = new GrafanaApiClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
        hosts: [{ id: 'prod', domain: 'https://grafana-prod.example.com' }],
      });

      expect(() => client.isUnifiedAlerting('nonexistent')).toThrow(
        'Grafana instance "nonexistent" not found. Available instances: prod',
      );
    });

    it('lists available instances in error message', () => {
      const client = new GrafanaApiClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
        hosts: [
          { id: 'prod', domain: 'https://grafana-prod.example.com' },
          { id: 'staging', domain: 'https://grafana-staging.example.com' },
        ],
      });

      expect(() => client.isUnifiedAlerting('invalid')).toThrow(
        'Available instances: prod, staging',
      );
    });
  });
});
