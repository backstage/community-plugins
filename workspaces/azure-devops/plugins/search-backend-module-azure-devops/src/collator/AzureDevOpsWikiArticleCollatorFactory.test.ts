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
import { ConfigReader } from '@backstage/config';
import { AzureDevOpsCredentialsProvider } from '@backstage/integration';
import { AzureDevOpsWikiArticleCollatorFactory } from './AzureDevOpsWikiArticleCollatorFactory';

const mockFetchResponse = (body: object, headers?: Record<string, string>) => {
  return {
    ok: true,
    json: async () => body,
    headers: new Headers(headers),
  } as Response;
};

describe('AzureDevOpsWikiArticleCollatorFactory', () => {
  const logger = mockServices.logger.mock();
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('fromConfig', () => {
    it('should read all config values from app-config', () => {
      const config = new ConfigReader({
        search: {
          collators: {
            azureDevOpsWikiCollator: {
              baseUrl: 'https://ado.mycompany.com',
              token: 'my-pat',
              wikis: [
                {
                  organization: 'my-org',
                  project: 'my-project',
                  wikiIdentifier: 'my-wiki.wiki',
                  titleSuffix: ' - Wiki',
                },
              ],
            },
          },
        },
      });

      const factory = AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
        logger,
      });

      expect(factory.type).toBe('azure-devops-wiki-article');
    });

    it('should accept config without baseUrl or token when credentials provider is given', () => {
      const config = new ConfigReader({
        search: {
          collators: {
            azureDevOpsWikiCollator: {
              wikis: [
                {
                  organization: 'my-org',
                  project: 'my-project',
                  wikiIdentifier: 'my-wiki.wiki',
                },
              ],
            },
          },
        },
      });

      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn(),
      };

      const factory = AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      expect(factory.type).toBe('azure-devops-wiki-article');
    });
  });

  describe('execute', () => {
    it('should log deprecation warning when token is configured', async () => {
      const config = new ConfigReader({
        search: {
          collators: {
            azureDevOpsWikiCollator: {
              baseUrl: 'https://dev.azure.com',
              token: 'my-pat',
              wikis: [
                {
                  organization: 'my-org',
                  project: 'my-project',
                  wikiIdentifier: 'my-wiki.wiki',
                },
              ],
            },
          },
        },
      });

      fetchSpy
        .mockResolvedValueOnce(
          mockFetchResponse({ value: [{ id: 1, path: '/Page' }] }),
        )
        .mockResolvedValueOnce(
          mockFetchResponse({
            id: 1,
            path: '/Page',
            content: 'Content',
            remoteUrl: 'https://dev.azure.com/my-org/my-project/_wiki/1/Page',
            gitItemPath: '/Page.md',
            isNonConformant: false,
            isParentPage: false,
            order: 0,
            subPages: [],
            url: '',
          }),
        );

      const factory = AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
        logger,
      });

      const collator = await factory.getCollator();
      const documents: any[] = [];
      for await (const doc of collator) {
        documents.push(doc);
      }

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('deprecated'),
      );
    });

    it('should not log deprecation warning when using credentials provider', async () => {
      const config = new ConfigReader({
        search: {
          collators: {
            azureDevOpsWikiCollator: {
              wikis: [
                {
                  organization: 'my-org',
                  project: 'my-project',
                  wikiIdentifier: 'my-wiki.wiki',
                },
              ],
            },
          },
        },
      });

      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue({
          headers: { Authorization: 'Bearer token' },
          token: 'token',
          type: 'bearer',
        }),
      };

      fetchSpy
        .mockResolvedValueOnce(
          mockFetchResponse({ value: [{ id: 1, path: '/Page' }] }),
        )
        .mockResolvedValueOnce(
          mockFetchResponse({
            id: 1,
            path: '/Page',
            content: 'Content',
            remoteUrl: 'https://dev.azure.com/my-org/my-project/_wiki/1/Page',
            gitItemPath: '/Page.md',
            isNonConformant: false,
            isParentPage: false,
            order: 0,
            subPages: [],
            url: '',
          }),
        );

      const factory = AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      const collator = await factory.getCollator();
      const documents: any[] = [];
      for await (const doc of collator) {
        documents.push(doc);
      }

      expect(logger.warn).not.toHaveBeenCalled();
      expect(documents).toHaveLength(1);
      expect(documents[0]).toEqual({
        title: 'Page',
        location: 'https://dev.azure.com/my-org/my-project/_wiki/1/Page',
        text: 'Content',
      });
    });

    it('should error when no wikis are configured', async () => {
      const config = new ConfigReader({
        search: {
          collators: {
            azureDevOpsWikiCollator: {
              token: 'my-pat',
            },
          },
        },
      });

      const factory = AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
        logger,
      });

      const collator = await factory.getCollator();
      const documents: any[] = [];
      for await (const doc of collator) {
        documents.push(doc);
      }

      expect(documents).toHaveLength(0);
      expect(logger.error).toHaveBeenCalledWith(
        'No wikis configured in your app-config.yaml',
      );
    });

    it('should error when no token and no credentials provider', async () => {
      const config = new ConfigReader({
        search: {
          collators: {
            azureDevOpsWikiCollator: {
              wikis: [
                {
                  organization: 'my-org',
                  project: 'my-project',
                  wikiIdentifier: 'my-wiki.wiki',
                },
              ],
            },
          },
        },
      });

      const factory = AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
        logger,
      });

      const collator = await factory.getCollator();
      const documents: any[] = [];
      for await (const doc of collator) {
        documents.push(doc);
      }

      expect(documents).toHaveLength(0);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('No credentials available'),
      );
    });

    it('should default baseUrl to https://dev.azure.com', async () => {
      const config = new ConfigReader({
        search: {
          collators: {
            azureDevOpsWikiCollator: {
              wikis: [
                {
                  organization: 'my-org',
                  project: 'my-project',
                  wikiIdentifier: 'my-wiki.wiki',
                },
              ],
            },
          },
        },
      });

      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue({
          headers: { Authorization: 'Bearer token' },
          token: 'token',
          type: 'bearer',
        }),
      };

      fetchSpy
        .mockResolvedValueOnce(
          mockFetchResponse({ value: [{ id: 1, path: '/Page' }] }),
        )
        .mockResolvedValueOnce(
          mockFetchResponse({
            id: 1,
            path: '/Page',
            content: 'Content',
            remoteUrl: 'https://dev.azure.com/my-org/my-project/_wiki/1/Page',
            gitItemPath: '/Page.md',
            isNonConformant: false,
            isParentPage: false,
            order: 0,
            subPages: [],
            url: '',
          }),
        );

      const factory = AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      const collator = await factory.getCollator();
      const documents: any[] = [];
      for await (const doc of collator) {
        documents.push(doc);
      }

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://dev.azure.com/my-org/my-project'),
        expect.any(Object),
      );
    });

    it('should index multiple wikis from different organizations', async () => {
      const config = new ConfigReader({
        search: {
          collators: {
            azureDevOpsWikiCollator: {
              wikis: [
                {
                  organization: 'org-a',
                  project: 'proj-a',
                  wikiIdentifier: 'wiki-a.wiki',
                  titleSuffix: ' - Org A',
                },
                {
                  organization: 'org-b',
                  project: 'proj-b',
                  wikiIdentifier: 'wiki-b.wiki',
                },
              ],
            },
          },
        },
      });

      const mockCredentialsProvider: AzureDevOpsCredentialsProvider = {
        getCredentials: jest.fn().mockResolvedValue({
          headers: { Authorization: 'Bearer token' },
          token: 'token',
          type: 'bearer',
        }),
      };

      fetchSpy
        .mockResolvedValueOnce(
          mockFetchResponse({ value: [{ id: 1, path: '/Page-A' }] }),
        )
        .mockResolvedValueOnce(
          mockFetchResponse({ value: [{ id: 2, path: '/Page-B' }] }),
        )
        .mockResolvedValueOnce(
          mockFetchResponse({
            id: 1,
            path: '/Page-A',
            content: 'Content A',
            remoteUrl: 'https://dev.azure.com/org-a/proj-a/_wiki/1/Page-A',
            gitItemPath: '/Page-A.md',
            isNonConformant: false,
            isParentPage: false,
            order: 0,
            subPages: [],
            url: '',
          }),
        )
        .mockResolvedValueOnce(
          mockFetchResponse({
            id: 2,
            path: '/Page-B',
            content: 'Content B',
            remoteUrl: 'https://dev.azure.com/org-b/proj-b/_wiki/2/Page-B',
            gitItemPath: '/Page-B.md',
            isNonConformant: false,
            isParentPage: false,
            order: 0,
            subPages: [],
            url: '',
          }),
        );

      const factory = AzureDevOpsWikiArticleCollatorFactory.fromConfig(config, {
        logger,
        credentialsProvider: mockCredentialsProvider,
      });

      const collator = await factory.getCollator();
      const documents: any[] = [];
      for await (const doc of collator) {
        documents.push(doc);
      }

      expect(documents).toHaveLength(2);
      expect(documents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Page-A - Org A',
            text: 'Content A',
          }),
          expect.objectContaining({
            title: 'Page-B',
            text: 'Content B',
          }),
        ]),
      );

      expect(mockCredentialsProvider.getCredentials).toHaveBeenCalledWith({
        url: 'https://dev.azure.com/org-a',
      });
      expect(mockCredentialsProvider.getCredentials).toHaveBeenCalledWith({
        url: 'https://dev.azure.com/org-b',
      });
    });
  });
});
