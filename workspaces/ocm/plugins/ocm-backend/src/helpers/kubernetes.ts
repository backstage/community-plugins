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

import {
  CustomObjectsApi,
  KubeConfig,
  KubernetesListObject,
} from '@kubernetes/client-node';

import { ManagedCluster, ManagedClusterInfo, OcmConfig } from '../types';

export const hubApiClient = (
  clusterConfig: OcmConfig,
  logger: LoggerService,
): CustomObjectsApi => {
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
  return call
    .then(r => {
      return r;
    })
    .catch(r => {
      if (r.body) {
        if (typeof r.body === 'object') {
          throw Object.assign(new Error(r.body.reason), {
            // Name and statusCode are required by the backstage error handler
            statusCode: r.body.code || r.statusCode,
            name: r.body.reason,
            ...r.body,
          });
        }
        if (typeof r.body === 'string') {
          const body = JSON.parse(r.body);
          throw Object.assign(new Error(), {
            name: body.reason,
            message: body.message,
            statusCode: body.code,
            kind: body.kind,
            apiVersion: body.apiVersion,
            metadata: body.metadata,
            status: body.status,
            reason: body.reason,
            details: body.details,
            code: body.code,
          });
        }
      }
      throw Object.assign(new Error(r.message), {
        // If there is no body, there is no status code, default to 500
        statusCode: 500,
        name: r.message,
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
