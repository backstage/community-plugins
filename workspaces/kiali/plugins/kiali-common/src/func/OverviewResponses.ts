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
import { IstioConfigList, ValidationStatus } from '../types';

export type ValidationsByClusterAndNamespace = Map<
  string,
  Map<string, ValidationStatus>
>;

/**
 * Newer Kiali APIs return ValidationStatus[] with namespace/cluster fields.
 * Older APIs return a nested map keyed by cluster, then namespace, to ValidationStatus.
 */
export const normalizeConfigValidations = (
  response: unknown,
): ValidationsByClusterAndNamespace => {
  const validationsByClusterAndNamespace: ValidationsByClusterAndNamespace =
    new Map();

  if (Array.isArray(response)) {
    response.forEach((validation: ValidationStatus) => {
      if (!validation?.cluster || !validation?.namespace) {
        return;
      }
      if (!validationsByClusterAndNamespace.has(validation.cluster)) {
        validationsByClusterAndNamespace.set(validation.cluster, new Map());
      }
      validationsByClusterAndNamespace
        .get(validation.cluster)!
        .set(validation.namespace, validation);
    });
    return validationsByClusterAndNamespace;
  }

  if (response && typeof response === 'object') {
    Object.entries(response as Record<string, unknown>).forEach(
      ([clusterName, byNamespace]) => {
        if (!byNamespace || typeof byNamespace !== 'object') {
          return;
        }
        const namespaceMap = new Map<string, ValidationStatus>();
        Object.entries(byNamespace as Record<string, ValidationStatus>).forEach(
          ([namespaceName, validation]) => {
            namespaceMap.set(namespaceName, validation);
          },
        );
        validationsByClusterAndNamespace.set(clusterName, namespaceMap);
      },
    );
  }

  return validationsByClusterAndNamespace;
};

const emptyIstioConfigList = (): IstioConfigList => ({
  permissions: {},
  resources: {},
  validations: {},
});

/**
 * Newer APIs return IstioConfigList with resources keyed by GVK.
 * Older APIs returned a map keyed by namespace.
 */
export const groupIstioConfigByNamespace = (
  response: unknown,
): Map<string, IstioConfigList> => {
  const istioConfigPerNamespace = new Map<string, IstioConfigList>();

  if (!response || typeof response !== 'object') {
    return istioConfigPerNamespace;
  }

  const istioConfigResponse = response as IstioConfigList &
    Record<string, IstioConfigList>;

  if (istioConfigResponse.resources) {
    Object.entries(istioConfigResponse.resources).forEach(
      ([key, configListField]) => {
        if (!Array.isArray(configListField)) {
          return;
        }
        configListField.forEach(
          (istioObject: { metadata?: { namespace?: string } }) => {
            const nsName = istioObject?.metadata?.namespace;
            if (!nsName) {
              return;
            }
            if (!istioConfigPerNamespace.has(nsName)) {
              istioConfigPerNamespace.set(nsName, emptyIstioConfigList());
            }
            const nsConfig = istioConfigPerNamespace.get(nsName)!;
            if (!nsConfig.resources[key]) {
              nsConfig.resources[key] = [];
            }
            nsConfig.resources[key].push(istioObject);
          },
        );
      },
    );
    return istioConfigPerNamespace;
  }

  // Legacy namespace-keyed response
  Object.entries(istioConfigResponse).forEach(([nsName, nsConfig]) => {
    if (nsConfig && typeof nsConfig === 'object' && 'resources' in nsConfig) {
      istioConfigPerNamespace.set(nsName, nsConfig);
    }
  });

  return istioConfigPerNamespace;
};
