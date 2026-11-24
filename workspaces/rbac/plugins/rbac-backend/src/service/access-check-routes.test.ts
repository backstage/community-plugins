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
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { mockServices } from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import express from 'express';
import Router from 'express-promise-router';
import request from 'supertest';

import {
  mockAuditorService,
  mockAuthService,
  mockedAuthorizeConditional,
  mockHttpAuth,
  mockPermissionEvaluator,
  pluginMetadataCollectorMock,
} from '../../__fixtures__/mock-utils';
import { AccessCheckService } from './access-check';
import { registerAccessCheckRoutes } from './access-check-routes';

describe('REST access check API', () => {
  let app: express.Express;

  const checkAccessMock = jest.fn();
  const accessCheckMock = {
    checkAccess: checkAccessMock,
  };

  const pluginPolicies = [
    {
      pluginId: 'catalog',
      policies: [
        {
          name: 'catalog.entity.read',
          resourceType: 'catalog-entity',
          policy: 'read',
        },
      ],
    },
  ];

  beforeEach(async () => {
    const router = Router();
    router.use(express.json());

    registerAccessCheckRoutes(
      router,
      accessCheckMock as unknown as AccessCheckService,
      pluginMetadataCollectorMock as any,
      {
        auth: mockAuthService,
        httpAuth: mockHttpAuth,
        auditor: mockAuditorService,
        permissions: mockPermissionEvaluator,
      },
    );

    const middleware = MiddlewareFactory.create({
      logger: mockServices.logger.mock(),
      config: mockServices.rootConfig(),
    });
    router.use(middleware.error());

    app = express().use(router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('answers the check for a normalized user entity reference', async () => {
    const response = {
      userEntityRef: 'user:default/tom',
      isSuperUser: false,
      roles: [],
      decisions: [],
    };
    pluginMetadataCollectorMock.getPluginPolicies = jest
      .fn()
      .mockResolvedValue(pluginPolicies);
    checkAccessMock.mockResolvedValue(response);

    const result = await request(app)
      .get('/access-check?userEntityRef=user:default/Tom')
      .send();

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(response);
    // stored role members are lowercased, so the lookup is too
    expect(checkAccessMock).toHaveBeenCalledWith(
      'user:default/tom',
      pluginPolicies,
    );
    // the read is audited together with its query
    expect(mockAuditorService.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'access-check-read',
        meta: expect.objectContaining({
          query: { userEntityRef: 'user:default/Tom' },
        }),
      }),
    );
  });

  it('rejects a caller without read access', async () => {
    mockedAuthorizeConditional.mockImplementationOnce(async () => [
      { result: AuthorizeResult.DENY },
    ]);

    const result = await request(app)
      .get('/access-check?userEntityRef=user:default/tom')
      .send();

    expect(result.statusCode).toBe(403);
    expect(checkAccessMock).not.toHaveBeenCalled();
  });

  it('rejects a caller whose read access is scoped by conditions', async () => {
    mockedAuthorizeConditional.mockImplementationOnce(async () => [
      { result: AuthorizeResult.CONDITIONAL },
    ]);

    const result = await request(app)
      .get('/access-check?userEntityRef=user:default/tom')
      .send();

    expect(result.statusCode).toBe(403);
    expect(checkAccessMock).not.toHaveBeenCalled();
  });

  it('rejects a missing, repeated, malformed or non-user entity reference', async () => {
    const missing = await request(app).get('/access-check').send();
    expect(missing.statusCode).toBe(400);
    expect(missing.body.error.message).toContain('userEntityRef');

    const repeated = await request(app)
      .get(
        '/access-check?userEntityRef=user:default/tom&userEntityRef=user:default/jane',
      )
      .send();
    expect(repeated.statusCode).toBe(400);
    expect(repeated.body.error.message).toContain('exactly once');

    const malformed = await request(app)
      .get('/access-check?userEntityRef=tom')
      .send();
    expect(malformed.statusCode).toBe(400);

    const wrongKind = await request(app)
      .get('/access-check?userEntityRef=role:default/admin')
      .send();
    expect(wrongKind.statusCode).toBe(400);
    expect(wrongKind.body.error.message).toContain('Unsupported kind');

    expect(checkAccessMock).not.toHaveBeenCalled();
  });
});
