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
import {
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

/**
 * The configuration parameters for the Ping Identity provider.
 *
 * @public
 */
export type PingIdentityProviderConfig = {
  /**
   * Identifier of the provider which will be used i.e. at the location key for ingested entities.
   */
  id: string;

  /**
   * The PingOne API path
   */
  apiPath: string;

  /**
   * The PingOne Auth path
   */
  authPath: string;

  /**
   * The envId where the application is located
   */
  envId: string;

  /**
   * The OAuth client ID to use for authenticating requests.
   * If specified, ClientSecret must also be specified
   */
  clientId?: string;

  /**
   * The OAuth client secret to use for authenticating requests.
   * If specified, ClientId must also be specified
   */
  clientSecret?: string;

  /**
   * Schedule configuration for refresh tasks.
   */
  schedule?: SchedulerServiceTaskScheduleDefinition;
  /**
   * The number of users to query at a time.
   * @defaultValue 100
   * @remarks
   * This is a performance optimization to avoid querying too many users at once.
   * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#paging-ordering-and-filtering-collections
   */
  userQuerySize?: number;
  /**
   * The number of groups to query at a time.
   * @defaultValue 100
   * @remarks
   * This is a performance optimization to avoid querying too many groups at once.
   * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#paging-ordering-and-filtering-collections
   */
  groupQuerySize?: number;
};

const readProviderConfig = (
  id: string,
  providerConfigInstance: Config,
): PingIdentityProviderConfig => {
  const apiPath = providerConfigInstance.getString('apiPath');
  const authPath = providerConfigInstance.getString('authPath');
  const envId = providerConfigInstance.getString('envId');
  const clientId = providerConfigInstance.getOptionalString('clientId');
  const clientSecret = providerConfigInstance.getOptionalString('clientSecret');
  const userQuerySize =
    providerConfigInstance.getOptionalNumber('userQuerySize');
  const groupQuerySize =
    providerConfigInstance.getOptionalNumber('groupQuerySize');

  if (clientId && !clientSecret) {
    throw new Error(`clientSecret must be provided when clientId is defined.`);
  }

  if (clientSecret && !clientId) {
    throw new Error(`clientId must be provided when clientSecret is defined.`);
  }

  const schedule = providerConfigInstance.has('schedule')
    ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
        providerConfigInstance.getConfig('schedule'),
      )
    : undefined;

  return {
    id,
    apiPath,
    authPath,
    envId,
    clientId,
    clientSecret,
    schedule,
    userQuerySize,
    groupQuerySize,
  };
};

export const readProviderConfigs = (
  config: Config,
): PingIdentityProviderConfig[] => {
  const providersConfig = config.getOptionalConfig(
    'catalog.providers.pingIdentityOrg',
  );
  if (!providersConfig) {
    return [];
  }
  return providersConfig.keys().map(id => {
    const providerConfigInstance = providersConfig.getConfig(id);
    return readProviderConfig(id, providerConfigInstance);
  });
};
