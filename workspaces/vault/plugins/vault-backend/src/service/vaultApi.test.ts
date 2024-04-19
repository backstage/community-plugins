/*
 * Copyright 2020 The Backstage Authors
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

import { setupRequestMockHandlers } from '@backstage/backend-test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { VaultSecret, VaultClient, VaultSecretList } from './vaultApi';
import { ConfigReader } from '@backstage/config';

describe('VaultApi', () => {
  let api: VaultClient;

  const server = setupServer();
  setupRequestMockHandlers(server);

  const mockBaseUrl = 'https://api-vault.com';
  const config = new ConfigReader({
    vault: {
      baseUrl: mockBaseUrl,
      token: '1234567890',
    },
  });

  const mockListResult: VaultSecretList = {
    data: {
      keys: ['secret::one', 'secret::two'],
    },
  };
  const mockListResultEmpty: VaultSecretList = {
    data: {
      keys: [],
    },
  };

  const mockSecretsResult = (
    secretEngine: string = 'secrets',
  ): VaultSecret[] => {
    return [
      {
        name: 'secret::one',
        path: 'test/success',
        editUrl: `${mockBaseUrl}/ui/vault/secrets/${secretEngine}/edit/test/success/secret::one`,
        showUrl: `${mockBaseUrl}/ui/vault/secrets/${secretEngine}/show/test/success/secret::one`,
      },
      {
        name: 'secret::two',
        path: 'test/success',
        editUrl: `${mockBaseUrl}/ui/vault/secrets/${secretEngine}/edit/test/success/secret::two`,
        showUrl: `${mockBaseUrl}/ui/vault/secrets/${secretEngine}/show/test/success/secret::two`,
      },
    ];
  };

  const setupHandlers = () => {
    server.use(
      rest.get(
        `${mockBaseUrl}/v1/secrets/metadata/test/success`,
        (_, res, ctx) => {
          return res(ctx.json(mockListResult));
        },
      ),
      rest.get(`${mockBaseUrl}/v1/kv/metadata/test/success`, (_, res, ctx) => {
        return res(ctx.json(mockListResult));
      }),
      rest.get(
        `${mockBaseUrl}/v1/secrets/metadata/test/error`,
        (_, res, ctx) => {
          return res(ctx.json(mockListResultEmpty));
        },
      ),
      rest.post(`${mockBaseUrl}/v1/auth/token/renew-self`, (_, res, ctx) => {
        return res(ctx.json({ auth: { client_token: '0987654321' } }));
      }),
    );
  };

  beforeEach(() => {
    setupHandlers();
    api = new VaultClient({ config });
  });

  it('should return secrets', async () => {
    const secrets = await api.listSecrets('test/success');
    expect(secrets).toEqual(mockSecretsResult());
  });

  it('should return secrets for custom engine', async () => {
    const secrets = await api.listSecrets('test/success', {
      secretEngine: 'kv',
    });
    expect(secrets).toEqual(mockSecretsResult('kv'));
  });

  it('should return empty secret list', async () => {
    const secrets = await api.listSecrets('test/error');
    expect(secrets).toEqual([]);
  });

  it('should return success token renew', async () => {
    expect(await api.renewToken()).toBe(undefined);
  });

  it('should render frontend url', () => {
    const url = api.getFrontendSecretsUrl();
    expect(url).toEqual(`${mockBaseUrl}/ui/vault/secrets/secrets`);
  });
});
