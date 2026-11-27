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

/** @typedef {{ Group: string, Version: string, Kind: string }} GroupVersionKind */

/** @type {Record<string, GroupVersionKind>} */
const KIND_TO_GVK = {
  AuthorizationPolicy: {
    Group: 'security.istio.io',
    Version: 'v1',
    Kind: 'AuthorizationPolicy',
  },
  PeerAuthentication: {
    Group: 'security.istio.io',
    Version: 'v1',
    Kind: 'PeerAuthentication',
  },
  RequestAuthentication: {
    Group: 'security.istio.io',
    Version: 'v1',
    Kind: 'RequestAuthentication',
  },
  DestinationRule: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: 'DestinationRule',
  },
  Gateway: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: 'Gateway',
  },
  EnvoyFilter: {
    Group: 'networking.istio.io',
    Version: 'v1alpha3',
    Kind: 'EnvoyFilter',
  },
  Sidecar: { Group: 'networking.istio.io', Version: 'v1', Kind: 'Sidecar' },
  ServiceEntry: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: 'ServiceEntry',
  },
  VirtualService: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: 'VirtualService',
  },
  WorkloadEntry: {
    Group: 'networking.istio.io',
    Version: 'v1alpha3',
    Kind: 'WorkloadEntry',
  },
  WorkloadGroup: {
    Group: 'networking.istio.io',
    Version: 'v1alpha3',
    Kind: 'WorkloadGroup',
  },
  WasmPlugin: {
    Group: 'extensions.istio.io',
    Version: 'v1alpha1',
    Kind: 'WasmPlugin',
  },
  Telemetry: {
    Group: 'telemetry.istio.io',
    Version: 'v1alpha1',
    Kind: 'Telemetry',
  },
  K8sGateway: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1',
    Kind: 'Gateway',
  },
  K8sHTTPRoute: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1',
    Kind: 'HTTPRoute',
  },
  K8sGRPCRoute: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1',
    Kind: 'GRPCRoute',
  },
  K8sTCPRoute: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1alpha2',
    Kind: 'TCPRoute',
  },
  K8sTLSRoute: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1alpha2',
    Kind: 'TLSRoute',
  },
  K8sReferenceGrant: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1beta1',
    Kind: 'ReferenceGrant',
  },
};

/** Fixture list keys → default Istio kind (fixtures use camelCase plurals). */
const LEGACY_CONFIG_ARRAYS = [
  ['authorizationPolicies', 'AuthorizationPolicy'],
  ['peerAuthentications', 'PeerAuthentication'],
  ['requestAuthentications', 'RequestAuthentication'],
  ['destinationRules', 'DestinationRule'],
  ['envoyFilters', 'EnvoyFilter'],
  ['gateways', 'Gateway'],
  ['sidecars', 'Sidecar'],
  ['serviceEntries', 'ServiceEntry'],
  ['virtualServices', 'VirtualService'],
  ['workloadEntries', 'WorkloadEntry'],
  ['workloadGroups', 'WorkloadGroup'],
  ['wasmPlugins', 'WasmPlugin'],
  ['telemetries', 'Telemetry'],
  ['k8sGateways', 'K8sGateway'],
  ['k8sHTTPRoutes', 'K8sHTTPRoute'],
  ['k8sGRPCRoutes', 'K8sGRPCRoute'],
  ['k8sTCPRoutes', 'K8sTCPRoute'],
  ['k8sTLSRoutes', 'K8sTLSRoute'],
  ['k8sReferenceGrants', 'K8sReferenceGrant'],
];

/**
 * @param {GroupVersionKind} gvk
 * @returns {string}
 */
export function gvkToString(gvk) {
  if (!gvk?.Kind) {
    return '';
  }
  if (!gvk.Group || !gvk.Version) {
    return gvk.Kind;
  }
  return `${gvk.Group}/${gvk.Version}, Kind=${gvk.Kind}`;
}

/**
 * @param {string | undefined} apiVersion
 * @param {string | undefined} kind
 * @returns {GroupVersionKind}
 */
export function gvkFromApiVersionKind(apiVersion, kind) {
  if (!kind) {
    return { Group: '', Version: '', Kind: '' };
  }
  if (!apiVersion?.trim()) {
    return (
      KIND_TO_GVK[kind] ?? {
        Group: '',
        Version: '',
        Kind: kind,
      }
    );
  }
  const parts = apiVersion.split('/');
  if (parts.length !== 2) {
    return (
      KIND_TO_GVK[kind] ?? {
        Group: '',
        Version: '',
        Kind: kind,
      }
    );
  }
  return { Group: parts[0], Version: parts[1], Kind: kind };
}

/**
 * @param {unknown} ref
 * @returns {import('@backstage-community/plugin-kiali-common/types').ObjectReference | undefined}
 */
export function normalizeObjectReference(ref) {
  if (!ref || typeof ref !== 'object') {
    return undefined;
  }
  const entry = /** @type {Record<string, unknown>} */ (ref);
  if (
    entry.objectGVK &&
    typeof entry.objectGVK === 'object' &&
    /** @type {{ Kind?: string }} */ (entry.objectGVK).Kind
  ) {
    return {
      name: String(entry.name ?? ''),
      namespace: String(entry.namespace ?? ''),
      objectGVK: /** @type {GroupVersionKind} */ (entry.objectGVK),
    };
  }
  const objectType = entry.objectType;
  if (typeof objectType === 'string') {
    const gvk = KIND_TO_GVK[objectType] ?? {
      Group: 'networking.istio.io',
      Version: 'v1',
      Kind: objectType,
    };
    return {
      name: String(entry.name ?? ''),
      namespace: String(entry.namespace ?? ''),
      objectGVK: gvk,
    };
  }
  return undefined;
}

/**
 * @param {unknown} refs
 * @returns {Array<{ name: string, namespace: string, objectGVK: GroupVersionKind }>}
 */
export function normalizeIstioReferences(refs) {
  if (!Array.isArray(refs)) {
    return [];
  }
  return refs
    .map(normalizeObjectReference)
    .filter(r => Boolean(r?.objectGVK?.Kind));
}

/**
 * @param {Record<string, unknown>} item
 */
function normalizeListEntity(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }
  if ('istioReferences' in item) {
    item.istioReferences = normalizeIstioReferences(item.istioReferences);
  }
  return item;
}

export function shouldApplyE2eHealthPatches() {
  return (
    process.env.KIALI_E2E_PATCH_HEALTH === '1' ||
    Boolean(process.env.KIALI_E2E_NAMESPACES?.trim())
  );
}

/** @param {string} name */
function failureWorkloadStatus(name) {
  return {
    name,
    desiredReplicas: 1,
    currentReplicas: 0,
    availableReplicas: 0,
    syncedProxies: 0,
  };
}

/** @param {Record<string, unknown>} entry */
export function patchRatingsV1UnhealthyWorkload(entry) {
  if (!entry || entry.name !== 'ratings-v1') {
    return entry;
  }
  const health =
    entry.health && typeof entry.health === 'object'
      ? /** @type {Record<string, unknown>} */ ({ ...entry.health })
      : {};
  return {
    ...entry,
    health: {
      ...health,
      workloadStatus: failureWorkloadStatus('ratings-v1'),
    },
  };
}

/** @param {Record<string, unknown>} map */
export function patchRatingsV1UnhealthyHealthMap(map) {
  if (!map || typeof map !== 'object' || !map['ratings-v1']) {
    return map;
  }
  const entry = /** @type {Record<string, unknown>} */ (map['ratings-v1']);
  return {
    ...map,
    'ratings-v1': {
      ...entry,
      workloadStatus: failureWorkloadStatus('ratings-v1'),
    },
  };
}

/** @param {unknown} detail */
export function applyE2eHealthPatchesToWorkloadDetail(detail) {
  if (!detail || typeof detail !== 'object') {
    return detail;
  }
  const workload = /** @type {Record<string, unknown>} */ (detail);
  if (workload.name !== 'ratings-v1' || !workload.health) {
    return detail;
  }
  const health = /** @type {Record<string, unknown>} */ ({
    ...workload.health,
  });
  return {
    ...workload,
    health: {
      ...health,
      workloadStatus: failureWorkloadStatus('ratings-v1'),
    },
  };
}

/**
 * @param {unknown} payload
 */
export function normalizeWorkloadServiceAppPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }
  const body = /** @type {Record<string, unknown>} */ (payload);
  for (const key of ['services', 'applications', 'workloads']) {
    const list = body[key];
    if (Array.isArray(list)) {
      body[key] = list.map(entry =>
        normalizeListEntity(
          /** @type {Record<string, unknown>} */ ({ ...entry }),
        ),
      );
    }
  }
  if (shouldApplyE2eHealthPatches() && Array.isArray(body.workloads)) {
    body.workloads = body.workloads.map(entry =>
      patchRatingsV1UnhealthyWorkload(
        /** @type {Record<string, unknown>} */ (entry),
      ),
    );
  }
  return body;
}

/** @param {unknown} detail */
/**
 * Align Istio object apiVersion/kind with dicTypeToGVK (v1) so PFBadge lookup works.
 *
 * @param {unknown} item
 * @param {string} [defaultKind]
 */
export function normalizeIstioResourceObject(item, defaultKind) {
  if (!item || typeof item !== 'object') {
    return item;
  }
  const obj = /** @type {{ kind?: string, apiVersion?: string }} */ ({
    ...item,
  });
  const kind = obj.kind ?? defaultKind ?? '';
  const gvk = KIND_TO_GVK[kind] ?? gvkFromApiVersionKind(obj.apiVersion, kind);
  if (gvk.Kind) {
    obj.kind = gvk.Kind;
  }
  if (gvk.Group && gvk.Version) {
    obj.apiVersion = `${gvk.Group}/${gvk.Version}`;
  }
  return obj;
}

/** @param {Record<string, unknown>} detail */
function withIstioConfigDetailDefaults(detail) {
  const defaultPermissions = { create: true, update: true, delete: true };
  const defaultValidation = {
    name: '',
    objectType: '',
    valid: true,
    checks: [],
  };
  const defaultReferences = {
    objectReferences: [],
    serviceReferences: [],
    workloadReferences: [],
  };

  return {
    ...detail,
    permissions: {
      ...defaultPermissions,
      ...(detail.permissions && typeof detail.permissions === 'object'
        ? detail.permissions
        : {}),
    },
    references: detail.references ?? defaultReferences,
    validation: detail.validation ?? defaultValidation,
  };
}

/**
 * @param {unknown} detail
 * @param {string} objectType e.g. Gateway, VirtualService
 */
export function normalizeIstioConfigDetail(detail, objectType) {
  if (!detail || typeof detail !== 'object') {
    return detail;
  }
  const raw = /** @type {Record<string, unknown>} */ (detail);

  if (raw.resource && typeof raw.resource === 'object') {
    return withIstioConfigDetailDefaults({
      ...raw,
      resource: normalizeIstioResourceObject(raw.resource, objectType),
    });
  }

  /** @type {Record<string, string>} */
  const legacyByKind = {
    Gateway: 'gateway',
    VirtualService: 'virtualService',
    DestinationRule: 'destinationRule',
    ServiceEntry: 'serviceEntry',
    Sidecar: 'sidecar',
    EnvoyFilter: 'envoyFilter',
    AuthorizationPolicy: 'authorizationPolicy',
    PeerAuthentication: 'peerAuthentication',
    RequestAuthentication: 'requestAuthentication',
  };

  const legacyKey = legacyByKind[objectType];
  const legacyResource = legacyKey ? raw[legacyKey] : undefined;

  if (legacyResource && typeof legacyResource === 'object') {
    const resource = normalizeIstioResourceObject(legacyResource, objectType);
    const meta =
      /** @type {{ metadata?: { name?: string, namespace?: string } }} */ (
        resource
      ).metadata ?? {};
    return withIstioConfigDetailDefaults({
      namespace: raw.namespace ?? { name: meta.namespace ?? 'bookinfo' },
      permissions: raw.permissions,
      references: raw.references,
      validation: raw.validation ?? {
        name: meta.name ?? '',
        objectType,
        valid: true,
        checks: [],
      },
      resource,
    });
  }

  return withIstioConfigDetailDefaults(raw);
}

export function normalizeKialiDetailPayload(detail) {
  if (!detail || typeof detail !== 'object') {
    return detail;
  }
  const out = { .../** @type {Record<string, unknown>} */ (detail) };

  const listKeys = [
    'destinationRules',
    'virtualServices',
    'gateways',
    'serviceEntries',
    'k8sHTTPRoutes',
    'k8sGRPCRoutes',
    'k8sGateways',
    'workloads',
    'endpoints',
    'pods',
    'istioReferences',
  ];
  for (const key of listKeys) {
    if (out[key] == null) {
      out[key] = [];
    }
  }
  if (out.validations == null) {
    out.validations = {};
  }

  return normalizeWorkloadServiceAppPayload(out);
}

/**
 * Converts dev fixtures (pre-GVK list shape) into current Kiali IstioConfigList.
 *
 * @param {unknown} legacy
 */
export function convertLegacyIstioConfig(legacy) {
  if (!legacy || typeof legacy !== 'object') {
    return { permissions: {}, validations: {}, resources: {} };
  }
  const input = /** @type {Record<string, unknown>} */ (legacy);
  if (input.resources && typeof input.resources === 'object') {
    return {
      permissions: input.permissions ?? {},
      validations: input.validations ?? {},
      resources: { .../** @type {object} */ (input.resources) },
    };
  }

  /** @type {Record<string, unknown[]>} */
  const resources = {};

  for (const [arrayKey, defaultKind] of LEGACY_CONFIG_ARRAYS) {
    const items = input[arrayKey];
    if (!Array.isArray(items) || items.length === 0) {
      continue;
    }
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const obj = /** @type {{ kind?: string, apiVersion?: string }} */ (item);
      const kind = obj.kind ?? defaultKind;
      // Bucket keys must match dicTypeToGVK (v1) so the UI filters find them.
      const gvk =
        KIND_TO_GVK[kind] ?? gvkFromApiVersionKind(obj.apiVersion, kind);
      const gvkKey = gvkToString(gvk);
      if (!gvkKey) {
        continue;
      }
      if (!resources[gvkKey]) {
        resources[gvkKey] = [];
      }
      resources[gvkKey].push(normalizeIstioResourceObject(item, kind));
    }
  }

  return {
    permissions: input.permissions ?? {},
    validations: input.validations ?? {},
    resources,
  };
}

/**
 * @param {Record<string, unknown>} namespaceKeyed
 */
export function mergeNamespaceKeyedIstioConfig(namespaceKeyed) {
  const merged = {
    permissions: {},
    validations: {},
    resources: /** @type {Record<string, unknown[]>} */ ({}),
  };

  for (const cfg of Object.values(namespaceKeyed)) {
    const modern = convertLegacyIstioConfig(cfg);
    for (const [gvk, list] of Object.entries(modern.resources)) {
      merged.resources[gvk] = [...(merged.resources[gvk] ?? []), ...list];
    }
    if (modern.validations && typeof modern.validations === 'object') {
      Object.assign(merged.validations, modern.validations);
    }
  }

  return merged;
}
