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
import React from 'react';
import { Route } from 'react-router-dom';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { SearchPage } from '@backstage/plugin-search';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core-components';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import {
  AnnouncementsPage,
  AnnouncementsAdminPortal,
} from '@backstage-community/plugin-announcements';
import { Home } from './components/home/HomePage';
import { SignalsDisplay } from '@backstage/plugin-signals';

const app = createApp({
  apis,
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
  },
  components: {
    SignInPage: props => <SignInPage {...props} auto providers={['guest']} />,
  },
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Home />} />

    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>

    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />} />

    {/* announcements route */}
    <Route path="/announcements" element={<AnnouncementsPage />} />

    {/* announcement admin route */}
    <Route path="/announcements/admin" element={<AnnouncementsAdminPortal />} />
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <SignalsDisplay />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);
