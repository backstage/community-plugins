/*
 * Copyright 2024 The Backstage Authors
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
import type { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  catalog?: {
    providers?: {
      keycloakOrg?: {
        [key: string]: {
          /**
           * KeycloakOrgConfig
           */
          /**
           * Location of the Keycloak instance
           */
          baseUrl: string;
          /**
           * Keycloak realm name. This realm is scraped and entities are
           */
          realm?: string;
          /**
           * Keycloak realm name. This realm is used for authentication using the credentials below.
           */
          loginRealm?: string;
          /**
           * The number of users to query at a time.
           * @defaultValue 100
           * @remarks
           * This is a performance optimization to avoid querying too many users at once.
           * @see https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_users_resource
           */
          userQuerySize?: number;
          /**
           * The number of groups to query at a time.
           * @defaultValue 100
           * @remarks
           * This is a performance optimization to avoid querying too many groups at once.
           * @see https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_groups_resource
           */
          groupQuerySize?: number;
          /**
           * Maximum request concurrency to prevent DoS attacks on the Keycloak server.
           */
          maxConcurrency?: number;
          /**
           * Whether the API call will return a brief representation for groups or not. Defaults to true
           */
          briefRepresentation?: boolean;
          schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        } & (
          | {
              /**
               * KeycloakClientCredentials
               */
              /**
               * Keycloak credentials. Use together with "password".
               */
              username: string;
              /**
               * Keycloak credentials. Use together with "username".
               * @visibility secret
               */
              password: string;
            }
          | {
              /**
               * KeycloakClientCredentials
               */
              /**
               * Keycloak credentials. Use together with "clientSecret".
               */
              clientId: string;
              /**
               * Keycloak credentials. Use together with "clientId".
               * @visibility secret
               */
              clientSecret: string;
            }
        );
      };
    };
  };
}
