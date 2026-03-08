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
import React from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { TestApiProvider } from '@backstage/test-utils';
import { agenticChatApiRef, type AgenticChatApi } from '../api';
import type {
  Message,
  ChatSessionSummary,
  DocumentInfo,
  AgenticChatStatus,
} from '../types';

/**
 * Creates a partial mock of AgenticChatApi with sensible defaults.
 * Override specific methods by passing them in the `overrides` parameter.
 */
export function createMockApi(
  overrides: Partial<AgenticChatApi> = {},
): Partial<AgenticChatApi> {
  return {
    getStatus: jest.fn().mockResolvedValue(createMockStatus()),
    getBranding: jest.fn().mockResolvedValue({}),
    listModels: jest.fn().mockResolvedValue([]),
    listDocumentsForStore: jest.fn().mockResolvedValue([]),
    createSession: jest
      .fn()
      .mockResolvedValue({ id: 'session-1', title: 'Test' }),
    createConversation: jest
      .fn()
      .mockResolvedValue({ conversationId: 'conv-1' }),
    chatStreamWithSession: jest.fn().mockResolvedValue(undefined),
    chatStream: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/**
 * Creates a React wrapper component that provides a mocked AgenticChatApi.
 */
export function createApiWrapper(api: Partial<AgenticChatApi>) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(TestApiProvider, {
      apis: [[agenticChatApiRef, api as AgenticChatApi]] as [
        typeof agenticChatApiRef,
        AgenticChatApi,
      ][],
      children,
    });
}

let messageCounter = 0;

/**
 * Creates a test Message with sensible defaults.
 */
export function createTestMessage(overrides: Partial<Message> = {}): Message {
  messageCounter++;
  return {
    id: `msg-${messageCounter}`,
    text: `Test message ${messageCounter}`,
    isUser: false,
    timestamp: new Date('2025-01-15T10:00:00Z'),
    ...overrides,
  };
}

let sessionCounter = 0;

/**
 * Creates a test ChatSessionSummary with sensible defaults.
 */
export function createTestSession(
  overrides: Partial<ChatSessionSummary> = {},
): ChatSessionSummary {
  sessionCounter++;
  return {
    id: `session-${sessionCounter}`,
    title: `Test Session ${sessionCounter}`,
    conversationId: `conv-${sessionCounter}`,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    ...overrides,
  };
}

let documentCounter = 0;

/**
 * Creates a test DocumentInfo with sensible defaults.
 */
export function createTestDocument(
  overrides: Partial<DocumentInfo> = {},
): DocumentInfo {
  documentCounter++;
  return {
    id: `doc-${documentCounter}`,
    fileName: `document-${documentCounter}.md`,
    format: 'text' as DocumentInfo['format'],
    fileSize: 1024,
    uploadedAt: '2025-01-15T10:00:00Z',
    status: 'completed',
    ...overrides,
  };
}

/**
 * Creates a properly typed mock Response for testing.
 */
export function createMockResponse(
  overrides: Partial<Response> = {},
): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    headers: new Headers(),
    ...overrides,
  } as unknown as Response;
}

/**
 * Creates a partial mock of AgenticChatApi with all admin panel methods.
 * Use for admin panel tests. Override specific methods as needed:
 *
 *   const api = createAdminMockApi();
 *   (api.getAdminConfig as jest.Mock).mockResolvedValue({ ... });
 */
export function createAdminMockApi(): Partial<AgenticChatApi> {
  return {
    getAdminConfig: jest
      .fn()
      .mockResolvedValue({ entry: null, source: 'default' }),
    setAdminConfig: jest.fn().mockResolvedValue({ warnings: [] }),
    deleteAdminConfig: jest.fn().mockResolvedValue({ deleted: true }),
    getEffectiveConfig: jest.fn().mockResolvedValue({
      branding: {
        appName: 'AI Chat',
        tagline: 'Your AI Assistant',
        primaryColor: '#1e40af',
        secondaryColor: '#475569',
      },
      model: 'meta-llama/Llama-3.3-8B-Instruct',
      baseUrl: 'http://localhost:8321',
      systemPrompt: 'You are a helpful assistant',
      toolChoice: 'auto',
      enableWebSearch: false,
      enableCodeInterpreter: false,
      safetyEnabled: false,
      inputShields: [],
      outputShields: [],
      evaluationEnabled: false,
      scoringFunctions: [],
      minScoreThreshold: 0.5,
    }),
    listModels: jest
      .fn()
      .mockResolvedValue([
        { id: 'meta-llama/Llama-3.3-8B-Instruct', owned_by: 'meta' },
        { id: 'qwen3:14b-q8_0' },
      ]),
    generateSystemPrompt: jest.fn().mockResolvedValue('Generated prompt text'),
    testModelConnection: jest.fn().mockResolvedValue({
      connected: true,
      modelFound: true,
      canGenerate: true,
    }),
    testMcpConnection: jest.fn().mockResolvedValue({
      success: true,
      tools: [],
      toolCount: 0,
    }),
    getBranding: jest.fn().mockResolvedValue({
      appName: 'AI Chat',
      tagline: 'Your AI Assistant',
      inputPlaceholder: 'Ask me anything...',
      primaryColor: '#1e40af',
      secondaryColor: '#475569',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
      infoColor: '#0ea5e9',
      enableGlassEffect: true,
      themePreset: 'default',
    }),
    getStatus: jest.fn().mockResolvedValue({
      providerId: 'test',
      provider: {
        connected: true,
        model: 'test-model',
        baseUrl: 'http://localhost',
      },
      vectorStore: { connected: false },
      mcpServers: [],
      timestamp: new Date().toISOString(),
      ready: true,
      securityMode: 'none',
    }),
    getSafetyStatus: jest.fn().mockResolvedValue({
      enabled: false,
      shields: [],
      timestamp: '',
    }),
    getEvaluationStatus: jest.fn().mockResolvedValue({
      enabled: false,
      scoringFunctions: [],
      timestamp: '',
    }),
    getSwimLanes: jest.fn().mockResolvedValue([]),
    getQuickActions: jest.fn().mockResolvedValue([]),
    listDocuments: jest.fn().mockResolvedValue([]),
    listActiveVectorStores: jest.fn().mockResolvedValue({ stores: [] }),
    getVectorStoreConfig: jest.fn().mockResolvedValue({
      config: {},
      source: 'yaml',
    }),
  };
}

/**
 * Creates a test AgenticChatStatus with sensible defaults.
 */
export function createMockStatus(
  overrides: Partial<AgenticChatStatus> = {},
): AgenticChatStatus {
  return {
    providerId: 'test',
    provider: {
      id: 'llamastack',
      model: 'test-model',
      baseUrl: 'https://test.example.com',
      connected: true,
    },
    vectorStore: {
      id: 'default',
      connected: true,
    },
    mcpServers: [],
    securityMode: 'none',
    timestamp: '2025-01-01T00:00:00Z',
    ready: true,
    configurationErrors: [],
    ...overrides,
  };
}
