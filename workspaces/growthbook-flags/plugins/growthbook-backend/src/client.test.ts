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
import { GrowthbookApiError, GrowthbookClient } from './client';
import { createSdkFlagsSource } from './sdkSource';

type Call = { url: string; auth?: string };

function fakeFetch(
  responder: (url: string) => { status?: number; body?: unknown },
) {
  const calls: Call[] = [];
  const fetchFn = jest.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({
        url,
        auth: (init?.headers as Record<string, string> | undefined)
          ?.Authorization,
      });
      const { status = 200, body = {} } = responder(url);
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
      } as Response;
    },
  );
  return { fetchFn: fetchFn as unknown as typeof fetch, calls };
}

const make = (
  responder: Parameters<typeof fakeFetch>[0],
  now: () => number = () => 0,
) => {
  const f = fakeFetch(responder);
  const client = new GrowthbookClient({
    baseUrl: 'https://gb.example.com',
    secretKey: 'secret_abc',
    fetchFn: f.fetchFn,
    now,
  });
  return { client, ...f };
};

describe('GrowthbookClient', () => {
  it('sends the secret key as a bearer token', async () => {
    const { client, calls } = make(() => ({ body: { projects: [] } }));
    await client.listProjects();
    expect(calls[0].auth).toBe('Bearer secret_abc');
  });

  it('throws GrowthbookApiError with the status on failure', async () => {
    const { client } = make(() => ({ status: 500 }));
    await expect(client.listProjects()).rejects.toMatchObject({
      name: 'GrowthbookApiError',
      status: 500,
    });
    await expect(client.listProjects()).rejects.toBeInstanceOf(
      GrowthbookApiError,
    );
  });

  it('caches projects within the TTL and refetches after it', async () => {
    let t = 0;
    const { client, fetchFn } = make(
      () => ({ body: { projects: [{ id: 'p1', name: 'P' }] } }),
      () => t,
    );
    await client.listProjects();
    t = 299_000;
    await client.listProjects();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    t = 301_000;
    await client.listProjects();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('paginates features and filters flags by project id', async () => {
    const { client, calls } = make(url => {
      const offset = new URL(url).searchParams.get('offset');
      return offset === '0'
        ? {
            body: {
              features: [
                {
                  id: 'a',
                  project: 'p1',
                  valueType: 'boolean',
                  defaultValue: 'true',
                  environments: {},
                },
              ],
              hasMore: true,
              nextOffset: 100,
            },
          }
        : {
            body: {
              features: [
                {
                  id: 'b',
                  project: 'p2',
                  valueType: 'boolean',
                  defaultValue: 'false',
                  environments: {},
                },
              ],
              hasMore: false,
              nextOffset: null,
            },
          };
    });
    const flags = await client.getFlags('prod', 'p1');
    expect(flags.map(f => f.key)).toEqual(['a']);
    expect(calls).toHaveLength(2);
    expect(await client.getFlags('prod')).toHaveLength(2);
  });

  it('lists experiments with the project filter, excluding archived, across pages', async () => {
    const { client, calls } = make(url => {
      const offset = new URL(url).searchParams.get('offset');
      return offset === '0'
        ? {
            body: {
              experiments: [{ id: 'e1' }],
              hasMore: true,
              nextOffset: 100,
            },
          }
        : {
            body: {
              experiments: [{ id: 'e2' }],
              hasMore: false,
              nextOffset: null,
            },
          };
    });
    const experiments = await client.listExperiments('prj 1');
    expect(experiments.map(e => e.id)).toEqual(['e1', 'e2']);
    const first = new URL(calls[0].url);
    expect(first.pathname).toBe('/api/v1/experiments');
    expect(first.searchParams.get('projectId')).toBe('prj 1');
    expect(first.searchParams.get('archived')).toBe('false');
    expect(first.searchParams.get('limit')).toBe('100');
  });

  it('omits projectId when listing experiments without a project', async () => {
    const { client, calls } = make(() => ({
      body: { experiments: [], hasMore: false },
    }));
    await client.listExperiments();
    expect(new URL(calls[0].url).searchParams.has('projectId')).toBe(false);
  });

  it('returns undefined on 404 for results, feature and stale lookups', async () => {
    const { client } = make(() => ({ status: 404 }));
    expect(await client.getExperimentResults('x')).toBeUndefined();
    expect(await client.getFeature('x')).toBeUndefined();
    expect(await client.getStale('x')).toBeUndefined();
  });

  it('url-encodes ids in paths and query strings', async () => {
    const { client, calls } = make(url =>
      url.includes('stale-features')
        ? { body: { features: {} } }
        : { body: { feature: { id: 'a/b' }, experiment: {}, result: {} } },
    );
    await client.getFeature('a/b c');
    await client.getExperimentResults('e/1');
    await client.getStale('a/b c');
    expect(calls[0].url).toBe(
      'https://gb.example.com/api/v1/features/a%2Fb%20c',
    );
    expect(calls[1].url).toBe(
      'https://gb.example.com/api/v1/experiments/e%2F1/results',
    );
    expect(calls[2].url).toBe(
      'https://gb.example.com/api/v2/stale-features?ids=a%2Fb%20c',
    );
  });

  it('returns the stale entry for the requested feature', async () => {
    const { client } = make(() => ({
      body: {
        features: {
          f: { featureId: 'f', isStale: true, staleReason: 'no-rules' },
        },
      },
    }));
    expect(await client.getStale('f')).toMatchObject({
      isStale: true,
      staleReason: 'no-rules',
    });
  });
});

describe('GrowthbookClient cache limits', () => {
  const resultsBody = { experiment: {}, result: {} };
  const responder = (url: string) =>
    url.includes('/api/v1/projects')
      ? { body: { projects: [{ id: 'p1', name: 'P' }] } }
      : { body: resultsBody };

  it('keeps projects cached after the cache fills with per-id lookups', async () => {
    const { client, calls } = make(responder);
    for (let i = 0; i < 200; i++) {
      await client.getExperimentResults(`exp_${i}`);
    }
    await client.listProjects();
    await client.listProjects();
    expect(calls.filter(c => c.url.includes('/projects'))).toHaveLength(1);
  });

  it('evicts expired entries to make room when the cache is full', async () => {
    let t = 0;
    const { client, calls } = make(responder, () => t);
    for (let i = 0; i < 200; i++) {
      await client.getExperimentResults(`exp_${i}`);
    }
    t = 61_000;
    await client.getExperimentResults('fresh');
    await client.getExperimentResults('fresh');
    expect(calls.filter(c => c.url.includes('/exp')).length).toBe(201);
  });

  it('does not cache misses', async () => {
    let status = 404;
    const { client, fetchFn } = make(() =>
      status === 404 ? { status } : { body: { feature: { id: 'f' } } },
    );
    expect(await client.getFeature('f')).toBeUndefined();
    status = 200;
    expect(await client.getFeature('f')).toEqual({ id: 'f' });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});

describe('GrowthbookClient results without a snapshot', () => {
  it.each([400, 404])(
    'treats %s from the results endpoint as no results',
    async status => {
      const { client } = make(() => ({ status }));
      expect(await client.getExperimentResults('draft_1')).toBeUndefined();
    },
  );

  it('still throws on server errors', async () => {
    const { client } = make(() => ({ status: 500 }));
    await expect(client.getExperimentResults('x')).rejects.toMatchObject({
      status: 500,
    });
  });
});

describe('GrowthbookClient pagination safety', () => {
  it('fails instead of looping when nextOffset does not advance', async () => {
    let calls = 0;
    const { client } = make(() => {
      calls += 1;
      // Cap the fake server so unfixed code fails the assertion, not the runner.
      return calls > 50
        ? { body: { experiments: [], hasMore: false } }
        : {
            body: {
              experiments: [{ id: 'e' }],
              hasMore: true,
              nextOffset: 0,
            },
          };
    });
    await expect(client.listExperiments()).rejects.toThrow(/did not advance/);
    expect(calls).toBe(1);
  });
});

describe('createSdkFlagsSource', () => {
  it('returns undefined for an unknown environment without fetching', async () => {
    const { fetchFn } = fakeFetch(() => ({}));
    const source = createSdkFlagsSource({
      baseUrl: 'https://gb',
      resolveKey: () => undefined,
      fetchFn,
    });
    expect(await source.getFlags('nope')).toBeUndefined();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('fetches, normalizes and caches SDK flags', async () => {
    const { fetchFn, calls } = fakeFetch(() => ({
      body: {
        features: { b: { defaultValue: true }, a: { defaultValue: 'x' } },
      },
    }));
    const source = createSdkFlagsSource({
      baseUrl: 'https://gb',
      resolveKey: env => (env === 'prod' ? 'sdk-1' : undefined),
      fetchFn,
      now: () => 0,
    });
    const flags = await source.getFlags('prod');
    expect(flags?.map(f => f.key)).toEqual(['a', 'b']);
    await source.getFlags('prod');
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://gb/api/features/sdk-1');
    expect(calls[0].auth).toBeUndefined();
  });
});
