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
import {
  mcpChatClientPlugin,
  McpChatClientPage,
  MCPChatClientIcon,
} from './plugin';
import { mcpChatApiRef } from './api';
import { rootRouteRef } from './routes';
import { BotIconComponent } from './components/BotIcon';
import { McpChatClient } from './api/McpChatApi';

// Mock dependencies
jest.mock('./api/McpChatApi');
jest.mock('./components/BotIcon', () => ({
  BotIconComponent: jest.fn(() => 'BotIconComponent'),
}));

describe('mcp-chat-client plugin', () => {
  describe('mcpChatClientPlugin', () => {
    it('should be defined', () => {
      expect(mcpChatClientPlugin).toBeDefined();
    });

    it('should have correct plugin id', () => {
      expect(mcpChatClientPlugin.getId()).toBe('mcp-chat-client');
    });

    it('should have root route configured', () => {
      const routes = mcpChatClientPlugin.routes;
      expect(routes).toBeDefined();
      expect(routes.root).toBe(rootRouteRef);
    });

    it('should have APIs configured', () => {
      const apis = mcpChatClientPlugin.getApis();
      expect(apis).toBeDefined();
      // APIs should be iterable
      expect(typeof apis[Symbol.iterator]).toBe('function');
    });

    it('should create McpChatClient instance', () => {
      const mockDiscoveryApi = { getBaseUrl: jest.fn() };
      const mockFetchApi = { fetch: jest.fn() };

      const client = new McpChatClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
      });

      expect(client).toBeDefined();
      expect(typeof client.sendChatMessage).toBe('function');
      expect(typeof client.getConfigStatus).toBe('function');
      expect(typeof client.getAvailableTools).toBe('function');
      expect(typeof client.testProviderConnection).toBe('function');
    });
  });

  describe('McpChatClientPage', () => {
    it('should be defined', () => {
      expect(McpChatClientPage).toBeDefined();
    });

    it('should be a function (component)', () => {
      expect(typeof McpChatClientPage).toBe('function');
    });
  });

  describe('MCPChatClientIcon', () => {
    it('should be defined', () => {
      expect(MCPChatClientIcon).toBeDefined();
    });

    it('should be the BotIconComponent', () => {
      expect(MCPChatClientIcon).toBe(BotIconComponent);
    });

    it('should be a React component function', () => {
      expect(typeof MCPChatClientIcon).toBe('function');
    });
  });

  describe('Plugin integration', () => {
    it('should export all required components', () => {
      expect(mcpChatClientPlugin).toBeDefined();
      expect(McpChatClientPage).toBeDefined();
      expect(MCPChatClientIcon).toBeDefined();
    });

    it('should have consistent plugin structure', () => {
      // Verify the plugin has all expected properties
      expect(mcpChatClientPlugin.getId()).toBeTruthy();
      expect(mcpChatClientPlugin.routes).toBeDefined();
      expect(mcpChatClientPlugin.getApis()).toBeDefined();

      // Verify the icon is properly exported
      expect(MCPChatClientIcon).toBe(BotIconComponent);
    });

    it('should have plugin routes with root route', () => {
      const routes = mcpChatClientPlugin.routes;
      expect(routes).toHaveProperty('root');
      expect(routes.root).toBe(rootRouteRef);
    });
  });

  describe('Plugin exports validation', () => {
    it('should export plugin as a valid Backstage plugin', () => {
      expect(mcpChatClientPlugin).toBeDefined();
      expect(typeof mcpChatClientPlugin.getId).toBe('function');
      expect(mcpChatClientPlugin.getId()).toBe('mcp-chat-client');
    });

    it('should export page component', () => {
      expect(McpChatClientPage).toBeDefined();
      expect(typeof McpChatClientPage).toBe('function');
    });

    it('should export icon component', () => {
      expect(MCPChatClientIcon).toBeDefined();
      expect(typeof MCPChatClientIcon).toBe('function');
    });
  });

  describe('API reference validation', () => {
    it('should have mcpChatApiRef defined', () => {
      expect(mcpChatApiRef).toBeDefined();
      expect(mcpChatApiRef.id).toBe('plugin.mcp-chat-client.service');
    });

    it('should have rootRouteRef defined', () => {
      expect(rootRouteRef).toBeDefined();
    });
  });

  describe('McpChatClient API', () => {
    let client: McpChatClient;
    let mockDiscoveryApi: any;
    let mockFetchApi: any;

    beforeEach(() => {
      mockDiscoveryApi = {
        getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api'),
      };
      mockFetchApi = {
        fetch: jest.fn(),
      };
      client = new McpChatClient({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
      });
    });

    it('should have all required methods', () => {
      expect(typeof client.sendChatMessage).toBe('function');
      expect(typeof client.getConfigStatus).toBe('function');
      expect(typeof client.getAvailableTools).toBe('function');
      expect(typeof client.testProviderConnection).toBe('function');
    });

    it('should handle sendChatMessage method signature', () => {
      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const enabledTools = ['tool1'];
      const signal = new AbortController().signal;

      // Should not throw when called with proper parameters
      expect(() => {
        client.sendChatMessage(messages, enabledTools, signal);
      }).not.toThrow();
    });

    it('should handle method calls without optional parameters', () => {
      const messages = [{ role: 'user' as const, content: 'Hello' }];

      // Should not throw when called with minimal parameters
      expect(() => {
        client.sendChatMessage(messages);
      }).not.toThrow();

      expect(() => {
        client.getConfigStatus();
      }).not.toThrow();

      expect(() => {
        client.getAvailableTools();
      }).not.toThrow();

      expect(() => {
        client.testProviderConnection();
      }).not.toThrow();
    });
  });
});
