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
import { InMemoryCatalogClient } from '@backstage/catalog-client/testUtils';
import { Content } from '@backstage/core-components';
import { createDevApp } from '@backstage/frontend-dev-utils';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { mockApis } from '@backstage/frontend-test-utils';
import appPlugin from '@backstage/plugin-app';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import { CustomHomepageGrid } from '@backstage/plugin-home';
import {
  HomePageLayoutBlueprint,
  type HomePageLayoutProps,
} from '@backstage/plugin-home-react/alpha';
import type { ScaffolderApi } from '@backstage/plugin-scaffolder-common';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { Fragment } from 'react';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import { scaffolderApiRef } from '@backstage/plugin-scaffolder-react';
import plugin from '../src';
import { templateFixtures } from './fixtures';

const mockCatalogPlugin = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('api:catalog').override({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () =>
            new InMemoryCatalogClient({ entities: templateFixtures }),
        }),
    }),
  ],
});

const mockAppPlugin = appPlugin.withOverrides({
  extensions: [
    appPlugin.getExtension('sign-in-page:app').override({ disabled: true }),
    appPlugin.getExtension('api:app/permission').override({
      params: defineParams =>
        defineParams({
          api: permissionApiRef,
          deps: {},
          factory: () => mockApis.permission(),
        }),
    }),
  ],
});

const mockScaffolderPlugin = scaffolderPlugin.withOverrides({
  extensions: [
    scaffolderPlugin.getExtension('api:scaffolder').override({
      params: defineParams =>
        defineParams({
          api: scaffolderApiRef,
          deps: {},
          factory: () =>
            ({
              getTemplateParameterSchema: async () => ({
                title: 'Template',
                steps: [],
              }),
            } as Partial<ScaffolderApi> as ScaffolderApi),
        }),
    }),
  ],
});

const homePluginDefaultLayoutModule = createFrontendModule({
  pluginId: 'home',
  extensions: [
    HomePageLayoutBlueprint.make({
      params: {
        loader: async () =>
          function DefaultLayout({ widgets }: HomePageLayoutProps) {
            return (
              <Content>
                <CustomHomepageGrid
                  config={[
                    {
                      component: 'HomePageFeaturedTemplates',
                      x: 0,
                      y: 0,
                      width: 6,
                      height: 6,
                    },
                  ]}
                >
                  {widgets.map((widget, index) => (
                    <Fragment key={widget.name ?? index}>
                      {widget.component}
                    </Fragment>
                  ))}
                </CustomHomepageGrid>
              </Content>
            );
          },
      },
    }),
  ],
});

createDevApp({
  features: [
    homePlugin,
    homePluginDefaultLayoutModule,
    mockAppPlugin,
    mockScaffolderPlugin,
    mockCatalogPlugin,
    plugin,
  ],
});
