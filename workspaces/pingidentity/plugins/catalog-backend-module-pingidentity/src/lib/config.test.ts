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
import { readProviderConfigs } from './config';

describe('readProviderConfigs', () => {
  it('reads all the values', () => {
    const config = {
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
              clientSecret: 'clientSecret',
              schedule: {
                frequency: {
                  minutes: 30,
                },
                initialDelay: undefined,
                scope: undefined,
                timeout: {
                  minutes: 3,
                },
              },
              userQuerySize: 100,
              groupQuerySize: 200,
            },
          },
        },
      },
    };
    const actual = readProviderConfigs(new ConfigReader(config));
    const expected = [
      {
        id: 'default',
        apiPath: 'apiPath',
        authPath: 'authPath',
        envId: 'envId',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        schedule: {
          frequency: {
            minutes: 30,
          },
          initialDelay: undefined,
          scope: undefined,
          timeout: {
            minutes: 3,
          },
        },
        userQuerySize: 100,
        groupQuerySize: 200,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should fail if clientId is set without clientSecret', () => {
    const config = {
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientId: 'clientId',
            },
          },
        },
      },
    };
    expect(() => readProviderConfigs(new ConfigReader(config))).toThrow();
  });

  it('should fail if clientSecret is set without clientId', () => {
    const config = {
      catalog: {
        providers: {
          pingIdentityOrg: {
            default: {
              apiPath: 'apiPath',
              authPath: 'authPath',
              envId: 'envId',
              clientSecret: 'clientSecret',
            },
          },
        },
      },
    };
    expect(() => readProviderConfigs(new ConfigReader(config))).toThrow();
  });
});
