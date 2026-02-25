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
import { OAuth2 } from '@backstage/core-app-api';
import {
  configApiRef,
  createApiRef,
  discoveryApiRef,
  oauthRequestApiRef,
  type BackstageIdentityApi,
  type ConfigApi,
  type DiscoveryApi,
  type OAuthApi,
  type OAuthRequestApi,
  type OpenIdConnectApi,
  type ProfileInfoApi,
  type SessionApi,
} from '@backstage/core-plugin-api';
import { ApiBlueprint } from '@backstage/frontend-plugin-api';

type CustomAuthApiRefType = OAuthApi &
  OpenIdConnectApi &
  ProfileInfoApi &
  BackstageIdentityApi &
  SessionApi;

export const oidcAuthApiRef = createApiRef<CustomAuthApiRefType>({
  id: 'internal.auth.oidc',
});

export const oidcAuthApi = ApiBlueprint.make({
  name: 'oidcAuthApi',
  params: defineParams =>
    defineParams({
      api: oidcAuthApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        oauthRequestApi: oauthRequestApiRef,
        configApi: configApiRef,
      },
      factory: ({
        discoveryApi,
        oauthRequestApi,
        configApi,
      }: {
        discoveryApi: DiscoveryApi;
        oauthRequestApi: OAuthRequestApi;
        configApi: ConfigApi;
      }) =>
        OAuth2.create({
          configApi,
          discoveryApi,
          oauthRequestApi,
          provider: {
            id: 'oidc',
            title: 'OIDC',
            icon: () => null,
          },
          environment: configApi.getOptionalString('auth.environment'),
        }),
    }),
});
