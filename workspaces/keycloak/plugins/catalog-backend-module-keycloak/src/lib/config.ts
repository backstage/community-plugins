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

import { readSchedulerServiceTaskScheduleDefinitionFromConfig } from '@backstage/backend-plugin-api';
import type { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

/**
 * The configuration parameters for a single Keycloak provider.
 *
 * @public
 */
export type KeycloakProviderConfig = {
  /**
   * Identifier of the provider which will be used i.e. at the location key for ingested entities.
   */
  id: string;

  /**
   * The Keycloak base URL
   */
  baseUrl: string;

  /**
   * The username to use for authenticating requests
   * If specified, password must also be specified
   */
  username?: string;

  /**
   * The password to use for authenticating requests
   * If specified, username must also be specified
   */
  password?: string;

  /**
   * The clientId to use for authenticating requests
   * If specified, clientSecret must also be specified
   */
  clientId?: string;

  /**
   * The clientSecret to use for authenticating requests
   * If specified, clientId must also be specified
   */
  clientSecret?: string;

  /**
   * name of the Keycloak realm
   */
  realm: string;

  /**
   * name of the Keycloak login realm
   */
  loginRealm?: string;

  /**
   * Schedule configuration for refresh tasks.
   */
  schedule?: SchedulerServiceTaskScheduleDefinition;

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
   * Whether the API call will return a brief representation for groups or not. Defaults to true.
   * A complete representation will include attributes
   */
  briefRepresentation?: boolean;
};

const readProviderConfig = (
  id: string,
  providerConfigInstance: Config,
): KeycloakProviderConfig => {
  const baseUrl = providerConfigInstance.getString('baseUrl');
  const realm = providerConfigInstance.getOptionalString('realm') ?? 'master';
  const loginRealm =
    providerConfigInstance.getOptionalString('loginRealm') ?? 'master';
  const username = providerConfigInstance.getOptionalString('username');
  const password = providerConfigInstance.getOptionalString('password');
  const clientId = providerConfigInstance.getOptionalString('clientId');
  const clientSecret = providerConfigInstance.getOptionalString('clientSecret');
  const userQuerySize =
    providerConfigInstance.getOptionalNumber('userQuerySize');
  const groupQuerySize =
    providerConfigInstance.getOptionalNumber('groupQuerySize');
  const maxConcurrency =
    providerConfigInstance.getOptionalNumber('maxConcurrency');
  const briefRepresentation = providerConfigInstance.getOptionalBoolean(
    'briefRepresentation',
  );

  if (clientId && !clientSecret) {
    throw new InputError(
      `clientSecret must be provided when clientId is defined.`,
    );
  }

  if (clientSecret && !clientId) {
    throw new InputError(
      `clientId must be provided when clientSecret is defined.`,
    );
  }

  if (username && !password) {
    throw new InputError(`password must be provided when username is defined.`);
  }

  if (password && !username) {
    throw new InputError(`username must be provided when password is defined.`);
  }

  const schedule = providerConfigInstance.has('schedule')
    ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
        providerConfigInstance.getConfig('schedule'),
      )
    : undefined;

  return {
    id,
    baseUrl,
    loginRealm,
    realm,
    username,
    password,
    clientId,
    clientSecret,
    schedule,
    userQuerySize,
    groupQuerySize,
    maxConcurrency,
    briefRepresentation,
  };
};

export const readProviderConfigs = (
  config: Config,
): KeycloakProviderConfig[] => {
  const providersConfig = config.getOptionalConfig(
    'catalog.providers.keycloakOrg',
  );
  if (!providersConfig) {
    return [];
  }
  return providersConfig.keys().map(id => {
    const providerConfigInstance = providersConfig.getConfig(id);
    return readProviderConfig(id, providerConfigInstance);
  });
};
