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
  mockCredentials,
  mockErrorHandler,
  mockServices,
} from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import { ManageService } from './services/Manage';

const mockedResult = { ownerEntities: [], ownedEntities: [] };

describe('createRouter', () => {
  let app: express.Express;
  let manageService: jest.Mocked<ManageService>;

  beforeEach(async () => {
    manageService = {
      getOwnersAndOwnedEntities: jest.fn(),
    };
    const router = await createRouter({
      httpAuth: mockServices.httpAuth(),
      userInfo: mockServices.userInfo(),
      manageService,
    });
    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  it('Should return values properly', async () => {
    manageService.getOwnersAndOwnedEntities.mockResolvedValue(mockedResult);

    const response = await request(app)
      .get('/home')
      .set('Authorization', mockCredentials.user.header());

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedResult);
  });
});
