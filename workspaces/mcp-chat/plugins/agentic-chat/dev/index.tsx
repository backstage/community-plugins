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
import { createDevApp } from '@backstage/dev-utils';
import { OAuth2 } from '@backstage/core-app-api';
import {
  createApiFactory,
  createApiRef,
  discoveryApiRef,
  oauthRequestApiRef,
} from '@backstage/core-plugin-api';
import type {
  OAuthApi,
  OpenIdConnectApi,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
} from '@backstage/core-plugin-api';
import { agenticChatPlugin, AgenticChatPage } from '../src/plugin';

const oidcAuthApiRef = createApiRef<
  OAuthApi &
    OpenIdConnectApi &
    ProfileInfoApi &
    BackstageIdentityApi &
    SessionApi
>({
  id: 'internal.auth.oidc',
});

createDevApp()
  .registerApi(
    createApiFactory({
      api: oidcAuthApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        oauthRequestApi: oauthRequestApiRef,
      },
      factory: ({ discoveryApi, oauthRequestApi }) =>
        OAuth2.create({
          discoveryApi,
          oauthRequestApi,
          provider: { id: 'oidc', title: 'Keycloak', icon: () => null },
        }),
    }),
  )
  .addSignInProvider({
    id: 'oidc',
    title: 'Keycloak',
    message: 'Sign in with Keycloak SSO',
    apiRef: oidcAuthApiRef,
  })
  .registerPlugin(agenticChatPlugin)
  .addPage({
    element: <AgenticChatPage />,
    title: 'Agentic Chat',
    path: '/agentic-chat',
  })
  .render();
