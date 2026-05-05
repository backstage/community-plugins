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
import { DEFAULT_PROXY_PATH } from './defaults';
import { GrafanaHost } from './types';

export interface ReadHostsResult {
  hosts: GrafanaHost[];
  defaultHostId?: string;
}

/**
 * Reads and validates Grafana host configurations from the app config.
 * Supports both the legacy single-instance `grafana.domain` config
 * and the multi-instance `grafana.hosts` array config.
 */
export function readHosts(configApi: ConfigApi): ReadHostsResult {
  const hostsConfig: GrafanaHost[] =
    configApi.getOptionalConfigArray('grafana.hosts')?.map(hostConfig => ({
      id: hostConfig.getString('id'),
      domain: hostConfig.getString('domain'),
      proxyPath: hostConfig.getOptionalString('proxyPath'),
      unifiedAlerting: hostConfig.getOptionalBoolean('unifiedAlerting'),
    })) ?? [];

  // Legacy config keys (backward compatibility); see config.d.ts @deprecated
  // eslint-disable-next-line deprecation/deprecation
  const domain = configApi.getOptionalString('grafana.domain');

  if (!domain && hostsConfig.length === 0) {
    throw new Error(
      'At least `grafana.domain` or `grafana.hosts` must be defined in app-config.yaml',
    );
  }

  // Backwards compatibility: if legacy domain is set and no hosts are configured,
  // add it as the 'default' host
  if (domain && hostsConfig.length === 0) {
    hostsConfig.push({
      id: 'default',
      domain,
      // eslint-disable-next-line deprecation/deprecation
      proxyPath: configApi.getOptionalString('grafana.proxyPath'),
      // eslint-disable-next-line deprecation/deprecation
      unifiedAlerting: configApi.getOptionalBoolean('grafana.unifiedAlerting'),
    });
  } else if (domain && hostsConfig.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      'Both `grafana.domain` and `grafana.hosts` are defined in app-config.yaml. ' +
        'The `grafana.domain` value will be ignored in favor of `grafana.hosts`.',
    );
  }

  // Validate unique ids and proxy paths
  if (hostsConfig.length > 0) {
    const seenIds = new Set<string>();
    for (const host of hostsConfig) {
      if (!host.id || typeof host.id !== 'string') {
        throw new Error(
          'Invalid Grafana host configuration: missing or invalid "id" field. ' +
            'Each host in grafana.hosts must have a non-empty string "id".',
        );
      }
      if (!host.domain || typeof host.domain !== 'string') {
        throw new Error(
          `Invalid Grafana host configuration: host "${host.id}" is missing or has an invalid "domain" field.`,
        );
      }
      if (seenIds.has(host.id)) {
        throw new Error(
          `Duplicate Grafana host id "${host.id}" in grafana.hosts configuration. ` +
            'Each host must have a unique "id".',
        );
      }
      seenIds.add(host.id);
    }
  }

  if (hostsConfig.length > 1) {
    const seen = new Map<string, string>();
    for (const host of hostsConfig) {
      const path = host.proxyPath ?? DEFAULT_PROXY_PATH;
      const existing = seen.get(path);
      if (existing) {
        throw new Error(
          `Grafana hosts "${existing}" and "${host.id}" share the same proxy path "${path}". ` +
            'Each host must have a unique `proxyPath` so requests are routed to the correct instance.',
        );
      }
      seen.set(path, host.id);
    }
  }

  const defaultHostId = configApi.getOptionalString('grafana.defaultHost');
  if (defaultHostId) {
    const hostIds = new Set(hostsConfig.map(h => h.id));
    if (!hostIds.has(defaultHostId)) {
      throw new Error(
        `\`grafana.defaultHost\` is set to "${defaultHostId}" but no host with that id exists in \`grafana.hosts\`. ` +
          `Available host ids: ${Array.from(hostIds).join(', ')}`,
      );
    }
  }

  return { hosts: hostsConfig, defaultHostId };
}
