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
  dicTypeToGVK,
  DestinationRule as DR,
  gvkType,
  Gateway as GW,
  IstioConfigItem,
  IstioConfigList,
  IstioObject,
  K8sGRPCRoute as K8sGRPCR,
  K8sGateway as K8sGW,
  K8sHTTPRoute as K8sHTTPR,
  K8sMetadata,
  ObjectValidation,
  ServiceEntry as SE,
  Validations,
  VirtualService as VS,
} from '../types';
import { getGVKTypeString, getIstioObjectGVK } from '../utils/IstioConfigUtils';

export function validationKey(name: string, namespace?: string): string {
  if (namespace !== undefined) {
    return `${name}.${namespace}`;
  }
  return name;
}

const includeName = (name: string, names: string[]) => {
  for (let i = 0; i < names.length; i++) {
    if (name.includes(names[i])) {
      return true;
    }
  }
  return false;
};

export const filterByName = (
  unfiltered: IstioConfigList,
  names: string[],
): IstioConfigList => {
  if (names && names.length === 0) {
    return unfiltered;
  }

  const filteredResources: { [key: string]: any[] } = {};

  // Iterate over the dicTypeToGVK to access each resource type dynamically
  Object.values(dicTypeToGVK).forEach(value => {
    const resourceKey = getGVKTypeString(value);

    // Check if the resource exists in the unfiltered list, then filter by names
    if (unfiltered.resources[resourceKey]) {
      filteredResources[resourceKey] = unfiltered.resources[resourceKey].filter(
        resource => includeName(resource.metadata.name, names),
      );
    }
  });

  return {
    resources: filteredResources,
    validations: unfiltered.validations,
    permissions: unfiltered.permissions,
  };
};

interface ObjectWithMetadata {
  metadata: K8sMetadata;
}

const includesNamespace = (
  item: ObjectWithMetadata,
  namespaces: Set<string>,
): boolean => {
  return (
    item.metadata.namespace !== undefined &&
    namespaces.has(item.metadata.namespace)
  );
};

export const filterByNamespaces = (
  unfiltered: IstioConfigList,
  namespaces: string[],
): IstioConfigList => {
  const namespaceSet = new Set(namespaces);
  const filteredResources: { [key: string]: any[] } = {};

  // Iterate over dicTypeToGVK to dynamically filter each resource by namespace
  Object.values(dicTypeToGVK).forEach(value => {
    const resourceKey = getGVKTypeString(value);

    // Check if the resource exists in the unfiltered list, then filter by namespace
    if (unfiltered.resources && unfiltered.resources[resourceKey]) {
      filteredResources[resourceKey] = unfiltered.resources[resourceKey].filter(
        resource => includesNamespace(resource, namespaceSet),
      );
    }
  });

  return {
    resources: filteredResources,
    validations: unfiltered.validations,
    permissions: unfiltered.permissions,
  };
};

export const filterByConfigValidation = (
  unfiltered: IstioConfigItem[],
  configFilters: string[],
): IstioConfigItem[] => {
  if (configFilters && configFilters.length === 0) {
    return unfiltered;
  }
  const filtered: IstioConfigItem[] = [];

  const filterByValid = configFilters.indexOf('Valid') > -1;
  const filterByNotValid = configFilters.indexOf('Not Valid') > -1;
  const filterByNotValidated = configFilters.indexOf('Not Validated') > -1;
  const filterByWarning = configFilters.indexOf('Warning') > -1;
  if (
    filterByValid &&
    filterByNotValid &&
    filterByNotValidated &&
    filterByWarning
  ) {
    return unfiltered;
  }

  unfiltered.forEach(item => {
    if (filterByValid && item.validation && item.validation.valid) {
      filtered.push(item);
    }
    if (filterByNotValid && item.validation && !item.validation.valid) {
      filtered.push(item);
    }
    if (filterByNotValidated && !item.validation) {
      filtered.push(item);
    }
    if (
      filterByWarning &&
      item.validation &&
      item.validation.checks.filter(i => i.severity === 'warning').length > 0
    ) {
      filtered.push(item);
    }
  });
  return filtered;
};

export const toIstioItems = (
  istioConfigList: IstioConfigList,
  cluster?: string,
): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];

  const hasValidations = (
    objectGVK: string,
    name: string,
    namespace?: string,
  ): ObjectValidation =>
    istioConfigList.validations[objectGVK] &&
    istioConfigList.validations[objectGVK][validationKey(name, namespace)];

  const resources = istioConfigList.resources;
  Object.keys(resources).forEach(field => {
    const entries = resources[field];

    if (!entries) {
      return;
    }

    entries.forEach((entry: IstioObject) => {
      const gvkString = getGVKTypeString(
        getIstioObjectGVK(entry.apiVersion, entry.kind),
      );
      const item = {
        namespace: entry.metadata.namespace ?? '',
        cluster: cluster,
        kind: entry.kind,
        apiVersion: entry.apiVersion,
        name: entry.metadata.name,
        creationTimestamp: entry.metadata.creationTimestamp,
        resource: entry,
        resourceVersion: entry.metadata.resourceVersion,
        validation: hasValidations(
          gvkString,
          entry.metadata.name,
          entry.metadata.namespace,
        )
          ? istioConfigList.validations[gvkString][
              validationKey(entry.metadata.name, entry.metadata.namespace)
            ]
          : undefined,
      };

      istioItems.push(item);
    });
  });

  return istioItems;
};

export const vsToIstioItems = (
  vss: VS[],
  validations: Validations,
  cluster?: string,
): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];
  const objectGVK = getGVKTypeString(gvkType.VirtualService);
  const hasValidations = (vKey: string): ObjectValidation =>
    validations[objectGVK] && validations[objectGVK][vKey];

  vss.forEach(vs => {
    const vKey = validationKey(vs.metadata.name, vs.metadata.namespace);

    const item = {
      cluster: cluster,
      namespace: vs.metadata.namespace ?? '',
      kind: vs.kind,
      apiVersion: vs.apiVersion,
      name: vs.metadata.name,
      creationTimestamp: vs.metadata.creationTimestamp,
      resource: vs,
      resourceVersion: vs.metadata.resourceVersion,
      validation: hasValidations(vKey)
        ? validations[objectGVK][vKey]
        : undefined,
    };

    istioItems.push(item);
  });

  return istioItems;
};

export const drToIstioItems = (
  drs: DR[],
  validations: Validations,
  cluster?: string,
): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];
  const objectGVK = getGVKTypeString(gvkType.DestinationRule);
  const hasValidations = (vKey: string): ObjectValidation =>
    validations[objectGVK] && validations[objectGVK][vKey];

  drs.forEach(dr => {
    const vKey = validationKey(dr.metadata.name, dr.metadata.namespace);

    const item = {
      cluster: cluster,
      namespace: dr.metadata.namespace ?? '',
      kind: dr.kind,
      apiVersion: dr.apiVersion,
      name: dr.metadata.name,
      creationTimestamp: dr.metadata.creationTimestamp,
      resource: dr,
      resourceVersion: dr.metadata.resourceVersion,
      validation: hasValidations(vKey)
        ? validations[objectGVK][vKey]
        : undefined,
    };

    istioItems.push(item);
  });

  return istioItems;
};

export const gwToIstioItems = (
  gws: GW[],
  vss: VS[],
  validations: Validations,
  cluster?: string,
): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];
  const objectGVK = getGVKTypeString(gvkType.Gateway);
  const hasValidations = (vKey: string): ObjectValidation =>
    validations[objectGVK] && validations[objectGVK][vKey];
  const vsGateways = new Set();

  vss.forEach(vs => {
    vs.spec.gateways?.forEach(vsGatewayName => {
      if (vsGatewayName.indexOf('/') < 0) {
        vsGateways.add(`${vs.metadata.namespace}/${vsGatewayName}`);
      } else {
        vsGateways.add(vsGatewayName);
      }
    });
  });

  gws.forEach(gw => {
    if (vsGateways.has(`${gw.metadata.namespace}/${gw.metadata.name}`)) {
      const vKey = validationKey(gw.metadata.name, gw.metadata.namespace);

      const item = {
        cluster: cluster,
        namespace: gw.metadata.namespace ?? '',
        kind: gw.kind,
        apiVersion: gw.apiVersion,
        name: gw.metadata.name,
        creationTimestamp: gw.metadata.creationTimestamp,
        resource: gw,
        resourceVersion: gw.metadata.resourceVersion,
        validation: hasValidations(vKey)
          ? validations[objectGVK][vKey]
          : undefined,
      };

      istioItems.push(item);
    }
  });

  return istioItems;
};

export const k8sGwToIstioItems = (
  gws: K8sGW[],
  k8srs: K8sHTTPR[],
  k8sgrpcrs: K8sGRPCR[],
  validations: Validations,
  cluster?: string,
  gatewayLabel?: string,
): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];
  const objectGVK = getGVKTypeString(gvkType.K8sGateway);
  const hasValidations = (vKey: string): ObjectValidation =>
    validations[objectGVK] && validations[objectGVK][vKey];
  const k8sGateways = new Set();

  k8srs.forEach(k8sr => {
    k8sr.spec.parentRefs?.forEach(parentRef => {
      if (!parentRef.namespace) {
        k8sGateways.add(`${k8sr.metadata.namespace}/${parentRef.name}`);
      } else {
        k8sGateways.add(`${parentRef.namespace}/${parentRef.name}`);
      }
    });
  });

  k8sgrpcrs.forEach(k8sr => {
    k8sr.spec.parentRefs?.forEach(parentRef => {
      if (!parentRef.namespace) {
        k8sGateways.add(`${k8sr.metadata.namespace}/${parentRef.name}`);
      } else {
        k8sGateways.add(`${parentRef.namespace}/${parentRef.name}`);
      }
    });
  });

  gws.forEach(gw => {
    // K8s Gateways which are listed in HTTP or GRPC Routes
    // OR those K8 Gateways which name equals to service's gatewayLabel
    if (
      k8sGateways.has(`${gw.metadata.namespace}/${gw.metadata.name}`) ||
      gatewayLabel === gw.metadata.name
    ) {
      const vKey = validationKey(gw.metadata.name, gw.metadata.namespace);

      const item = {
        cluster: cluster,
        namespace: gw.metadata.namespace ?? '',
        kind: gw.kind,
        apiVersion: gw.apiVersion,
        name: gw.metadata.name,
        creationTimestamp: gw.metadata.creationTimestamp,
        resource: gw,
        resourceVersion: gw.metadata.resourceVersion,
        validation: hasValidations(vKey)
          ? validations[objectGVK][vKey]
          : undefined,
      };

      istioItems.push(item);
    }
  });

  return istioItems;
};

export const seToIstioItems = (
  see: SE[],
  validations: Validations,
  cluster?: string,
): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];
  const objectGVK = getGVKTypeString(gvkType.ServiceEntry);
  const hasValidations = (vKey: string): ObjectValidation =>
    validations[objectGVK] && validations[objectGVK][vKey];

  see.forEach(se => {
    const vKey = validationKey(se.metadata.name, se.metadata.namespace);

    const item = {
      cluster: cluster,
      namespace: se.metadata.namespace ?? '',
      kind: se.kind,
      apiVersion: se.apiVersion,
      name: se.metadata.name,
      creationTimestamp: se.metadata.creationTimestamp,
      resource: se,
      resourceVersion: se.metadata.resourceVersion,
      validation: hasValidations(vKey)
        ? validations[objectGVK][vKey]
        : undefined,
    };

    istioItems.push(item);
  });

  return istioItems;
};

export const k8sHTTPRouteToIstioItems = (
  routes: K8sHTTPR[],
  validations: Validations,
  cluster?: string,
): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];
  const objectGVK = getGVKTypeString(gvkType.K8sHTTPRoute);
  const hasValidations = (vKey: string): ObjectValidation =>
    validations[objectGVK] && validations[objectGVK][vKey];

  routes.forEach(route => {
    const vKey = validationKey(route.metadata.name, route.metadata.namespace);

    const item = {
      cluster: cluster,
      namespace: route.metadata.namespace ?? '',
      kind: route.kind,
      apiVersion: route.apiVersion,
      name: route.metadata.name,
      creationTimestamp: route.metadata.creationTimestamp,
      resource: route,
      resourceVersion: route.metadata.resourceVersion,
      validation: hasValidations(vKey)
        ? validations[objectGVK][vKey]
        : undefined,
    };

    istioItems.push(item);
  });

  return istioItems;
};

export const k8sGRPCRouteToIstioItems = (
  grpcRoutes: K8sGRPCR[],
  validations: Validations,
  cluster?: string,
): IstioConfigItem[] => {
  const istioItems: IstioConfigItem[] = [];
  const objectGVK = getGVKTypeString(gvkType.K8sGRPCRoute);
  const hasValidations = (vKey: string): ObjectValidation =>
    validations[objectGVK] && validations[objectGVK][vKey];

  grpcRoutes.forEach(route => {
    const vKey = validationKey(route.metadata.name, route.metadata.namespace);

    const item = {
      cluster: cluster,
      namespace: route.metadata.namespace ?? '',
      kind: route.kind,
      apiVersion: route.apiVersion,
      name: route.metadata.name,
      creationTimestamp: route.metadata.creationTimestamp,
      resource: route,
      resourceVersion: route.metadata.resourceVersion,
      validation: hasValidations(vKey)
        ? validations[objectGVK][vKey]
        : undefined,
    };

    istioItems.push(item);
  });

  return istioItems;
};
