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
import { createDevApp } from '@backstage/dev-utils';
import {
  cicdStatisticsPlugin,
  EntityCicdStatisticsContent,
} from '@backstage-community/plugin-cicd-statistics';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityLayout,
} from '@backstage/plugin-catalog';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';

import { cicdStatisticsApiRef } from '@backstage-community/plugin-cicd-statistics';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { CicdStatisticsApiGithub } from '../src/api';
import { configApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';

createDevApp()
  // We need the catalog plugin to get the example entities and make the front entity page functional
  .registerPlugin(catalogPlugin)
  .addPage({
    path: '/catalog',
    title: 'Catalog',
    element: <CatalogIndexPage />,
  })

  // We need the entity page experience to see the linguist card
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
                'url:https://github.com/backstage/backstage',
              'github.com/project-slug': 'backstage/backstage',
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
    api: githubAuthApiRef,
    deps: {},
    factory: () => {
      return {
        getAccessToken: async () => {
          // This nonsense is only here to make been able to locally test this plugin without having to setup a backend app
          return 'THIS_IS_ONLY_FOR_TESTING_LOCALLY_PLEASE_DO_NOT_NEVER_USE_THIS_IN_PRODUCTION';
        },
      } as typeof githubAuthApiRef.T;
    },
  })
  .registerApi({
    api: cicdStatisticsApiRef,
    deps: {
      catalogApiMock: catalogApiRef,
      githubAuthApi: githubAuthApiRef,
      configApi: configApiRef,
    },
    factory: ({ githubAuthApi, configApi }) => {
      return new CicdStatisticsApiGithub(githubAuthApi, configApi, {});
    },
  })
  .render();
