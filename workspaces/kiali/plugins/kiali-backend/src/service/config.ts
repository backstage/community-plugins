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
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

const KIALI_PREFIX = 'kiali';

export type KialiDetails = {
  caData?: string;
  caFile?: string;
  name: string;
  skipTLSVerify?: boolean;
  sessionTime?: number;
  serviceAccountToken?: string;
  tokenName?: string;
  url: string;
  urlExternal: string;
};

const isValidUrl = (url: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (error) {
    return false;
  }
  return true;
};

export const getFromKialiConfig = (config: Config): Config[] => {
  // Check if required values are valid
  const requiredValues = ['name', 'url'];
  config.getConfigArray('providers').forEach(provider => {
    // Check presence of required values
    requiredValues.forEach(key => {
      if (!provider.has(key)) {
        throw new Error(
          `[${key}] Value must be specified in config at '${KIALI_PREFIX}.providers objects, the name of provider is ${provider.getString(
            'name',
          )}'`,
        );
      }
    });
    // Check if url is valid
    const url = provider.getString('url');
    if (!isValidUrl(url)) {
      throw new Error(
        `"${url}" is not a valid url in config at '${KIALI_PREFIX}.providers.${provider}.url'`,
      );
    }
    // Check if urlExternal is valid
    const kialiExternal = provider.getOptionalString('urlExternal');
    if (kialiExternal && kialiExternal !== '' && !isValidUrl(kialiExternal)) {
      throw new Error(
        `"${kialiExternal}" is not a valid url in config at '${KIALI_PREFIX}.providers.${provider}.urlExternal'`,
      );
    }
  });
  return config.getConfigArray('providers');
};

export const getHubClusterFromConfig = (
  config: Config,
  logger: LoggerService,
): KialiDetails[] => {
  const hubs = getFromKialiConfig(config);
  logger.debug(`Found ${hubs.length} Kiali configurations`);
  return hubs.map(hub => {
    return {
      name: hub.getString('name'),
      url: new URL(hub.getString('url')).href,
      urlExternal: hub.getOptionalString('urlExternal')
        ? new URL(hub.getOptionalString('urlExternal')!).href
        : undefined,
      skipTLSVerify: hub.getOptionalBoolean('skipTLSVerify') || false,
      sessionTime: hub.getOptionalNumber('sessionTime'),
      serviceAccountToken: hub.getOptionalString('serviceAccountToken'),
      tokenName: hub.getOptionalString('tokenName') || 'kiali-token-Kubernetes',
      caData: hub.getOptionalString('caData'),
      caFile: hub.getOptionalString('caFile'),
    } as KialiDetails;
  });
};

export const readKialiConfigs = (
  config: Config,
  logger: LoggerService,
): KialiDetails[] => {
  const kialiConfigs = config.getConfig(KIALI_PREFIX);
  logger.debug(`Reading Kiali configurations`);
  return getHubClusterFromConfig(kialiConfigs, logger);
};
