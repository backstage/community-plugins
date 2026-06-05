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
import { runCatalogCleanupSweeper } from './catalogCleanup';
import { ConfigReader } from '@backstage/config';

// 1. Define mock functions
const mockDownload = jest.fn();
const mockFile = jest.fn().mockReturnValue({
  download: mockDownload,
});
const mockDeleteFiles = jest.fn();
const mockGetFiles = jest.fn();
const mockBucket = jest.fn().mockReturnValue({
  file: mockFile,
  getFiles: mockGetFiles,
  deleteFiles: mockDeleteFiles,
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

const mockDeleteDocument = jest.fn();
jest.mock('@google-cloud/discoveryengine', () => {
  return {
    DocumentServiceClient: jest.fn().mockImplementation(() => {
      return {
        projectLocationCollectionDataStoreBranchPath: jest
          .fn()
          .mockReturnValue('mock-parent-path'),
        deleteDocument: mockDeleteDocument,
      };
    }),
  };
});

describe('runCatalogCleanupSweeper', () => {
  let mockCatalog: any;
  let mockLogger: any;
  let mockAuth: any;
  let mockConfig: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCatalog = {
      getEntities: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    mockAuth = {
      getOwnServiceCredentials: jest
        .fn()
        .mockResolvedValue({ token: 'mock-token' }),
    };

    mockConfig = new ConfigReader({
      techdocs: {
        publisher: {
          googleGcs: {
            bucketName: 'my-techdocs-bucket',
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
    });
  });

  it('should skip sweep if bucketName is not configured', async () => {
    mockConfig = new ConfigReader({
      search: {
        engines: {
          vertexai: {
            location: 'europe-west4',
            projectId: 'my-project',
            dataStoreId: 'my-datastore',
          },
        },
      },
    });

    await runCatalogCleanupSweeper({
      config: mockConfig,
      logger: mockLogger,
      catalog: mockCatalog,
      auth: mockAuth,
    });

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('TechDocs GCS bucketName is not configured'),
    );
    expect(mockCatalog.getEntities).not.toHaveBeenCalled();
  });

  it('should sweep orphaned folders in GCS and delete their entries in Vertex AI Search', async () => {
    mockCatalog.getEntities.mockResolvedValue({
      items: [
        {
          metadata: {
            name: 'active-comp',
            namespace: 'default',
          },
          kind: 'Component',
        },
      ],
    });

    const mockActiveFile = {
      name: 'default/component/active-comp/index.html',
    };
    const mockStaleFile = { name: 'default/component/stale-comp/index.html' };
    const mockStaleIndexFile = {
      name: 'default/component/stale-comp/search_index.json',
    };

    mockGetFiles.mockResolvedValue([
      [mockActiveFile, mockStaleFile, mockStaleIndexFile],
    ]);

    const mockStaleDocs = [
      { title: 'Stale Page 1', text: 'stale text', location: 'page1.html' },
    ];
    mockDownload.mockResolvedValueOnce([
      Buffer.from(JSON.stringify({ docs: mockStaleDocs })),
    ]);

    await runCatalogCleanupSweeper({
      config: mockConfig,
      logger: mockLogger,
      catalog: mockCatalog,
      auth: mockAuth,
    });

    expect(mockCatalog.getEntities).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { kind: 'component' },
      }),
      expect.objectContaining({
        credentials: { token: 'mock-token' },
      }),
    );

    expect(mockGetFiles).toHaveBeenCalled();
    expect(mockBucket).toHaveBeenCalledWith('my-techdocs-bucket');
    expect(mockFile).toHaveBeenCalledWith(
      'default/component/stale-comp/search_index.json',
    );
    expect(mockDownload).toHaveBeenCalled();

    expect(mockDeleteDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining('mock-parent-path/documents/'),
      }),
    );

    expect(mockDeleteFiles).toHaveBeenCalledWith({
      prefix: 'default/component/stale-comp/',
    });
  });
});
