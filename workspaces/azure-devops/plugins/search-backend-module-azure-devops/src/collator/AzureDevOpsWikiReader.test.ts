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

import { mockServices } from '@backstage/backend-test-utils';
import { AzureDevOpsCredentialsProvider } from '@backstage/integration';
import { AzureDevOpsWikiReader } from './AzureDevOpsWikiReader';

const mockFetchResponse = (body: object, headers?: Record<string, string>) => {
  return {
    ok: true,
    json: async () => body,
    headers: new Headers(headers),
  } as Response;
};

describe('AzureDevOpsWikiReader', () => {
  const logger = mockServices.logger.mock();
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(mockFetchResponse({ value: [] }));
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('with legacy PAT token', () => {
    it('should use Basic auth with the provided token', async () => {
      const reader = new AzureDevOpsWikiReader({
        baseUrl: 'https://dev.azure.com',
        organization: 'my-org',
        project: 'my-project',
        wikiIdentifier: 'my-wiki.wiki',
        logger,
        token: 'my-pat-token',
      });

      fetchSpy.mockResolvedValueOnce(
        mockFetchResponse({
          id: 1,
          path: '/Test-Page',
          content: 'Hello world',
          remoteUrl:
            'https://dev.azure.com/my-org/my-project/_wiki/wikis/my-wiki.wiki/1/Test-Page',
          gitItemPath: '/Test-Page.md',
          isNonConformant: false,
          isParentPage: false,
          order: 0,
          subPages: [],
          url: 'https://dev.azure.com/my-org/my-project/_apis/wiki/wikis/my-wiki.wiki/pages/1',
        }),
      );

      await reader.readSingleWikiPage(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://dev.azure.com/my-org/my-project/_apis/wiki/wikis/my-wiki.wiki//pages/1?includeContent=true',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Basic ${Buffer.from(':my-pat-token').toString(
              'base64',
            )}`,
          }),
        }),
      );
    });

    it('should prefer token over credentials provider when both are present', async () => {
      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue({
          headers: { Authorization: 'Bearer service-principal-token' },
          token: 'service-principal-token',
          type: 'bearer',
        }),
      };

      const reader = new AzureDevOpsWikiReader({
        baseUrl: 'https://dev.azure.com',
        organization: 'my-org',
        project: 'my-project',
        wikiIdentifier: 'my-wiki.wiki',
        logger,
        token: 'my-pat-token',
        credentialsProvider: mockCredentialsProvider,
      });

      fetchSpy.mockResolvedValueOnce(
        mockFetchResponse({
          id: 1,
          path: '/Test',
          content: '',
          remoteUrl: '',
          gitItemPath: '',
          isNonConformant: false,
          isParentPage: false,
          order: 0,
          subPages: [],
          url: '',
        }),
      );

      await reader.readSingleWikiPage(1);

      expect(mockCredentialsProvider.getCredentials).not.toHaveBeenCalled();
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Basic ${Buffer.from(':my-pat-token').toString(
              'base64',
            )}`,
          }),
        }),
      );
    });
  });

  describe('with credentials provider', () => {
    it('should use Bearer auth from credentials provider', async () => {
      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue({
          headers: { Authorization: 'Bearer my-bearer-token' },
          token: 'my-bearer-token',
          type: 'bearer',
        }),
      };

      const reader = new AzureDevOpsWikiReader({
        baseUrl: 'https://dev.azure.com',
        organization: 'my-org',
        project: 'my-project',
        wikiIdentifier: 'my-wiki.wiki',
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      fetchSpy.mockResolvedValueOnce(
        mockFetchResponse({
          id: 1,
          path: '/Test',
          content: '',
          remoteUrl: '',
          gitItemPath: '',
          isNonConformant: false,
          isParentPage: false,
          order: 0,
          subPages: [],
          url: '',
        }),
      );

      await reader.readSingleWikiPage(1);

      expect(mockCredentialsProvider.getCredentials).toHaveBeenCalledWith({
        url: 'https://dev.azure.com/my-org',
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-bearer-token',
          }),
        }),
      );
    });

    it('should use PAT auth from credentials provider', async () => {
      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue({
          headers: { Authorization: 'Basic cGF0LWZyb20taW50ZWdyYXRpb24=' },
          token: 'pat-from-integration',
          type: 'pat',
        }),
      };

      const reader = new AzureDevOpsWikiReader({
        baseUrl: 'https://dev.azure.com',
        organization: 'my-org',
        project: 'my-project',
        wikiIdentifier: 'my-wiki.wiki',
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      fetchSpy.mockResolvedValueOnce(
        mockFetchResponse({
          id: 1,
          path: '/Test',
          content: '',
          remoteUrl: '',
          gitItemPath: '',
          isNonConformant: false,
          isParentPage: false,
          order: 0,
          subPages: [],
          url: '',
        }),
      );

      await reader.readSingleWikiPage(1);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Basic cGF0LWZyb20taW50ZWdyYXRpb24=',
          }),
        }),
      );
    });

    it('should throw when credentials provider returns undefined', async () => {
      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue(undefined),
      };

      const reader = new AzureDevOpsWikiReader({
        baseUrl: 'https://dev.azure.com',
        organization: 'my-org',
        project: 'my-project',
        wikiIdentifier: 'my-wiki.wiki',
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      await expect(reader.readSingleWikiPage(1)).rejects.toThrow(
        'No credentials found for Azure DevOps organization at https://dev.azure.com/my-org',
      );
    });

    it('should build correct org URL for credentials lookup with custom baseUrl', async () => {
      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue({
          headers: { Authorization: 'Bearer token' },
          token: 'token',
          type: 'bearer',
        }),
      };

      const reader = new AzureDevOpsWikiReader({
        baseUrl: 'https://ado.mycompany.com',
        organization: 'internal-org',
        project: 'my-project',
        wikiIdentifier: 'my-wiki.wiki',
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      fetchSpy.mockResolvedValueOnce(
        mockFetchResponse({
          id: 1,
          path: '/Test',
          content: '',
          remoteUrl: '',
          gitItemPath: '',
          isNonConformant: false,
          isParentPage: false,
          order: 0,
          subPages: [],
          url: '',
        }),
      );

      await reader.readSingleWikiPage(1);

      expect(mockCredentialsProvider.getCredentials).toHaveBeenCalledWith({
        url: 'https://ado.mycompany.com/internal-org',
      });
    });
  });

  describe('getListOfAllWikiPages', () => {
    it('should paginate through wiki pages using continuation token', async () => {
      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue({
          headers: { Authorization: 'Bearer token' },
          token: 'token',
          type: 'bearer',
        }),
      };

      const reader = new AzureDevOpsWikiReader({
        baseUrl: 'https://dev.azure.com',
        organization: 'my-org',
        project: 'my-project',
        wikiIdentifier: 'my-wiki.wiki',
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      fetchSpy
        .mockResolvedValueOnce(
          mockFetchResponse(
            { value: [{ id: 1, path: '/Page-1' }] },
            { 'x-ms-continuationtoken': 'continue-token' },
          ),
        )
        .mockResolvedValueOnce(
          mockFetchResponse({ value: [{ id: 2, path: '/Page-2' }] }),
        );

      const pages = await reader.getListOfAllWikiPages();

      expect(pages).toHaveLength(2);
      expect(pages[0]).toEqual({ id: 1, path: '/Page-1' });
      expect(pages[1]).toEqual({ id: 2, path: '/Page-2' });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should throw when neither token nor credentials provider is configured', async () => {
      const reader = new AzureDevOpsWikiReader({
        baseUrl: 'https://dev.azure.com',
        organization: 'my-org',
        project: 'my-project',
        wikiIdentifier: 'my-wiki.wiki',
        logger,
      });

      await expect(reader.readSingleWikiPage(1)).rejects.toThrow(
        'No authentication configured',
      );
    });
  });
});
