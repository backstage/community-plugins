/*
 * Copyright 2026 The Backstage Authors
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
import { InputError } from '@backstage/errors';

import { readServiceNowConfig } from './config';

describe('readServiceNowConfig', () => {
  it('returns undefined when servicenow config is absent', () => {
    expect(readServiceNowConfig(new ConfigReader({}))).toBeUndefined();
  });

  it('throws when instanceUrl is missing', () => {
    expect(() =>
      readServiceNowConfig(
        new ConfigReader({
          servicenow: {
            basicAuth: { username: 'u', password: 'p' },
          },
        }),
      ),
    ).toThrow();
  });

  it('throws when both oauth and basicAuth are configured', () => {
    expect(() =>
      readServiceNowConfig(
        new ConfigReader({
          servicenow: {
            instanceUrl: 'https://example.service-now.com',
            oauth: {
              grantType: 'client_credentials',
              clientId: 'id',
              clientSecret: 'secret',
            },
            basicAuth: { username: 'u', password: 'p' },
          },
        }),
      ),
    ).toThrow(InputError);
  });

  it('throws on unsupported oauth grantType', () => {
    expect(() =>
      readServiceNowConfig(
        new ConfigReader({
          servicenow: {
            instanceUrl: 'https://example.service-now.com',
            oauth: {
              grantType: 'authorization_code',
              clientId: 'id',
              clientSecret: 'secret',
            },
          },
        }),
      ),
    ).toThrow(/Unsupported OAuth grantType/);
  });

  it('throws when password grant is missing username', () => {
    expect(() =>
      readServiceNowConfig(
        new ConfigReader({
          servicenow: {
            instanceUrl: 'https://example.service-now.com',
            oauth: {
              grantType: 'password',
              clientId: 'id',
              clientSecret: 'secret',
              password: 'p',
            },
          },
        }),
      ),
    ).toThrow();
  });

  it('parses basicAuth configuration', () => {
    const result = readServiceNowConfig(
      new ConfigReader({
        servicenow: {
          instanceUrl: 'https://example.service-now.com',
          basicAuth: { username: 'test-user', password: 'test-password' },
        },
      }),
    );

    expect(result).toEqual({
      servicenow: {
        instanceUrl: 'https://example.service-now.com',
        oauth: undefined,
        basicAuth: { username: 'test-user', password: 'test-password' },
      },
    });
  });

  it('parses oauth client_credentials configuration', () => {
    const result = readServiceNowConfig(
      new ConfigReader({
        servicenow: {
          instanceUrl: 'https://example.service-now.com',
          oauth: {
            grantType: 'client_credentials',
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
          },
        },
      }),
    );

    expect(result).toEqual({
      servicenow: {
        instanceUrl: 'https://example.service-now.com',
        oauth: {
          grantType: 'client_credentials',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          tokenUrl: undefined,
        },
        basicAuth: undefined,
      },
    });
  });
});
