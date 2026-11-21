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

/**
 * Dev/e2e harness only: allow POST /api/catalog/locations with type "file"
 * so RHIDP-19025 can register large-catalog-org.yaml at runtime without
 * putting it in the default app-config (keeps the dropdown path for <100).
 */
import { createBackendModule } from '@backstage/backend-plugin-api';
import { catalogLocationsExtensionPoint } from '@backstage/plugin-catalog-node';

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'allow-file-locations',
  register(env) {
    env.registerInit({
      deps: { locations: catalogLocationsExtensionPoint },
      async init({ locations }) {
        locations.setAllowedLocationTypes(['url', 'file']);
      },
    });
  },
});
