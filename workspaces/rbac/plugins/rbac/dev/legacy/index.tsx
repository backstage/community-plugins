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
 * Legacy dev mode for the RBAC plugin.
 */
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import { createDevApp } from '@backstage/dev-utils';
import { OAuth2 } from '@backstage/core-app-api';
import {
  configApiRef,
  createApiFactory,
  createApiRef,
  discoveryApiRef,
  oauthRequestApiRef,
  type OAuthApi,
  type OpenIdConnectApi,
  type ProfileInfoApi,
  type BackstageIdentityApi,
  type SessionApi,
} from '@backstage/core-plugin-api';

import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import { RbacPage, rbacPlugin } from '../../src/legacy';
import { rbacTranslations } from '../../src/alpha';
import { devAppThemes } from './shared';

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
  .addThemes(devAppThemes)
  .registerPlugin(rbacPlugin)
  .registerPlugin(catalogPlugin)
  .addTranslationResource(rbacTranslations)
  .setAvailableLanguages(['en', 'de', 'fr', 'it', 'es', 'ja'])
  .setDefaultLanguage('en')
  .registerApi(
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
  )
  .addSignInProvider({
    id: 'oidc',
    title: 'Keycloak OIDC',
    message: 'Sign in with Keycloak (multi-user testing)',
    apiRef: oidcAuthApiRef,
  })
  .addPage({
    element: <CatalogIndexPage />,
    title: 'Catalog',
    path: '/catalog',
  })
  .addPage({
    element: <CatalogEntityPage />,
    path: '/catalog/:namespace/:kind/:name',
  })
  .addPage({
    element: <RbacPage />,
    title: 'RBAC',
    path: '/rbac',
  })
  .render();
