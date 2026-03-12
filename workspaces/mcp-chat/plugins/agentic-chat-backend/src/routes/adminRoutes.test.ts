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
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import express from 'express';
import request from 'supertest';
import knex, { type Knex } from 'knex';
import { createRouter } from '../router';
import type { AgenticProvider, AgenticProviderStatus } from '../providers';
import { ProviderManager } from '../providers';
import { AdminConfigService } from '../services/AdminConfigService';

function createApp(
  db: Knex,
  overrides?: {
    permissionResult?: AuthorizeResult;
    providerPatch?: Partial<AgenticProvider>;
  },
) {
  const permResult = overrides?.permissionResult ?? AuthorizeResult.ALLOW;
  const mockStatus: AgenticProviderStatus = {
    provider: {
      id: 'llama-stack',
      model: 'test-model',
      baseUrl: 'https://llama-stack.test',
      connected: true,
    },
    vectorStore: { id: 'vs_test', connected: true, totalDocuments: 3 },
    mcpServers: [],
    securityMode: 'plugin-only',
    timestamp: new Date().toISOString(),
    ready: true,
    configurationErrors: [],
  };

  const mockProvider: Partial<AgenticProvider> = {
    id: 'llamastack',
    displayName: 'Llama Stack',
    getStatus: jest.fn().mockResolvedValue(mockStatus),
    chat: jest.fn().mockResolvedValue({ role: 'assistant', content: 'hi' }),
    chatStream: jest.fn(),
    rag: {
      listDocuments: jest.fn().mockResolvedValue([]),
      listVectorStores: jest.fn().mockResolvedValue([]),
      getDefaultVectorStoreId: jest.fn().mockReturnValue('vs_test'),
      syncDocuments: jest.fn().mockResolvedValue({
        added: 0,
        updated: 0,
        removed: 0,
        failed: 0,
        unchanged: 0,
        errors: [],
      }),
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file-1',
        fileName: 'test.txt',
        status: 'completed',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
      searchVectorStore: jest.fn().mockResolvedValue({
        query: 'test query',
        chunks: [
          {
            text: 'Hello world chunk',
            score: 0.95,
            fileId: 'file-1',
            fileName: 'test.txt',
          },
        ],
        vectorStoreId: 'vs_test',
        totalResults: 1,
      }),
      getVectorStoreConfig: jest.fn().mockResolvedValue({
        vectorStoreName: 'test-db',
        embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
        embeddingDimension: 384,
        chunkingStrategy: 'static',
        maxChunkSizeTokens: 200,
        chunkOverlapTokens: 50,
      }),
      createVectorStoreWithConfig: jest.fn().mockResolvedValue({
        vectorStoreId: 'vs_new',
        vectorStoreName: 'test-db',
        created: true,
        embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
        embeddingDimension: 384,
      }),
      getVectorStoreStatus: jest.fn().mockResolvedValue({
        exists: true,
        ready: true,
        vectorStoreId: 'vs_test',
        vectorStoreName: 'test-db',
        documentCount: 3,
        embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
      }),
      getActiveVectorStoreIds: jest.fn().mockReturnValue(['vs_test']),
      addVectorStoreId: jest.fn(),
      removeVectorStoreId: jest.fn(),
      deleteVectorStore: jest
        .fn()
        .mockResolvedValue({ success: true, filesDeleted: 2 }),
    },
    ...overrides?.providerPatch,
  };

  const mockHttpAuth = {
    credentials: jest.fn().mockResolvedValue({
      principal: {
        type: 'user',
        userEntityRef: 'user:default/admin',
      },
      $$type: '@backstage/BackstageCredentials',
      expiresAt: undefined,
    }),
    issueUserCookie: jest.fn().mockResolvedValue(undefined),
  };

  const mockPermissions = {
    authorize: jest.fn().mockResolvedValue([{ result: permResult }]),
    authorizeConditional: jest.fn().mockResolvedValue([{ result: permResult }]),
  };

  const mockConfig = mockServices.rootConfig({
    data: {
      agenticChat: {
        branding: { appName: 'Test', tagline: 'Test' },
        security: {
          mode: 'plugin-only',
          adminUsers: ['user:default/admin'],
        },
        llamaStack: {
          vectorStoreName: 'test-db',
          embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
          embeddingDimension: 384,
          chunkingStrategy: 'static',
          maxChunkSizeTokens: 200,
          chunkOverlapTokens: 50,
        },
      },
    },
  });

  const mockDatabase = {
    getClient: jest.fn().mockResolvedValue(db),
  };

  return {
    create: async () => {
      const dbService = mockDatabase as unknown as Parameters<
        typeof createRouter
      >[0]['database'];
      const adminConfig = new AdminConfigService(
        dbService,
        mockServices.logger.mock(),
      );
      await adminConfig.initialize();

      const typedProvider = mockProvider as unknown as AgenticProvider;
      const providerManager = new ProviderManager(
        typedProvider,
        () => typedProvider,
        mockServices.logger.mock(),
      );

      const router = await createRouter({
        logger: mockServices.logger.mock(),
        config: mockConfig,
        httpAuth: mockHttpAuth as unknown as Parameters<
          typeof createRouter
        >[0]['httpAuth'],
        permissions: mockPermissions as unknown as Parameters<
          typeof createRouter
        >[0]['permissions'],
        database: dbService,
        providerManager,
        adminConfig,
      });
      const app = express();
      app.use(router);
      return app;
    },
    provider: mockProvider,
  };
}

describe('Admin routes', () => {
  let db: Knex;

  beforeEach(() => {
    db = knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });
  });

  afterEach(async () => {
    await db.destroy();
  });

  // ---------------------------------------------------------------------------
  // Permission enforcement
  // ---------------------------------------------------------------------------

  describe('permission enforcement', () => {
    it('returns 403 for non-admin users on admin routes', async () => {
      const { create } = createApp(db, {
        permissionResult: AuthorizeResult.DENY,
      });
      const app = await create();

      const res = await request(app).get('/admin/config');
      expect(res.status).toBe(403);
    });
  });

  // ---------------------------------------------------------------------------
  // Config CRUD
  // ---------------------------------------------------------------------------

  describe('GET /admin/config', () => {
    it('returns empty list initially', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/admin/config');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entries).toEqual([]);
    });
  });

  describe('PUT /admin/config/:key', () => {
    it('sets a config value', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/swimLanes')
        .send({ value: [{ id: 'lane-1', title: 'Lane 1', cards: [] }] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.configKey).toBe('swimLanes');
    });

    it('rejects invalid keys with 400', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/invalid')
        .send({ value: 'test' });

      expect(res.status).toBe(400);
    });

    it('rejects missing value field with 400', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).put('/admin/config/swimLanes').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /admin/config/:key', () => {
    it('returns null for unset keys', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/admin/config/swimLanes');
      expect(res.status).toBe(200);
      expect(res.body.entry).toBeNull();
      expect(res.body.source).toBe('default');
    });

    it('returns stored value after set', async () => {
      const { create } = createApp(db);
      const app = await create();

      await request(app)
        .put('/admin/config/systemPrompt')
        .send({ value: 'Be helpful' });

      const res = await request(app).get('/admin/config/systemPrompt');
      expect(res.status).toBe(200);
      expect(res.body.source).toBe('database');
      expect(res.body.entry.configValue).toBe('Be helpful');
      expect(res.body.entry.updatedBy).toBe('user:default/admin');
    });

    it('rejects invalid keys', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/admin/config/invalid');
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /admin/config/:key', () => {
    it('deletes an existing entry', async () => {
      const { create } = createApp(db);
      const app = await create();

      await request(app)
        .put('/admin/config/branding')
        .send({ value: { appName: 'MyApp' } });

      const res = await request(app).delete('/admin/config/branding');
      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(true);

      const check = await request(app).get('/admin/config/branding');
      expect(check.body.entry).toBeNull();
    });

    it('returns deleted=false for missing keys', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).delete('/admin/config/branding');
      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Document Upload
  // ---------------------------------------------------------------------------

  describe('POST /admin/documents', () => {
    it('uploads a file successfully', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/documents')
        .attach('file', Buffer.from('test content'), 'doc.txt');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.fileId).toBe('file-1');
      expect(res.body.fileName).toBe('test.txt');
    });

    it('rejects unsupported file types', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/documents')
        .attach('file', Buffer.from('data'), 'script.exe');

      expect(res.status).toBe(400);
    });

    it('rejects requests without a file', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).post('/admin/documents').send({});

      expect(res.status).toBe(400);
    });
  });

  describe('returns 501 when RAG feature not supported', () => {
    const ragUnsupportedPatch = {
      rag: {
        listDocuments: jest.fn().mockResolvedValue([]),
        listVectorStores: jest.fn().mockResolvedValue([]),
        getDefaultVectorStoreId: jest.fn().mockReturnValue('vs_test'),
        getActiveVectorStoreIds: jest.fn().mockReturnValue(['vs_test']),
        syncDocuments: jest.fn().mockResolvedValue({
          added: 0,
          updated: 0,
          removed: 0,
          failed: 0,
          unchanged: 0,
          errors: [],
        }),
      },
    };

    it.each([
      {
        desc: 'upload not supported',
        makeRequest: (a: express.Express) =>
          request(a)
            .post('/admin/documents')
            .attach('file', Buffer.from('test'), 'doc.txt'),
      },
      {
        desc: 'delete not supported',
        makeRequest: (a: express.Express) =>
          request(a).delete('/admin/documents/file-1'),
      },
      {
        desc: 'search not supported',
        makeRequest: (a: express.Express) =>
          request(a).post('/admin/rag-test').send({ query: 'test' }),
      },
      {
        desc: 'creation not supported',
        makeRequest: (a: express.Express) =>
          request(a).post('/admin/vector-store/create'),
      },
      {
        desc: 'status not supported',
        makeRequest: (a: express.Express) =>
          request(a).get('/admin/vector-store/status'),
      },
    ])('returns 501 when $desc', async ({ makeRequest }) => {
      const { create } = createApp(db, { providerPatch: ragUnsupportedPatch });
      const app = await create();
      const res = await makeRequest(app);
      expect(res.status).toBe(501);
    });
  });

  // ---------------------------------------------------------------------------
  // Document Delete
  // ---------------------------------------------------------------------------

  describe('DELETE /admin/documents/:id', () => {
    it('deletes a document', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).delete('/admin/documents/file-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.documentId).toBe('file-1');
    });
  });

  // ---------------------------------------------------------------------------
  // RAG Test
  // ---------------------------------------------------------------------------

  describe('POST /admin/rag-test', () => {
    it('searches the vector store', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/rag-test')
        .send({ query: 'hello world' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.chunks).toHaveLength(1);
      expect(res.body.chunks[0].text).toBe('Hello world chunk');
      expect(res.body.vectorStoreId).toBe('vs_test');
    });

    it('rejects empty query', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/rag-test')
        .send({ query: '' });

      expect(res.status).toBe(400);
    });

    it('rejects missing query', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).post('/admin/rag-test').send({});

      expect(res.status).toBe(400);
    });

    it('rejects query exceeding max length', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/rag-test')
        .send({ query: 'x'.repeat(2001) });

      expect(res.status).toBe(400);
    });

    it('rejects invalid maxResults', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/rag-test')
        .send({ query: 'test', maxResults: 100 });

      expect(res.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // Vector Store Config
  // ---------------------------------------------------------------------------

  describe('GET /admin/vector-store-config', () => {
    it('returns effective config from YAML defaults', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/admin/vector-store-config');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.source).toBe('yaml');
      expect(res.body.config.vectorStoreName).toBe('test-db');
      expect(res.body.config.embeddingModel).toBe(
        'sentence-transformers/all-MiniLM-L6-v2',
      );
      expect(res.body.config.embeddingDimension).toBe(384);
    });

    it('merges DB overrides with YAML', async () => {
      const { create } = createApp(db, {
        providerPatch: {
          rag: {
            listDocuments: jest.fn().mockResolvedValue([]),
            listVectorStores: jest.fn().mockResolvedValue([]),
            getDefaultVectorStoreId: jest.fn().mockReturnValue('vs_test'),
            getActiveVectorStoreIds: jest.fn().mockReturnValue(['vs_test']),
            syncDocuments: jest.fn().mockResolvedValue({
              added: 0,
              updated: 0,
              removed: 0,
              failed: 0,
              unchanged: 0,
              errors: [],
            }),
            getVectorStoreConfig: jest.fn().mockResolvedValue({
              vectorStoreName: 'custom-db',
              embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
              embeddingDimension: 768,
              chunkingStrategy: 'static',
              maxChunkSizeTokens: 200,
              chunkOverlapTokens: 50,
            }),
          },
        },
      });
      const app = await create();

      // Save a DB override so the route reports source: 'merged'
      await request(app)
        .put('/admin/config/vectorStoreConfig')
        .send({
          value: {
            vectorStoreName: 'custom-db',
            embeddingDimension: 768,
          },
        });

      const res = await request(app).get('/admin/vector-store-config');
      expect(res.status).toBe(200);
      expect(res.body.source).toBe('merged');
      expect(res.body.config.vectorStoreName).toBe('custom-db');
      expect(res.body.config.embeddingDimension).toBe(768);
      expect(res.body.config.embeddingModel).toBe(
        'sentence-transformers/all-MiniLM-L6-v2',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Vector Store Create
  // ---------------------------------------------------------------------------

  describe('POST /admin/vector-store/create', () => {
    it('creates a vector store', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).post('/admin/vector-store/create');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.vectorStoreId).toBe('vs_new');
      expect(res.body.created).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Vector Store Status
  // ---------------------------------------------------------------------------

  describe('GET /admin/vector-store/status', () => {
    it('returns vector store status', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/admin/vector-store/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.exists).toBe(true);
      expect(res.body.ready).toBe(true);
      expect(res.body.vectorStoreId).toBe('vs_test');
      expect(res.body.documentCount).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // Duplicate Document Prevention
  // ---------------------------------------------------------------------------

  describe('POST /admin/documents (duplicate prevention)', () => {
    it('returns 409 when a file with the same name exists', async () => {
      const { create, provider } = createApp(db);
      (provider.rag!.listDocuments as jest.Mock).mockResolvedValue([
        {
          id: 'file-existing',
          fileName: 'readme.md',
          format: 'md',
          fileSize: 100,
          status: 'completed',
        },
      ]);
      const app = await create();

      const res = await request(app)
        .post('/admin/documents')
        .attach('file', Buffer.from('# Hello'), 'readme.md');

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already exists');
      expect(res.body.existingFile.id).toBe('file-existing');
    });

    it('replaces file when ?replace=true is set', async () => {
      const { create, provider } = createApp(db);
      (provider.rag!.listDocuments as jest.Mock).mockResolvedValue([
        {
          id: 'file-old',
          fileName: 'readme.md',
          format: 'md',
          fileSize: 100,
          status: 'completed',
        },
      ]);
      const app = await create();

      const res = await request(app)
        .post('/admin/documents?replace=true')
        .attach('file', Buffer.from('# Updated'), 'readme.md');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.replaced).toBe(true);
      expect(provider.rag!.deleteDocument).toHaveBeenCalledWith(
        'file-old',
        undefined,
      );
    });

    it('allows upload when no duplicate exists', async () => {
      const { create, provider } = createApp(db);
      (provider.rag!.listDocuments as jest.Mock).mockResolvedValue([]);
      const app = await create();

      const res = await request(app)
        .post('/admin/documents')
        .attach('file', Buffer.from('hello'), 'newfile.txt');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.replaced).toBe(false);
      expect(provider.rag!.uploadDocument).toHaveBeenCalledWith(
        'newfile.txt',
        expect.any(Buffer),
        undefined,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Multi-Vector-Store Management
  // ---------------------------------------------------------------------------

  describe('GET /admin/vector-stores', () => {
    it('returns active vector stores', async () => {
      const { create, provider } = createApp(db);
      (provider.rag!.listVectorStores as jest.Mock).mockResolvedValue([
        {
          id: 'vs_test',
          name: 'test-db',
          status: 'completed',
          fileCount: 3,
          createdAt: 1700000000,
        },
      ]);
      const app = await create();

      const res = await request(app).get('/admin/vector-stores');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stores).toHaveLength(1);
      expect(res.body.stores[0].id).toBe('vs_test');
      expect(res.body.stores[0].active).toBe(true);
    });

    it('returns empty array when RAG is not available', async () => {
      const { create } = createApp(db, {
        providerPatch: { rag: undefined },
      });
      const app = await create();

      const res = await request(app).get('/admin/vector-stores');
      expect(res.status).toBe(200);
      expect(res.body.stores).toEqual([]);
    });
  });

  describe('POST /admin/vector-stores/connect', () => {
    it('connects an existing vector store after validating on server', async () => {
      const { create, provider } = createApp(db);
      (provider.rag!.listVectorStores as jest.Mock).mockResolvedValueOnce([
        {
          id: 'vs_new_store',
          name: 'new-store',
          status: 'completed',
          fileCount: 0,
          createdAt: 0,
        },
      ]);
      const app = await create();

      const res = await request(app)
        .post('/admin/vector-stores/connect')
        .send({ vectorStoreId: 'vs_new_store' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(provider.rag!.addVectorStoreId).toHaveBeenCalledWith(
        'vs_new_store',
      );
    });

    it('returns 404 when vector store does not exist on server', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/vector-stores/connect')
        .send({ vectorStoreId: 'vs_nonexistent' });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found on the server');
    });

    it('returns 400 when vectorStoreId is missing', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/vector-stores/connect')
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 409 when vectorStoreId is already connected', async () => {
      const { create, provider } = createApp(db);
      (provider.rag!.listVectorStores as jest.Mock).mockResolvedValueOnce([
        {
          id: 'vs_test',
          name: 'test-db',
          status: 'completed',
          fileCount: 0,
          createdAt: 0,
        },
      ]);
      const app = await create();

      const res = await request(app)
        .post('/admin/vector-stores/connect')
        .send({ vectorStoreId: 'vs_test' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already connected');
    });
  });

  describe('DELETE /admin/vector-stores/:id', () => {
    it('removes a vector store from active list (disconnect)', async () => {
      const { create, provider } = createApp(db);
      const app = await create();

      const res = await request(app).delete('/admin/vector-stores/vs_test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.removed).toBe('vs_test');
      expect(res.body.permanent).toBe(false);
      expect(provider.rag!.removeVectorStoreId).toHaveBeenCalledWith('vs_test');
      expect(provider.rag!.deleteVectorStore).not.toHaveBeenCalled();
    });

    it('permanently deletes a vector store and files with ?permanent=true', async () => {
      const { create, provider } = createApp(db);
      const app = await create();

      const res = await request(app).delete(
        '/admin/vector-stores/vs_test?permanent=true',
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.removed).toBe('vs_test');
      expect(res.body.permanent).toBe(true);
      expect(res.body.filesDeleted).toBe(2);
      expect(provider.rag!.deleteVectorStore).toHaveBeenCalledWith('vs_test');
    });
  });

  // ---------------------------------------------------------------------------
  // Effective Config
  // ---------------------------------------------------------------------------

  describe('GET /admin/effective-config', () => {
    it('returns YAML-only fallback when provider has no getEffectiveConfig', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/admin/effective-config');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });

    it('returns provider effective config when getEffectiveConfig is implemented', async () => {
      const mockEffective = {
        model: 'meta-llama/Llama-3.3-8B-Instruct',
        baseUrl: 'http://localhost:8321',
        systemPrompt: 'You are helpful',
        toolChoice: 'auto',
        enableWebSearch: false,
        enableCodeInterpreter: false,
        safetyEnabled: true,
        inputShields: ['shield-1'],
        outputShields: [],
      };

      const { create } = createApp(db, {
        providerPatch: {
          getEffectiveConfig: jest.fn().mockResolvedValue(mockEffective),
        },
      });
      const app = await create();

      const res = await request(app).get('/admin/effective-config');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config.model).toBe('meta-llama/Llama-3.3-8B-Instruct');
      expect(res.body.config.baseUrl).toBe('http://localhost:8321');
      expect(res.body.config.safetyEnabled).toBe(true);
      expect(res.body.config.inputShields).toEqual(['shield-1']);
    });

    it('strips sensitive fields from the response', async () => {
      const mockEffective = {
        model: 'test-model',
        baseUrl: 'http://localhost:8321',
        token: 'secret-api-key',
        skipTlsVerify: true,
      };

      const { create } = createApp(db, {
        providerPatch: {
          getEffectiveConfig: jest.fn().mockResolvedValue(mockEffective),
        },
      });
      const app = await create();

      const res = await request(app).get('/admin/effective-config');
      expect(res.status).toBe(200);
      expect(res.body.config.token).toBeUndefined();
      expect(res.body.config.skipTlsVerify).toBeUndefined();
      expect(res.body.config.model).toBe('test-model');
    });
  });

  // ---------------------------------------------------------------------------
  // List Available Models
  // ---------------------------------------------------------------------------

  describe('GET /admin/models', () => {
    it('returns 501 when provider does not support listModels', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/admin/models');
      expect(res.status).toBe(501);
      expect(res.body.success).toBe(false);
    });

    it('returns models from provider', async () => {
      const { create } = createApp(db, {
        providerPatch: {
          listModels: jest
            .fn()
            .mockResolvedValue([
              { id: 'meta-llama/Llama-3.3-8B-Instruct', owned_by: 'meta' },
              { id: 'qwen3:14b-q8_0' },
            ]),
        },
      });
      const app = await create();

      const res = await request(app).get('/admin/models');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.models).toHaveLength(2);
      expect(res.body.models[0].id).toBe('meta-llama/Llama-3.3-8B-Instruct');
      expect(res.body.models[0].owned_by).toBe('meta');
      expect(res.body.models[1].id).toBe('qwen3:14b-q8_0');
    });

    it('returns 500 when provider throws', async () => {
      const { create } = createApp(db, {
        providerPatch: {
          listModels: jest
            .fn()
            .mockRejectedValue(new Error('Connection refused')),
        },
      });
      const app = await create();

      const res = await request(app).get('/admin/models');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Generate System Prompt
  // ---------------------------------------------------------------------------

  describe('POST /admin/generate-system-prompt', () => {
    it('rejects empty description', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/generate-system-prompt')
        .send({ description: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects description exceeding 2000 characters', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/generate-system-prompt')
        .send({ description: 'x'.repeat(2001) });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 501 when provider does not support generation', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .post('/admin/generate-system-prompt')
        .send({ description: 'Help with Kubernetes' });

      expect(res.status).toBe(501);
      expect(res.body.success).toBe(false);
    });

    it('returns generated prompt from provider', async () => {
      const { create } = createApp(db, {
        providerPatch: {
          generateSystemPrompt: jest
            .fn()
            .mockResolvedValue('You are a helpful Kubernetes assistant.'),
        },
      });
      const app = await create();

      const res = await request(app)
        .post('/admin/generate-system-prompt')
        .send({ description: 'Help with Kubernetes deployments' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.prompt).toBe('You are a helpful Kubernetes assistant.');
      expect(res.body.timestamp).toBeDefined();
    });

    it('returns 500 when provider throws', async () => {
      const { create } = createApp(db, {
        providerPatch: {
          generateSystemPrompt: jest
            .fn()
            .mockRejectedValue(new Error('LLM unreachable')),
        },
      });
      const app = await create();

      const res = await request(app)
        .post('/admin/generate-system-prompt')
        .send({ description: 'Help me' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // Step 4 Integration Tests: Validation, Branding Merge, Cache Invalidation
  // ===========================================================================

  describe('PUT /admin/config/:key validation', () => {
    it('rejects invalid baseUrl', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/baseUrl')
        .send({ value: 'not-a-url' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('accepts valid baseUrl', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/baseUrl')
        .send({ value: 'https://llama.example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects empty model string', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/model')
        .send({ value: '  ' });

      expect(res.status).toBe(400);
    });

    it('rejects non-boolean enableWebSearch', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/enableWebSearch')
        .send({ value: 'yes' });

      expect(res.status).toBe(400);
    });

    it('rejects invalid toolChoice', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/toolChoice')
        .send({ value: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('accepts valid toolChoice string', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/toolChoice')
        .send({ value: 'auto' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /branding — DB + YAML merge', () => {
    it('returns YAML branding when no DB override exists', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/branding');
      expect(res.status).toBe(200);
      expect(res.body.branding.appName).toBe('Test');
      expect(res.body.branding.tagline).toBe('Test');
    });

    it('merges DB branding overrides on top of YAML', async () => {
      const { create } = createApp(db);
      const app = await create();

      await request(app)
        .put('/admin/config/branding')
        .send({ value: { appName: 'Custom App', primaryColor: '#ff0000' } });

      const res = await request(app).get('/branding');
      expect(res.status).toBe(200);
      expect(res.body.branding.appName).toBe('Custom App');
      expect(res.body.branding.primaryColor).toBe('#ff0000');
      // YAML baseline fields should still be present
      expect(res.body.branding.tagline).toBe('Test');
    });

    it('reverts to YAML after DB branding is deleted', async () => {
      const { create } = createApp(db);
      const app = await create();

      await request(app)
        .put('/admin/config/branding')
        .send({ value: { appName: 'Custom App' } });
      await request(app).delete('/admin/config/branding');

      const res = await request(app).get('/branding');
      expect(res.status).toBe(200);
      expect(res.body.branding.appName).toBe('Test');
    });
  });

  describe('Cache invalidation callback', () => {
    it('calls onConfigChanged when provider supports it', async () => {
      const invalidateFn = jest.fn();
      const { create } = createApp(db, {
        providerPatch: {
          invalidateRuntimeConfig: invalidateFn,
        },
      });
      const app = await create();

      await request(app)
        .put('/admin/config/systemPrompt')
        .send({ value: 'Updated prompt' });

      expect(invalidateFn).toHaveBeenCalledTimes(1);
    });

    it('calls onConfigChanged on delete', async () => {
      const invalidateFn = jest.fn();
      const { create } = createApp(db, {
        providerPatch: {
          invalidateRuntimeConfig: invalidateFn,
        },
      });
      const app = await create();

      await request(app)
        .put('/admin/config/branding')
        .send({ value: { appName: 'X' } });
      invalidateFn.mockClear();

      await request(app).delete('/admin/config/branding');

      expect(invalidateFn).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Step 6: MCP servers via admin config
  // ===========================================================================

  describe('PUT /admin/config/mcpServers', () => {
    it('accepts valid MCP server configs', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/mcpServers')
        .send({
          value: [
            {
              id: 'mcp-test',
              name: 'Test MCP',
              url: 'https://mcp.example.com/sse',
              type: 'sse',
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects MCP server with invalid URL', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/mcpServers')
        .send({
          value: [
            { id: 'bad', name: 'Bad MCP', url: 'not-a-url', type: 'sse' },
          ],
        });

      expect(res.status).toBe(400);
    });

    it('rejects MCP server missing required fields', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app)
        .put('/admin/config/mcpServers')
        .send({ value: [{ url: 'https://mcp.test' }] });

      expect(res.status).toBe(400);
    });

    it('persists and retrieves MCP server config', async () => {
      const { create } = createApp(db);
      const app = await create();

      const servers = [
        {
          id: 'mcp-new',
          name: 'New MCP Server',
          url: 'https://new-mcp.example.com/sse',
          type: 'sse',
        },
      ];

      await request(app)
        .put('/admin/config/mcpServers')
        .send({ value: servers });

      const res = await request(app).get('/admin/config/mcpServers');
      expect(res.status).toBe(200);
      expect(res.body.source).toBe('database');
      expect(res.body.entry.configValue).toEqual(servers);
    });
  });

  // ===========================================================================
  // Runtime propagation: admin save → immediate effect on non-admin routes
  // ===========================================================================

  describe('GET /swim-lanes — DB + YAML round-trip', () => {
    it('returns YAML swim lanes when no DB override exists', async () => {
      const { create } = createApp(db);
      const app = await create();

      const res = await request(app).get('/swim-lanes');
      expect(res.status).toBe(200);
      expect(res.body.source).toBe('yaml');
    });

    it('returns DB swim lanes after admin save', async () => {
      const { create } = createApp(db);
      const app = await create();

      const lanes = [
        {
          id: 'lane-1',
          title: 'Admin Lane',
          cards: [{ title: 'Card 1', prompt: 'Do something' }],
        },
      ];

      await request(app).put('/admin/config/swimLanes').send({ value: lanes });

      const res = await request(app).get('/swim-lanes');
      expect(res.status).toBe(200);
      expect(res.body.source).toBe('database');
      expect(res.body.swimLanes).toEqual(lanes);
    });

    it('reverts to YAML after admin deletes swim lanes', async () => {
      const { create } = createApp(db);
      const app = await create();

      const lanes = [
        {
          id: 'lane-temp',
          title: 'Temp Lane',
          cards: [{ title: 'Card', prompt: 'test' }],
        },
      ];

      await request(app).put('/admin/config/swimLanes').send({ value: lanes });

      let res = await request(app).get('/swim-lanes');
      expect(res.body.source).toBe('database');

      await request(app).delete('/admin/config/swimLanes');

      res = await request(app).get('/swim-lanes');
      expect(res.body.source).toBe('yaml');
    });
  });

  describe('Config CRUD — all AdminConfigKey round-trips', () => {
    it('safetyOnError: saves and retrieves', async () => {
      const { create } = createApp(db);
      const app = await create();

      const putRes = await request(app)
        .put('/admin/config/safetyOnError')
        .send({ value: 'block' });
      expect(putRes.status).toBe(200);

      const getRes = await request(app).get('/admin/config/safetyOnError');
      expect(getRes.body.source).toBe('database');
      expect(getRes.body.entry.configValue).toBe('block');
    });

    it('evaluationOnError: saves and retrieves', async () => {
      const { create } = createApp(db);
      const app = await create();

      const putRes = await request(app)
        .put('/admin/config/evaluationOnError')
        .send({ value: 'fail' });
      expect(putRes.status).toBe(200);

      const getRes = await request(app).get('/admin/config/evaluationOnError');
      expect(getRes.body.source).toBe('database');
      expect(getRes.body.entry.configValue).toBe('fail');
    });

    it('disabledMcpServerIds: saves and retrieves', async () => {
      const { create } = createApp(db);
      const app = await create();

      const putRes = await request(app)
        .put('/admin/config/disabledMcpServerIds')
        .send({ value: ['server-1', 'server-2'] });
      expect(putRes.status).toBe(200);

      const getRes = await request(app).get(
        '/admin/config/disabledMcpServerIds',
      );
      expect(getRes.body.source).toBe('database');
      expect(getRes.body.entry.configValue).toEqual(['server-1', 'server-2']);
    });

    it('multiple keys saved and retrieved independently', async () => {
      const { create } = createApp(db);
      const app = await create();

      await request(app)
        .put('/admin/config/model')
        .send({ value: 'test-model-v2' });
      await request(app)
        .put('/admin/config/systemPrompt')
        .send({ value: 'Be concise.' });
      await request(app)
        .put('/admin/config/safetyEnabled')
        .send({ value: true });
      await request(app)
        .put('/admin/config/evaluationEnabled')
        .send({ value: true });
      await request(app)
        .put('/admin/config/minScoreThreshold')
        .send({ value: 0.75 });

      const modelRes = await request(app).get('/admin/config/model');
      expect(modelRes.body.entry.configValue).toBe('test-model-v2');
      expect(modelRes.body.source).toBe('database');

      const promptRes = await request(app).get('/admin/config/systemPrompt');
      expect(promptRes.body.entry.configValue).toBe('Be concise.');

      const safetyRes = await request(app).get('/admin/config/safetyEnabled');
      expect(safetyRes.body.entry.configValue).toBe(true);

      const evalRes = await request(app).get('/admin/config/evaluationEnabled');
      expect(evalRes.body.entry.configValue).toBe(true);

      const threshRes = await request(app).get(
        '/admin/config/minScoreThreshold',
      );
      expect(threshRes.body.entry.configValue).toBe(0.75);

      const listRes = await request(app).get('/admin/config');
      expect(listRes.body.entries).toHaveLength(5);
    });
  });

  describe('MCP test-connection SSRF protection', () => {
    it.each([
      {
        desc: 'localhost',
        url: 'http://localhost:3000/mcp',
        errorMatch: 'private/internal network',
      },
      {
        desc: '127.0.0.1',
        url: 'http://127.0.0.1:8080/mcp',
        errorMatch: 'private/internal network',
      },
      {
        desc: '10.x private network',
        url: 'http://10.0.0.5:3000/mcp',
        errorMatch: 'private/internal network',
      },
      {
        desc: '192.168.x private network',
        url: 'http://192.168.1.1:3000/mcp',
        errorMatch: 'private/internal network',
      },
      {
        desc: '172.16-31.x private network',
        url: 'http://172.20.0.1:3000/mcp',
        errorMatch: 'private/internal network',
      },
      {
        desc: 'link-local 169.254.x',
        url: 'http://169.254.169.254/latest/meta-data/',
        errorMatch: 'private/internal network',
      },
      { desc: 'missing URL', url: undefined, errorMatch: 'URL is required' },
      {
        desc: 'non-http/https protocol',
        url: 'ftp://example.com/mcp',
        errorMatch: 'http:// or https://',
      },
    ])('rejects $desc URLs', async ({ url, errorMatch }) => {
      const { create } = createApp(db);
      const app = await create();

      const body: Record<string, unknown> = { type: 'streamable-http' };
      if (url !== undefined) body.url = url;

      const res = await request(app)
        .post('/admin/mcp/test-connection')
        .send(body);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const errorText = res.body.message ?? res.body.error ?? '';
      expect(errorText).toContain(errorMatch);
    });
  });
});
