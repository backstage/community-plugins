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
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { readKialiConfigs } from './config';

const logger = mockServices.logger.mock();

describe('Configuration', () => {
  it('should return KialiDetails object from configuration', async () => {
    const configuration = new ConfigReader({
      kiali: {
        providers: [
          {
            name: 'default',
            url: 'https://localhost:4000',
          },
        ],
      },
    });

    const result = readKialiConfigs(configuration, logger);
    expect(result).toStrictEqual([
      {
        name: 'default',
        url: 'https://localhost:4000/',
        urlExternal: undefined,
        serviceAccountToken: undefined,
        skipTLSVerify: false,
        tokenName: 'kiali-token-Kubernetes',
        sessionTime: undefined,
        caData: undefined,
        caFile: undefined,
      },
    ]);
  });

  it('should return KialiDetails object from configuration with the tokenName if passed', async () => {
    const configuration = new ConfigReader({
      kiali: {
        providers: [
          {
            name: 'default',
            url: 'https://localhost:4000',
            tokenName: 'kiali-token-EXAMPLE',
          },
        ],
      },
    });

    const result = readKialiConfigs(configuration, logger);
    expect(result).toStrictEqual([
      {
        name: 'default',
        url: 'https://localhost:4000/',
        urlExternal: undefined,
        serviceAccountToken: undefined,
        skipTLSVerify: false,
        tokenName: 'kiali-token-EXAMPLE',
        sessionTime: undefined,
        caData: undefined,
        caFile: undefined,
      },
    ]);
  });

  it('should throw an error when providers is not set', async () => {
    const configuration = new ConfigReader({
      kiali: {
        skipTLSVerify: true,
      },
    });
    expect(() => readKialiConfigs(configuration, logger)).toThrow(
      new Error(
        `Missing required config value at 'kiali.providers' in 'mock-config'`,
      ),
    );
  });

  it('should throw an error when url is not set', async () => {
    const configuration = new ConfigReader({
      kiali: {
        providers: [
          {
            name: 'default',
            skipTLSVerify: true,
          },
        ],
      },
    });
    expect(() => readKialiConfigs(configuration, logger)).toThrow(
      new Error(
        `[url] Value must be specified in config at 'kiali.providers objects, the name of provider is default'`,
      ),
    );
  });

  it('should throw an error when name is not set', async () => {
    const configuration = new ConfigReader({
      kiali: {
        providers: [
          {
            url: 'kiali',
          },
        ],
      },
    });
    expect(() => readKialiConfigs(configuration, logger)).toThrow(
      new Error(
        `Missing required config value at 'kiali.providers[0].name' in 'mock-config'`,
      ),
    );
  });

  it('should throw an error when url is not correct', async () => {
    const configuration = new ConfigReader({
      kiali: {
        providers: [
          {
            name: 'default',
            url: 'kiali',
          },
        ],
      },
    });
    expect(() => readKialiConfigs(configuration, logger)).toThrow(
      new Error(
        `"kiali" is not a valid url in config at 'kiali.providers.[object Object].url'`,
      ),
    );
  });
});
