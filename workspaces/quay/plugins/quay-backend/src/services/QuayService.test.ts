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

import { ConfigReader } from '@backstage/config';

import { QUAY_SINGLE_INSTANCE_NAME } from '@backstage-community/plugin-quay-common';

import {
  Label,
  LabelsResponse,
  LayerByDigest,
  ManifestByDigestResponse,
  SecurityDetailsResponse,
  Tag,
  TagsResponse,
  VulnerabilitySeverity,
} from '../types';
import { QuayService } from './QuayService';

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as any;

describe('QuayService', () => {
  const singleInstanceConfig = {
    quay: { apiUrl: 'https://quay.example.com', apiKey: 'test-token' },
  };
  const multiInstanceConfig = {
    quay: {
      instances: [
        {
          name: 'staging',
          apiUrl: 'https://quay-staging.example.com',
          apiKey: 'staging-token',
        },
        {
          name: 'prod',
          apiUrl: 'https://quay-prod.example.com',
          apiKey: 'prod-token',
        },
      ],
    },
  };

  describe.each([
    {
      configType: 'single-instance',
      config: singleInstanceConfig,
      instanceName: QUAY_SINGLE_INSTANCE_NAME,
      expectedUrl: singleInstanceConfig.quay.apiUrl,
      expectedToken: singleInstanceConfig.quay.apiKey,
    },
    {
      configType: 'multi-instance',
      config: multiInstanceConfig,
      instanceName: 'prod',
      expectedUrl: 'https://quay-prod.example.com',
      expectedToken: 'prod-token',
    },
  ])('$configType', ({ config, instanceName, expectedUrl, expectedToken }) => {
    let quayService: QuayService;
    let fetchMock: jest.SpyInstance;

    beforeEach(() => {
      const mockConfig = new ConfigReader(config);
      quayService = QuayService.fromConfig(mockConfig, mockLogger);
      fetchMock = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should fetch tags successfully', async () => {
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

      const expectedResponse: TagsResponse = {
        page: 0,
        hasAdditional: true,
        tags: mockTags,
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedResponse,
      });

      const result = await quayService.getTags(instanceName, 'org', 'repo');
      expect(result).toEqual(expectedResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        `${expectedUrl}/api/v1/repository/org/repo/tag?onlyActiveTags=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${expectedToken}`,
          },
        },
      );
    });

    it('should handle multiple query params correctly when fetching tags', async () => {
      const expectedResponse = {
        page: 2,
        hasAdditional: false,
        tags: [],
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedResponse,
      });

      await quayService.getTags(
        instanceName,
        'org',
        'repo',
        2,
        10,
        'specific-tag',
      );
      expect(fetchMock).toHaveBeenCalledWith(
        `${expectedUrl}/api/v1/repository/org/repo/tag?page=2&limit=10&specificTag=specific-tag&onlyActiveTags=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${expectedToken}`,
          },
        },
      );
    });

    it('should fetch labels successfully', async () => {
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

      const expectedResponse: LabelsResponse = {
        labels: mockLabels,
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedResponse,
      });

      const result = await quayService.getLabels(
        instanceName,
        'org',
        'repo',
        'sha256:a1b2c3d4e5c6d7e8',
      );
      expect(result).toEqual(expectedResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        `${expectedUrl}/api/v1/repository/org/repo/manifest/sha256:a1b2c3d4e5c6d7e8/labels`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${expectedToken}`,
          },
        },
      );
    });

    it('should fetch manifest by digest successfully', async () => {
      const mockLayersByDigest: LayerByDigest[] = [
        {
          index: 0,
          compressedSize: 100,
          isRemote: false,
          urls: null,
          command: [
            '/bin/sh',
            '-c',
            'apt-get update && apt-get install -y nodejs',
          ],
          comment: 'Install Node.js runtime',
          author: 'John Doe <john@example.com>',
          blobDigest: 'sha256:abc1234567890',
          createdDatetime: '2025-02-03T12:00:00Z',
        },
        {
          index: 1,
          compressedSize: 200,
          isRemote: false,
          urls: null,
          command: ['COPY', './app /usr/src/app/'],
          comment: 'Copy application code',
          author: 'CI/CD Pipeline',
          blobDigest: 'sha256:zyxw098654321',
          createdDatetime: '2025-02-03T12:01:00Z',
        },
      ];

      const expectedResponse: ManifestByDigestResponse = {
        digest: 'sha256:a1b2c3d4e5',
        isManifestList: false,
        manifestData: JSON.stringify({
          schemaVersion: 2,
          mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
          config: {
            mediaType: 'application/vnd.docker.container.image.v1+json',
            digest:
              'sha256:e123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            size: 8192,
          },
        }),
        configMediaType: 'application/vnd.docker.container.image.v1+json',
        layers: mockLayersByDigest,
        layersCompressedSize: 300,
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedResponse,
      });

      const response = await quayService.getManifestByDigest(
        instanceName,
        'org',
        'repo',
        'sha256:a1b2c3d4e5',
      );
      expect(response).toEqual(expectedResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        `${expectedUrl}/api/v1/repository/org/repo/manifest/sha256:a1b2c3d4e5`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${expectedToken}`,
          },
        },
      );
    });

    it('should fetch security details successfully', async () => {
      const expectedResponse: SecurityDetailsResponse = {
        status: 'scanned',
        data: {
          layer: {
            name: 'layer1',
            parentName: 'parent1',
            namespaceName: 'namespace1',
            indexedByVersion: 1,
            features: [
              {
                name: 'package1',
                versionFormat: 'format1',
                namespaceName: 'namespace1',
                addedBy: 'sha256:abc',
                version: '1.0.0',
                baseScores: [5.0, 7.0],
                cveIds: ['CVE-2025-1', 'CVE-2025-2'],
                vulnerabilities: [
                  {
                    severity: VulnerabilitySeverity.High,
                    namespaceName: 'namespace1',
                    link: 'https://example.com/vuln1',
                    fixedBy: '2.0.0',
                    description: 'Test vulnerability 1',
                    name: 'VULN-1',
                    metadata: {
                      updateBy: '2025-01-01',
                      repoName: 'repo1',
                      repoLink: 'https://example.com/repo1',
                      distroName: 'distro1',
                      distroVersion: '1',
                      nvd: {
                        cvssV3: {
                          vectors: 'TEST',
                          score: 7.5,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => expectedResponse,
      });

      const result = await quayService.getSecurityDetails(
        instanceName,
        'org',
        'repo',
        'sha256:abc1234567890',
      );
      expect(result).toEqual(expectedResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        `${expectedUrl}/api/v1/repository/org/repo/manifest/sha256:abc1234567890/security?vulnerabilities=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${expectedToken}`,
          },
        },
      );
    });

    it('should log an error and throw when fetching fails', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(
        quayService.getTags(instanceName, 'org', 'repo'),
      ).rejects.toThrow('Failed to fetch data: Internal Server Error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Quay Service request failed: (500, Internal Server Error)',
      );
    });
  });

  describe('fromConfig', () => {
    it('should successfully load single-instance configuration', () => {
      const mockConfig = new ConfigReader(singleInstanceConfig);
      const quayService = QuayService.fromConfig(mockConfig, mockLogger);

      expect(quayService).toBeInstanceOf(QuayService);
      expect(quayService.getQuayInstance(undefined)?.name).toBe(
        QUAY_SINGLE_INSTANCE_NAME,
      );
    });

    it('should successfully load multi-instance configuration', () => {
      const mockConfig = new ConfigReader(multiInstanceConfig);
      const quayService = QuayService.fromConfig(mockConfig, mockLogger);
      expect(quayService.getQuayInstance('prod')?.name).toBe('prod');
      expect(quayService.getQuayInstance('staging')?.name).toBe('staging');
    });

    it('should throw error when empty instances array', () => {
      const mockConfig = new ConfigReader({
        quay: {
          instances: [],
        },
      });

      expect(() => QuayService.fromConfig(mockConfig, mockLogger)).toThrow(
        'At least one Quay instance must be configured',
      );
    });

    it('should throw error when missing apiUrl in single-instance config', () => {
      const mockConfig = new ConfigReader({
        quay: {
          apiKey: 'test-token',
        },
      });

      expect(() => QuayService.fromConfig(mockConfig, mockLogger)).toThrow();
    });

    it('should throw error when missing apiUrl in multi-instance config', () => {
      const mockConfig = new ConfigReader({
        quay: {
          instances: [
            {
              name: 'prod',
              apiKey: 'prod-token',
            },
          ],
        },
      });

      expect(() => QuayService.fromConfig(mockConfig, mockLogger)).toThrow();
    });
  });

  describe('getQuayInstance', () => {
    it('should return first instance when no instance name', async () => {
      const mockConfig = new ConfigReader(multiInstanceConfig);
      const quayService = QuayService.fromConfig(mockConfig, mockLogger);
      expect(quayService.getQuayInstance()).toEqual({
        name: multiInstanceConfig.quay.instances[0].name,
        apiUrl: multiInstanceConfig.quay.instances[0].apiUrl,
        token: multiInstanceConfig.quay.instances[0].apiKey,
      });
    });

    it('should return instance by instance name', async () => {
      const mockConfig = new ConfigReader(multiInstanceConfig);
      const quayService = QuayService.fromConfig(mockConfig, mockLogger);
      expect(quayService.getQuayInstance('prod')).toEqual({
        name: multiInstanceConfig.quay.instances[1].name,
        apiUrl: multiInstanceConfig.quay.instances[1].apiUrl,
        token: multiInstanceConfig.quay.instances[1].apiKey,
      });
    });

    it('should return undefined for non-existent instance', async () => {
      const mockConfig = new ConfigReader(multiInstanceConfig);
      const quayService = QuayService.fromConfig(mockConfig, mockLogger);
      expect(quayService.getQuayInstance('non-existent')).toBeUndefined();
    });
  });
});
