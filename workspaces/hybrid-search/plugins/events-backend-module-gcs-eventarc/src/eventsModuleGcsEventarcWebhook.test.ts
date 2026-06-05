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
import { startTestBackend, mockServices } from '@backstage/backend-test-utils';
import { eventsServiceRef } from '@backstage/plugin-events-node';
import { createServiceFactory } from '@backstage/backend-plugin-api';
import request from 'supertest';

// 1. Define mock functions
const mockDownload = jest.fn();
const mockFile = jest.fn().mockReturnValue({
  download: mockDownload,
});
const mockGetFiles = jest.fn();
const mockBucket = jest.fn().mockReturnValue({
  file: mockFile,
  getFiles: mockGetFiles,
});

jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn().mockImplementation(() => {
      return {
        bucket: mockBucket,
      };
    }),
  };
});

const mockImportDocuments = jest.fn();
const mockDeleteDocument = jest.fn();
const mockPromise = jest.fn();

jest.mock('@google-cloud/discoveryengine', () => {
  return {
    DocumentServiceClient: jest.fn().mockImplementation(() => {
      return {
        projectLocationCollectionDataStoreBranchPath: jest
          .fn()
          .mockReturnValue('mock-parent-path'),
        importDocuments: mockImportDocuments,
        deleteDocument: mockDeleteDocument,
      };
    }),
  };
});

const mockVerifyIdToken = jest.fn();
jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: mockVerifyIdToken,
      };
    }),
  };
});

// 2. Load the module under test after mocks are defined
const mod = require('./eventsModuleGcsEventarcWebhook');

const eventsModuleGcsEventarcWebhook =
  mod.eventsModuleGcsEventarcWebhook || mod.default;

describe('eventsModuleGcsEventarcWebhook', () => {
  let mockEventsService: any;
  let oidcEnabled = false;

  beforeEach(() => {
    jest.clearAllMocks();
    oidcEnabled = false;

    mockEventsService = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    };

    mockPromise.mockResolvedValue({});
    mockImportDocuments.mockResolvedValue([{ promise: mockPromise }]);
  });

  const getFeatures = () => {
    const configMock = mockServices.rootConfig.factory({
      data: {
        events: {
          modules: {
            gcsEventarcWebhook: {
              oidc: {
                enabled: oidcEnabled,
                audience: 'my-audience',
                serviceAccountEmail: 'expected-sa@gcp.com',
              },
            },
          },
        },
        search: {
          engines: {
            vertexai: {
              location: 'europe-west4',
              projectId: 'my-project',
              dataStoreId: 'my-datastore',
            },
          },
        },
      },
    });

    const eventsMockServiceFactory = createServiceFactory({
      service: eventsServiceRef,
      deps: {},
      async factory() {
        return mockEventsService;
      },
    });

    return [
      eventsModuleGcsEventarcWebhook,
      configMock,
      eventsMockServiceFactory,
    ];
  };

  it('should initialize and register router + subscriber', async () => {
    await startTestBackend({
      features: getFeatures(),
    });

    expect(mockEventsService.subscribe).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'gcs-eventarc-webhook',
        topics: ['gcs-notifications'],
      }),
    );
  });

  describe('HTTP /gcs router', () => {
    it('accepts unauthenticated requests when OIDC is disabled', async () => {
      oidcEnabled = false;
      const { server } = await startTestBackend({
        features: getFeatures(),
      });

      const response = await request(server)
        .post('/api/events/gcs')
        .set('ce-type', 'google.cloud.storage.object.v1.finalized')
        .send({
          bucket: 'my-bucket',
          name: 'default/Component/my-comp/search_index.json',
          generation: 123456,
        });

      expect(response.status).toBe(200);
      expect(mockEventsService.publish).toHaveBeenCalledWith({
        topic: 'gcs-notifications',
        eventPayload: {
          bucket: 'my-bucket',
          name: 'default/Component/my-comp/search_index.json',
          generation: 123456,
        },
      });
    });

    it('rejects unauthenticated requests when OIDC is enabled and token is missing', async () => {
      oidcEnabled = true;
      const { server } = await startTestBackend({
        features: getFeatures(),
      });

      const response = await request(server)
        .post('/api/events/gcs')
        .set('ce-type', 'google.cloud.storage.object.v1.finalized')
        .send({
          bucket: 'my-bucket',
          name: 'default/Component/my-comp/search_index.json',
          generation: 123456,
        });

      expect(response.status).toBe(401);
      expect(mockEventsService.publish).not.toHaveBeenCalled();
    });

    it('accepts authenticated requests when OIDC is enabled and valid token is provided', async () => {
      oidcEnabled = true;

      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          iss: 'https://accounts.google.com',
          email: 'expected-sa@gcp.com',
        }),
      });

      const { server } = await startTestBackend({
        features: getFeatures(),
      });

      const response = await request(server)
        .post('/api/events/gcs')
        .set('ce-type', 'google.cloud.storage.object.v1.finalized')
        .set('authorization', 'Bearer valid-id-token')
        .send({
          bucket: 'my-bucket',
          name: 'default/Component/my-comp/search_index.json',
          generation: 123456,
        });

      expect(response.status).toBe(200);
      expect(mockVerifyIdToken).toHaveBeenCalledWith({
        idToken: 'valid-id-token',
        audience: 'my-audience',
      });
      expect(mockEventsService.publish).toHaveBeenCalled();
    });
  });

  describe('Events subscriber processing logic', () => {
    it('downloads search_index.json, processes docs, imports into DiscoveryEngine and runs deletes', async () => {
      let subscriberCallback: any;

      mockEventsService.subscribe.mockImplementation((sub: any) => {
        subscriberCallback = sub.onEvent;
      });

      await startTestBackend({
        features: getFeatures(),
      });

      expect(subscriberCallback).toBeDefined();

      // Setup current version docs download
      const mockDocs = [
        { title: 'Doc A', text: 'Some text', location: 'page1.html' },
        { title: 'Doc B', text: 'Some other text', location: 'page2.html' },
      ];
      mockDownload.mockResolvedValueOnce([
        Buffer.from(JSON.stringify({ docs: mockDocs })),
      ]);

      // Setup previous version generations and files
      const mockPrevFile = {
        name: 'default/Component/my-comp/search_index.json',
        generation: 100000,
      };
      mockGetFiles.mockResolvedValueOnce([
        [
          {
            name: 'default/Component/my-comp/search_index.json',
            generation: 123456,
          },
          mockPrevFile,
        ],
      ]);

      // Setup previous version docs download (Doc A and Doc C)
      const mockPrevDocs = [
        { title: 'Doc A', text: 'Some text', location: 'page1.html' },
        { title: 'Doc C', text: 'Stale doc', location: 'page3.html' }, // Stale, should be deleted
      ];
      mockDownload.mockResolvedValueOnce([
        Buffer.from(JSON.stringify({ docs: mockPrevDocs })),
      ]);

      // Execute onEvent subscriber callback
      await subscriberCallback({
        topic: 'gcs-notifications',
        eventPayload: {
          bucket: 'my-bucket',
          name: 'default/Component/my-comp/search_index.json',
          generation: 123456,
        },
      });

      // Assert current docs download was called
      expect(mockBucket).toHaveBeenCalledWith('my-bucket');
      expect(mockFile).toHaveBeenCalledWith(
        'default/Component/my-comp/search_index.json',
        {
          generation: '123456',
        },
      );

      // Assert import to Discovery Engine was called
      expect(mockImportDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: 'mock-parent-path',
          inlineSource: {
            documents: expect.arrayContaining([
              expect.objectContaining({
                jsonData: expect.stringContaining('page1.html'),
              }),
              expect.objectContaining({
                jsonData: expect.stringContaining('page2.html'),
              }),
            ]),
          },
          reconciliationMode: 'INCREMENTAL',
        }),
      );

      // Assert previous generation lookups were called
      expect(mockGetFiles).toHaveBeenCalledWith({
        prefix: 'default/Component/my-comp/search_index.json',
        versions: true,
      });

      expect(mockFile).toHaveBeenCalledWith(
        'default/Component/my-comp/search_index.json',
        {
          generation: '100000',
        },
      );

      // Assert deletion of Doc C (page3.html)
      expect(mockDeleteDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('mock-parent-path/documents/'),
        }),
      );
      expect(mockDeleteDocument).toHaveBeenCalledTimes(1);
    });
  });
});
