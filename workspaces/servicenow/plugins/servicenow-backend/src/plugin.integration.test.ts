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

import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import request from 'supertest';

import { servicenowPlugin } from './plugin';

const validServiceNowConfig = {
  servicenow: {
    instanceUrl: 'https://example.service-now.com',
    basicAuth: {
      username: 'test-user',
      password: 'test-password',
    },
  },
};

describe('servicenowPlugin integration', () => {
  it('should mount the router and return 200 on /health with valid config', async () => {
    const { server } = await startTestBackend({
      features: [
        servicenowPlugin,
        mockServices.rootConfig.factory({ data: validServiceNowConfig }),
        mockServices.httpAuth.factory(),
      ],
    });

    const response = await request(server).get('/api/servicenow/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should not mount the router when servicenow config is missing', async () => {
    const { server } = await startTestBackend({
      features: [
        servicenowPlugin,
        mockServices.rootConfig.factory({ data: {} }),
        mockServices.httpAuth.factory(),
      ],
    });

    const response = await request(server).get('/api/servicenow/health');

    expect(response.status).toBe(404);
  });
});
