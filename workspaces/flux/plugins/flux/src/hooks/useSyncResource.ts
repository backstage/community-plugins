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
import { ImagePolicy, gvkFromKind } from '../objects';
import { Deployment, Source } from '../components/helpers';

export const ReconcileRequestAnnotation = 'reconcile.fluxcd.io/requestedAt';

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

export function syncRequest(
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  now: string,
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
        metadata: {
          annotations: {
            [ReconcileRequestAnnotation]: now,
          },
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

export async function requestSyncResource(
  kubernetesApi: KubernetesApi,
  name: string,
  namespace: string,
  clusterName: string,
  gvk: CustomResourceMatcher,
  now: string,
  pollInterval: number = 2000,
) {
  const res = await kubernetesApi.proxy(
    syncRequest(name, namespace, clusterName, gvk, now),
  );
  if (!res.ok) {
    throw new Error(`Failed to sync resource: ${res.status} ${res.statusText}`);
  }

  for (let i = 0; i < 10; i++) {
    const pollResponse = await kubernetesApi.proxy(
      getRequest(name, namespace, clusterName, gvk),
    );
    if (!pollResponse.ok) {
      throw new Error('Failed to poll resource');
    }
    const helmReleaseResponse = await pollResponse.json();
    const lastHandledReconcileAt =
      helmReleaseResponse.status.lastHandledReconcileAt;
    if (lastHandledReconcileAt === now) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Timed out waiting for status to update');
}

export async function syncResource(
  resource: Source | Deployment | ImagePolicy,
  kubernetesApi: KubernetesApi,
  alertApi: AlertApi,
) {
  try {
    const gvk = gvkFromKind(resource.type);
    if (!gvk) {
      throw new Error(`Unknown resource type: ${resource.type}`);
    }

    if ('sourceRef' in resource && resource.sourceRef) {
      const sourceGVK = gvkFromKind(resource.sourceRef.kind);
      if (!sourceGVK) {
        throw new Error(
          `Unknown resource source type: ${resource.sourceRef.kind}`,
        );
      }
      // sync the source
      await requestSyncResource(
        kubernetesApi,
        resource.sourceRef.name!,
        resource.sourceRef.namespace || resource.namespace,
        resource.clusterName,
        sourceGVK,
        new Date().toISOString(),
      );
    }

    // sync the helm release
    await requestSyncResource(
      kubernetesApi,
      resource.name,
      resource.namespace,
      resource.clusterName,
      gvk,
      new Date().toISOString(),
    );

    alertApi.post({
      message: 'Sync request successful',
      severity: 'success',
      display: 'transient',
    });
  } catch (e: any) {
    alertApi.post({
      message: `Sync error: ${(e && e.message) || e}`,
      severity: 'error',
      display: 'transient',
    });
  }
}

/**
 *
 * @public
 */
export function useSyncResource(resource: Source | Deployment | ImagePolicy) {
  const kubernetesApi = useApi(kubernetesApiRef);
  const alertApi = useApi(alertApiRef);

  const [{ loading }, sync] = useAsyncFn(
    () => syncResource(resource, kubernetesApi, alertApi),
    [resource, kubernetesApi, alert],
  );

  return { sync, isSyncing: loading };
}
