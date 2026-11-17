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
import { createDevApp } from '@backstage/frontend-dev-utils';

import { mockApis } from '@backstage/frontend-test-utils';
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';

// eslint-disable-next-line @backstage/no-relative-monorepo-imports
import { allExamples } from '../../../examples';

import npmPlugin, { npmTranslationsModule } from '../src/alpha';

// Only needed so that the app doesn't call `/api/permission/authorize` call
const appOverrides = createFrontendModule({
  pluginId: 'app',
  extensions: [
    ApiBlueprint.make({
      name: 'permission',
      params: defineParams =>
        defineParams({
          api: permissionApiRef,
          deps: {},
          factory: () => mockApis.permission(),
        }),
    }),
  ],
});

const catalogPluginOverrides = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('api:catalog').override({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApiMock({ entities: allExamples }),
        }),
    }),
  ],
});

createDevApp({
  features: [
    appOverrides,
    catalogPluginOverrides,
    userSettingsPlugin,
    npmPlugin,
    npmTranslationsModule,
  ],
});
