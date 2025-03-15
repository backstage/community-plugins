/*
 * Copyright 2022 The Backstage Authors
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
import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  cicdStatisticsPlugin,
  EntityCicdStatisticsContent,
} from '../src/plugin';

import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityLayout,
} from '@backstage/plugin-catalog';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';

import {
  cicdStatisticsApiRef,
  FilterBranchType,
  FilterStatusType,
} from '../src';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

createDevApp()
  // We need the catalog plugin to get the example entities and make the front entity page functional
  .registerPlugin(catalogPlugin)
  .addPage({
    path: '/catalog',
    title: 'Catalog',
    element: <CatalogIndexPage />,
  })

  // We need one entity page tab to see the CICD statistics
  .addPage({
    path: '/catalog/:namespace/:kind/:name',
    element: <CatalogEntityPage />,
    children: (
      <EntityLayout>
        <EntityLayout.Route path="/" title="Overview">
          <EntityCicdStatisticsContent />
        </EntityLayout.Route>
      </EntityLayout>
    ),
  })
  .addPage({
    element: <EntityCicdStatisticsContent />,
    title: 'CICD Charts',
  })
  .registerPlugin(cicdStatisticsPlugin)
  .registerApi(
    catalogApiMock.factory({
      entities: [
        {
          apiVersion: 'backstage.io/v1alpha1',
          kind: 'Component',
          metadata: {
            name: 'software-template',
            namespace: 'default',
            description: 'A template for creating a new software component',
            annotations: {
              'backstage.io/techdocs-ref': 'software-template',
              'backstage.io/managed-by-location':
                'https://github.com/backstage/backstage',
            },
            spec: {
              type: 'service',
              owner: 'guest',
              lifecycle: 'experimental',
            },
          },
        },
      ],
    }),
  )
  .registerApi({
    api: cicdStatisticsApiRef,
    deps: { catalogApiMock: catalogApiRef },
    factory: () => ({
      getConfiguration: async () => {
        return {
          availableStatuses: ['failed', 'succeeded'] as FilterStatusType[],
        };
      },
      fetchBuilds: async () => {
        return {
          builds: [
            {
              id: '1',
              status: 'succeeded' as FilterStatusType,
              timestamp: '2022-01-01T00:00:00Z',
              branchType: 'master' as FilterBranchType,
              duration: 1000,
              requestedAt: new Date('2022-01-01T00:00:00Z'),
              stages: [
                {
                  duration: 1000,
                  status: 'succeeded' as FilterStatusType,
                  name: 'build',
                },
              ],
            },
            {
              id: '2',
              status: 'failed' as FilterStatusType,
              timestamp: '2022-01-02T00:00:00Z',
              branchType: 'master' as FilterBranchType,
              duration: 1000,
              requestedAt: new Date('2022-01-02T00:00:00Z'),
              stages: [
                {
                  duration: 1000,
                  status: 'failed' as FilterStatusType,
                  name: 'build',
                },
              ],
            },
          ],
        };
      },
    }),
  })
  .render();
