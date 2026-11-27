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

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyE2eHealthPatchesToWorkloadDetail,
  convertLegacyIstioConfig,
  mergeNamespaceKeyedIstioConfig,
  normalizeIstioConfigDetail,
  normalizeKialiDetailPayload,
  normalizeWorkloadServiceAppPayload,
  patchRatingsV1UnhealthyHealthMap,
  patchRatingsV1UnhealthyWorkload,
} from './kiali-mock-normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = path.resolve(
  __dirname,
  '../plugins/kiali/dev/__fixtures__',
);
const PORT = Number(process.env.KIALI_MOCK_PORT ?? 20001);
const PREFIX = '/kiali/';

/** When set (e.g. by Playwright), limit namespaces to match e2e expectations. */
const E2E_NAMESPACE_FILTER = process.env.KIALI_E2E_NAMESPACES?.split(',')
  .map(ns => ns.trim())
  .filter(Boolean);

const SUPPORTED_KIALI_VERSION = 'v1.86.0';

/** @param {string} relativePath */
function loadJson(relativePath) {
  const absolute = path.join(FIXTURES_ROOT, relativePath);
  if (!fs.existsSync(absolute)) {
    return undefined;
  }
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

/** @param {Array<{ name: string }>} list */
function filterNamespaceList(list) {
  if (!E2E_NAMESPACE_FILTER?.length) {
    return list;
  }
  const allowed = new Set(E2E_NAMESPACE_FILTER);
  return list.filter(ns => allowed.has(ns.name));
}

/** @param {string | null} raw */
function parseNamespaceList(raw) {
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map(ns => ns.trim())
    .filter(Boolean);
}

/** @param {URLSearchParams} search */
function namespacesFromQuery(search) {
  return parseNamespaceList(search.get('namespaces'));
}

/** @param {string} ns @param {string} collection @param {string} childKey */
function mergeClusterCollection(ns, collection, childKey) {
  const data = loadJson(`namespaces/${ns}/${collection}.json`);
  if (!data) {
    return [];
  }
  const items = data[childKey] ?? [];
  return items.map(item => ({
    ...item,
    namespace: item.namespace ?? ns,
  }));
}

/** @param {string[]} namespaces */
function buildClusterWorkloads(namespaces) {
  const workloads = [];
  for (const ns of namespaces) {
    workloads.push(...mergeClusterCollection(ns, 'workloads', 'workloads'));
  }
  const body = normalizeWorkloadServiceAppPayload({
    workloads,
    validations: {},
  });
  if (Array.isArray(body.workloads)) {
    body.workloads = body.workloads.map(patchRatingsV1UnhealthyWorkload);
  }
  return body;
}

/** @param {string[]} namespaces */
function buildClusterServices(namespaces) {
  const services = [];
  for (const ns of namespaces) {
    services.push(...mergeClusterCollection(ns, 'services', 'services'));
  }
  return normalizeWorkloadServiceAppPayload({ services, validations: {} });
}

/** @param {string[]} namespaces */
function buildClusterApps(namespaces) {
  const applications = [];
  for (const ns of namespaces) {
    applications.push(...mergeClusterCollection(ns, 'apps', 'applications'));
  }
  return normalizeWorkloadServiceAppPayload({ applications, validations: {} });
}

/** @param {string} namespace @param {string} direction @param {string} rateInterval */
function loadNamespaceMetrics(namespace, direction, rateInterval) {
  const duration = String(rateInterval).replace(/s$/, '');
  const candidates = [duration, '600', '300', '60', '120', '1800', '3600'];
  for (const d of candidates) {
    const relative = `namespaces/${namespace}/metrics/${direction}/metrics_${direction}_${d}.json`;
    const data = loadJson(relative);
    if (data && Object.keys(data).length > 0) {
      return data;
    }
  }
  return {};
}

let cachedGlobalIstioConfig;

function globalIstioConfig() {
  if (!cachedGlobalIstioConfig) {
    let raw = loadJson('general/istioConfig.json') ?? {};
    if (E2E_NAMESPACE_FILTER?.length && !raw.resources) {
      raw = Object.fromEntries(
        Object.entries(raw).filter(([ns]) => E2E_NAMESPACE_FILTER.includes(ns)),
      );
    }
    if (raw.resources) {
      cachedGlobalIstioConfig = convertLegacyIstioConfig(raw);
    } else {
      cachedGlobalIstioConfig = mergeNamespaceKeyedIstioConfig(raw);
    }
  }
  return cachedGlobalIstioConfig;
}

/**
 * @param {'app' | 'service' | 'workload'} type
 * @param {string[]} namespaces
 */
function buildClustersHealth(type, namespaces) {
  const healthFile =
    type === 'app' ? 'app' : type === 'service' ? 'service' : 'workload';
  const responseKey =
    type === 'app'
      ? 'namespaceAppHealth'
      : type === 'service'
        ? 'namespaceServiceHealth'
        : 'namespaceWorkloadHealth';

  /** @type {Record<string, Record<string, unknown>>} */
  const payload = {};
  payload[responseKey] = {};

  for (const ns of namespaces) {
    let health = loadJson(`namespaces/${ns}/health/${healthFile}.json`);
    if (health) {
      if (type === 'workload' && ns === 'bookinfo') {
        health = patchRatingsV1UnhealthyHealthMap(health);
      }
      payload[responseKey][ns] = health;
    }
  }
  return payload;
}

/** @param {string} namespace @param {string} workloadName */
function workloadDetail(namespace, workloadName) {
  const fileName = workloadName.replace(/-/g, '_');
  return (
    loadJson(`namespaces/${namespace}/workloads/${fileName}.json`) ??
    loadJson(`namespaces/${namespace}/workloads/${workloadName}.json`)
  );
}

/** @param {string} namespace @param {string} serviceName */
function serviceDetail(namespace, serviceName) {
  const fileName = serviceName.replace(/-/g, '_');
  return (
    loadJson(`namespaces/${namespace}/services/${fileName}.json`) ??
    loadJson(`namespaces/${namespace}/services/${serviceName}.json`)
  );
}

/**
 * Parse Istio config detail paths (with or without apiVersion in the URL).
 *
 * Examples:
 * - api/namespaces/bookinfo/istio/Gateway/bookinfo-gateway
 * - api/namespaces/bookinfo/istio/networking.istio.io/v1/Gateway/bookinfo-gateway
 *
 * @param {string} apiPath
 * @returns {{ namespace: string, objectType: string, objectName: string } | undefined}
 */
function parseIstioConfigDetailPath(apiPath) {
  const match = apiPath.match(/^api\/namespaces\/([^/]+)\/istio\/(.+)$/);
  if (!match) {
    return undefined;
  }
  const namespace = match[1];
  const segments = match[2]
    .split('/')
    .map(segment => decodeURIComponent(segment));
  if (segments.length < 2) {
    return undefined;
  }
  const objectName = segments[segments.length - 1];
  const objectType = segments[segments.length - 2];
  return { namespace, objectType, objectName };
}

/** Fixture directories use plural lowercase names (gateways, virtualservices, …). */
const ISTIO_CONFIG_DETAIL_FOLDER = {
  Gateway: 'gateways',
  VirtualService: 'virtualservices',
  DestinationRule: 'destinationrules',
  ServiceEntry: 'serviceentries',
  Sidecar: 'sidecars',
  EnvoyFilter: 'envoyfilters',
  AuthorizationPolicy: 'authorizationpolicies',
  PeerAuthentication: 'peerauthentications',
  RequestAuthentication: 'requestauthentications',
};

/** @param {string} objectType */
function istioConfigDetailFolder(objectType) {
  if (ISTIO_CONFIG_DETAIL_FOLDER[objectType]) {
    return ISTIO_CONFIG_DETAIL_FOLDER[objectType];
  }
  return objectType.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

/** @param {string} namespace @param {string} objectType @param {string} objectName */
function loadIstioConfigDetail(namespace, objectType, objectName) {
  const folder = istioConfigDetailFolder(objectType);
  const key = objectName.replace(/-/g, '_');
  return (
    loadJson(`namespaces/${namespace}/istio_configs/${folder}/${key}.json`) ??
    loadJson(
      `namespaces/${namespace}/istio_configs/${folder}/${objectName}.json`,
    ) ??
    loadJson(
      `namespaces/${namespace}/istio_configs/${folder}/${objectName.replace(/-/g, '')}.json`,
    )
  );
}

/** @param {string} namespace @param {string} appName */
function appDetail(namespace, appName) {
  const fileName = appName.replace(/-/g, '_');
  return (
    loadJson(`namespaces/${namespace}/apps/${fileName}.json`) ??
    loadJson(`namespaces/${namespace}/apps/${appName}.json`)
  );
}

/** @param {http.IncomingMessage} req @param {http.ServerResponse} res @param {unknown} body */
function sendJson(res, body, status = 200) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

/** @param {http.IncomingMessage} req @param {http.ServerResponse} res */
function handleRequest(req, res) {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (!url.pathname.startsWith(PREFIX)) {
    res.writeHead(404);
    res.end();
    return;
  }

  const apiPath = url.pathname.slice(PREFIX.length);
  const method = req.method ?? 'GET';

  if (method === 'GET' && apiPath === 'api/auth/info') {
    return sendJson(res, loadJson('general/auth_info_anonymous.json'));
  }

  if (method === 'POST' && apiPath === 'api/authenticate') {
    return sendJson(res, { username: 'anonymous', expiresOn: '' });
  }

  if (method === 'GET' && apiPath === 'api/status') {
    const status = loadJson('general/status.json') ?? { status: {} };
    status.status = {
      ...status.status,
      'Kiali version': SUPPORTED_KIALI_VERSION,
      'Kiali state': 'running',
    };
    return sendJson(res, status);
  }

  if (method === 'GET' && apiPath === 'api/namespaces') {
    const all = loadJson('general/namespaces.json') ?? [];
    return sendJson(res, filterNamespaceList(all));
  }

  if (method === 'GET' && apiPath === 'api/config') {
    return sendJson(res, loadJson('general/config.json'));
  }

  if (method === 'GET' && apiPath === 'api/clusters') {
    const config = loadJson('general/config.json');
    return sendJson(res, { clusters: config?.clusters ?? {} });
  }

  if (method === 'GET' && apiPath === 'api/clusters/health') {
    const typeParam = url.searchParams.get('type') ?? 'app';
    const type =
      typeParam === 'service' || typeParam === 'workload' ? typeParam : 'app';
    const namespaces = namespacesFromQuery(url.searchParams);
    return sendJson(res, buildClustersHealth(type, namespaces));
  }

  if (method === 'GET' && apiPath === 'api/clusters/workloads') {
    const namespaces = namespacesFromQuery(url.searchParams);
    return sendJson(res, buildClusterWorkloads(namespaces));
  }

  if (method === 'GET' && apiPath === 'api/clusters/services') {
    const namespaces = namespacesFromQuery(url.searchParams);
    return sendJson(res, buildClusterServices(namespaces));
  }

  if (method === 'GET' && apiPath === 'api/clusters/apps') {
    const namespaces = namespacesFromQuery(url.searchParams);
    return sendJson(res, buildClusterApps(namespaces));
  }

  if (method === 'GET' && apiPath === 'api/namespaces/graph') {
    return sendJson(res, loadJson('general/graph.json'));
  }

  if (method === 'GET' && apiPath === 'api/crippled') {
    return sendJson(res, loadJson('general/crippledFeatures.json') ?? {});
  }

  if (method === 'GET' && apiPath === 'api/mesh/tls') {
    return sendJson(res, loadJson('general/meshTls.json'));
  }

  if (method === 'GET' && apiPath === 'api/istio/status') {
    return sendJson(res, loadJson('general/istioStatus.json') ?? []);
  }

  if (method === 'GET' && apiPath === 'api/clusters/tls') {
    return sendJson(res, loadJson('general/istioCertsInfo.json') ?? []);
  }

  if (method === 'GET' && apiPath === 'api/istio/validations') {
    const validations = loadJson('general/istioValidations.json') ?? {};
    const flat = Object.entries(validations).flatMap(([cluster, byNs]) =>
      Object.entries(byNs).map(([namespace, status]) => ({
        ...status,
        namespace,
        cluster,
      })),
    );
    return sendJson(res, flat);
  }

  if (method === 'GET' && apiPath === 'api/istio/config') {
    return sendJson(res, globalIstioConfig());
  }

  if (method === 'GET' && apiPath === 'api/grafana') {
    return sendJson(res, loadJson('general/grafana.json') ?? {});
  }

  const namespaceIstio = apiPath.match(/^api\/namespaces\/([^/]+)\/istio$/);
  if (method === 'GET' && namespaceIstio) {
    const [, namespace] = namespaceIstio;
    const legacy = loadJson(`namespaces/${namespace}/istio_config.json`) ?? {
      namespace: { name: namespace },
    };
    return sendJson(res, convertLegacyIstioConfig(legacy));
  }

  const workloadMatch = apiPath.match(
    /^api\/namespaces\/([^/]+)\/workloads\/([^/]+)$/,
  );
  if (method === 'GET' && workloadMatch) {
    const [, namespace, name] = workloadMatch;
    const detail = workloadDetail(namespace, decodeURIComponent(name));
    if (detail) {
      return sendJson(
        res,
        applyE2eHealthPatchesToWorkloadDetail(
          normalizeKialiDetailPayload(detail),
        ),
      );
    }
  }

  const serviceMatch = apiPath.match(
    /^api\/namespaces\/([^/]+)\/services\/([^/]+)$/,
  );
  if (method === 'GET' && serviceMatch) {
    const [, namespace, name] = serviceMatch;
    const detail = serviceDetail(namespace, decodeURIComponent(name));
    if (detail) {
      return sendJson(res, normalizeKialiDetailPayload(detail));
    }
  }

  const appMatch = apiPath.match(/^api\/namespaces\/([^/]+)\/apps\/([^/]+)$/);
  if (method === 'GET' && appMatch) {
    const [, namespace, name] = appMatch;
    const detail = appDetail(namespace, decodeURIComponent(name));
    if (detail) {
      return sendJson(res, normalizeKialiDetailPayload(detail));
    }
  }

  if (method === 'GET' && apiPath === 'api/clusters/metrics') {
    const namespaces = namespacesFromQuery(url.searchParams);
    const direction = url.searchParams.get('direction') ?? 'inbound';
    const rateInterval = url.searchParams.get('rateInterval') ?? '600s';
    /** @type {Record<string, unknown>} */
    const byNamespace = {};
    for (const ns of namespaces) {
      const metrics = loadNamespaceMetrics(ns, direction, rateInterval);
      if (Object.keys(metrics).length > 0) {
        byNamespace[ns] = metrics;
      }
    }
    return sendJson(res, byNamespace);
  }

  const namespaceMetrics = apiPath.match(/^api\/namespaces\/([^/]+)\/metrics$/);
  if (method === 'GET' && namespaceMetrics) {
    const [, namespace] = namespaceMetrics;
    const direction = url.searchParams.get('direction') ?? 'inbound';
    const rateInterval = url.searchParams.get('rateInterval') ?? '600s';
    return sendJson(
      res,
      loadNamespaceMetrics(namespace, direction, rateInterval),
    );
  }

  const resourceMetrics = apiPath.match(
    /^api\/namespaces\/([^/]+)\/(apps|services|workloads)\/([^/]+)\/metrics$/,
  );
  if (method === 'GET' && resourceMetrics) {
    const [, namespace] = resourceMetrics;
    const direction = url.searchParams.get('direction') ?? 'inbound';
    const rateInterval = url.searchParams.get('rateInterval') ?? '600s';
    return sendJson(
      res,
      loadNamespaceMetrics(namespace, direction, rateInterval),
    );
  }

  const istioDetailMatch = parseIstioConfigDetailPath(apiPath);
  if (method === 'GET' && istioDetailMatch) {
    const { namespace, objectType, objectName } = istioDetailMatch;
    const detail = loadIstioConfigDetail(namespace, objectType, objectName);
    if (detail) {
      return sendJson(res, normalizeIstioConfigDetail(detail, objectType));
    }
    return sendJson(res, {}, 404);
  }

  const nsWorkloads = apiPath.match(/^api\/namespaces\/([^/]+)\/workloads$/);
  if (method === 'GET' && nsWorkloads) {
    const [, namespace] = nsWorkloads;
    const data = loadJson(`namespaces/${namespace}/workloads.json`);
    if (data) {
      return sendJson(res, normalizeWorkloadServiceAppPayload(data));
    }
  }

  const nsServices = apiPath.match(/^api\/namespaces\/([^/]+)\/services$/);
  if (method === 'GET' && nsServices) {
    const [, namespace] = nsServices;
    const data = loadJson(`namespaces/${namespace}/services.json`) ?? {};
    return sendJson(res, normalizeWorkloadServiceAppPayload(data));
  }

  const nsApps = apiPath.match(/^api\/namespaces\/([^/]+)\/apps$/);
  if (method === 'GET' && nsApps) {
    const [, namespace] = nsApps;
    const data = loadJson(`namespaces/${namespace}/apps.json`) ?? {};
    return sendJson(res, normalizeWorkloadServiceAppPayload(data));
  }

  if (process.env.KIALI_MOCK_DEBUG === '1') {
    // eslint-disable-next-line no-console
    console.warn(`[kiali-e2e-mock] unhandled ${method} /${apiPath}`);
  }

  sendJson(res, {});
}

const server = http.createServer(handleRequest);
server.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(
    `Kiali e2e mock listening at http://127.0.0.1:${PORT}${PREFIX} (fixtures: ${FIXTURES_ROOT})`,
  );
});
