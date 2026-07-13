/*
 * Copyright 2025 The Backstage Authors
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
import { getAkeylessConfig } from './config';

describe('getAkeylessConfig', () => {
  const baseConfig = {
    akeyless: {
      gatewayUrl: 'https://api.akeyless.io',
      authentication: {
        method: 'accessKey',
        accessKey: {
          accessId: 'test-id',
          accessKey: 'test-key',
        },
      },
    },
  };

  it('defaults deploymentProfile to saas', () => {
    const config = getAkeylessConfig(new ConfigReader(baseConfig));
    expect(config.deploymentProfile).toEqual('saas');
  });

  it('accepts valid deployment profiles', () => {
    const config = getAkeylessConfig(
      new ConfigReader({
        akeyless: {
          ...baseConfig.akeyless,
          deploymentProfile: 'onprem',
        },
      }),
    );
    expect(config.deploymentProfile).toEqual('onprem');
  });

  it('rejects invalid deployment profiles with a clear error', () => {
    expect(() =>
      getAkeylessConfig(
        new ConfigReader({
          akeyless: {
            ...baseConfig.akeyless,
            deploymentProfile: 'foo',
          },
        }),
      ),
    ).toThrow(
      "Invalid akeyless.deploymentProfile 'foo'. Allowed values: saas, onprem, cloud",
    );
  });

  it('rejects invalid cloud IAM providers with a clear error', () => {
    expect(() =>
      getAkeylessConfig(
        new ConfigReader({
          akeyless: {
            deploymentProfile: 'cloud',
            gatewayUrl: 'https://api.akeyless.io',
            authentication: {
              method: 'cloudIam',
              cloudIam: {
                accessId: 'test-id',
                provider: 'invalid',
              },
            },
          },
        }),
      ),
    ).toThrow(
      "Invalid akeyless.authentication.cloudIam.provider 'invalid'. Allowed values: aws_iam, azure_ad, gcp",
    );
  });
});
