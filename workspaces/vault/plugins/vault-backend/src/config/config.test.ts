/*
 * Copyright 2022 The Backstage Authors
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
import { getVaultConfig } from './config';

describe('GetVaultConfig', () => {
  it('fails by missing keys', () => {
    expect(() => getVaultConfig(new ConfigReader({}))).toThrow();
    expect(() =>
      getVaultConfig(
        new ConfigReader({
          vault: {},
        }),
      ),
    ).toThrow();
  });

  // FIXME: Remove this test once we remove support to the old configuration
  it('retro compatibility', () => {
    const config = new ConfigReader({
      vault: {
        baseUrl: 'http://www.example.com',
        token: '123',
      },
    });

    const vaultConfig = getVaultConfig(config);
    expect(vaultConfig).toStrictEqual({
      baseUrl: 'http://www.example.com',
      publicUrl: undefined,
      token: { type: 'static', config: { secret: '123' } },
      kvVersion: 2,
      secretEngine: 'secrets',
    });
  });

  it('loads default params', () => {
    const config = new ConfigReader({
      vault: {
        baseUrl: 'http://www.example.com',
        auth: {
          type: 'static',
          secret: '123',
        },
      },
    });

    const vaultConfig = getVaultConfig(config);
    expect(vaultConfig).toStrictEqual({
      baseUrl: 'http://www.example.com',
      publicUrl: undefined,
      token: { type: 'static', config: { secret: '123' } },
      kvVersion: 2,
      secretEngine: 'secrets',
    });
  });

  it('loads custom params', () => {
    const config = new ConfigReader({
      vault: {
        baseUrl: 'http://www.example.com',
        auth: {
          type: 'static',
          secret: '123',
        },
        kvVersion: 1,
        secretEngine: 'test',
      },
    });

    const vaultConfig = getVaultConfig(config);
    expect(vaultConfig).toStrictEqual({
      baseUrl: 'http://www.example.com',
      publicUrl: undefined,
      token: { type: 'static', config: { secret: '123' } },
      kvVersion: 1,
      secretEngine: 'test',
    });
  });

  it('loads kubernetes default params', () => {
    const config = new ConfigReader({
      vault: {
        baseUrl: 'http://www.example.com',
        auth: {
          type: 'kubernetes',
          role: 'test',
        },
      },
    });

    const vaultConfig = getVaultConfig(config);
    expect(vaultConfig).toStrictEqual({
      baseUrl: 'http://www.example.com',
      publicUrl: undefined,
      token: {
        type: 'kubernetes',
        config: {
          role: 'test',
          authPath: 'kubernetes',
          serviceAccountTokenPath:
            '/var/run/secrets/kubernetes.io/serviceaccount/token',
        },
      },
      kvVersion: 2,
      secretEngine: 'secrets',
    });
  });

  it('loads kubernetes custom params', () => {
    const config = new ConfigReader({
      vault: {
        baseUrl: 'http://www.example.com',
        auth: {
          type: 'kubernetes',
          role: 'test',
          authPath: 'test',
          serviceAccountTokenPath: 'test',
        },
      },
    });

    const vaultConfig = getVaultConfig(config);
    expect(vaultConfig).toStrictEqual({
      baseUrl: 'http://www.example.com',
      publicUrl: undefined,
      token: {
        type: 'kubernetes',
        config: {
          role: 'test',
          authPath: 'test',
          serviceAccountTokenPath: 'test',
        },
      },
      kvVersion: 2,
      secretEngine: 'secrets',
    });
  });
});
