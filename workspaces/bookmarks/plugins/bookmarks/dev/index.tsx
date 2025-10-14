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

import { createDevApp } from '@backstage/dev-utils';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityLayout,
} from '@backstage/plugin-catalog';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { StrictMode } from 'react';
import { bookmarksTranslations, isBookmarksAvailable } from '../src';
import { EntityBookmarksContent } from '../src/components/EntityBookmarksContent/EntityBookmarksContent';
import { bookmarksPlugin } from '../src/plugin';
import { AVAILABLE_LANGUAGES } from '../src/translations/translations';
import { testEntities, testEntity } from './testData';

import '@backstage/ui/css/styles.css';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';

const PluginTestPage = () => (
  <EntityLayout>
    <EntityLayout.Route
      path="/bookmarks"
      title="Bookmarks"
      if={isBookmarksAvailable}
    >
      <StrictMode>
        <EntityBookmarksContent />
      </StrictMode>
    </EntityLayout.Route>

    {/* to test empty state case */}
    <EntityLayout.Route
      path="/bookmarks"
      title="Bookmarks (not present)"
      if={e => !isBookmarksAvailable(e)}
    >
      <StrictMode>
        <EntityBookmarksContent />
      </StrictMode>
    </EntityLayout.Route>
  </EntityLayout>
);

createDevApp()
  .registerPlugin(catalogPlugin)
  .addPage({
    path: '/bookmarks',
    title: 'Bookmarks test page',
    element: (
      <EntityProvider entity={testEntity}>
        <PluginTestPage />
      </EntityProvider>
    ),
  })
  .addPage({
    path: '/catalog',
    title: 'Catalog',
    element: <CatalogIndexPage />,
  })
  .addPage({
    path: '/catalog/:namespace/:kind/:name',
    element: <CatalogEntityPage />,
    children: <PluginTestPage />,
  })
  .registerApi(
    catalogApiMock.factory({
      entities: testEntities,
    }),
  )
  .registerPlugin(bookmarksPlugin)
  .addTranslationResource(bookmarksTranslations)
  .setAvailableLanguages(AVAILABLE_LANGUAGES)
  .render();
