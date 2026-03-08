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
import { AgenticChatApiClient, agenticChatApiRef } from './AgenticChatApi';
import {
  DiscoveryApi,
  FetchApi,
  ConfigApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { createMockResponse } from '../test-utils/factories';

describe('AgenticChatApi', () => {
  let api: AgenticChatApiClient;
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let mockFetchApi: jest.Mocked<FetchApi>;
  let mockConfigApi: jest.Mocked<ConfigApi>;
  let mockIdentityApi: jest.Mocked<IdentityApi>;

  beforeEach(() => {
    mockDiscoveryApi = {
      getBaseUrl: jest
        .fn()
        .mockResolvedValue('http://localhost:7007/api/agentic-chat'),
    };

    mockIdentityApi = {
      getBackstageIdentity: jest.fn().mockResolvedValue({
        type: 'user',
        userEntityRef: 'user:default/guest',
        ownershipEntityRefs: [],
      }),
      getCredentials: jest.fn().mockResolvedValue({ token: 'test-token' }),
      getProfileInfo: jest.fn().mockResolvedValue({ displayName: 'Guest' }),
      signOut: jest.fn(),
    };

    mockFetchApi = {
      fetch: jest.fn(),
    };

    mockConfigApi = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
      getOptional: jest.fn(),
      getOptionalStringArray: jest.fn(),
      getConfig: jest.fn().mockReturnValue({
        getOptionalConfigArray: jest.fn().mockReturnValue([]),
      }),
      getOptionalConfig: jest.fn().mockReturnValue(undefined),
      getOptionalConfigArray: jest.fn().mockReturnValue([]),
      has: jest.fn(),
      keys: jest.fn().mockReturnValue([]),
      get: jest.fn(),
      getNumber: jest.fn(),
      getOptionalNumber: jest.fn(),
      getBoolean: jest.fn(),
      getOptionalBoolean: jest.fn(),
      getStringArray: jest.fn(),
      getConfigArray: jest.fn(),
    };

    api = new AgenticChatApiClient({
      discoveryApi: mockDiscoveryApi,
      fetchApi: mockFetchApi,
      configApi: mockConfigApi,
      identityApi: mockIdentityApi,
    });
  });

  describe('agenticChatApiRef', () => {
    it('should have correct id', () => {
      expect(agenticChatApiRef.id).toBe('plugin.agentic-chat.api');
    });
  });

  describe('getStatus', () => {
    it('should fetch status from backend', async () => {
      const mockStatus = {
        success: true,
        status: {
          vectorStoreIds: ['vs_test'],
          model: 'test-model',
          documentsCount: 5,
        },
      };

      mockFetchApi.fetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: jest.fn().mockResolvedValue(mockStatus),
        }),
      );

      const result = await api.getStatus();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('agentic-chat');
      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/agentic-chat/status',
      );
      expect(result).toEqual(mockStatus);
    });
  });

  describe('listDocuments', () => {
    it('should fetch documents from backend', async () => {
      const mockDocs = [
        { id: 'file1', filename: 'test.md', purpose: 'assistants' },
      ];

      mockFetchApi.fetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: jest.fn().mockResolvedValue({ documents: mockDocs }),
        }),
      );

      const result = await api.listDocuments();

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/agentic-chat/documents',
      );
      expect(result).toEqual(mockDocs);
    });
  });

  describe('listConversations', () => {
    it('should fetch conversations with default parameters', async () => {
      const mockConversations = {
        success: true,
        conversations: [],
        hasMore: false,
      };

      mockFetchApi.fetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: jest.fn().mockResolvedValue(mockConversations),
        }),
      );

      const result = await api.listConversations();

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/conversations?limit=10&order=desc'),
      );
      expect(result.conversations).toEqual([]);
    });

    it('should accept custom limit and order', async () => {
      mockFetchApi.fetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: jest
            .fn()
            .mockResolvedValue({ conversations: [], hasMore: false }),
        }),
      );

      await api.listConversations(5, 'asc');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5&order=asc'),
      );
    });
  });

  describe('getBranding', () => {
    it('should fetch branding configuration', async () => {
      const mockBrandingData = {
        appName: 'Agentic Chat',
        tagline: 'Your AI assistant',
        primaryColor: '#9333ea',
      };

      mockFetchApi.fetch.mockResolvedValue(
        createMockResponse({
          ok: true,
          json: jest.fn().mockResolvedValue({ branding: mockBrandingData }),
        }),
      );

      const result = await api.getBranding();

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/agentic-chat/branding',
      );
      expect(result).toEqual(mockBrandingData);
    });
  });
});
