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
  BackstageCredentials,
  BackstageUserPrincipal,
  HttpAuthService,
} from '@backstage/backend-plugin-api';
import { AuthenticationError } from '@backstage/errors';
import express from 'express';
import request from 'supertest';

import { mockErrorHandler, mockServices } from '@backstage/backend-test-utils';
import { ServiceNowConfig } from '../../config';
import { createRouter } from './router';

const mockFetchIncidents = jest.fn();
jest.mock('../service-now-rest/client', () => {
  return {
    DefaultServiceNowClient: jest.fn().mockImplementation(() => ({
      fetchIncidents: mockFetchIncidents,
    })),
  };
});

describe('createRouter', () => {
  let app: express.Express;
  let mockHttpAuthService: jest.Mocked<HttpAuthService>;
  let mockServiceNowConfig: ServiceNowConfig;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockHttpAuthService = mockServices.httpAuth.mock();

    mockServiceNowConfig = {
      servicenow: {
        instanceUrl: 'https://mock-instance.service-now.com',
      },
    };

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      servicenowConfig: mockServiceNowConfig,
      httpAuth: mockHttpAuthService,
    });

    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  describe('GET /incidents', () => {
    const mockAuthHeader = `Bearer mock-secret-token`;
    const mockCredentials: BackstageCredentials<BackstageUserPrincipal> = {
      $$type: '@backstage/BackstageCredentials',
      principal: { type: 'user', userEntityRef: 'user:default/test.user' },
    };
    const mockIncidentsData = [
      {
        sys_id: 'INC001',
        number: 'INC001',
        short_description: 'Test incident',
        description: 'Test incident description',
        sys_created_on: '2024-01-01',
        priority: 1,
        incident_state: 1,
        url: 'https://mock-instance.service-now.com/INC001',
      },
    ];

    it('should successfully retrieve incidents', async () => {
      mockHttpAuthService.credentials.mockResolvedValue(mockCredentials);
      mockFetchIncidents.mockResolvedValue(mockIncidentsData);

      const response = await request(app)
        .get('/incidents?entityId=user:default/test.user')
        .set('Authorization', mockAuthHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining(
          mockIncidentsData.map(_incident =>
            expect.objectContaining({
              sys_id: expect.any(String),
              number: expect.any(String),
              short_description: expect.any(String),
              description: expect.any(String),
              sys_created_on: expect.any(String),
              priority: expect.any(Number),
              incident_state: expect.any(Number),
              url: expect.any(String),
            }),
          ),
        ),
      );
      expect(mockHttpAuthService.credentials).toHaveBeenCalledWith(
        expect.anything(),
        { allow: ['user'] },
      );
      expect(mockFetchIncidents).toHaveBeenCalledWith({
        entityId: 'user:default/test.user',
      });
    });

    it('should return 400 if entityId is missing', async () => {
      mockHttpAuthService.credentials.mockResolvedValue(mockCredentials);

      const response = await request(app).get('/incidents');

      expect(response.status).toBe(400);
      expect(response.body.error.message).toEqual(
        'entityId is required if userEmail is not present.',
      );
    });

    it('should return 401 if authorization is missing', async () => {
      mockHttpAuthService.credentials.mockRejectedValue(
        new AuthenticationError('Missing credentials'),
      );

      const response = await request(app).get(
        '/incidents?entityId=user:default/test.user',
      );

      expect(response.status).toBe(401);
      expect(mockFetchIncidents).not.toHaveBeenCalled();
    });

    it('should return 500 if fetching incidents fails', async () => {
      mockHttpAuthService.credentials.mockResolvedValue(mockCredentials);
      mockFetchIncidents.mockRejectedValue(new Error('ServiceNow is down'));

      const response = await request(app)
        .get('/incidents?entityId=user:default/test.user')
        .set('Authorization', mockAuthHeader);

      expect(response.status).toBe(500);
      expect(response.body.error.message).toBe(
        'Failed to fetch incidents from ServiceNow',
      );
    });

    it('should successfully retrieve incidents when both userEmail and entityId are provided', async () => {
      mockHttpAuthService.credentials.mockResolvedValue(mockCredentials);
      mockFetchIncidents.mockResolvedValue(mockIncidentsData);

      const response = await request(app)
        .get(
          '/incidents?userEmail=test.user@example.com&entityId=user:default/test.user',
        )
        .set('Authorization', mockAuthHeader);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockIncidentsData);
      expect(mockFetchIncidents).toHaveBeenCalledWith({
        userEmail: 'test.user@example.com',
        entityId: 'user:default/test.user',
      });
    });
  });
});
