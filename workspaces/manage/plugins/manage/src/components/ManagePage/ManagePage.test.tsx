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

import React from 'react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import {
  catalogApiRef,
  StarredEntitiesApi,
  starredEntitiesApiRef,
} from '@backstage/plugin-catalog-react';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { Observable } from '@backstage/types';

import {
  ManageApi,
  manageApiRef,
} from '@backstage-community/plugin-manage-react';

import { ManagePageImpl } from './ManagePage';
import { ManageTabsImpl } from '../ManageTabs';
import { mockCatalogApi } from '../../../test/catalog';

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

describe('ManagePage', () => {
  it('should render an empty page if nothing owned', async () => {
    const mockApi: ManageApi = {
      getProviders: () => [],
      kindOrder: [],
    };

    const apis = [
      [manageApiRef, mockApi],
      [catalogApiRef, mockCatalogApi({ empty: true })],
      [starredEntitiesApiRef, starredEntities],
    ] as const;

    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <ManagePageImpl subtitle="Things you own">
          <ManageTabsImpl />
        </ManagePageImpl>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog': catalogPlugin.routes.catalogIndex,
          '/catalog/:kind/:namespace/:name': catalogPlugin.routes.catalogEntity,
        },
      },
    );

    expect(getByText('Manage')?.tagName).toBe('H1');
    expect(getByText('Things you own')).toBeDefined();
    expect(
      getByText("You and your team(s) don't own any entities"),
    ).toBeDefined();
  });

  it('should render a table of owned entities', async () => {
    const mockApi: ManageApi = {
      getProviders: () => [],
      kindOrder: [],
    };

    const apis = [
      [manageApiRef, mockApi],
      [catalogApiRef, mockCatalogApi()],
      [starredEntitiesApiRef, starredEntities],
    ] as const;

    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <ManagePageImpl subtitle="Things you own">
          <ManageTabsImpl />
        </ManagePageImpl>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/catalog': catalogPlugin.routes.catalogIndex,
          '/catalog/:kind/:namespace/:name': catalogPlugin.routes.catalogEntity,
        },
      },
    );

    expect(getByText('Manage')?.tagName).toBe('H1');
    expect(getByText('Things you own')).toBeDefined();
    expect(getByText('The Foo')).toBeDefined();
  });
});
