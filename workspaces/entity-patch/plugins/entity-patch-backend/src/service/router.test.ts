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
  });

  it('returns catalog values merged with empty DB overlay when entity exists', async () => {
    (CatalogClient as jest.Mock).mockImplementation(() => ({
      getEntityByRef: jest.fn().mockResolvedValue(paymentsApi),
    }));

    const app = await buildApp();
    const res = await request(app)
      .get('/values/default/component/payments-api')
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
      .get('/values/default/component/unknown')
      .set('Authorization', mockCredentials.user.header());

    expect(res.status).toBe(404);
  });
});

describe('POST /patches/:namespace/:kind/:name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CatalogClient as jest.Mock).mockImplementation(() => ({}));
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

  it('returns 400 for a body missing patchName', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/patches/default/component/payments-api')
      .set('Authorization', mockCredentials.user.header())
      .send({ data: { description: 'New desc' } });

    expect(res.status).toBe(400);
  });
});
