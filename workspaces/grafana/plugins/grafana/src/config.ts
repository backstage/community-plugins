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
import { GrafanaHost } from './types';

/**
 * Reads and validates Grafana host configurations from the app config.
 * Supports both the legacy single-instance `grafana.domain` config
 * and the multi-instance `grafana.hosts` array config.
 */
export function readHosts(configApi: ConfigApi): GrafanaHost[] {
  const hostsConfig: GrafanaHost[] =
    configApi.getOptional('grafana.hosts') ?? [];
  const domain = configApi.getOptionalString('grafana.domain');

  if (!domain && hostsConfig.length === 0) {
    throw new Error(
      'At least `grafana.domain` or `grafana.hosts` must be defined in app-config.yaml',
    );
  }

  for (const host of hostsConfig) {
    if (!host.id) {
      throw new Error('Each `grafana.hosts[].id` must be defined');
    }
    if (!host.domain) {
      throw new Error('Each `grafana.hosts[].domain` must be defined');
    }
  }

  // Backwards compatibility: if legacy domain is set and no hosts are configured,
  // add it as the 'default' host
  if (domain && hostsConfig.length === 0) {
    hostsConfig.push({
      id: 'default',
      domain,
      proxyPath: configApi.getOptionalString('grafana.proxyPath'),
      unifiedAlerting: configApi.getOptionalBoolean('grafana.unifiedAlerting'),
    });
  } else if (domain && hostsConfig.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      'Both `grafana.domain` and `grafana.hosts` are defined in app-config.yaml. ' +
        'The `grafana.domain` value will be ignored in favor of `grafana.hosts`.',
    );
  }

  // Validate unique proxy paths when multiple hosts are configured
  if (hostsConfig.length > 1) {
    const defaultProxyPath = '/grafana/api';
    const seen = new Map<string, string>();
    for (const host of hostsConfig) {
      const path = host.proxyPath ?? defaultProxyPath;
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

  return hostsConfig;
}
