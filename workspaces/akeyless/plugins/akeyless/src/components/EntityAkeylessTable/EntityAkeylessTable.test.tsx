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

import { ComponentEntity } from '@backstage/catalog-model';
import { alertApiRef } from '@backstage/core-plugin-api';
import { ApiProvider, UrlPatternDiscovery } from '@backstage/core-app-api';
import {
  MockFetchApi,
  setupRequestMockHandlers,
  TestApiRegistry,
  renderInTestApp,
} from '@backstage/test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  AKEYLESS_ALLOW_CRUD_ANNOTATION,
  AKEYLESS_SECRET_PATH_ANNOTATION,
  AKEYLESS_SECRET_TYPES_ANNOTATION,
  DEFAULT_SECRET_TYPES,
} from '../../constants';
import { akeylessApiRef, AkeylessClient, AkeylessSecret } from '../../api';
import {
  akeylessSecretConfig,
  EntityAkeylessTable,
  firstNonRootSecretPath,
  isRootContextPath,
} from './EntityAkeylessTable';

describe('akeylessSecretConfig', () => {
  const entity = (annotations: Record<string, string>) =>
    ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'test', annotations },
      spec: { type: 'service', lifecycle: 'production', owner: 'team' },
    } as ComponentEntity);

  it('parses a single secrets path', () => {
    expect(
      akeylessSecretConfig(
        entity({ [AKEYLESS_SECRET_PATH_ANNOTATION]: '/demo/prod' }),
      ),
    ).toEqual({
      secretPaths: ['/demo/prod'],
      itemTypes: [...DEFAULT_SECRET_TYPES],
      allowCrud: true,
    });
  });

  it('parses comma-separated paths and trims whitespace', () => {
    expect(
      akeylessSecretConfig(
        entity({
          [AKEYLESS_SECRET_PATH_ANNOTATION]: ' /a , /b ',
        }),
      ),
    ).toEqual({
      secretPaths: ['/a', '/b'],
      itemTypes: [...DEFAULT_SECRET_TYPES],
      allowCrud: true,
    });
  });

  it('uses custom item types when provided', () => {
    expect(
      akeylessSecretConfig(
        entity({
          [AKEYLESS_SECRET_PATH_ANNOTATION]: '/demo',
          [AKEYLESS_SECRET_TYPES_ANNOTATION]: 'static-secret,certificate',
        }),
      ),
    ).toEqual({
      secretPaths: ['/demo'],
      itemTypes: ['static-secret', 'certificate'],
      allowCrud: true,
    });
  });

  it('falls back to default item types when types annotation is empty', () => {
    expect(
      akeylessSecretConfig(
        entity({
          [AKEYLESS_SECRET_PATH_ANNOTATION]: '/demo',
          [AKEYLESS_SECRET_TYPES_ANNOTATION]: ' , ',
        }),
      ),
    ).toEqual({
      secretPaths: ['/demo'],
      itemTypes: [...DEFAULT_SECRET_TYPES],
      allowCrud: true,
    });
  });

  it('disables CRUD when allow-crud annotation is false', () => {
    expect(
      akeylessSecretConfig(
        entity({
          [AKEYLESS_SECRET_PATH_ANNOTATION]: '/demo',
          [AKEYLESS_ALLOW_CRUD_ANNOTATION]: 'false',
        }),
      ),
    ).toEqual({
      secretPaths: ['/demo'],
      itemTypes: [...DEFAULT_SECRET_TYPES],
      allowCrud: false,
    });
  });
});

describe('root context path helpers', () => {
  it('detects root paths', () => {
    expect(isRootContextPath('/')).toBe(true);
    expect(isRootContextPath(' / ')).toBe(true);
    expect(isRootContextPath('////')).toBe(true);
    expect(isRootContextPath('/./')).toBe(true);
    expect(isRootContextPath('/../')).toBe(true);
    expect(isRootContextPath('/demo')).toBe(false);
  });

  it('selects the first non-root annotated path', () => {
    expect(firstNonRootSecretPath(['/', '/demo', '/other'])).toEqual('/demo');
    expect(firstNonRootSecretPath(['////', '/demo', '/other'])).toEqual(
      '/demo',
    );
    expect(firstNonRootSecretPath(['/'])).toBeUndefined();
  });
});

describe('EntityAkeylessTable', () => {
  const server = setupServer();
  setupRequestMockHandlers(server);

  const mockBaseUrl = 'https://backstage.test/api/akeyless';
  const discoveryApi = UrlPatternDiscovery.compile(mockBaseUrl);
  const fetchApi = new MockFetchApi();
  let akeylessClient: AkeylessClient;
  let apis: TestApiRegistry;
  let listSecretsSpy: jest.SpyInstance;

  const entity = (annotations: Record<string, string>) =>
    ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'test', annotations },
      spec: { type: 'service', lifecycle: 'production', owner: 'team' },
    } as ComponentEntity);

  const mockSecrets: AkeylessSecret[] = [
    {
      name: 'secret-one',
      fullPath: '/demo/prod/secret-one',
      itemType: 'static-secret',
      path: '/demo/prod',
      showUrl:
        'https://console.akeyless.io/items?item=%2Fdemo%2Fprod%2Fsecret-one',
      editUrl:
        'https://console.akeyless.io/items?item=%2Fdemo%2Fprod%2Fsecret-one',
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    akeylessClient = new AkeylessClient({ discoveryApi, fetchApi });
    apis = TestApiRegistry.from(
      [akeylessApiRef, akeylessClient],
      [alertApiRef, { post: jest.fn() }],
    );
    listSecretsSpy = jest.spyOn(akeylessClient, 'listSecrets');
  });

  it('renders listed secrets', async () => {
    server.use(
      rest.get(`${mockBaseUrl}/v1/secrets/:path`, (_req, res, ctx) =>
        res(
          ctx.json({
            items: mockSecrets,
            allowCrud: true,
          }),
        ),
      ),
    );

    const rendered = await renderInTestApp(
      <ApiProvider apis={apis}>
        <EntityAkeylessTable
          entity={entity({ [AKEYLESS_SECRET_PATH_ANNOTATION]: '/demo/prod' })}
        />
      </ApiProvider>,
    );

    expect(
      await rendered.findByText('/demo/prod/secret-one'),
    ).toBeInTheDocument();
    expect(
      rendered.getByRole('button', { name: 'Create static secret' }),
    ).toBeInTheDocument();
    expect(listSecretsSpy).toHaveBeenCalledWith('/demo/prod', {
      itemTypes: [...DEFAULT_SECRET_TYPES],
    });
  });

  it('renders an error row when listing fails for a path', async () => {
    server.use(
      rest.get(`${mockBaseUrl}/v1/secrets/:path`, (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ error: 'upstream failure' })),
      ),
    );

    const rendered = await renderInTestApp(
      <ApiProvider apis={apis}>
        <EntityAkeylessTable
          entity={entity({ [AKEYLESS_SECRET_PATH_ANNOTATION]: '/demo/prod' })}
        />
      </ApiProvider>,
    );

    expect(
      await rendered.findByText(/Failed to load secrets from/),
    ).toBeInTheDocument();
  });

  it('hides CRUD controls when backend reports allowCrud false', async () => {
    server.use(
      rest.get(`${mockBaseUrl}/v1/secrets/:path`, (_req, res, ctx) =>
        res(
          ctx.json({
            items: mockSecrets,
            allowCrud: false,
          }),
        ),
      ),
    );

    const rendered = await renderInTestApp(
      <ApiProvider apis={apis}>
        <EntityAkeylessTable
          entity={entity({ [AKEYLESS_SECRET_PATH_ANNOTATION]: '/demo/prod' })}
        />
      </ApiProvider>,
    );

    expect(
      await rendered.findByText('/demo/prod/secret-one'),
    ).toBeInTheDocument();
    expect(
      rendered.queryByRole('button', { name: 'Create static secret' }),
    ).not.toBeInTheDocument();
  });
});
