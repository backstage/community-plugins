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
import { LoggerService } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import express from 'express';
import request from 'supertest';

import {
  Label,
  LabelsResponse,
  ManifestByDigestResponse,
  SecurityDetailsResponse,
  Tag,
  TagsResponse,
} from '../types';
import { QuayService } from './QuayService';
import { createRouter } from './router';

jest.mock('./QuayService');

describe('createRouter', () => {
  let app: express.Express;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockQuayService = {
    getTags: jest.fn(),
    getLabels: jest.fn(),
    getManifestByDigest: jest.fn(),
    getSecurityDetails: jest.fn(),
  };

  const mockConfig = new ConfigReader({});

  const mockPermissions = {
    authorize: jest.fn(),
    authorizeConditional: jest.fn(),
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
      quayService: mockQuayService as unknown as QuayService,
      logger: mockLogger as unknown as LoggerService,
      config: mockConfig,
      permissions: mockPermissions,
      httpAuth: mockHttpAuth,
    });

    app = express().use(router);
  });

  describe('GET /repository/:org/:repo/tag', () => {
    const mockTags: Tag[] = [
      {
        name: 'prod',
        reversion: false,
        startTs: 12345,
        manifestDigest: 'sha256:1234567890',
        isManifestList: false,
        size: 987654321,
        lastModified: 'Mon, 03 Feb 2025 01:30:00 -0000',
      },
      {
        name: 'demo',
        reversion: false,
        startTs: 12345,
        manifestDigest: 'sha256:1234567890',
        isManifestList: false,
        size: 987654321,
        lastModified: 'Mon, 03 Feb 2025 01:45:00 -0000',
      },
    ];

    const expectedTagResponse: TagsResponse = {
      page: 0,
      hasAdditional: true,
      tags: mockTags,
    };

    it('should return tags when authorize', async () => {
      mockQuayService.getTags.mockResolvedValue(expectedTagResponse);

      const response = await request(app)
        .get('/repository/org/repo/tag')
        .expect(200);

      expect(response.body).toEqual(expectedTagResponse);
      expect(mockQuayService.getTags).toHaveBeenCalledWith(
        'org',
        'repo',
        undefined,
        undefined,
      );
    });

    it('should handle pagination parameters', async () => {
      const expectedTagWithParamsResponse = {
        page: 2,
        hasAdditional: true,
        tags: mockTags,
      };

      mockQuayService.getTags.mockResolvedValue(expectedTagWithParamsResponse);

      await request(app)
        .get('/repository/org/repo/tag?page=2&limit=10')
        .expect(200);

      expect(mockQuayService.getTags).toHaveBeenCalledWith(
        'org',
        'repo',
        2,
        10,
      );
    });

    it('should require authorization', async () => {
      mockPermissions.authorize.mockResolvedValue([
        { result: AuthorizeResult.DENY },
      ]);

      const response = await request(app).get('/repository/org/repo/tag');
      expect(response.status).toEqual(403);
    });
  });

  describe('GET /repository/:org/:repo/manifest/:digest/labels', () => {
    const mockLabels: Label[] = [
      {
        id: 'asdfghjkl12345',
        key: 'description',
        value: 'An application that does something useful.',
        sourceType: 'manifest',
        mediaType: 'text/plain',
      },
      {
        id: 'asdfghjkl54321',
        key: 'description',
        value: 'An application that does something useful.',
        sourceType: 'manifest',
        mediaType: 'text/plain',
      },
    ];

    const expectedLabelsResponse: LabelsResponse = {
      labels: mockLabels,
    };

    it('should return labels when authorized', async () => {
      mockQuayService.getLabels.mockResolvedValue(expectedLabelsResponse);
      const response = await request(app)
        .get('/repository/org/repo/manifest/sha256:123/labels')
        .expect(200);

      expect(response.body).toEqual(expectedLabelsResponse);
      expect(mockQuayService.getLabels).toHaveBeenCalledWith(
        'org',
        'repo',
        'sha256:123',
      );
    });
  });

  describe('GET /repository/:org/:repo/manifest/:digest/security', () => {
    const expectedSecurityDetailsResponse: SecurityDetailsResponse = {
      status: 'scanned',
      data: {
        layer: {
          name: 'layer1',
          parentName: 'parent1',
          namespaceName: 'namespace1',
          indexedByVersion: 1,
          features: [],
        },
      },
    };

    it('should return security details when authorized', async () => {
      mockQuayService.getSecurityDetails.mockResolvedValue(
        expectedSecurityDetailsResponse,
      );

      const response = await request(app)
        .get('/repository/org/repo/manifest/sha256:123/security')
        .expect(200);

      expect(response.body).toEqual(expectedSecurityDetailsResponse);
      expect(mockQuayService.getSecurityDetails).toHaveBeenCalledWith(
        'org',
        'repo',
        'sha256:123',
      );
    });
  });

  describe('GET /repository/:org/:repo/manifest/:digest', () => {
    const expectedManifestResponse: ManifestByDigestResponse = {
      digest: 'sha256:123',
      isManifestList: false,
      manifestData: '{}',
      configMediaType: 'application/vnd.docker.container.image.v1+json',
      layers: [],
      layersCompressedSize: 0,
    };

    it('should return manifest when authorized', async () => {
      mockQuayService.getManifestByDigest.mockResolvedValue(
        expectedManifestResponse,
      );

      const response = await request(app)
        .get('/repository/org/repo/manifest/sha256:123')
        .expect(200);

      expect(response.body).toEqual(expectedManifestResponse);
      expect(mockQuayService.getManifestByDigest).toHaveBeenCalledWith(
        'org',
        'repo',
        'sha256:123',
      );
    });
  });
});
