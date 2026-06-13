/*
 * Copyright 2024 The Backstage Authors
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

import { createRouter } from './router';
import express from 'express';
import request from 'supertest';
import { ConfigReader } from '@backstage/config';
import { mockServices } from '@backstage/backend-test-utils';

const mockConfig = new ConfigReader({
  devlake: {
    db: {
      host: 'localhost',
      port: 5432,
      user: 'test',
      password: 'test',
      database: 'devlake_test',
    },
    teams: [
      {
        name: 'Team Alpha',
        devlakeProjectName: 'project-alpha',
      },
    ],
  },
});

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: mockConfig,
    });
    app = express().use(router);
  });

  it('returns health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns configured teams', async () => {
    const response = await request(app).get('/teams');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { name: 'All', devlakeProjectName: '__all__' },
      { name: 'Team Alpha', devlakeProjectName: 'project-alpha' },
    ]);
  });

  it('returns 400 when team param is missing', async () => {
    const response = await request(app).get('/dora/metrics');
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Missing required query param');
  });

  it('returns 404 for unknown team', async () => {
    const response = await request(app).get(
      '/dora/metrics?team=Unknown%20Team',
    );
    expect(response.status).toBe(404);
    expect(response.body.error).toContain('not found in configuration');
  });
});
