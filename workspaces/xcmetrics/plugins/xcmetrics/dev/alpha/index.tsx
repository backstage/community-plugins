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

import { createApp } from '@backstage/frontend-defaults';
import { mockApis } from '@backstage/frontend-test-utils';

import {
  PageBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';

import xcmetricsPlugin from '../../src/alpha';
import { xcmetricsApiRef } from '../../src/api';
import { XcmetricsLayout } from '../../src/components/XcmetricsLayout';

import { XcmetricsClient as mockXcmetricsClient } from '../../src/api/mocks/XcmetricsClient';

const devPagesPlugin = createFrontendPlugin({
  pluginId: 'xcmetrics-dev-pages',
  extensions: [
    PageBlueprint.make({
      name: 'embed-example',
      params: {
        path: '/xcmetrics-embed',
        loader: () =>
          import('@backstage/core-components').then(
            ({ Page, Header, Content }) => (
              <Page themeId="tool">
                <Header title="Embed Example" />
                <Content>
                  <XcmetricsLayout />
                </Content>
              </Page>
            ),
          ),
      },
    }),
  ],
});

const xcmetricsPluginOverrides = xcmetricsPlugin.withOverrides({
  extensions: [
    xcmetricsPlugin.getExtension('api:xcmetrics/xcmetrics-api').override({
      params: defineParams =>
        defineParams({
          api: xcmetricsApiRef,
          deps: {},
          factory: () => mockXcmetricsClient,
        }),
    }),
  ],
});

const app = createApp({
  features: [devPagesPlugin, xcmetricsPluginOverrides],
  advanced: {
    configLoader: async () => ({
      config: mockApis.config({
        data: {
          app: { title: 'XCMetrics Dev', baseUrl: 'http://localhost:3000' },
          backend: { baseUrl: 'http://localhost:7007' },
        },
      }),
    }),
  },
});

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
