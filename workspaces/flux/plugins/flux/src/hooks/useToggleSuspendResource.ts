/*
 * Copyright 2025 The Backstage Authors
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
import { AlertApi, alertApiRef, useApi } from '@backstage/core-plugin-api';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { CustomResourceMatcher } from '@backstage/plugin-kubernetes-common';
import useAsyncFn from 'react-use/esm/useAsyncFn';
import { gvkFromKind } from '../objects';
import { Deployment, Source } from '../components/helpers';

export const pathForResource = (
  name: string,
  namespace: string,
  gvk: CustomResourceMatcher,
): string => {
  const basePath = [
    '/apis',
    gvk.group,
    gvk.apiVersion,
    'namespaces',
    namespace,
    gvk.plural,
    name,
  ].join('/');

  return basePath;
};

export function toggleSuspendRequest(
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  suspend: boolean,
) {
  return {
    clusterName,
    path: pathForResource(name, namespace, gvk),
    init: {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify({
        spec: {
          suspend,
        },
      }),
    },
  };
}

export function getRequest(
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
) {
  return {
    clusterName,
    path: pathForResource(name, namespace, gvk),
  };
}

export async function requestToggleSuspendResource(
  kubernetesApi: KubernetesApi,
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  suspend: boolean,
) {
  const res = await kubernetesApi.proxy(
    toggleSuspendRequest(name, namespace, clusterName, gvk, suspend),
  );
  const key = suspend ? 'Suspend' : 'Resume';
  if (!res.ok) {
    throw new Error(
      `Failed to ${key} resource: ${res.status} ${res.statusText}`,
    );
  }
}

export async function toggleSuspendResource(
  resource: Source | Deployment,
  kubernetesApi: KubernetesApi,
  alertApi: AlertApi,
  suspend: boolean,
) {
  const key = suspend ? 'Suspend' : 'Resume';
  try {
    const gvk = gvkFromKind(resource.type);
    if (!gvk) {
      throw new Error(`Unknown resource type: ${resource.type}`);
    }

    await requestToggleSuspendResource(
      kubernetesApi,
      resource.name,
      resource.namespace,
      resource.clusterName,
      gvk,
      suspend,
    );

    alertApi.post({
      message: `${key} request successful`,
      severity: 'success',
      display: 'transient',
    });
  } catch (e: any) {
    alertApi.post({
      message: `${key} error: ${(e && e.message) || e}`,
      severity: 'error',
      display: 'transient',
    });
  }
}

/**
 *
 * @public
 */
export function useToggleSuspendResource(
  resource: Source | Deployment,
  suspend: boolean,
) {
  const kubernetesApi = useApi(kubernetesApiRef);
  const alertApi = useApi(alertApiRef);

  const [{ loading }, toggleSuspend] = useAsyncFn(
    () => toggleSuspendResource(resource, kubernetesApi, alertApi, suspend),
    [resource, kubernetesApi, alert],
  );

  return { loading, toggleSuspend };
}
