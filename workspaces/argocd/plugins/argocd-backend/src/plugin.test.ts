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
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import request from 'supertest';
import { argoCDPlugin } from './plugin';

const config = mockServices.rootConfig.factory({
  data: {
    argocd: {
      appLocatorMethods: [
        {
          type: 'config',
          instances: [
            {
              name: 'test-instance',
              url: 'https://argocd.example.com',
              token: 'test-token',
            },
          ],
        },
      ],
    },
  },
});

const EXPECTED_ACTION_IDS = [
  'backstage-community-argocd:create-resources',
  'backstage-community-argocd:argocd:find-applications',
  'backstage-community-argocd:argocd:get-application',
  'backstage-community-argocd:argocd:get-revision-details',
  'backstage-community-argocd:argocd:list-applications',
];

function permissionsFactory(
  result: AuthorizeResult.ALLOW | AuthorizeResult.DENY,
) {
  return mockServices.permissions.mock({
    authorize: async requests => requests.map(() => ({ result })),
  }).factory;
}

describe('argoCDPlugin', () => {
  it('should mount the router and return 200 on /check when allowed', async () => {
    const { server } = await startTestBackend({
      features: [
        argoCDPlugin,
        config,
        permissionsFactory(AuthorizeResult.ALLOW),
      ],
    });

    const response = await request(server).get(
      '/api/backstage-community-argocd/check',
    );

    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });

  it('should return 403 on /check when argocd.view.read is denied', async () => {
    const { server } = await startTestBackend({
      features: [
        argoCDPlugin,
        config,
        permissionsFactory(AuthorizeResult.DENY),
      ],
    });

    const response = await request(server).get(
      '/api/backstage-community-argocd/check',
    );

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'Unauthorized, please ensure you have the correct permissions',
    });
  });

  it('should register the expected Actions API action IDs', async () => {
    const { server } = await startTestBackend({
      features: [
        argoCDPlugin,
        config,
        permissionsFactory(AuthorizeResult.ALLOW),
      ],
    });

    const response = await request(server).get(
      '/api/backstage-community-argocd/.backstage/actions/v1/actions',
    );

    expect(response.status).toBe(200);
    expect(
      response.body.actions.map((a: { id: string }) => a.id).sort(),
    ).toEqual([...EXPECTED_ACTION_IDS].sort());
  });
});
