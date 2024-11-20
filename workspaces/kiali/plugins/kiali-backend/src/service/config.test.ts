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
import { ConfigReader } from '@backstage/config';

import { readKialiConfigs } from './config';

describe('Configuration', () => {
  it('should return KialiDetails object from configuration', async () => {
    const configuration = new ConfigReader({
      kiali: {
        url: 'https://localhost:4000',
      },
    });
    const result = readKialiConfigs(configuration);
    expect(result).toStrictEqual({
      url: 'https://localhost:4000/',
      urlExternal: 'https://localhost:4000/',
      serviceAccountToken: undefined,
      skipTLSVerify: false,
      sessionTime: undefined,
      caData: undefined,
      caFile: undefined,
    });
  });

  it('should throw an error when url is not set', async () => {
    const configuration = new ConfigReader({
      kiali: {
        skipTLSVerify: true,
      },
    });
    expect(() => readKialiConfigs(configuration)).toThrow(
      new Error(`Value must be specified in config at 'kiali.url'`),
    );
  });

  it('should throw an error when url is not correct', async () => {
    const configuration = new ConfigReader({
      kiali: {
        url: 'kiali',
      },
    });
    expect(() => readKialiConfigs(configuration)).toThrow(
      new Error(`"kiali" is not a valid url`),
    );
  });
});
