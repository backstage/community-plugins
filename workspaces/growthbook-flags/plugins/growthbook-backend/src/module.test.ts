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
import growthbookFlagsPlugin from './module';

const BASE = '/api/backstage-community-growthbook';

const backendFor = (growthbook: object) =>
  startTestBackend({
    features: [
      growthbookFlagsPlugin,
      mockServices.rootConfig.factory({ data: { growthbook } }),
    ],
  });

describe('growthbookFlagsPlugin', () => {
  it('serves the management routes when secretKey is configured', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ projects: [{ id: 'p1', name: 'Checkout' }] }),
    } as Response);
    try {
      const { server } = await backendFor({
        baseUrl: 'https://gb.example.com/',
        secretKey: 'secret_abc',
      });
      const res = await request(server).get(`${BASE}/projects`);
      expect(res.body).toEqual({ projects: ['Checkout'] });
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://gb.example.com/api/v1/projects?limit=100',
        { headers: { Authorization: 'Bearer secret_abc' } },
      );
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('serves the SDK router when only sdkKeys are configured', async () => {
    const { server } = await backendFor({
      baseUrl: 'https://gb.example.com',
      sdkKeys: { prod: 'sdk-1' },
    });
    expect((await request(server).get(`${BASE}/projects`)).body).toEqual({
      projects: [],
    });
    const res = await request(server).get(`${BASE}/experiments`);
    expect(res.status).toBe(501);
  });

  it('fails to start without secretKey or sdkKeys', async () => {
    await expect(
      backendFor({ baseUrl: 'https://gb.example.com' }),
    ).rejects.toThrow(/secretKey or growthbook.sdkKeys/);
  });
});
