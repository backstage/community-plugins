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
import express from 'express';
import request from 'supertest';
import { mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './router';
import type { GrowthbookClient } from './client';
import type { SdkFlagsSource } from './sdkSource';

const FLAG_ROWS = [
  { key: 'a', type: 'boolean' as const, valuePreview: 'true' },
];

function makeMgmt(
  overrides: Partial<Record<keyof GrowthbookClient, jest.Mock>> = {},
) {
  return {
    listProjects: jest
      .fn()
      .mockResolvedValue([{ id: 'prj_1', name: 'Checkout' }]),
    getFlags: jest.fn().mockResolvedValue(FLAG_ROWS),
    listExperiments: jest.fn().mockResolvedValue([]),
    getExperimentResults: jest.fn().mockResolvedValue(undefined),
    getFeature: jest.fn().mockResolvedValue(undefined),
    getStale: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function appFor(options: {
  mgmt?: ReturnType<typeof makeMgmt>;
  sdk?: SdkFlagsSource;
}) {
  const app = express();
  app.use(
    createRouter({
      logger: mockServices.logger.mock(),
      appUrl: 'https://gb.example.com',
      mgmt: options.mgmt as unknown as GrowthbookClient,
      sdk: options.sdk,
    }),
  );
  return app;
}

describe('router (management mode)', () => {
  it('lists project names', async () => {
    const res = await request(appFor({ mgmt: makeMgmt() })).get('/projects');
    expect(res.body).toEqual({ projects: ['Checkout'] });
  });

  it('returns flags for a known project (case-insensitive) and defaults env to prod', async () => {
    const mgmt = makeMgmt();
    const res = await request(appFor({ mgmt })).get('/flags?project=checkout');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(FLAG_ROWS);
    expect(mgmt.getFlags).toHaveBeenCalledWith('prod', 'prj_1');
  });

  it('rejects an unknown project with 400', async () => {
    const res = await request(appFor({ mgmt: makeMgmt() })).get(
      '/flags?project=nope',
    );
    expect(res.status).toBe(400);
  });

  it('returns 502 with a generic message when GrowthBook fails', async () => {
    const mgmt = makeMgmt({
      getFlags: jest.fn().mockRejectedValue(new Error('boom: secret detail')),
    });
    const res = await request(appFor({ mgmt })).get('/flags');
    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('secret detail');
  });

  it('answers non-GET methods with 405 and unknown paths with 404', async () => {
    const app = appFor({ mgmt: makeMgmt() });
    expect((await request(app).post('/flags')).status).toBe(405);
    expect((await request(app).get('/nope')).status).toBe(404);
  });

  it('returns normalized experiments for a project', async () => {
    const mgmt = makeMgmt({
      listExperiments: jest
        .fn()
        .mockResolvedValue([
          { id: 'exp_1', name: 'E', status: 'running', variations: [] },
        ]),
    });
    const res = await request(appFor({ mgmt })).get(
      '/experiments?project=Checkout',
    );
    expect(res.status).toBe(200);
    expect(mgmt.listExperiments).toHaveBeenCalledWith('prj_1');
    expect(res.body[0]).toMatchObject({
      id: 'exp_1',
      status: 'running',
      url: 'https://gb.example.com/experiment/exp_1',
    });
  });

  it('rejects experiments for an unknown project with 400', async () => {
    const res = await request(appFor({ mgmt: makeMgmt() })).get(
      '/experiments?project=nope',
    );
    expect(res.status).toBe(400);
  });

  it('returns results summary, and available:false when GrowthBook has none', async () => {
    const mgmt = makeMgmt({
      getExperimentResults: jest
        .fn()
        .mockResolvedValueOnce({
          experiment: {
            id: 'e',
            name: 'E',
            status: 'running',
            variations: [{ variationId: 'v0', key: '0', name: 'Control' }],
          },
          result: {
            results: [
              {
                metrics: [
                  {
                    metricId: 'm',
                    metricName: 'M',
                    variations: [{ variationId: 'v0', users: 5 }],
                  },
                ],
              },
            ],
          },
        })
        .mockResolvedValueOnce(undefined),
    });
    const app = appFor({ mgmt });
    const ok = await request(app).get('/experiments/e/results');
    expect(ok.body).toMatchObject({ available: true, metricName: 'M' });
    const none = await request(app).get('/experiments/e/results');
    expect(none.status).toBe(200);
    expect(none.body).toEqual({ available: false, variations: [] });
  });

  it('returns flag detail with stale status and 404 for unknown flags', async () => {
    const mgmt = makeMgmt({
      getFeature: jest
        .fn()
        .mockResolvedValueOnce({
          id: 'f',
          environments: { prod: { enabled: true, rules: [] } },
        })
        .mockResolvedValueOnce(undefined),
      getStale: jest
        .fn()
        .mockResolvedValue({ isStale: true, staleReason: 'no-rules' }),
    });
    const app = appFor({ mgmt });
    const ok = await request(app).get('/flags/f');
    expect(ok.body).toMatchObject({
      key: 'f',
      isStale: true,
      staleReason: 'no-rules',
    });
    expect((await request(app).get('/flags/missing')).status).toBe(404);
  });

  it('still returns flag detail when the stale lookup fails', async () => {
    const mgmt = makeMgmt({
      getFeature: jest.fn().mockResolvedValue({ id: 'f', environments: {} }),
      getStale: jest.fn().mockRejectedValue(new Error('stale down')),
    });
    const res = await request(appFor({ mgmt })).get('/flags/f');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ key: 'f', isStale: false });
  });

  it('decodes url-encoded flag keys', async () => {
    const mgmt = makeMgmt({
      getFeature: jest.fn().mockResolvedValue(undefined),
    });
    await request(appFor({ mgmt })).get('/flags/a%2Fb%20c');
    expect(mgmt.getFeature).toHaveBeenCalledWith('a/b c');
  });
});

describe('router (SDK mode)', () => {
  const sdk: SdkFlagsSource = {
    getFlags: jest.fn(async env => (env === 'prod' ? FLAG_ROWS : undefined)),
  };

  it('returns empty projects and SDK flags', async () => {
    const app = appFor({ sdk });
    expect((await request(app).get('/projects')).body).toEqual({
      projects: [],
    });
    expect((await request(app).get('/flags?env=prod')).body).toEqual(FLAG_ROWS);
  });

  it('rejects project filtering and unknown environments with 400', async () => {
    const app = appFor({ sdk });
    expect((await request(app).get('/flags?project=x')).status).toBe(400);
    expect((await request(app).get('/flags?env=nope')).status).toBe(400);
  });

  it.each(['/experiments', '/experiments/e/results', '/flags/f'])(
    '%s returns 501',
    async path => {
      const res = await request(appFor({ sdk })).get(path);
      expect(res.status).toBe(501);
      expect(res.body.error).toMatch(/secretKey/);
    },
  );
});
