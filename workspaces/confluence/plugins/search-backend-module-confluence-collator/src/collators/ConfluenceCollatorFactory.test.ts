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
import {
  ConfluenceCollatorFactory,
  ConfluenceCollatorFactoryOptions,
} from './ConfluenceCollatorFactory';
import {
  mockServices,
  registerMswTestHooks,
} from '@backstage/backend-test-utils';
import { TestPipeline } from '@backstage/plugin-search-backend-node';
import { ConfigReader } from '@backstage/config';
import { setupServer } from 'msw/node';
import { rest, RestRequest } from 'msw';

const logger = mockServices.logger.mock();

const BASE_URL = 'http://confluence.example.com';
const CONFLUENCE_API_PATH = '/rest/api/content/search';

/* eslint jest/expect-expect: ["warn", { "assertFunctionNames": ["expect", "testSearchQuery"] }]  */
const testSearchQuery = (
  request: RestRequest | undefined,
  expectedSearch: unknown,
) => {
  if (!request) {
    expect(request).not.toBeFalsy();
    return;
  }

  const executedSearch: { [key: string]: string } = {};
  request.url.searchParams.forEach((value: string, key: string) => {
    executedSearch[key] = value;
  });
  expect(executedSearch).toEqual(expectedSearch);
};

describe('ConfluenceCollatorFactory', () => {
  const config = new ConfigReader({
    confluence: {
      baseUrl: BASE_URL,
      auth: {
        type: 'basic',
        token: 'AA',
        email: 'user@example.com',
      },
    },
  });
  const options: ConfluenceCollatorFactoryOptions = {
    logger,
  };
  const factory = ConfluenceCollatorFactory.fromConfig(config, options);

  const worker = setupServer();
  registerMswTestHooks(worker);

  it('has expected collator factory type', () => {
    expect(factory.type).toBe('confluence');
  });

  it('throws if auth fields are missing based on provided type', () => {
    // missing email
    const malformedBasicAuthConfig = new ConfigReader({
      confluence: {
        baseUrl: BASE_URL,
        auth: {
          type: 'basic',
          token: 'AA',
        },
      },
    });
    expect(() =>
      ConfluenceCollatorFactory.fromConfig(malformedBasicAuthConfig, options),
    ).toThrow();

    // missing password
    const malformedUserpassAuthConfig = new ConfigReader({
      confluence: {
        baseUrl: BASE_URL,
        auth: {
          type: 'userpass',
          username: 'user',
        },
      },
    });
    expect(() =>
      ConfluenceCollatorFactory.fromConfig(
        malformedUserpassAuthConfig,
        options,
      ),
    ).toThrow();

    // missing token
    const malformedBearerAuthConfig = new ConfigReader({
      confluence: {
        baseUrl: BASE_URL,
        auth: {
          type: 'bearer',
        },
      },
    });
    expect(() =>
      ConfluenceCollatorFactory.fromConfig(malformedBearerAuthConfig, options),
    ).toThrow();
  });

  it('uses default CQL query when `spaces` & `query` are both omitted from config', async () => {
    let request;
    worker.use(
      rest.get(BASE_URL + CONFLUENCE_API_PATH, (req, res, ctx) => {
        request = req;

        return res(ctx.status(200), ctx.json({}));
      }),
    );

    const collator = await factory.getCollator();
    const pipeline = TestPipeline.fromCollator(collator);
    await pipeline.execute();
    const expectedSearch = {
      limit: '1000',
      status: 'current',
      expand: 'version',
      cql: 'type IN (page, blogpost, comment, attachment)',
    };
    testSearchQuery(request, expectedSearch);
  });

  it('combines values from `spaces` & `query` when both are present in config', async () => {
    const configWithQuery = new ConfigReader({
      confluence: {
        baseUrl: BASE_URL,
        auth: {
          type: 'basic',
          token: 'AA',
          email: 'user@example.com',
        },
        spaces: ['SPACE1', 'SPACE2'],
        query: 'type = page',
      },
    });
    const factoryWithConfig = ConfluenceCollatorFactory.fromConfig(
      configWithQuery,
      options,
    );
    let request;
    worker.use(
      rest.get(BASE_URL + CONFLUENCE_API_PATH, (req, res, ctx) => {
        request = req;

        return res(ctx.status(200), ctx.json({}));
      }),
    );

    const collator = await factoryWithConfig.getCollator();
    const pipeline = TestPipeline.fromCollator(collator);
    await pipeline.execute();
    const expectedSearch = {
      limit: '1000',
      status: 'current',
      expand: 'version',
      cql: '(space="SPACE1" or space="SPACE2") and (type = page)',
    };
    testSearchQuery(request, expectedSearch);
  });

  it('uses only spaces when only spaces is present in config', async () => {
    const configWithSpacesOnly = new ConfigReader({
      confluence: {
        baseUrl: BASE_URL,
        auth: {
          type: 'basic',
          token: 'AA',
          email: 'user@example.com',
        },
        spaces: ['SPACE1', 'SPACE2'],
      },
    });
    const factoryWithConfig = ConfluenceCollatorFactory.fromConfig(
      configWithSpacesOnly,
      options,
    );
    let request;
    worker.use(
      rest.get(BASE_URL + CONFLUENCE_API_PATH, (req, res, ctx) => {
        request = req;
        return res(ctx.status(200), ctx.json({}));
      }),
    );

    const collator = await factoryWithConfig.getCollator();
    const pipeline = TestPipeline.fromCollator(collator);
    await pipeline.execute();
    const expectedSearch = {
      limit: '1000',
      status: 'current',
      cql: 'space="SPACE1" or space="SPACE2"',
      expand: 'version',
    };
    testSearchQuery(request, expectedSearch);
  });

  it('uses only query when only query is present in config', async () => {
    const configWithQueryOnly = new ConfigReader({
      confluence: {
        baseUrl: BASE_URL,
        auth: {
          type: 'basic',
          token: 'AA',
          email: 'user@example.com',
        },
        query: 'type = page',
      },
    });
    const factoryWithConfig = ConfluenceCollatorFactory.fromConfig(
      configWithQueryOnly,
      options,
    );
    let request;
    worker.use(
      rest.get(BASE_URL + CONFLUENCE_API_PATH, (req, res, ctx) => {
        request = req;
        return res(ctx.status(200), ctx.json({}));
      }),
    );

    const collator = await factoryWithConfig.getCollator();
    const pipeline = TestPipeline.fromCollator(collator);
    await pipeline.execute();
    const expectedSearch = {
      limit: '1000',
      status: 'current',
      cql: 'type = page',
      expand: 'version',
    };
    testSearchQuery(request, expectedSearch);
  });
});
