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
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { Entity } from '@backstage/catalog-model';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createRouter } from './router';
import { MendCacheManager } from './cache.service';
import { MendAuthSevice } from './auth.service';
import { CatalogClient } from '@backstage/catalog-client';
import {
  MEND_PROJECT_ANNOTATION,
  BACKSTAGE_SOURCE_LOCATION_ANNOTATION,
} from '../constants';
import { Project } from './data.service.types';

// Mock external dependencies
jest.mock('./cache.service');
jest.mock('./auth.service');
jest.mock('@backstage/catalog-client');

const mockCatalogClient = {
  getEntities: jest.fn(),
};

const mockCacheManager = {
  getProjectsById: jest.fn(),
};

const mockAuthService = {
  isConfigured: jest.fn(),
  getAuthToken: jest.fn(),
  connect: jest.fn(),
  getClientUrl: jest.fn(),
  getClientName: jest.fn(),
  init: jest.fn(),
  getConfigurationError: jest.fn(),
};

// Mock the MendDataService constructor
jest.mock('./data.service', () => ({
  MendDataService: jest.fn(),
}));

const mockDataService = {
  getCodeFinding: jest.fn(),
  getDependenciesFinding: jest.fn(),
  getContainersFinding: jest.fn(),
};

// Mock implementations
(CatalogClient as jest.Mock).mockImplementation(() => mockCatalogClient);
(MendCacheManager as unknown as jest.Mock).mockImplementation(
  () => mockCacheManager,
);

// Set up the MendDataService mock to return our mockDataService
const { MendDataService } = require('./data.service');

(MendDataService as jest.Mock).mockImplementation(() => mockDataService);

// Mock static methods
Object.defineProperty(MendAuthSevice, 'isConfigured', {
  value: mockAuthService.isConfigured,
});
Object.defineProperty(MendAuthSevice, 'getAuthToken', {
  value: mockAuthService.getAuthToken,
});
Object.defineProperty(MendAuthSevice, 'connect', {
  value: mockAuthService.connect,
});
Object.defineProperty(MendAuthSevice, 'getClientUrl', {
  value: mockAuthService.getClientUrl,
});
Object.defineProperty(MendAuthSevice, 'getClientName', {
  value: mockAuthService.getClientName,
});
Object.defineProperty(MendAuthSevice, 'init', {
  value: mockAuthService.init,
});
Object.defineProperty(MendAuthSevice, 'getConfigurationError', {
  value: mockAuthService.getConfigurationError,
});

// Test data
const mockProject1: Project = {
  uuid: 'project-1',
  name: 'Test Project 1',
  applicationName: 'MendPerformance',
  applicationUuid: 'app-1',
  lastScan: 1776792479426,
  languages: [['javascript/Node.js', 380]],
  statistics: {
    critical: 5,
    high: 10,
    medium: 15,
    low: 20,
    total: 50,
    dependencies: {
      critical: 3,
      high: 6,
      medium: 9,
      low: 12,
      total: 30,
    },
    code: {
      critical: null,
      high: 2,
      medium: 3,
      low: 4,
      total: 9,
    },
    containers: {
      critical: 2,
      high: 2,
      medium: 3,
      low: 4,
      total: 11,
    },
  },
};

const mockProject2: Project = {
  uuid: 'project-2',
  name: 'Project 2',
  applicationName: 'MendPerformance',
  applicationUuid: 'app-2',
  lastScan: 1776792480729,
  languages: [
    ['Ruby', 113],
    ['Java', 80],
    ['Source Library', 1],
    ['Unknown Library', 1],
  ],
  statistics: {
    critical: 2,
    high: 4,
    medium: 6,
    low: 8,
    total: 20,
    dependencies: {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
      total: 10,
    },
    code: {
      critical: null,
      high: 1,
      medium: 2,
      low: 2,
      total: 5,
    },
    containers: {
      critical: 1,
      high: 1,
      medium: 1,
      low: 2,
      total: 5,
    },
  },
};

const mockEntity1: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component-1',
    namespace: 'default',
    uid: 'entity-1',
    annotations: {
      [MEND_PROJECT_ANNOTATION]: 'project-1',
      [BACKSTAGE_SOURCE_LOCATION_ANNOTATION]:
        'url:https://github.com/test/repo1',
    },
  },
  spec: {
    type: 'service',
  },
};

const mockEntity2: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component-2',
    namespace: 'default',
    uid: 'entity-2',
    annotations: {
      [MEND_PROJECT_ANNOTATION]: 'project-1,project-2',
      [BACKSTAGE_SOURCE_LOCATION_ANNOTATION]:
        'url:https://github.com/test/repo2',
    },
  },
  spec: {
    type: 'service',
  },
};

const mockEntityWithoutAnnotation: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component-no-annotation',
    namespace: 'default',
    uid: 'entity-3',
  },
  spec: {
    type: 'service',
  },
};

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    jest.spyOn(jwt, 'decode').mockImplementation(() => ({
      integratorEmail: 'DUMMY_INTEGRATOR_EMAIL',
      userKey: 'DUMMY_USER_KEY',
      wsEnvUrl: 'https://ws.example.com',
    }));

    // Setup default auth mocks
    mockAuthService.isConfigured.mockReturnValue(true);
    mockAuthService.getAuthToken.mockReturnValue('mock-token');
    mockAuthService.getClientUrl.mockReturnValue('https://mend.example.com');
    mockAuthService.getClientName.mockReturnValue('Mend');

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: new ConfigReader({
        mend: {
          activationKey: 'DUMMY_ACTIVATION_KEY',
        },
      }),
      discovery: mockServices.discovery(),
      auth: mockServices.auth(),
      httpAuth: mockServices.httpAuth(),
      cache: mockServices.cache.mock(),
      scheduler: mockServices.scheduler.mock(),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset default mocks
    mockAuthService.isConfigured.mockReturnValue(true);
    mockAuthService.getAuthToken.mockReturnValue('mock-token');
    mockAuthService.getClientUrl.mockReturnValue('https://mend.example.com');
    mockAuthService.getClientName.mockReturnValue('Mend');

    // Reset data service mocks with proper pagination response structure
    // Note: fetchQueryPagination expects the service methods to return pagination responses,
    // but it returns flattened arrays to the caller
    mockDataService.getCodeFinding.mockResolvedValue({
      response: [], // Empty array of code findings
      additionalData: {
        totalItems: 0,
        paging: {}, // No next page
      },
    });
    mockDataService.getDependenciesFinding.mockResolvedValue({
      response: [], // Empty array of dependency findings
      additionalData: {
        totalItems: 0,
        paging: {}, // No next page
      },
    });
    mockDataService.getContainersFinding.mockResolvedValue({
      response: [], // Empty array of container findings
      additionalData: {
        totalItems: 0,
        paging: {}, // No next page
      },
    });
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('Authentication middleware', () => {
    it('should return 401 when activation key is not configured', async () => {
      mockAuthService.isConfigured.mockReturnValue(false);
      mockAuthService.getConfigurationError.mockReturnValue(
        'Missing activation key',
      );

      const response = await request(app).get('/project');

      expect(response.status).toEqual(401);
      expect(response.body).toEqual({
        name: 'ConfigurationError',
        message: 'Missing activation key',
      });
    });

    it('should return 401 when auth token is not available and connection fails', async () => {
      mockAuthService.isConfigured.mockReturnValue(true);
      mockAuthService.getAuthToken.mockReturnValue(null);
      mockAuthService.connect.mockRejectedValue(new Error('Connection failed'));

      const response = await request(app).get('/project');

      expect(response.status).toEqual(401);
      expect(response.body).toEqual({ error: 'Oops! Unauthorized' });
    });
  });

  describe('GET /project', () => {
    beforeEach(() => {
      // Setup successful auth
      mockAuthService.isConfigured.mockReturnValue(true);
      mockAuthService.getAuthToken.mockReturnValue('mock-token');
    });

    it('should return projects with entity URLs when entities have mend annotations', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity1, mockEntity2],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
        'project-2': mockProject2,
      });

      const response = await request(app).get('/project');

      expect(response.status).toEqual(200);
      expect(response.body.projectList).toHaveLength(3); // entity1 has 1 project, entity2 has 2 projects
      expect(response.body.projectList[0]).toMatchObject({
        uuid: 'project-1',
        name: 'Test Project 1',
        entityUrl: expect.stringContaining('test-component-1'),
      });
      expect(response.body.clientUrl).toBe('https://mend.example.com');
      expect(response.body.clientName).toBe('Mend');
    });

    it('should sort projects by critical severity descending', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity2], // Has both projects
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1, // 5 critical
        'project-2': mockProject2, // 2 critical
      });

      const response = await request(app).get('/project');

      expect(response.status).toEqual(200);
      expect(response.body.projectList).toHaveLength(2);
      expect(response.body.projectList[0].uuid).toBe('project-1'); // Higher critical count first
      expect(response.body.projectList[1].uuid).toBe('project-2');
    });

    it('should handle entities without mend annotations', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntityWithoutAnnotation],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
      });

      const response = await request(app).get('/project');

      expect(response.status).toEqual(200);
      expect(response.body.projectList).toHaveLength(0);
    });

    it('should handle empty annotation values', async () => {
      const entityWithEmptyAnnotation: Entity = {
        ...mockEntity1,
        metadata: {
          ...mockEntity1.metadata,
          annotations: {
            [MEND_PROJECT_ANNOTATION]: '',
          },
        },
      };

      mockCatalogClient.getEntities.mockResolvedValue({
        items: [entityWithEmptyAnnotation],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
      });

      const response = await request(app).get('/project');

      expect(response.status).toEqual(200);
      expect(response.body.projectList).toHaveLength(0);
    });

    it('should handle comma-separated project IDs with whitespace', async () => {
      const entityWithWhitespace: Entity = {
        ...mockEntity1,
        metadata: {
          ...mockEntity1.metadata,
          annotations: {
            [MEND_PROJECT_ANNOTATION]: ' project-1 , project-2 , ',
          },
        },
      };

      mockCatalogClient.getEntities.mockResolvedValue({
        items: [entityWithWhitespace],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
        'project-2': mockProject2,
      });

      const response = await request(app).get('/project');

      expect(response.status).toEqual(200);
      expect(response.body.projectList).toHaveLength(2);
    });

    it('should filter out projects not found in cache', async () => {
      const entityWithMissingProject: Entity = {
        ...mockEntity1,
        metadata: {
          ...mockEntity1.metadata,
          annotations: {
            [MEND_PROJECT_ANNOTATION]: 'project-1,missing-project',
          },
        },
      };

      mockCatalogClient.getEntities.mockResolvedValue({
        items: [entityWithMissingProject],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
        // missing-project not in cache
      });

      const response = await request(app).get('/project');

      expect(response.status).toEqual(200);
      expect(response.body.projectList).toHaveLength(1);
      expect(response.body.projectList[0].uuid).toBe('project-1');
    });

    it('should handle catalog client errors', async () => {
      mockCatalogClient.getEntities.mockRejectedValue(
        new Error('Catalog error'),
      );
      mockCacheManager.getProjectsById.mockResolvedValue({});

      const response = await request(app).get('/project');

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: 'Oops! Please try again later.' });
    });

    it('should handle cache manager errors', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({ items: [] });
      mockCacheManager.getProjectsById.mockRejectedValue(
        new Error('Cache error'),
      );

      const response = await request(app).get('/project');

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: 'Oops! Please try again later.' });
    });
  });

  describe('POST /finding', () => {
    beforeEach(() => {
      // Setup successful auth
      mockAuthService.isConfigured.mockReturnValue(true);
      mockAuthService.getAuthToken.mockReturnValue('mock-token');
    });

    it('should return 400 when no uid is provided', async () => {
      const response = await request(app).post('/finding').send({});

      expect(response.status).toEqual(400);
      expect(response.body.message).toBe('Oops! No UUID provided');
      expect(response.body.clientUrl).toBe('https://mend.example.com');
      expect(response.body.clientName).toBe('Mend');
    });

    it('should return 404 when entity is not found', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({ items: [] });
      mockCacheManager.getProjectsById.mockResolvedValue({});

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'non-existent-entity' });

      expect(response.status).toEqual(404);
      expect(response.body.message).toBe('Entity not found.');
    });

    it('should return 404 when entity has no mend annotation', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntityWithoutAnnotation],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
      });

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-3' });

      expect(response.status).toEqual(404);
      expect(response.body.message).toBe(
        'Results for this repository unavailable on Mend or cannot be accessed.',
      );
    });

    it('should return 404 when entity has empty mend annotation', async () => {
      const entityWithEmptyAnnotation: Entity = {
        ...mockEntity1,
        metadata: {
          ...mockEntity1.metadata,
          annotations: {
            [MEND_PROJECT_ANNOTATION]: '',
          },
        },
      };

      mockCatalogClient.getEntities.mockResolvedValue({
        items: [entityWithEmptyAnnotation],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
      });

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1' });

      expect(response.status).toEqual(404);
      expect(response.body.message).toBe(
        'Results for this repository unavailable on Mend or cannot be accessed.',
      );
    });

    it('should return 404 when no projects found in cache', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity1],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({}); // Empty cache

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1' });

      expect(response.status).toEqual(404);
      expect(response.body.message).toBe(
        'Results for this repository are either unavailable on Mend or cannot be accessed.',
      );
    });

    it('should return findings for first project when no projectId is provided', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity2], // Has project-1 and project-2
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
        'project-2': mockProject2,
      });

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-2' });

      expect(response.status).toEqual(200);
      expect(response.body.findingList).toBeDefined();
      expect(response.body.projectList).toHaveLength(2); // All entity projects
      expect(response.body.selectedProject).toBeDefined();
      expect(response.body.selectedProject.uuid).toBe('project-1'); // First project
      expect(response.body.clientUrl).toBe('https://mend.example.com');
      expect(response.body.clientName).toBe('Mend');
    });

    it('should return findings for specified projectId', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity2], // Has project-1 and project-2
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
        'project-2': mockProject2,
      });

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-2', projectId: 'project-2' });

      expect(response.status).toEqual(200);
      expect(response.body.findingList).toBeDefined();
      expect(response.body.projectList).toHaveLength(2); // All entity projects
      expect(response.body.selectedProject).toBeDefined();
      expect(response.body.selectedProject.uuid).toBe('project-2'); // Requested project
      expect(mockDataService.getCodeFinding).toHaveBeenCalledWith(
        expect.objectContaining({
          pathParams: { uuid: 'project-2' },
        }),
      );
    });

    it('should return 404 when projectId does not exist in cache but is in annotation', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity1], // Has project-1 in annotation
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        // project-1 not in cache
      });

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1', projectId: 'project-1' });

      expect(response.status).toEqual(404);
      expect(response.body.message).toBe(
        'Results for this repository are either unavailable on Mend or cannot be accessed.',
      );
    });

    it('should return 403 when projectId exists in cache but not in entity annotation', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity1], // Only has project-1
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
        'project-2': mockProject2,
      });

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1', projectId: 'project-2' }); // Requesting project-2 which is not in entity-1

      expect(response.status).toEqual(403);
      expect(response.body.message).toBe(
        'Provided Mend project ID is not associated with this entity.',
      );
    });

    it('should return findings when entity has valid projects', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity1],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
      });

      // Start with empty findings to test the basic flow
      // The data service mocks are already set to return empty arrays in beforeEach

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1' });

      expect(response.status).toEqual(200);
      expect(response.body.findingList).toBeDefined();
      expect(response.body.findingList).toEqual([]); // Should be empty array
      expect(response.body.projectList).toHaveLength(1);
      expect(response.body.projectList[0].uuid).toBe('project-1');
      expect(response.body.selectedProject.uuid).toBe('project-1');
      expect(response.body.clientUrl).toBe('https://mend.example.com');
      expect(response.body.clientName).toBe('Mend');
    });

    it('should handle whitespace in project IDs annotation', async () => {
      const entityWithWhitespace: Entity = {
        ...mockEntity1,
        metadata: {
          ...mockEntity1.metadata,
          annotations: {
            [MEND_PROJECT_ANNOTATION]: ' project-1 , project-2 , ',
            [BACKSTAGE_SOURCE_LOCATION_ANNOTATION]:
              'url:https://github.com/test/repo',
          },
        },
      };

      mockCatalogClient.getEntities.mockResolvedValue({
        items: [entityWithWhitespace],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
        'project-2': mockProject2,
      });

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1' });

      // Should process both projects despite whitespace
      expect(response.status).toEqual(200);
      expect(response.body.projectList).toHaveLength(2);
      expect(response.body.selectedProject.uuid).toBe('project-1'); // First project used
    });

    it('should parse source location annotation correctly', async () => {
      const entityWithSourceLocation: Entity = {
        ...mockEntity1,
        metadata: {
          ...mockEntity1.metadata,
          annotations: {
            [MEND_PROJECT_ANNOTATION]: 'project-1',
            [BACKSTAGE_SOURCE_LOCATION_ANNOTATION]:
              'url:https://github.com/test/repo',
          },
        },
      };

      mockCatalogClient.getEntities.mockResolvedValue({
        items: [entityWithSourceLocation],
      });
      mockCacheManager.getProjectsById.mockResolvedValue({
        'project-1': mockProject1,
      });

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1' });

      expect(response.status).toEqual(200);
      expect(response.body.projectSourceUrl).toContain('github.com/test/repo');
    });

    it('should handle catalog client errors', async () => {
      mockCatalogClient.getEntities.mockRejectedValue(
        new Error('Catalog error'),
      );

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1' });

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: 'Oops! Please try again later.' });
    });

    it('should handle cache manager errors', async () => {
      mockCatalogClient.getEntities.mockResolvedValue({
        items: [mockEntity1],
      });
      mockCacheManager.getProjectsById.mockRejectedValue(
        new Error('Cache error'),
      );

      const response = await request(app)
        .post('/finding')
        .send({ uid: 'entity-1' });

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: 'Oops! Please try again later.' });
    });
  });
});
