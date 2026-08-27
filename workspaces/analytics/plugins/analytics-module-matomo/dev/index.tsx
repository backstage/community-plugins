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

import ReactDOM from 'react-dom/client';

// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import { ConfigReader } from '@backstage/config';
import { createApp } from '@backstage/frontend-defaults';
import {
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';

import analyticsProviderMatomoPlugin from '../src';
import { Playground } from './Playground';

const playgroundPlugin = createFrontendPlugin({
  pluginId: 'analytics-matomo-playground',
  extensions: [
    PageBlueprint.make({
      params: {
        path: '/analytics-module-matomo',
        loader: async () => <Playground />,
      },
    }),
  ],
});

const defaultPage = '/analytics-module-matomo';

const app = createApp({
  features: [analyticsProviderMatomoPlugin, playgroundPlugin],
  advanced: {
    configLoader: async () => ({
      config: new ConfigReader({
        app: {
          title: 'Matomo Dev',
          baseUrl: 'http://localhost:3000',
          analytics: {
            matomo: {
              host: 'example.com',
              siteId: 2,
              identity: 'disabled',
            },
          },
        },
        backend: { baseUrl: 'http://localhost:7007' },
      }),
    }),
  },
});

if (typeof window !== 'undefined' && window.location.pathname === '/') {
  window.location.pathname = defaultPage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(app.createRoot());
