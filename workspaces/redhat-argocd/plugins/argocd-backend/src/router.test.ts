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
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { mockApplications, mockConfig } from './__data__/mockdata';
import { ArgoCDService } from './services/ArgoCDService';

jest.mock('./services/ArgoCDService');

describe('router', () => {
  let app: express.Express;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  };

  const mockPermissions = {
    authorize: jest.fn(),
    authorizeConditional: jest.fn(),
  };

  const mockArgoCDService = {
    listArgoApps: jest.fn(),
    getRevisionDetails: jest.fn(),
    getApplication: jest.fn(),
  };

  const mockHttpAuth = {
    credentials: jest.fn(),
    issueUserCookie: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    mockPermissions.authorize.mockResolvedValue([
      { result: AuthorizeResult.ALLOW },
    ]);
    mockHttpAuth.credentials.mockResolvedValue({ token: 'test-token' });

    const router = await createRouter({
      argoCDService: mockArgoCDService as unknown as ArgoCDService,
      httpAuth: mockHttpAuth,
      logger: mockLogger,
      config: mockConfig,
      permissions: mockPermissions,
    });

    app = express().use(router);
  });

  describe('GET /argoInstance/:instanceName/applications/selector/:selector', () => {
    it('should list application with selector', async () => {
      const expectedSelectorResponse = mockApplications.filter(
        application => application.metadata.name === 'test-app',
      );
      mockArgoCDService.listArgoApps.mockResolvedValue(
        expectedSelectorResponse,
      );
      const response = await request(app)
        .get(
          '/argoInstance/test-instance/applications/selector/test=true?test=true',
        )
        .expect(200);

      expect(response.body).toEqual(expectedSelectorResponse);
      expect(mockArgoCDService.listArgoApps).toHaveBeenCalledWith(
        'test-instance',
        {
          selector: 'test=true',
        },
      );
    });

    it('should return applications with appNamespace', async () => {
      const expectedAppNamespaceResponse = mockApplications.filter(
        application => application.metadata.name === 'staging-app',
      );
      mockArgoCDService.listArgoApps.mockResolvedValue(
        expectedAppNamespaceResponse,
      );
      const response = await request(app)
        .get(
          '/argoInstance/staging-instance/applications/selector/clusterName=microk8s?clusterName=microK8s&appNamespace=staging',
        )
        .expect(200);

      expect(response.body).toEqual(expectedAppNamespaceResponse);
      expect(mockArgoCDService.listArgoApps).toHaveBeenCalledWith(
        'staging-instance',
        {
          selector: 'clusterName=microk8s',
          appNamespace: 'staging',
        },
      );
    });

    it('should return applications with project', async () => {
      const expectedProjectResponse = mockApplications.filter(
        application => application.metadata.name === 'staging-app',
      );
      mockArgoCDService.listArgoApps.mockResolvedValue(expectedProjectResponse);
      const response = await request(app)
        .get(
          '/argoInstance/staging-instance/applications/selector/clusterName=microk8s?clusterName=microK8s&project=staging',
        )
        .expect(200);

      expect(response.body).toEqual(expectedProjectResponse);
      expect(mockArgoCDService.listArgoApps).toHaveBeenCalledWith(
        'staging-instance',
        {
          selector: 'clusterName=microk8s',
          project: 'staging',
        },
      );
    });
  });

  describe('GET /argoInstance/:instanceName/applications/:appName', () => {
    it('should return application', async () => {
      const expectedApplicationResponse = mockApplications.filter(
        application => application.metadata.name === 'test-app',
      );
      mockArgoCDService.getApplication.mockResolvedValue(
        expectedApplicationResponse,
      );
      const response = await request(app)
        .get('/argoInstance/test-instance/applications/test-app')
        .expect(200);

      expect(response.body).toEqual(expectedApplicationResponse);
      expect(mockArgoCDService.getApplication).toHaveBeenCalledWith(
        'test-instance',
        {
          appName: 'test-app',
        },
      );
    });

    it('should return application with appNamespace query param', async () => {
      const expectedApplicationResponse = mockApplications.filter(
        application => application.metadata.namespace === 'test',
      );
      mockArgoCDService.getApplication.mockResolvedValue(
        expectedApplicationResponse,
      );
      const response = await request(app)
        .get(
          '/argoInstance/test-instance/applications/test-app?appNamespace=test',
        )
        .expect(200);

      expect(response.body).toEqual(expectedApplicationResponse);
      expect(mockArgoCDService.getApplication).toHaveBeenCalledWith(
        'test-instance',
        {
          appName: 'test-app',
          appNamespace: 'test',
        },
      );
    });

    it('should return application with project query param', async () => {
      const expectedApplicationResponse = mockApplications.filter(
        application => application.spec.project === 'demo',
      );
      mockArgoCDService.getApplication.mockResolvedValue(
        expectedApplicationResponse,
      );
      const response = await request(app)
        .get(
          '/argoInstance/test-instance/applications/multi-source-app?project=demo',
        )
        .expect(200);

      expect(response.body).toEqual(expectedApplicationResponse);
      expect(mockArgoCDService.getApplication).toHaveBeenCalledWith(
        'test-instance',
        {
          appName: 'multi-source-app',
          project: 'demo',
        },
      );
    });
  });

  describe('GET /argoInstance/:instanceName/applications/name/:appName/revisions/:revisionID/metadata', () => {
    it('should return revision metadata', async () => {
      const expectedRevisionResponse = {
        author: 'test-user <test-user@mail.com>',
        date: new Date('2025-01-01').toString(),
        message: 'committed changed',
      };
      mockArgoCDService.getRevisionDetails.mockResolvedValue(
        expectedRevisionResponse,
      );
      const response = await request(app)
        .get(
          '/argoInstance/test-instance/applications/name/test-app/revisions/abc123/metadata',
        )
        .expect(200);

      expect(response.body).toEqual(expectedRevisionResponse);
      expect(mockArgoCDService.getRevisionDetails).toHaveBeenCalledWith(
        'test-instance',
        'test-app',
        'abc123',
        {
          appNamespace: undefined,
          sourceIndex: undefined,
        },
      );
    });

    it('should return application with appNamespace', async () => {
      const expectedRevisionAppNamespaceResponse = {
        author: 'test-user <test-user@mail.com>',
        date: new Date('2025-01-01').toString(),
        message: 'committed changed',
      };
      mockArgoCDService.getRevisionDetails.mockResolvedValue(
        expectedRevisionAppNamespaceResponse,
      );
      const response = await request(app)
        .get(
          '/argoInstance/test-instance/applications/name/test-app/revisions/abc123/metadata?appNamespace=staging',
        )
        .expect(200);

      expect(response.body).toEqual(expectedRevisionAppNamespaceResponse);
      expect(mockArgoCDService.getRevisionDetails).toHaveBeenCalledWith(
        'test-instance',
        'test-app',
        'abc123',
        {
          appNamespace: 'staging',
          sourceIndex: undefined,
        },
      );
    });
  });
});
