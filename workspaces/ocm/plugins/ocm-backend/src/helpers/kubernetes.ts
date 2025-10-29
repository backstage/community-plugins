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
import { LoggerService } from '@backstage/backend-plugin-api';

import type {
  CustomObjectsApi,
  KubernetesListObject,
} from '@kubernetes/client-node';

import { ManagedCluster, ManagedClusterInfo, OcmConfig } from '../types';

export const hubApiClient = async (
  clusterConfig: OcmConfig,
  logger: LoggerService,
): Promise<CustomObjectsApi> => {
  const { KubeConfig, CustomObjectsApi } = await import(
    '@kubernetes/client-node'
  );
  const kubeConfig = new KubeConfig();

  if (!clusterConfig.serviceAccountToken) {
    logger.info('Using default kubernetes config');
    kubeConfig.loadFromDefault();
    return kubeConfig.makeApiClient(CustomObjectsApi);
  }

  logger.info('Loading kubernetes config from config file');

  const user = {
    name: 'backstage',
    token: clusterConfig.serviceAccountToken,
  };

  const context = {
    name: clusterConfig.hubResourceName,
    user: user.name,
    cluster: clusterConfig.hubResourceName,
  };

  kubeConfig.loadFromOptions({
    clusters: [
      {
        server: clusterConfig.url,
        name: clusterConfig.hubResourceName,
        skipTLSVerify: clusterConfig.skipTLSVerify,
        caData: clusterConfig.caData,
      },
    ],
    users: [user],
    contexts: [context],
    currentContext: context.name,
  });
  return kubeConfig.makeApiClient(CustomObjectsApi);
};

const kubeApiResponseHandler = <T>(call: Promise<T>) => {
  return call.catch(e => {
    // r.body should be string or blob binary
    if ('body' in e && typeof e.body === 'string') {
      let body;
      try {
        body = JSON.parse(e.body);
      } catch (error) {
        /* eslint-disable-line no-empty */
      }
      if (body) {
        throw Object.assign(new Error(body.reason), {
          // Name and statusCode are required by the backstage error handler
          statusCode: body.code,
          name: body.reason,
          ...body,
        });
      }
    }

    throw Object.assign(new Error(e.message), {
      // If there is no body, default to 500
      statusCode: 500,
      name: e.message,
    });
  });
};

export const getManagedCluster = (api: CustomObjectsApi, name: string) => {
  return kubeApiResponseHandler<ManagedCluster>(
    api.getClusterCustomObject({
      plural: 'managedclusters',
      version: 'v1',
      group: 'cluster.open-cluster-management.io',
      name,
    }),
  );
};

export const listManagedClusters = (api: CustomObjectsApi) => {
  return kubeApiResponseHandler<KubernetesListObject<ManagedCluster>>(
    api.listClusterCustomObject({
      group: 'cluster.open-cluster-management.io',
      version: 'v1',
      plural: 'managedclusters',
    }),
  );
};

export const getManagedClusterInfo = (api: CustomObjectsApi, name: string) => {
  return kubeApiResponseHandler<ManagedClusterInfo>(
    api.getNamespacedCustomObject({
      group: 'internal.open-cluster-management.io',
      version: 'v1beta1',
      name,
      namespace: name,
      plural: 'managedclusterinfos',
    }),
  );
};

export const listManagedClusterInfos = (api: CustomObjectsApi) => {
  return kubeApiResponseHandler<KubernetesListObject<ManagedClusterInfo>>(
    api.listClusterCustomObject({
      group: 'internal.open-cluster-management.io',
      version: 'v1beta1',
      plural: 'managedclusterinfos',
    }),
  );
};
