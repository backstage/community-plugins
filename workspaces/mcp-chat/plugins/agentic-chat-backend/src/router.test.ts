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

import { createRouter } from './router';
import type { AgenticProvider, AgenticProviderStatus } from './providers';
import { ProviderManager } from './providers';
import type { ChatSessionService } from './services/ChatSessionService';
import { AdminConfigService } from './services/AdminConfigService';
import { DocumentInfo, FileFormat } from './types';

type RouterOptions = Parameters<typeof createRouter>[0];

function createTestRouterOptions(
  db: Knex,
  mockProvider: Partial<AgenticProvider>,
  adminConfig: AdminConfigService,
  overrides?: Partial<RouterOptions>,
): RouterOptions {
  const mockDatabase = { getClient: jest.fn().mockResolvedValue(db) };
  const mockConfig = mockServices.rootConfig({
    data: {
      agenticChat: {
        branding: { appName: 'Test App', tagline: 'Test tagline' },
      },
    },
  });
  const mockHttpAuth = {
    credentials: jest.fn().mockResolvedValue({
      principal: { type: 'user', userEntityRef: 'user:default/testuser' },
      $$type: '@backstage/BackstageCredentials',
      expiresAt: undefined,
    }),
    issueUserCookie: jest.fn().mockResolvedValue(undefined),
  };
  const mockPermissions = {
    authorize: jest.fn().mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
    authorizeConditional: jest
      .fn()
      .mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
  };

  const provider = mockProvider as unknown as AgenticProvider;
  const providerManager = new ProviderManager(
    provider,
    () => provider,
    mockServices.logger.mock(),
  );

  return {
    logger: mockServices.logger.mock(),
    config: mockConfig,
    httpAuth: mockHttpAuth as unknown as RouterOptions['httpAuth'],
    permissions: mockPermissions as unknown as RouterOptions['permissions'],
    database: mockDatabase as unknown as RouterOptions['database'],
    providerManager,
    adminConfig,
    ...overrides,
  };
}

describe('createRouter', () => {
  let app: express.Express;
  let mockProvider: Partial<AgenticProvider>;
  let db: Knex;
  let mockDatabase: { getClient: jest.Mock };
  let adminConfig: AdminConfigService;

  afterEach(async () => {
    if (db) {
      await db.destroy();
    }
  });

  beforeEach(async () => {
    db = knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });
    const mockStatus: AgenticProviderStatus = {
      provider: {
        id: 'llama-stack',
        model: 'test-model',
        baseUrl: 'https://llama-stack.test',
        connected: true,
      },
      vectorStore: {
        id: 'vs_test',
        connected: true,
        totalDocuments: 5,
      },
      mcpServers: [],
      securityMode: 'none',
      timestamp: new Date().toISOString(),
      ready: true,
      configurationErrors: [],
    };

    mockProvider = {
      id: 'llamastack',
      displayName: 'Llama Stack',
      getStatus: jest.fn().mockResolvedValue(mockStatus),
      chat: jest.fn().mockResolvedValue({ role: 'assistant', content: 'test' }),
      chatStream: jest.fn().mockResolvedValue(undefined),
      conversations: {
        create: jest.fn().mockResolvedValue({ conversationId: 'conv-1' }),
        list: jest
          .fn()
          .mockResolvedValue({ conversations: [], hasMore: false }),
        get: jest.fn().mockResolvedValue(null),
        getInputs: jest.fn().mockResolvedValue({ items: [], hasMore: false }),
        getByResponseChain: jest.fn().mockResolvedValue({ items: [] }),
        getProcessedMessages: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(undefined),
        submitApproval: jest.fn().mockResolvedValue({
          content: '',
          responseId: '',
          toolExecuted: false,
        }),
      },
      rag: {
        listDocuments: jest.fn().mockResolvedValue([]),
        listVectorStores: jest.fn().mockResolvedValue([]),
        getDefaultVectorStoreId: jest.fn().mockReturnValue('vs_test'),
        getActiveVectorStoreIds: jest.fn().mockReturnValue(['vs_test']),
        syncDocuments: jest.fn().mockResolvedValue({
          added: 0,
          updated: 0,
          removed: 0,
          errors: [],
          failed: 0,
          unchanged: 0,
        }),
      },
      safety: {
        isEnabled: jest.fn().mockReturnValue(false),
        getStatus: jest.fn().mockResolvedValue({ enabled: false, shields: [] }),
        checkInput: jest.fn().mockResolvedValue({ safe: true }),
        checkOutput: jest.fn().mockResolvedValue({ safe: true }),
      },
      evaluation: {
        isEnabled: jest.fn().mockReturnValue(false),
        getStatus: jest
          .fn()
          .mockResolvedValue({ enabled: false, scoringFunctions: [] }),
        evaluateResponse: jest.fn().mockResolvedValue(undefined),
      },
    };

    mockDatabase = { getClient: jest.fn().mockResolvedValue(db) };

    adminConfig = new AdminConfigService(
      mockDatabase as unknown as Parameters<typeof createRouter>[0]['database'],
      mockServices.logger.mock(),
    );
    await adminConfig.initialize();

    const router = await createRouter(
      createTestRouterOptions(db, mockProvider, adminConfig),
    );

    app = express();
    app.use(router);
  });

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /status', () => {
    it('returns service status when initialized', async () => {
      const response = await request(app).get('/status');

      expect(response.status).toEqual(200);
      // Status endpoint returns the status object directly
      expect(response.body).toHaveProperty('vectorStore');
      expect(response.body).toHaveProperty('provider');
      expect(response.body).toHaveProperty('ready', true);
    });
  });

  describe('GET /documents', () => {
    it('returns empty array when no documents', async () => {
      const response = await request(app).get('/documents');

      expect(response.status).toEqual(200);
      // Documents endpoint returns wrapped response
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('documents');
      expect(response.body.documents).toEqual([]);
      expect(response.body).toHaveProperty('totalDocuments', 0);
    });

    it('returns documents list', async () => {
      const mockDocs: DocumentInfo[] = [
        {
          id: 'file1',
          fileName: 'test.md',
          format: FileFormat.TEXT,
          fileSize: 1024,
          uploadedAt: '2025-01-01T00:00:00Z',
          status: 'completed',
        },
      ];
      (mockProvider.rag!.listDocuments as jest.Mock).mockResolvedValue(
        mockDocs,
      );

      const response = await request(app).get('/documents');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.documents).toEqual(mockDocs);
      expect(response.body).toHaveProperty('totalDocuments', 1);
    });
  });

  describe('GET /branding', () => {
    it('returns branding configuration', async () => {
      const response = await request(app).get('/branding');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('branding');
      expect(response.body.branding).toHaveProperty('appName', 'Test App');
      expect(response.body.branding).toHaveProperty('tagline', 'Test tagline');
    });
  });

  describe('GET /conversations', () => {
    it('returns empty conversations list', async () => {
      const response = await request(app).get('/conversations');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('conversations', []);
      expect(response.body).toHaveProperty('hasMore', false);
    });

    it('accepts query parameters', async () => {
      const response = await request(app).get(
        '/conversations?limit=5&order=asc',
      );

      expect(response.status).toEqual(200);
      expect(mockProvider.conversations!.list).toHaveBeenCalledWith(
        5,
        undefined,
      );
    });
  });

  describe('POST /chat', () => {
    it.each([
      { body: {}, desc: 'missing messages' },
      { body: { messages: [] }, desc: 'empty messages array' },
      {
        body: { messages: [{ role: 'invalid', content: 'test' }] },
        desc: 'invalid message role',
      },
      {
        body: { messages: [{ role: 'user' }] },
        desc: 'missing message content',
      },
    ])('returns 400 for $desc', async ({ body }) => {
      const response = await request(app).post('/chat').send(body);

      expect(response.status).toBe(400);
    });

    it('processes valid chat request', async () => {
      const mockChat = jest.fn().mockResolvedValue({
        role: 'assistant',
        content: 'Hello! How can I help?',
        responseId: 'resp_123',
      });
      (mockProvider as { chat: jest.Mock }).chat = mockChat;

      const response = await request(app)
        .post('/chat')
        .send({ messages: [{ role: 'user', content: 'Hello' }] });

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('content', 'Hello! How can I help?');
      expect(response.body).toHaveProperty('role', 'assistant');
    });

    it('passes enableRAG option to service', async () => {
      const mockChat = jest.fn().mockResolvedValue({
        role: 'assistant',
        content: 'Response without RAG',
      });
      (mockProvider as { chat: jest.Mock }).chat = mockChat;

      await request(app)
        .post('/chat')
        .send({
          messages: [{ role: 'user', content: 'Test' }],
          enableRAG: false,
        });

      expect(mockChat).toHaveBeenCalledWith(
        expect.objectContaining({ enableRAG: false }),
      );
    });

    it('passes previousResponseId for conversation threading', async () => {
      const mockChat = jest.fn().mockResolvedValue({
        role: 'assistant',
        content: 'Continuing conversation',
      });
      (mockProvider as { chat: jest.Mock }).chat = mockChat;

      await request(app)
        .post('/chat')
        .send({
          messages: [{ role: 'user', content: 'Continue' }],
          previousResponseId: 'resp_prev_123',
        });

      expect(mockChat).toHaveBeenCalledWith(
        expect.objectContaining({ previousResponseId: 'resp_prev_123' }),
      );
    });
  });

  describe('POST /sync', () => {
    it('triggers document sync', async () => {
      const mockSyncDocuments = jest.fn().mockResolvedValue({
        added: 2,
        updated: 1,
        removed: 0,
        failed: 0,
        unchanged: 5,
        errors: [],
      });
      (
        mockProvider.rag! as unknown as { syncDocuments: jest.Mock }
      ).syncDocuments = mockSyncDocuments;

      const response = await request(app).post('/sync').send({});

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      // The response directly contains the sync results
      expect(response.body).toHaveProperty('added', 2);
      expect(response.body).toHaveProperty('updated', 1);
    });
  });

  describe('GET /safety/status', () => {
    it('returns safety status when disabled', async () => {
      const response = await request(app).get('/safety/status');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('enabled', false);
      expect(response.body).toHaveProperty('shields', []);
    });

    it('returns safety status when enabled', async () => {
      (mockProvider.safety!.isEnabled as jest.Mock).mockReturnValue(true);
      (mockProvider.safety!.getStatus as jest.Mock).mockResolvedValue({
        enabled: true,
        shields: ['llama-guard'],
      });

      const response = await request(app).get('/safety/status');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('enabled', true);
      expect(response.body.shields).toHaveLength(1);
      expect(response.body.shields[0]).toBe('llama-guard');
    });
  });

  describe('GET /evaluation/status', () => {
    it('returns evaluation status when disabled', async () => {
      const response = await request(app).get('/evaluation/status');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('enabled', false);
    });

    it('returns evaluation status with scoring functions', async () => {
      (mockProvider.evaluation!.isEnabled as jest.Mock).mockReturnValue(true);
      (mockProvider.evaluation!.getStatus as jest.Mock).mockResolvedValue({
        enabled: true,
        scoringFunctions: ['relevancy'],
      });

      const response = await request(app).get('/evaluation/status');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('enabled', true);
      expect(response.body.scoringFunctions).toHaveLength(1);
    });
  });

  describe('GET /workflows', () => {
    it('returns empty workflows list', async () => {
      const response = await request(app).get('/workflows');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('workflows', []);
    });

    it('returns configured workflows from app-config', async () => {
      const configWithWorkflows = mockServices.rootConfig({
        data: {
          agenticChat: {
            branding: { appName: 'Test App', tagline: 'Test tagline' },
            workflows: [
              {
                id: 'deploy',
                name: 'Deploy App',
                description: 'Deploy an application',
                steps: [{ title: 'Step 1', prompt: 'Start deployment' }],
              },
            ],
          },
        },
      });
      const router2 = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          config: configWithWorkflows,
        }),
      );
      const app2 = express();
      app2.use(router2);

      const response = await request(app2).get('/workflows');

      expect(response.status).toEqual(200);
      expect(response.body.workflows).toHaveLength(1);
      expect(response.body.workflows[0]).toHaveProperty('id', 'deploy');
    });
  });

  describe('GET /quick-actions', () => {
    it('returns empty quick actions list', async () => {
      const response = await request(app).get('/quick-actions');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('quickActions', []);
    });
  });

  describe('GET /swim-lanes', () => {
    it('returns empty swim lanes list', async () => {
      const response = await request(app).get('/swim-lanes');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('swimLanes', []);
    });
  });

  describe('Permission denial', () => {
    it('should return 403 when permission is denied', async () => {
      const mockPermissionsDeny = {
        authorize: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
        authorizeConditional: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
      };

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          permissions:
            mockPermissionsDeny as unknown as RouterOptions['permissions'],
        }),
      );
      const appPerm = express();
      appPerm.use(router);

      const response = await request(appPerm)
        .post('/chat')
        .send({ messages: [{ role: 'user', content: 'Hello' }] });

      expect(response.status).toEqual(403);
      expect(response.body).toHaveProperty('error', 'Access Denied');
    });

    it('should return 403 with custom access denied message', async () => {
      const customMessage = 'Custom access denied message for testing';
      const mockPermissionsDeny = {
        authorize: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
        authorizeConditional: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
      };
      const mockConfig = mockServices.rootConfig({
        data: {
          agenticChat: {
            branding: { appName: 'Test App', tagline: 'Test tagline' },
            security: {
              accessDeniedMessage: customMessage,
            },
          },
        },
      });

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          config: mockConfig,
          permissions:
            mockPermissionsDeny as unknown as RouterOptions['permissions'],
        }),
      );
      const appPerm = express();
      appPerm.use(router);

      const response = await request(appPerm)
        .post('/chat')
        .send({ messages: [{ role: 'user', content: 'Hello' }] });

      expect(response.status).toEqual(403);
      expect(response.body).toHaveProperty('error', 'Access Denied');
      expect(response.body).toHaveProperty('message', customMessage);
    });

    it('should return 401 when auth fails', async () => {
      const mockHttpAuthThrows = {
        credentials: jest
          .fn()
          .mockRejectedValue(new Error('Not authenticated')),
        issueUserCookie: jest.fn().mockResolvedValue(undefined),
      };

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          httpAuth: mockHttpAuthThrows as unknown as RouterOptions['httpAuth'],
        }),
      );
      const appAuth = express();
      appAuth.use(router);

      const response = await request(appAuth)
        .post('/chat')
        .send({ messages: [{ role: 'user', content: 'Hello' }] });

      expect(response.status).toEqual(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should skip permission check when security mode is "none"', async () => {
      const mockConfigNone = mockServices.rootConfig({
        data: {
          agenticChat: {
            branding: { appName: 'Test App', tagline: 'Test tagline' },
            security: { mode: 'none' },
          },
        },
      });
      const mockHttpAuthNone = {
        credentials: jest.fn().mockRejectedValue(new Error('No auth')),
        issueUserCookie: jest.fn().mockResolvedValue(undefined),
      };
      const mockPermissionsNone = {
        authorize: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
        authorizeConditional: jest
          .fn()
          .mockResolvedValue([{ result: AuthorizeResult.DENY }]),
      };

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          config: mockConfigNone,
          httpAuth: mockHttpAuthNone as unknown as RouterOptions['httpAuth'],
          permissions:
            mockPermissionsNone as unknown as RouterOptions['permissions'],
        }),
      );
      const appNone = express();
      appNone.use(router);

      const response = await request(appNone).get('/status');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('ready', true);
    });
  });

  describe('Session routes', () => {
    const createMockSessions = (
      overrides?: Partial<{
        listSessions: jest.Mock;
        createSession: jest.Mock;
        getSession: jest.Mock;
        deleteSession: jest.Mock;
      }>,
    ): ChatSessionService => {
      const mock = {
        listSessions: jest.fn().mockResolvedValue([]),
        createSession: jest.fn().mockResolvedValue({
          id: 'sess-1',
          title: 'Test',
          userRef: 'user:default/testuser',
          conversationId: null,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        }),
        getSession: jest.fn().mockResolvedValue(null),
        deleteSession: jest.fn().mockResolvedValue(false),
      };
      return { ...mock, ...overrides } as unknown as ChatSessionService;
    };

    it('should return 501 when sessions not configured', async () => {
      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig),
      );
      const appNoSessions = express();
      appNoSessions.use(router);

      const response = await request(appNoSessions).get('/sessions');

      expect(response.status).toEqual(501);
      expect(response.body).toHaveProperty('error', 'Sessions not available');
    });

    it('should list sessions', async () => {
      const mockSessionsList = [
        {
          id: 'sess-1',
          title: 'Chat 1',
          userRef: 'user:default/testuser',
          conversationId: 'conv-1',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];
      const mockSessions = createMockSessions({
        listSessions: jest.fn().mockResolvedValue(mockSessionsList),
      });

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          sessions: mockSessions,
        }),
      );
      const appSessions = express();
      appSessions.use(router);

      const response = await request(appSessions).get('/sessions');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('sessions', mockSessionsList);
    });

    it('should create a session', async () => {
      const createdSession = {
        id: 'sess-new',
        title: 'Test',
        userRef: 'user:default/testuser',
        conversationId: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      const mockCreateSession = jest.fn().mockResolvedValue(createdSession);
      const mockSessions = createMockSessions({
        createSession: mockCreateSession,
      });

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          sessions: mockSessions,
        }),
      );
      const appSessions = express();
      appSessions.use(router);

      const response = await request(appSessions)
        .post('/sessions')
        .send({ title: 'Test' });

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('session', createdSession);
      expect(mockCreateSession).toHaveBeenCalledWith(
        'user:default/testuser',
        'Test',
      );
    });

    it('should get a session', async () => {
      const sessionData = {
        id: '123',
        title: 'My Session',
        userRef: 'user:default/testuser',
        conversationId: 'conv-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      const mockGetSession = jest.fn().mockResolvedValue(sessionData);
      const mockSessions = createMockSessions({
        getSession: mockGetSession,
      });

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          sessions: mockSessions,
        }),
      );
      const appSessions = express();
      appSessions.use(router);

      const response = await request(appSessions).get('/sessions/123');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('session', sessionData);
      expect(mockGetSession).toHaveBeenCalledWith(
        '123',
        'user:default/testuser',
      );
    });

    it('should return 404 for unknown session', async () => {
      const mockGetSession = jest.fn().mockResolvedValue(null);
      const mockSessions = createMockSessions({
        getSession: mockGetSession,
      });

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          sessions: mockSessions,
        }),
      );
      const appSessions = express();
      appSessions.use(router);

      const response = await request(appSessions).get('/sessions/unknown-123');

      expect(response.status).toEqual(404);
      expect(response.body).toHaveProperty('error', 'Session not found');
    });

    it('should delete a session', async () => {
      const sessionData = {
        id: '123',
        title: 'My Session',
        userRef: 'user:default/testuser',
        conversationId: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      const mockGetSession = jest.fn().mockResolvedValue(sessionData);
      const mockDeleteSession = jest.fn().mockResolvedValue(true);
      const mockSessions = createMockSessions({
        getSession: mockGetSession,
        deleteSession: mockDeleteSession,
      });

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          sessions: mockSessions,
        }),
      );
      const appSessions = express();
      appSessions.use(router);

      const response = await request(appSessions).delete('/sessions/123');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('success', true);
      expect(mockDeleteSession).toHaveBeenCalledWith(
        '123',
        'user:default/testuser',
      );
    });

    it('should return 404 when deleting unknown session', async () => {
      const mockGetSession = jest.fn().mockResolvedValue(null);
      const mockSessions = createMockSessions({
        getSession: mockGetSession,
      });

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          sessions: mockSessions,
        }),
      );
      const appSessions = express();
      appSessions.use(router);

      const response = await request(appSessions).delete(
        '/sessions/unknown-123',
      );

      expect(response.status).toEqual(404);
      expect(response.body).toHaveProperty('error', 'Session not found');
    });

    it('should get processed messages for a session', async () => {
      const sessionData = {
        id: '123',
        title: 'My Session',
        userRef: 'user:default/testuser',
        conversationId: 'conv-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };
      const mockMessages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];
      const mockGetSession = jest.fn().mockResolvedValue(sessionData);
      (
        mockProvider.conversations!.getProcessedMessages as jest.Mock
      ).mockResolvedValue(mockMessages);
      const mockSessions = createMockSessions({
        getSession: mockGetSession,
      });

      const router = await createRouter(
        createTestRouterOptions(db, mockProvider, adminConfig, {
          sessions: mockSessions,
        }),
      );
      const appSessions = express();
      appSessions.use(router);

      const response = await request(appSessions).get('/sessions/123/messages');

      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('messages', mockMessages);
    });
  });
});
