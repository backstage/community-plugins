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
import type { JSX } from 'react';

import { Entity } from '@backstage/catalog-model';
import { createApiFactory } from '@backstage/core-plugin-api';
import { createDevApp } from '@backstage/dev-utils';
import { CatalogEntityPage } from '@backstage/plugin-catalog';
import {
  CatalogApi,
  catalogApiRef,
  EntityProvider,
} from '@backstage/plugin-catalog-react';
import { SearchApi, searchApiRef } from '@backstage/plugin-search-react';

import { Grid } from '@material-ui/core';

import {
  ClusterAvailableResourceCard,
  ClusterContextProvider,
  ClusterInfoCard,
} from '../src';
import { OcmIcon, OcmPage, ocmPlugin } from '../src/plugin';

const clusterEntity = (name: string): Entity => ({
  apiVersion: 'backstage.io/v1beta1',
  kind: 'Resource',
  spec: { owner: 'unknown', type: 'kubernetes-cluster' },
  metadata: {
    name,
    namespace: 'default',
    annotations: {
      'backstage-community.io/ocm-provider-id': 'hub',
    },
  },
});

const clusterEntityPage = (name: string): JSX.Element => (
  <EntityProvider entity={clusterEntity(name)}>
    <ClusterContextProvider>
      <Grid container direction="column" xs={6}>
        <Grid item>
          <ClusterInfoCard />
        </Grid>
        <Grid item>
          <ClusterAvailableResourceCard />
        </Grid>
      </Grid>
    </ClusterContextProvider>
  </EntityProvider>
);

const clusters = [
  clusterEntity('foo'),
  clusterEntity('cluster1'),
  clusterEntity('offline-cluster'),
];

createDevApp()
  .registerApi({
    api: catalogApiRef,
    deps: {},
    factory: () =>
      ({
        async getEntities() {
          return {
            items: clusters,
          };
        },
        async getEntityByRef(ref: string) {
          return clusters.find(e => e.metadata.name === ref);
        },
      } as CatalogApi),
  })
  .registerApi(
    createApiFactory({
      api: searchApiRef,
      deps: {},
      factory: () =>
        ({
          async query() {
            return new Promise(() => {});
          },
        } as SearchApi),
    }),
  )
  .registerPlugin(ocmPlugin)
  .addPage({
    element: <OcmPage />,
    title: 'Clusters',
    path: '/ocm',
    icon: OcmIcon,
  })
  .addPage({
    path: '/catalog/:kind/:namespace/:name',
    element: <CatalogEntityPage />,
  })
  .addPage({
    path: '/catalog/resource/default/foo',
    element: clusterEntityPage('foo'),
  })
  .addPage({
    path: '/catalog/resource/default/cluster1',
    element: clusterEntityPage('cluster1'),
  })
  .addPage({
    path: '/catalog/resource/default/offline-cluster',
    element: clusterEntityPage('offline-cluster'),
  })
  .render();
