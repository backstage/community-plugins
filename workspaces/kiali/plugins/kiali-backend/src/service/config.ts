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
import { Config } from '@backstage/config';

const KIALI_PREFIX = 'kiali';

export type KialiDetails = {
  url: string;
  urlExternal: string;
  skipTLSVerify?: boolean;
  sessionTime?: number;
  serviceAccountToken?: string;
  caData?: string;
  caFile?: string;
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

export const getFromKialiConfig = (config: Config): Config => {
  // Check if required values are valid
  const requiredValues = ['url'];
  requiredValues.forEach(key => {
    if (!config.has(key)) {
      throw new Error(
        `Value must be specified in config at '${KIALI_PREFIX}.${key}'`,
      );
    }
  });
  return config;
};

export const getHubClusterFromConfig = (config: Config): KialiDetails => {
  const hub = getFromKialiConfig(config);

  const url = hub.getString('url');
  if (!isValidUrl(url)) {
    throw new Error(`"${url}" is not a valid url`);
  }
  /*
    new URL(url).href => guarantees that the url will end in '/' 
    - If the user does not indicate the last character as /, URL class will put it
  */
  const kialiExternal = hub.getOptionalString('urlExternal');
  if (kialiExternal && kialiExternal !== '' && !isValidUrl(kialiExternal)) {
    throw new Error(`"${kialiExternal}" is not a valid url`);
  }
  const externalUrl = kialiExternal ? kialiExternal : url;
  return {
    url: new URL(url).href,
    urlExternal: new URL(externalUrl).href,
    serviceAccountToken: hub.getOptionalString('serviceAccountToken'),
    skipTLSVerify: hub.getOptionalBoolean('skipTLSVerify') || false,
    caData: hub.getOptionalString('caData'),
    caFile: hub.getOptionalString('caFile'),
    sessionTime: hub.getOptionalNumber('sessionTime'),
  };
};

export const readKialiConfigs = (config: Config): KialiDetails => {
  const kialiConfigs = config.getConfig(KIALI_PREFIX);
  return getHubClusterFromConfig(kialiConfigs);
};
