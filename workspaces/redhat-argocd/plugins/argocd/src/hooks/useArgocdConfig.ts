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
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import type { Config } from '@backstage/config';

import { Instance } from '@backstage-community/plugin-redhat-argocd-common';

export const getArgocdInstances = (configApi: Config) => {
  return (
    configApi
      .getConfigArray('argocd.appLocatorMethods')
      .find(value => value.getOptionalString('type') === 'config')
      ?.getOptionalConfigArray('instances') ?? []
  ).map(config => ({
    name: config.getOptionalString('name') ?? '',
    url: config.getOptionalString('url') ?? '',
  }));
};

export const useArgocdConfig = (): {
  instances: Instance[];
  intervalMs: number;
  baseUrl: string | undefined;
} => {
  const configApi = useApi(configApiRef);

  const instances = getArgocdInstances(configApi);
  const intervalMs =
    configApi.getOptionalNumber('argocd.refreshInterval') ?? 10000;
  const baseUrl = configApi.getOptionalString('argocd.baseUrl');
  return {
    baseUrl,
    instances,
    intervalMs,
  };
};
