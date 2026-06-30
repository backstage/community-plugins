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

import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import {
  CatalogApi,
  catalogApiRef,
  StarredEntitiesApi,
  starredEntitiesApiRef,
} from '@backstage/plugin-catalog-react';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { Observable } from '@backstage/types';
import { RELATION_OWNED_BY } from '@backstage/catalog-model';

import {
  ManageApi,
  manageApiRef,
  ManageStaticConfig,
} from '@backstage-community/plugin-manage-react';

import { ManagePage } from './ManagePage';
import { ManagePageProviders } from './ManagePageProviders';
import { routeResolutionApiRef } from '@backstage/frontend-plugin-api';
import { rootRouteRef } from '../../routes';

const starredEntities: StarredEntitiesApi = {
  toggleStarred: async () => {},
  starredEntitie$: () =>
    ({
      subscribe: () => ({
        unsubscribe: () => {},
        closed: true,
      }),
    } as Observable<Set<string>>),
};

const mockCatalogApi: CatalogApi = {
  getEntitiesByRefs: async () => {
    return { items: [] };
  },
} satisfies Partial<CatalogApi> as any as CatalogApi;

const mockConfig: ManageStaticConfig = {
  kinds: ['Component', 'API', 'Template', 'Resource', 'Domain'],
  title: 'Manage',
  subtitle: 'Things you own',
  themeId: 'home',
  combined: false,
  showCombined: false,
  enableStarredEntities: false,
  showOrganizationChart: false,
  enableWholeOrganization: false,
  tabOrder: [],
  kindOrder: ['component'],
  widgetOrderCards: [],
  widgetOrderContentAbove: [],
  widgetOrderContentBelow: [],
  columnsOrder: [],
};

describe('ManagePage', () => {
  it('should render a table of owned entities', async () => {
    const mockApi: ManageApi = {
      getProviders: () => [],
      getOwnersAndEntities: async () => ({
        owners: {
          groups: [
            {
              kind: 'Group',
              metadata: { name: 'testgroup' },
              apiVersion: 'backstage.io/v1alpha1',
            },
          ],
          ownerEntityRefs: ['group:default/testgroup'],
          user: undefined,
        },
        ownedEntities: [
          {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'Component',
            metadata: { name: 'testcomponent' },
            relations: [
              {
                type: RELATION_OWNED_BY,
                targetRef: 'group:default/testgroup',
              },
            ],
          },
        ],
      }),
      kindOrder: [],
      progressStyle: 'circular',
    };

    const apis = [
      [manageApiRef, mockApi],
      [catalogApiRef, mockCatalogApi],
      [starredEntitiesApiRef, starredEntities],
      [routeResolutionApiRef, { resolve: () => () => '/manage' }],
    ] as const;

    const { getByText, findAllByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <ManagePageProviders
          combined={false}
          kinds={['component']}
          providers={[]}
          primeUserSettings={[]}
        >
          <ManagePage
            config={mockConfig}
            pluginNode={{
              spec: {
                id: 'manage',
                attachTo: { id: 'app', input: 'manage' },
                extension: null as any,
                disabled: false,
                plugin: {} as any,
              },
              edges: { attachments: new Map() },
            }}
            apis={{
              get(apiRef) {
                return apis.find(tuple => apiRef === tuple[0])?.[1] as any;
              },
            }}
            tabs={[
              {
                title: 'Test tab',
                path: 'test',
                children: <></>,
                fullHeight: false,
                condition: () => true,
                node: { spec: { id: 'test' } },
              } as any,
            ]}
            columns={[]}
            cardWidgets={[]}
            contentWidgets={[]}
            settings={[]}
            labelsElements={[]}
            showCombined={false}
          />
        </ManagePageProviders>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog': catalogPlugin.routes.catalogIndex,
          '/catalog/:kind/:namespace/:name': catalogPlugin.routes.catalogEntity,
          '/manage/:tab': rootRouteRef,
        },
        routeEntries: ['/', '/manage', '/manage/components'],
      },
    );

    expect(
      getByText('Manage — Things you own')?.parentElement?.className,
    ).toContain('PluginHeader');

    // Component found in the table
    expect(await findAllByText('testcomponent')).toBeDefined();

    // Test tab found in the tabs
    expect(getByText('Test tab')).toBeDefined();

    // Settings tab found in the tabs
    expect(getByText('Settings')).toBeDefined();
  });
});
