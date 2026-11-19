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
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';
import ReactDOM from 'react-dom/client';
import { createApp } from '@backstage/frontend-defaults';
import { ConfigReader } from '@backstage/config';
import { defaultConfigLoader } from '@backstage/core-app-api';
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import type { Entity } from '@backstage/catalog-model';
import mdxCardPlugin from '../src';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'example-service', namespace: 'default' },
  spec: { type: 'service', owner: 'team-a', lifecycle: 'production' },
};

const entityTemplate = `
## {props.entity.metadata.name}

Owned by <EntityRefLink entityRef={\`group:default/\${props.entity.spec.owner}\`} />.

<BarChart
  data={[
    { month: 'Jan', deploys: 10 },
    { month: 'Feb', deploys: 15 },
    { month: 'Mar', deploys: 20 },
  ]}
  xKey="month"
  yKeys={['deploys']}
/>
`;

const homeTemplate = `
Welcome, **{props.user.displayName}**.

<PieChart
  data={[
    { name: 'Services', value: 12 },
    { name: 'Websites', value: 5 },
    { name: 'Libraries', value: 8 },
  ]}
  donut
/>
`;

const devConfig = {
  backend: { baseUrl: 'http://localhost:7007' },
  app: {
    title: 'MDX Card Dev',
    extensions: [
      {
        'entity-card:mdx-card': {
          config: { title: 'MDX Card', template: entityTemplate },
        },
      },
      {
        'home-page-widget:mdx-card': {
          config: { title: 'MDX Card', template: homeTemplate },
        },
      },
      {
        'page:home': {
          config: {
            defaultConfig: [
              {
                component: 'home-page-widget:mdx-card',
                column: 0,
                row: 0,
                width: 6,
                height: 8,
              },
            ],
          },
        },
      },
    ],
  },
};

const catalogDevModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      name: 'catalog-mock',
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApiMock({ entities: [entity] }),
        }),
    }),
  ],
});

const app = createApp({
  features: [
    catalogPlugin,
    catalogDevModule,
    homePlugin,
    userSettingsPlugin,
    mdxCardPlugin,
  ],
  advanced: {
    configLoader: async () => ({
      config: ConfigReader.fromConfigs([
        ...(await defaultConfigLoader()),
        { context: 'dev', data: devConfig },
      ]),
    }),
  },
});

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(app.createRoot());
}
