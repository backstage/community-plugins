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
import { useApi } from '@backstage/core-plugin-api';
import { KubernetesApi, kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { FluxController, FluxControllerEnriched, Namespace } from '../objects';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

export const NAMESPACES_PATH = `/api/v1/namespaces?labelSelector=app.kubernetes.io%2Fpart-of%3Dflux&limit=500`;
export const getDeploymentsPath = (ns: string) =>
  `/apis/apps/v1/namespaces/${ns}/deployments?labelSelector=app.kubernetes.io%2Fpart-of%3Dflux&limit=500`;

export async function getDeploymentsList(kubernetesApi: KubernetesApi) {
  const clusters = await kubernetesApi?.getClusters();

  const namespacesListsProxyData = await Promise.all(
    clusters?.map(async cluster => {
      return {
        clusterName: cluster.name,
        proxy: await kubernetesApi.proxy({
          clusterName: cluster.name,
          path: NAMESPACES_PATH,
        }),
      };
    }),
  );

  const namespacesLists = async () => {
    let nsLists: { clusterName: string; namespaces: Namespace[] }[] = [];
    for (const namespacesList of namespacesListsProxyData) {
      const { clusterName } = namespacesList;
      const namespaces = await namespacesList.proxy.json();
      nsLists = [...nsLists, { clusterName, namespaces: namespaces.items }];
    }
    return _.uniqWith(nsLists, _.isEqual);
  };

  const namespacesList = await namespacesLists();

  const deploymentsListsProxyData = await Promise.all(
    namespacesList?.flatMap(nsList =>
      nsList.namespaces.map(async ns => {
        return {
          clusterName: nsList.clusterName,
          proxy: await kubernetesApi.proxy({
            clusterName: nsList.clusterName,
            path: getDeploymentsPath(ns.metadata.name),
          }),
        };
      }),
    ),
  );

  const deploymentsLists = async () => {
    let items: FluxControllerEnriched[] = [];
    for (const item of deploymentsListsProxyData) {
      const { clusterName } = item;
      const i = await item.proxy.json();
      items = [
        ...items,
        ...i.items.map((fc: FluxController) => {
          return { ...fc, clusterName };
        }),
      ];
    }
    return _.uniqWith(items, _.isEqual);
  };

  return await deploymentsLists();
}

/**
 *
 * @public
 */
export function useGetDeployments() {
  const kubernetesApi = useApi(kubernetesApiRef);

  const { isLoading, data, error } = useQuery<FluxControllerEnriched[], Error>({
    queryKey: ['deployments'],
    queryFn: () => getDeploymentsList(kubernetesApi),
  });

  return { isLoading, data, error };
}
