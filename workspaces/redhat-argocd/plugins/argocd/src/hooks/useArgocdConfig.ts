import { configApiRef, useApi } from '@backstage/core-plugin-api';

import { Instances } from '../types';

export const useArgocdConfig = (): {
  instances: Instances;
  intervalMs: number;
  baseUrl: string | undefined;
} => {
  const configApi = useApi(configApiRef);

  const instances = (
    configApi
      .getConfigArray('argocd.appLocatorMethods')
      .find(value => value.getOptionalString('type') === 'config')
      ?.getOptionalConfigArray('instances') ?? []
  ).map(config => ({
    name: config.getOptionalString('name') ?? '',
    url: config.getOptionalString('url') ?? '',
  }));
  const intervalMs =
    configApi.getOptionalNumber('argocd.refreshInterval') ?? 10000;
  const baseUrl = configApi.getOptionalString('argocd.baseUrl');
  return {
    baseUrl,
    instances,
    intervalMs,
  };
};
