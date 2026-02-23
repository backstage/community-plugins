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

export interface Config {
  grafana: {
    /**
     * Domain used by users to access Grafana web UI.
     * Example: https://monitoring.eu.my-company.com/
     * Either `domain` or `hosts` must be defined.
     * @deprecated Use `grafana.hosts[].domain` in `grafana.hosts` instead.
     * @visibility frontend
     */
    domain?: string;

    /**
     * Path to use for requests via the proxy, defaults to /grafana/api
     * @deprecated Use `grafana.hosts[].proxyPath` in `grafana.hosts` instead.
     * @visibility frontend
     */
    proxyPath?: string;

    /**
     * Is Grafana using unified alerting?
     * @deprecated Use `grafana.hosts[].unifiedAlerting` in `grafana.hosts` instead.
     * @visibility frontend
     */
    unifiedAlerting?: boolean;

    /**
     * Limit value to pass in Grafana Dashboard search query.
     * @deprecated Use server-side filtering instead. See https://github.com/backstage/community-plugins/pull/3909
     * @visibility frontend
     */
    grafanaDashboardSearchLimit?: number;

    /**
     * Max pages of Grafana Dashboard search query to fetch.
     * @deprecated Use server-side filtering instead. See https://github.com/backstage/community-plugins/pull/3909
     * @visibility frontend
     */
    grafanaDashboardMaxPages?: number;

    /**
     * Default host id for entities that do not have the `grafana/host-id` annotation.
     * Must match one of the `id` values in `grafana.hosts`.
     * When not set, the first host in `hosts` is used (or the legacy `default` host).
     * @visibility frontend
     */
    defaultHost?: string;

    /**
     * List of Grafana instances to connect to.
     * Either `domain` or `hosts` must be defined.
     * @visibility frontend
     */
    hosts?: Array<{
      /**
       * Unique identifier for this Grafana instance.
       * Used in the `grafana/host-id` entity annotation.
       * @visibility frontend
       */
      id: string;

      /**
       * Domain used by users to access this Grafana instance.
       * Example: https://monitoring.eu.my-company.com/
       * @visibility frontend
       */
      domain: string;

      /**
       * Path to use for requests via the proxy for this instance.
       * Defaults to /grafana/api
       * @visibility frontend
       */
      proxyPath?: string;

      /**
       * Is this Grafana instance using unified alerting?
       * @visibility frontend
       */
      unifiedAlerting?: boolean;
    }>;
  };
}
