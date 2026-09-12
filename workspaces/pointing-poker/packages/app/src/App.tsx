/*
 * Copyright 2026 The Backstage Authors
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
import { Navigate, Route } from 'react-router-dom';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import {
  PointingPokerPage,
  pointingPokerPlugin,
} from '@backstage-community/plugin-pointing-poker';

const app = createApp({
  plugins: [catalogPlugin, pointingPokerPlugin],
});

const routes = (
  <FlatRoutes>
    <Navigate key="/" to="/pointing-poker" />
    <Route path="/pointing-poker" element={<PointingPokerPage />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    />
    <Route path="/settings" element={<UserSettingsPage />} />
  </FlatRoutes>
);

export default app.createRoot(<AppRouter>{routes}</AppRouter>);
