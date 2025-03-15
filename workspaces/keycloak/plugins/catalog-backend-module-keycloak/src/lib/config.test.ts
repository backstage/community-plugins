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

import deepmerge from 'deepmerge';

import { CONFIG } from '../../__fixtures__/helpers';
import { readProviderConfigs } from './config';

describe('readProviderConfigs', () => {
  it('should return an empty array if no providers are configured', () => {
    const config = mockServices.rootConfig({ data: {} });

    const result = readProviderConfigs(config);

    expect(result).toEqual([]);
  });

  it('should return an array of provider configs', () => {
    const config = mockServices.rootConfig({ data: CONFIG });

    const result = readProviderConfigs(config);

    expect(result).toEqual([
      {
        id: 'default',
        baseUrl: 'http://localhost:8080',
        loginRealm: 'master',
        realm: 'master',
        username: undefined,
        password: undefined,
        clientId: undefined,
        clientSecret: undefined,
        schedule: undefined,
        userQuerySize: undefined,
        groupQuerySize: undefined,
        briefRepresentation: undefined,
      },
    ]);
  });

  it('should return an array of provider configs with optional values', () => {
    const config = mockServices.rootConfig({
      data: deepmerge(CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                realm: 'myrealm',
                loginRealm: 'myloginrealm',
                username: 'myusername',
                password: 'mypassword',
                clientId: 'myclientid',
                clientSecret: 'myclientsecret',
                userQuerySize: 100,
                groupQuerySize: 200,
                briefRepresentation: true,
                schedule: {
                  frequency: { hours: 1 },
                  timeout: { minutes: 50 },
                  initialDelay: { seconds: 15 },
                },
              },
            },
          },
        },
      }),
    });

    const result = readProviderConfigs(config);

    expect(result).toEqual([
      {
        id: 'default',
        baseUrl: 'http://localhost:8080',
        loginRealm: 'myloginrealm',
        realm: 'myrealm',
        username: 'myusername',
        password: 'mypassword',
        clientId: 'myclientid',
        clientSecret: 'myclientsecret',
        userQuerySize: 100,
        groupQuerySize: 200,
        briefRepresentation: true,
        schedule: {
          scope: undefined,
          frequency: { hours: 1 },
          timeout: { minutes: 50 },
          initialDelay: { seconds: 15 },
        },
      },
    ]);
  });

  it('should throw an error if clientId is provided without clientSecret', () => {
    const config = mockServices.rootConfig({
      data: deepmerge(CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                clientId: 'myclientid',
              },
            },
          },
        },
      }),
    });

    expect(() => readProviderConfigs(config)).toThrow(
      `clientSecret must be provided when clientId is defined.`,
    );
  });

  it('should throw an error if clientSecret is provided without clientId', () => {
    const config = mockServices.rootConfig({
      data: deepmerge(CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                clientSecret: 'myclientsecret',
              },
            },
          },
        },
      }),
    });

    expect(() => readProviderConfigs(config)).toThrow(
      `clientId must be provided when clientSecret is defined.`,
    );
  });

  it('should throw an error if username is provided without password', () => {
    const config = mockServices.rootConfig({
      data: deepmerge(CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                username: 'myusername',
              },
            },
          },
        },
      }),
    });

    expect(() => readProviderConfigs(config)).toThrow(
      `password must be provided when username is defined.`,
    );
  });

  it('should throw an error if password is provided without username', () => {
    const config = mockServices.rootConfig({
      data: deepmerge(CONFIG, {
        catalog: {
          providers: {
            keycloakOrg: {
              default: {
                password: 'mypassword',
              },
            },
          },
        },
      }),
    });

    expect(() => readProviderConfigs(config)).toThrow(
      `username must be provided when password is defined.`,
    );
  });
});
