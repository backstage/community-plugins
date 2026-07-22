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
 * New Frontend System dev mode for the Topology plugin.
 */

import '@backstage/cli/asset-types';
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import ReactDOM from 'react-dom/client';
import { createApp } from '@backstage/frontend-defaults';
import { SignInPage } from '@backstage/core-components';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import {
  ApiBlueprint,
  createFrontendModule,
  pluginHeaderActionsApiRef,
} from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';

import {
  topologyCatalogModule,
  topologyTranslationsModule,
} from '../../src/alpha';
import { devSidebarContent } from './shared';

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      (
        <SignInPage
          {...props}
          title="Select a sign-in method"
          align="center"
          providers={[
            'guest',
            {
              id: 'github-auth-provider',
              title: 'GitHub',
              message: 'Sign in using GitHub',
              apiRef: githubAuthApiRef,
            },
          ]}
        />
      ),
  },
});

const devNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    devSidebarContent,
    signInPage,
    ApiBlueprint.make({
      name: 'plugin-header-actions',
      params: defineParams =>
        defineParams({
          api: pluginHeaderActionsApiRef,
          deps: {},
          factory: () => ({
            getPluginHeaderActions: () => [],
          }),
        }),
    }),
  ],
});

const app = createApp({
  features: [devNavModule, topologyCatalogModule, topologyTranslationsModule],
});

if (window.location.pathname === '/') {
  window.location.replace('/catalog');
}

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
