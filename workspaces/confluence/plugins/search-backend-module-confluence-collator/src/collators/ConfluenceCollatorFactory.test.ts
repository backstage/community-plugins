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

const documentStub = (id: string) => ({
  id,
  title: `Document ${id}`,
  status: 'current',
  _links: { base: BASE_URL, webui: `/wiki/${id}` },
  body: { storage: { value: `<p>Body ${id}</p>` } },
  version: {
    by: { publicName: 'Author' },
    when: '2025-01-01T00:00:00.000Z',
    friendlyWhen: 'January 1st, 2025',
  },
  space: {
    key: 'SPACE',
    name: 'Space',
    _links: { webui: '/wiki/space' },
  },
  ancestors: [],
});

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
      default: {
        baseUrl: BASE_URL,
        auth: {
          type: 'basic',
          token: 'AA',
          email: 'user@example.com',
        },
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
        default: {
          baseUrl: BASE_URL,
          auth: {
            type: 'basic',
            token: 'AA',
          },
        },
      },
    });
    expect(() =>
      ConfluenceCollatorFactory.fromConfig(malformedBasicAuthConfig, options),
    ).toThrow();

    // missing password
    const malformedUserpassAuthConfig = new ConfigReader({
      confluence: {
        default: {
          baseUrl: BASE_URL,
          auth: {
            type: 'userpass',
            username: 'user',
          },
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
        default: {
          baseUrl: BASE_URL,
          auth: {
            type: 'bearer',
          },
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
      cql: 'type IN (page, blogpost, comment, attachment)',
    };
    testSearchQuery(request, expectedSearch);
  });

  it('combines values from `spaces` & `query` when both are present in config', async () => {
    const configWithQuery = new ConfigReader({
      confluence: {
        default: {
          baseUrl: BASE_URL,
          auth: {
            type: 'basic',
            token: 'AA',
            email: 'user@example.com',
          },
          spaces: ['SPACE1', 'SPACE2'],
          query: 'type = page',
        },
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
      cql: '(space="SPACE1" or space="SPACE2") and (type = page)',
    };
    testSearchQuery(request, expectedSearch);
  });

  it('uses only spaces when only spaces is present in config', async () => {
    const configWithSpacesOnly = new ConfigReader({
      confluence: {
        default: {
          baseUrl: BASE_URL,
          auth: {
            type: 'basic',
            token: 'AA',
            email: 'user@example.com',
          },
          spaces: ['SPACE1', 'SPACE2'],
        },
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
    };
    testSearchQuery(request, expectedSearch);
  });

  it('uses only query when only query is present in config', async () => {
    const configWithQueryOnly = new ConfigReader({
      confluence: {
        default: {
          baseUrl: BASE_URL,
          auth: {
            type: 'basic',
            token: 'AA',
            email: 'user@example.com',
          },
          query: '() and (type = page)',
        },
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
      cql: '() and (type = page)',
    };
    testSearchQuery(request, expectedSearch);
  });

  it('loads each page of search results into the database as it is fetched, rather than waiting for all pages', async () => {
    // Page 2's search request never resolves. If the collator buffered the
    // full multi-page document list before yielding anything (the bug being
    // guarded against here), page 1's document would never be yielded either.
    worker.use(
      rest.get(BASE_URL + CONFLUENCE_API_PATH, (req, res, ctx) => {
        if (req.url.searchParams.get('cursor') === 'page2') {
          return new Promise(() => {});
        }

        return res(
          ctx.status(200),
          ctx.json({
            results: [{ id: '1' }],
            _links: { next: `${CONFLUENCE_API_PATH}?cursor=page2` },
          }),
        );
      }),
      rest.get(`${BASE_URL}/rest/api/content/:id`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json(documentStub(req.params.id as string)),
        );
      }),
    );

    const collator = await factory.getCollator();

    const firstDocument = await new Promise((resolve, reject) => {
      collator.on('data', resolve);
      collator.on('error', reject);
    });
    collator.destroy();

    expect(firstDocument).toMatchObject({ title: 'Document 1' });
  });

  it('keeps fetching documents up to the parallelism limit across a page boundary, instead of draining to zero between pages', async () => {
    const configWithLowParallelism = new ConfigReader({
      confluence: {
        default: {
          baseUrl: BASE_URL,
          auth: {
            type: 'basic',
            token: 'AA',
            email: 'user@example.com',
          },
          parallelismLimit: 3,
        },
      },
    });
    const factoryWithLowParallelism = ConfluenceCollatorFactory.fromConfig(
      configWithLowParallelism,
      options,
    );

    // Page 1 has 2 documents whose detail fetch never resolves during the
    // assertion window, so they permanently occupy 2 of the 3 parallelism
    // slots. Page 2 has 1 document that resolves immediately.
    const slowDocumentIds = ['1', '2'];
    const fastDocumentId = '3';
    let fastDocumentFetched = false;

    worker.use(
      rest.get(BASE_URL + CONFLUENCE_API_PATH, (req, res, ctx) => {
        if (req.url.searchParams.get('cursor') === 'page2') {
          return res(
            ctx.status(200),
            ctx.json({ results: [{ id: fastDocumentId }], _links: {} }),
          );
        }

        return res(
          ctx.status(200),
          ctx.json({
            results: slowDocumentIds.map(id => ({ id })),
            _links: { next: `${CONFLUENCE_API_PATH}?cursor=page2` },
          }),
        );
      }),
      rest.get(`${BASE_URL}/rest/api/content/:id`, (req, res, ctx) => {
        const id = req.params.id as string;
        if (slowDocumentIds.includes(id)) {
          // Never resolves within the test: proves whether the fast
          // document on page 2 can still be fetched concurrently.
          return new Promise(() => {});
        }

        fastDocumentFetched = true;
        return res(ctx.status(200), ctx.json(documentStub(id)));
      }),
    );

    const collator = await factoryWithLowParallelism.getCollator();
    collator.on('data', () => {});
    collator.resume();

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(fastDocumentFetched).toBe(true);
  });

  it('never fetches more documents concurrently than the configured parallelism limit', async () => {
    const parallelismLimit = 2;
    const configWithLowParallelism = new ConfigReader({
      confluence: {
        default: {
          baseUrl: BASE_URL,
          auth: {
            type: 'basic',
            token: 'AA',
            email: 'user@example.com',
          },
          parallelismLimit,
        },
      },
    });
    const factoryWithLowParallelism = ConfluenceCollatorFactory.fromConfig(
      configWithLowParallelism,
      options,
    );

    const documentIds = ['1', '2', '3', '4', '5'];
    let inFlightCount = 0;
    let maxInFlightCount = 0;
    const releaseFns = new Map<string, () => void>();

    worker.use(
      rest.get(BASE_URL + CONFLUENCE_API_PATH, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            results: documentIds.map(id => ({ id })),
            _links: {},
          }),
        );
      }),
      rest.get(`${BASE_URL}/rest/api/content/:id`, (req, res, ctx) => {
        const id = req.params.id as string;

        inFlightCount += 1;
        maxInFlightCount = Math.max(maxInFlightCount, inFlightCount);

        return new Promise(resolve => {
          releaseFns.set(id, () => {
            inFlightCount -= 1;
            resolve(res(ctx.status(200), ctx.json(documentStub(id))));
          });
        });
      }),
    );

    const collator = await factoryWithLowParallelism.getCollator();
    collator.on('data', () => {});
    collator.resume();

    // Wait for the initial batch of requests to be dispatched, then release
    // them one at a time, giving each release a turn to let a queued
    // document take the freed slot before observing the high-water mark.
    for (let i = 0; i < documentIds.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      const nextToRelease = [...releaseFns.keys()][0];
      if (nextToRelease) {
        releaseFns.get(nextToRelease)!();
        releaseFns.delete(nextToRelease);
      }
    }

    await new Promise<void>((resolve, reject) => {
      collator.on('end', resolve);
      collator.on('error', reject);
    });

    expect(maxInFlightCount).toBeLessThanOrEqual(parallelismLimit);
    expect(maxInFlightCount).toBe(parallelismLimit);
  });

  it('does not raise an unhandled promise rejection when a prefetched page fails while the current page is still being processed', async () => {
    let releaseSlowDocument: (() => void) | undefined;

    worker.use(
      rest.get(BASE_URL + CONFLUENCE_API_PATH, (req, res, ctx) => {
        if (req.url.searchParams.get('cursor') === 'page2') {
          return res(ctx.status(500), ctx.text('boom'));
        }

        return res(
          ctx.status(200),
          ctx.json({
            results: [{ id: '1' }],
            _links: { next: `${CONFLUENCE_API_PATH}?cursor=page2` },
          }),
        );
      }),
      rest.get(`${BASE_URL}/rest/api/content/:id`, (req, res, ctx) => {
        return new Promise(resolve => {
          releaseSlowDocument = () =>
            resolve(
              res(
                ctx.status(200),
                ctx.json(documentStub(req.params.id as string)),
              ),
            );
        });
      }),
    );

    const unhandledRejections: unknown[] = [];
    const onUnhandledRejection = (reason: unknown) => {
      unhandledRejections.push(reason);
    };
    process.on('unhandledRejection', onUnhandledRejection);

    try {
      const collator = await factory.getCollator();
      collator.on('data', () => {});
      collator.resume();

      // Give the (rejecting) page-2 prefetch time to settle while page 1's
      // document fetch is still deliberately held open, then release it and
      // let the stream finish. If the rejection was ever truly unhandled,
      // Node will have already flagged it during this wait.
      await new Promise(resolve => setTimeout(resolve, 50));
      releaseSlowDocument?.();

      await new Promise<void>(resolve => {
        collator.on('end', resolve);
        collator.on('error', () => resolve());
      });
    } finally {
      process.off('unhandledRejection', onUnhandledRejection);
    }

    expect(unhandledRejections).toEqual([]);
  });
});
