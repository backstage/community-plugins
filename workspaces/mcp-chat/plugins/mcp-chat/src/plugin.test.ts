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
import { mcpChatPlugin, McpChatPage, MCPChatIcon } from './plugin';
import { mcpChatApiRef } from './api';
import { rootRouteRef } from './routes';
import { BotIconComponent } from './components/BotIcon';
import { McpChat } from './api/McpChatApi';

// Mock dependencies
jest.mock('./api/McpChatApi');
jest.mock('./components/BotIcon', () => ({
  BotIconComponent: jest.fn(() => 'BotIconComponent'),
}));

describe('mcp-chat plugin', () => {
  describe('mcpChatPlugin', () => {
    it('should be defined', () => {
      expect(mcpChatPlugin).toBeDefined();
    });

    it('should have correct plugin id', () => {
      expect(mcpChatPlugin.getId()).toBe('mcp-chat');
    });

    it('should have root route configured', () => {
      const routes = mcpChatPlugin.routes;
      expect(routes).toBeDefined();
      expect(routes.root).toBe(rootRouteRef);
    });

    it('should have APIs configured', () => {
      const apis = mcpChatPlugin.getApis();
      expect(apis).toBeDefined();
      // APIs should be iterable
      expect(typeof apis[Symbol.iterator]).toBe('function');
    });

    it('should create McpChat instance', () => {
      const mockDiscoveryApi = { getBaseUrl: jest.fn() };
      const mockFetchApi = { fetch: jest.fn() };

      const client = new McpChat({
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

  describe('McpChatPage', () => {
    it('should be defined', () => {
      expect(McpChatPage).toBeDefined();
    });

    it('should be a function (component)', () => {
      expect(typeof McpChatPage).toBe('function');
    });
  });

  describe('MCPChatIcon', () => {
    it('should be defined', () => {
      expect(MCPChatIcon).toBeDefined();
    });

    it('should be the BotIconComponent', () => {
      expect(MCPChatIcon).toBe(BotIconComponent);
    });

    it('should be a React component function', () => {
      expect(typeof MCPChatIcon).toBe('function');
    });
  });

  describe('Plugin integration', () => {
    it('should export all required components', () => {
      expect(mcpChatPlugin).toBeDefined();
      expect(McpChatPage).toBeDefined();
      expect(MCPChatIcon).toBeDefined();
    });

    it('should have consistent plugin structure', () => {
      // Verify the plugin has all expected properties
      expect(mcpChatPlugin.getId()).toBeTruthy();
      expect(mcpChatPlugin.routes).toBeDefined();
      expect(mcpChatPlugin.getApis()).toBeDefined();

      // Verify the icon is properly exported
      expect(MCPChatIcon).toBe(BotIconComponent);
    });

    it('should have plugin routes with root route', () => {
      const routes = mcpChatPlugin.routes;
      expect(routes).toHaveProperty('root');
      expect(routes.root).toBe(rootRouteRef);
    });
  });

  describe('Plugin exports validation', () => {
    it('should export plugin as a valid Backstage plugin', () => {
      expect(mcpChatPlugin).toBeDefined();
      expect(typeof mcpChatPlugin.getId).toBe('function');
      expect(mcpChatPlugin.getId()).toBe('mcp-chat');
    });

    it('should export page component', () => {
      expect(McpChatPage).toBeDefined();
      expect(typeof McpChatPage).toBe('function');
    });

    it('should export icon component', () => {
      expect(MCPChatIcon).toBeDefined();
      expect(typeof MCPChatIcon).toBe('function');
    });
  });

  describe('API reference validation', () => {
    it('should have mcpChatApiRef defined', () => {
      expect(mcpChatApiRef).toBeDefined();
      expect(mcpChatApiRef.id).toBe('plugin.mcp-chat.service');
    });

    it('should have rootRouteRef defined', () => {
      expect(rootRouteRef).toBeDefined();
    });
  });

  describe('McpChat API', () => {
    let client: McpChat;
    let mockDiscoveryApi: any;
    let mockFetchApi: any;

    beforeEach(() => {
      mockDiscoveryApi = {
        getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api'),
      };
      mockFetchApi = {
        fetch: jest.fn(),
      };
      client = new McpChat({
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
