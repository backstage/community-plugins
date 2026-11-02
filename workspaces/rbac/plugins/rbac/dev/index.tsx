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
 * New Frontend System dev mode for the RBAC plugin.
 */
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';
import { createApp } from '@backstage/frontend-defaults';
import ReactDOM from 'react-dom/client';

import { SignInPage } from '@backstage/core-components';
import { OAuth2 } from '@backstage/core-app-api';
import {
  ApiBlueprint,
  configApiRef,
  createApiFactory,
  createApiRef,
  createFrontendModule,
  discoveryApiRef,
  oauthRequestApiRef,
  type BackstageIdentityApi,
  type OAuthApi,
  type OpenIdConnectApi,
  type ProfileInfoApi,
  type SessionApi,
} from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';

import rbacPlugin, { rbacTranslationsModule } from '../src';
import { devSidebarContent } from './shared';

const oidcAuthApiRef = createApiRef<
  OAuthApi &
    OpenIdConnectApi &
    ProfileInfoApi &
    BackstageIdentityApi &
    SessionApi
>().with({ id: 'internal.auth.oidc' });

const devNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    devSidebarContent,

    ApiBlueprint.make({
      name: 'oidc-auth',
      params: defineParams =>
        defineParams(
          createApiFactory({
            api: oidcAuthApiRef,
            deps: {
              discoveryApi: discoveryApiRef,
              oauthRequestApi: oauthRequestApiRef,
              configApi: configApiRef,
            },
            factory: ({ discoveryApi, oauthRequestApi, configApi }) =>
              OAuth2.create({
                configApi,
                discoveryApi,
                oauthRequestApi,
                provider: { id: 'oidc', title: 'OIDC', icon: () => null },
              }),
          }),
        ),
    }),

    SignInPageBlueprint.make({
      params: {
        loader: async () => props => (
          <SignInPage
            {...props}
            providers={[
              'guest',
              {
                id: 'oidc',
                title: 'Keycloak OIDC',
                message: 'Sign in with Keycloak (multi-user testing)',
                apiRef: oidcAuthApiRef,
              },
            ]}
            title="Select a sign-in method"
            align="center"
          />
        ),
      },
    }),
  ],
});

const defaultPage = '/rbac';

const app = createApp({
  features: [rbacPlugin, rbacTranslationsModule, devNavModule],
});

const root = app.createRoot();

if (typeof window !== 'undefined' && window.location.pathname === '/') {
  window.location.pathname = defaultPage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(root);
