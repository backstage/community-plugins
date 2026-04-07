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
import request from 'supertest';
import express from 'express';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './router';
import { CatalogClient } from '@backstage/catalog-client';
import type { Entity } from '@backstage/catalog-model';
import { PatchStore } from './PatchStore';

jest.mock('@backstage/catalog-client');
jest.mock('./PatchStore');

const mockStore = {
  findByEntityRef: jest.fn().mockResolvedValue({}),
  getLatestUpdatedAt: jest.fn().mockResolvedValue(null),
  upsert: jest.fn().mockResolvedValue(undefined),
};
(PatchStore.create as jest.Mock) = jest.fn().mockResolvedValue(mockStore);

const paymentsApi: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'payments-api',
    namespace: 'default',
    description: 'Handles payment processing',
    annotations: { 'slack/channel': '#payments' },
  },
  spec: { type: 'service', lifecycle: 'production' },
};

const mockConfig = {
  entityPatch: {
    patches: [
      {
        name: 'component-metadata',
        filter: { kind: 'component' },
        mapping: {
          description: 'metadata.description',
          slackChannel: 'metadata.annotations.slack/channel',
        },
        sections: [
          { title: 'Info', properties: { description: { type: 'string' } } },
        ],
      },
    ],
  },
};

async function buildApp() {
  const router = await createRouter({
    logger: mockServices.logger.mock(),
    database: mockServices.database.mock(),
    httpAuth: mockServices.httpAuth(),
    auth: mockServices.auth(),
    userInfo: mockServices.userInfo(),
    discovery: mockServices.discovery(),
    config: mockServices.rootConfig({ data: mockConfig }),
  });
  const app = express();
  app.use(express.json());
  app.use(router);
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(500).json({ error: err?.message ?? String(err) });
  });
  return app;
}

describe('GET /health', () => {
  it('returns status ok', async () => {
    const app = await buildApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /values/:namespace/:kind/:name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.findByEntityRef.mockResolvedValue({});
    mockStore.getLatestUpdatedAt.mockResolvedValue(null);
  });

  it('returns raw DB data only when fillFromEntity param is absent', async () => {
    mockStore.findByEntityRef.mockResolvedValueOnce({
      'component-metadata': { description: 'stored description' },
    });

    const getEntityByRef = jest.fn();
    (CatalogClient as jest.Mock).mockImplementation(() => ({ getEntityByRef }));

    const app = await buildApp();
    const res = await request(app)
      .get('/values/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      'component-metadata': { description: 'stored description' },
    });
    // No catalog lookup in raw mode
    expect(getEntityByRef).not.toHaveBeenCalled();
  });

  it('includes an ETag header in raw mode based on latest updated_at', async () => {
    mockStore.getLatestUpdatedAt.mockResolvedValueOnce(
      '2026-01-01T00:00:00.000Z',
    );
    (CatalogClient as jest.Mock).mockImplementation(() => ({}));

    const app = await buildApp();
    const res = await request(app)
      .get('/values/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header());

    expect(res.status).toBe(200);
    expect(res.headers.etag).toBeDefined();
    // ETag is a quoted base64 of the timestamp
    expect(res.headers.etag).toMatch(/^"[A-Za-z0-9+/=]+"$/);
  });

  it('returns 304 when If-None-Match matches the current ETag', async () => {
    const timestamp = '2026-01-01T00:00:00.000Z';
    mockStore.getLatestUpdatedAt.mockResolvedValue(timestamp);
    (CatalogClient as jest.Mock).mockImplementation(() => ({}));

    const app = await buildApp();

    // First request to get the ETag
    const first = await request(app)
      .get('/values/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header());
    const etag = first.headers.etag;

    // Second request with matching If-None-Match
    const second = await request(app)
      .get('/values/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header())
      .set('If-None-Match', etag);

    expect(second.status).toBe(304);
    expect(second.text).toBe('');
  });

  it('returns 200 with data when If-None-Match does not match', async () => {
    mockStore.getLatestUpdatedAt.mockResolvedValue('2026-01-01T00:00:00.000Z');
    mockStore.findByEntityRef.mockResolvedValue({
      'component-metadata': { description: 'fresh data' },
    });
    (CatalogClient as jest.Mock).mockImplementation(() => ({}));

    const app = await buildApp();
    const res = await request(app)
      .get('/values/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header())
      .set('If-None-Match', '"stale-etag"');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      'component-metadata': { description: 'fresh data' },
    });
  });

  it('returns catalog values merged with empty DB overlay when entity exists', async () => {
    (CatalogClient as jest.Mock).mockImplementation(() => ({
      getEntityByRef: jest.fn().mockResolvedValue(paymentsApi),
    }));

    const app = await buildApp();
    const res = await request(app)
      .get('/values/default/component/payments-api?fillFromEntity=true')
      .set('Authorization', mockCredentials.user.header());
    expect(res.status).toBe(200);
    expect(res.body['component-metadata']).toMatchObject({
      description: 'Handles payment processing',
      slackChannel: '#payments',
    });
  });

  it('returns 404 when entity is not found in catalog', async () => {
    (CatalogClient as jest.Mock).mockImplementation(() => ({
      getEntityByRef: jest.fn().mockResolvedValue(null),
    }));

    const app = await buildApp();
    const res = await request(app)
      .get('/values/default/component/unknown?fillFromEntity=true')
      .set('Authorization', mockCredentials.user.header());

    expect(res.status).toBe(404);
  });

  it('only returns patches whose filter.kind matches the entity kind', async () => {
    const guestsGroup: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: 'guests', namespace: 'default' },
      spec: { type: 'team', profile: {} },
    };

    (CatalogClient as jest.Mock).mockImplementation(() => ({
      getEntityByRef: jest.fn().mockResolvedValue(guestsGroup),
    }));

    // Config with both a component patch and a group patch
    const configWithBoth = {
      entityPatch: {
        patches: [
          {
            name: 'component-metadata',
            filter: { kind: 'component' },
            mapping: { description: 'metadata.description' },
            sections: [{ title: 'Info', properties: {} }],
          },
          {
            name: 'group-details',
            filter: { kind: 'group' },
            mapping: { description: 'metadata.description' },
            sections: [{ title: 'Team', properties: {} }],
          },
        ],
      },
    };

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      database: mockServices.database.mock(),
      httpAuth: mockServices.httpAuth(),
      auth: mockServices.auth(),
      userInfo: mockServices.userInfo(),
      discovery: mockServices.discovery(),
      config: mockServices.rootConfig({ data: configWithBoth }),
    });
    const app = express();
    app.use(express.json());
    app.use(router);

    const res = await request(app)
      .get('/values/default/group/guests?fillFromEntity=true')
      .set('Authorization', mockCredentials.user.header());

    expect(res.status).toBe(200);
    // Only the group patch should appear — component patch must be absent
    expect(res.body).toHaveProperty('group-details');
    expect(res.body).not.toHaveProperty('component-metadata');
  });
});

describe('POST /patches/:namespace/:kind/:name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CatalogClient as jest.Mock).mockImplementation(() => ({
      refreshEntity: jest.fn().mockResolvedValue(undefined),
    }));
  });

  it('stores patch data and returns 200 for a valid body', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/patches/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header())
      .send({
        patchName: 'component-metadata',
        data: { description: 'New desc' },
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('triggers a catalog entity refresh after saving the patch', async () => {
    const refreshEntity = jest.fn().mockResolvedValue(undefined);
    (CatalogClient as jest.Mock).mockImplementation(() => ({ refreshEntity }));

    const app = await buildApp();
    await request(app)
      .post('/patches/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header())
      .send({ patchName: 'component-metadata', data: { description: 'New' } });

    // Allow the fire-and-forget promise to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(refreshEntity).toHaveBeenCalledWith(
      'component:default/payments-api',
      expect.objectContaining({ token: expect.any(String) }),
    );
  });

  it('returns 400 for a body missing patchName', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/patches/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header())
      .send({ data: { description: 'New desc' } });

    expect(res.status).toBe(400);
  });
});
