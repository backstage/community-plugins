/*
 * Copyright 2023 The Backstage Authors
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
import {
  ApiBlueprint,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { SearchResultListItemBlueprint } from '@backstage/plugin-search-react/alpha';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  AdrDocument,
  isAdrAvailable,
} from '@backstage-community/plugin-adr-common';
import { rootRouteRef } from './routes';
import { adrApiRef, AdrClient } from './api';

export * from './translations';

function isAdrDocument(result: any): result is AdrDocument {
  return result.entityRef;
}

/** @alpha */
export const adrSearchResultListItemExtension =
  SearchResultListItemBlueprint.makeWithOverrides({
    config: {
      schema: {
        lineClamp: z => z.number().default(5),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        predicate: result => result.type === 'adr',
        component: async () => {
          const { AdrSearchResultListItem } = await import(
            './search/AdrSearchResultListItem'
          );
          return ({ result, ...rest }) =>
            compatWrapper(
              isAdrDocument(result) ? (
                <AdrSearchResultListItem
                  {...rest}
                  {...config}
                  result={result}
                />
              ) : null,
            );
        },
      });
    },
  });

/** @alpha */
export const adrEntityContentExtension = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    defaultPath: '/adrs',
    defaultTitle: 'ADRs',
    filter: isAdrAvailable,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: async () => {
      const { EntityAdrContent } = await import(
        './components/EntityAdrContent'
      );
      return <EntityAdrContent />;
    },
  },
});

/** @alpha */
export const adrApiExtension = ApiBlueprint.make({
  name: 'adr-api',
  params: {
    factory: createApiFactory({
      api: adrApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory({ discoveryApi, fetchApi }) {
        return new AdrClient({ discoveryApi, fetchApi });
      },
    }),
  },
});

/** @alpha */
export default createFrontendPlugin({
  id: 'adr',
  extensions: [
    adrSearchResultListItemExtension,
    adrEntityContentExtension,
    adrApiExtension,
  ],
});
