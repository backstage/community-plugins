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

export interface Config {
  auth?: {
    providers?: {
      keycloak?: {
        [authEnv: string]: {
          /**
           * The client ID registered for Backstage in the Keycloak realm.
           */
          clientId: string;
          /**
           * The client secret registered for Backstage in the Keycloak realm.
           * @visibility secret
           */
          clientSecret: string;
          /**
           * Base URL of the Keycloak server, without a trailing `/realms/...` path.
           * @example "https://keycloak.example.com/auth"
           */
          baseUrl: string;
          /**
           * Name of the Keycloak realm that Backstage authenticates against.
           */
          realm: string;
          /**
           * Scopes appended to the required `openid profile email` scopes
           * on every authorization request (e.g. `offline_access`, `roles`).
           */
          additionalScopes?: string[];
          /**
           * Optional URL the browser is redirected to after the Keycloak
           * session has been terminated. Must match one of the
           * `Valid post logout redirect URIs` configured on the Keycloak
           * client. When omitted, Keycloak renders its own post-logout page.
           */
          postLogoutRedirectUri?: string;
          /**
           * Optional prompt parameter for the authorization request.
           * For example, set to 'login' to force the user to enter their credentials.
           * @example "login"
           */
          prompt?: string;
        };
      };
    };
  };
}
