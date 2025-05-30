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

import deepFreeze from 'deep-freeze';
import { MILLISECONDS, UNIT_TIME } from '../types';

// We assume this is always defined in the .env file
const documentationUrl = process.env.REACT_APP_KIALI_DOC_URL!;

const conf = {
  /** Configuration related with session */
  session: {
    /** TimeOut Session remain for warning user default 1 minute */
    timeOutforWarningUser: 1 * UNIT_TIME.MINUTE * MILLISECONDS,
  },
  /** Toolbar Configuration */
  toolbar: {
    /** Duration default is 1 minute */
    defaultDuration: 1 * UNIT_TIME.MINUTE,
    /** By default refresh is 1 minute */
    defaultRefreshInterval: 60 * MILLISECONDS,
    /** Time Range default is 10 minutes **/
    defaultTimeRange: {
      rangeDuration: 10 * UNIT_TIME.MINUTE,
    },
    /** Options in refresh */
    refreshInterval: {
      0: 'Pause',
      10000: 'Every 10s',
      15000: 'Every 15s',
      30000: 'Every 30s',
      60000: 'Every 1m',
      300000: 'Every 5m',
      900000: 'Every 15m',
    },
    /** Graphs layouts types */
    graphLayouts: {
      'kiali-grid': 'Grid',
      'kiali-concentric': 'Concentric',
      'kiali-dagre': 'Dagre',
    },
  },
  /** About Tracing Configuration*/
  tracing: {
    configuration: {
      limitResults: {
        20: 20,
        50: 50,
        100: 100,
        200: 200,
        300: 300,
        400: 400,
        500: 500,
      },
      statusCode: {
        none: 'none',
        200: '200',
        400: '400',
        401: '401',
        403: '403',
        404: '404',
        405: '405',
        408: '408',
        500: '500',
        502: '502',
        503: '503',
        504: '504',
      },
    },
  },
  /** About dialog configuration */
  about: {
    project: {
      url: 'https://github.com/kiali',
      icon: 'RepositoryIcon',
      linkText: 'Find us on GitHub',
    },
    website: {
      url: 'https://www.kiali.io', // Without www, we get an SSL error
      icon: 'HomeIcon',
      linkText: 'Visit our web page',
    },
  },
  /** */
  documentation: {
    url: documentationUrl,
  },
  /**  Login configuration */
  login: {
    headers: {
      'X-Auth-Type-Kiali-UI': '1',
    },
  },
  /** API configuration */
  api: {
    urls: {
      aggregateGraphElements: (
        namespace: string,
        aggregate: string,
        aggregateValue: string,
      ) =>
        `api/namespaces/${namespace}/aggregates/${aggregate}/${aggregateValue}/graph`,
      aggregateByServiceGraphElements: (
        namespace: string,
        aggregate: string,
        aggregateValue: string,
        service: string,
      ) =>
        `api/namespaces/${namespace}/aggregates/${aggregate}/${aggregateValue}/${service}/graph`,
      aggregateMetrics: (
        namespace: string,
        aggregate: string,
        aggregateValue: string,
      ) =>
        `api/namespaces/${namespace}/aggregates/${aggregate}/${aggregateValue}/metrics`,
      authenticate: 'api/authenticate',
      authInfo: 'api/auth/info',
      app: (namespace: string, app: string) =>
        `api/namespaces/${namespace}/apps/${app}`,
      appGraphElements: (namespace: string, app: string, version?: string) => {
        const baseUrl = `api/namespaces/${namespace}/applications/${app}`;
        const hasVersion = version && version !== 'unknown';
        const versionSuffixed = hasVersion
          ? `${baseUrl}/versions/${version}`
          : baseUrl;
        return `${versionSuffixed}/graph`;
      },
      appHealth: (namespace: string, app: string) =>
        `api/namespaces/${namespace}/apps/${app}/health`,
      appMetrics: (namespace: string, app: string) =>
        `api/namespaces/${namespace}/apps/${app}/metrics`,
      appDashboard: (namespace: string, app: string) =>
        `api/namespaces/${namespace}/apps/${app}/dashboard`,
      appSpans: (namespace: string, app: string) =>
        `api/namespaces/${namespace}/apps/${app}/spans`,
      clusters: 'api/clusters',
      clustersHealth: () => `api/clusters/health`,
      clustersWorkloads: () => `api/clusters/workloads`,
      crippledFeatures: 'api/crippled',
      serviceSpans: (namespace: string, service: string) =>
        `api/namespaces/${namespace}/services/${service}/spans`,
      workloadSpans: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/spans`,
      customDashboard: (namespace: string, template: string) =>
        `api/namespaces/${namespace}/customdashboard/${template}`,
      grafana: 'api/grafana',
      istioConfig: (namespace: string) => `api/namespaces/${namespace}/istio`,
      allIstioConfigs: () => `api/istio/config`,
      istioConfigCreate: (namespace: string, objectType: string) =>
        `api/namespaces/${namespace}/istio/${objectType}`,
      istioConfigDetail: (
        namespace: string,
        objectType: string,
        object: string,
      ) => `api/namespaces/${namespace}/istio/${objectType}/${object}`,
      istioConfigDelete: (
        namespace: string,
        objectType: string,
        object: string,
      ) => `api/namespaces/${namespace}/istio/${objectType}/${object}`,
      istioConfigUpdate: (
        namespace: string,
        objectType: string,
        object: string,
      ) => `api/namespaces/${namespace}/istio/${objectType}/${object}`,
      istioPermissions: 'api/istio/permissions',
      jaeger: 'api/jaeger',
      appTraces: (namespace: string, app: string) =>
        `api/namespaces/${namespace}/apps/${app}/traces`,
      serviceTraces: (namespace: string, svc: string) =>
        `api/namespaces/${namespace}/services/${svc}/traces`,
      workloadTraces: (namespace: string, wkd: string) =>
        `api/namespaces/${namespace}/workloads/${wkd}/traces`,
      jaegerErrorTraces: (namespace: string, app: string) =>
        `api/namespaces/${namespace}/apps/${app}/errortraces`,
      jaegerTrace: (idTrace: string) => `api/traces/${idTrace}`,
      logout: 'api/logout',
      metricsStats: 'api/stats/metrics',
      namespaces: 'api/namespaces',
      namespace: (namespace: string) => `api/namespaces/${namespace}`,
      namespacesGraphElements: `api/namespaces/graph`,
      namespaceMetrics: (namespace: string) =>
        `api/namespaces/${namespace}/metrics`,
      namespaceTls: (namespace: string) => `api/namespaces/${namespace}/tls`,
      namespaceValidations: (namespace: string) =>
        `api/namespaces/${namespace}/validations`,
      configValidations: () => `api/istio/validations`,
      meshTls: () => 'api/mesh/tls',
      istioStatus: () => 'api/istio/status',
      istioCertsInfo: () => 'api/istio/certs',
      pod: (namespace: string, pod: string) =>
        `api/namespaces/${namespace}/pods/${pod}`,
      podLogs: (namespace: string, pod: string) =>
        `api/namespaces/${namespace}/pods/${pod}/logs`,
      podEnvoyProxy: (namespace: string, pod: string) =>
        `api/namespaces/${namespace}/pods/${pod}/config_dump`,
      podEnvoyProxyLogging: (namespace: string, pod: string) =>
        `api/namespaces/${namespace}/pods/${pod}/logging`,
      podEnvoyProxyResourceEntries: (
        namespace: string,
        pod: string,
        resource: string,
      ) => `api/namespaces/${namespace}/pods/${pod}/config_dump/${resource}`,
      serverConfig: `api/config`,
      service: (namespace: string, service: string) =>
        `api/namespaces/${namespace}/services/${service}`,
      serviceGraphElements: (namespace: string, service: string) =>
        `api/namespaces/${namespace}/services/${service}/graph`,
      serviceHealth: (namespace: string, service: string) =>
        `api/namespaces/${namespace}/services/${service}/health`,
      serviceMetrics: (namespace: string, service: string) =>
        `api/namespaces/${namespace}/services/${service}/metrics`,
      serviceDashboard: (namespace: string, service: string) =>
        `api/namespaces/${namespace}/services/${service}/dashboard`,
      clustersApps: () => `api/clusters/apps`,
      clustersServices: () => `api/clusters/services`,
      status: 'api/status',
      workload: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}`,
      workloadGraphElements: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/graph`,
      workloadHealth: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/health`,
      workloadMetrics: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/metrics`,
      workloadDashboard: (namespace: string, workload: string) =>
        `api/namespaces/${namespace}/workloads/${workload}/dashboard`,
    },
  },
  /** Graph configurations */
  graph: {
    // maxHosts is the maximum number of hosts to show in the graph for
    // nodes representing Gateways, VirtualServices and ServiceEntries.
    maxHosts: 5,
  },
};

// @public
export const config = deepFreeze(conf) as typeof conf;
