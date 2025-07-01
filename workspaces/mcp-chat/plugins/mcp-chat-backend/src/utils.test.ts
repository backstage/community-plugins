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
import { findNpxPath, executeToolCall } from './utils';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';

// Mock child_process and fs
jest.mock('child_process');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
  },
}));

// Mock MCP client
jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn(),
}));

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockAccess = fs.access as jest.MockedFunction<typeof fs.access>;

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.DEBUG_MCP;
  });

  describe('findNpxPath', () => {
    it('should find npx in system PATH', async () => {
      mockAccess.mockResolvedValue(undefined);

      const mockChild = {
        on: jest.fn((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0); // Exit code 0 = success
          }
        }),
      };
      mockSpawn.mockReturnValue(mockChild as any);

      const npxPath = await findNpxPath();

      expect(npxPath).toBe('npx');
      expect(mockSpawn).toHaveBeenCalledWith('npx', ['--version'], {
        stdio: 'pipe',
      });
    });

    it('should find npx in node directory', async () => {
      mockAccess
        .mockRejectedValueOnce(new Error('not found')) // npx not in PATH
        .mockResolvedValue(undefined); // found in node dir

      const mockChild = {
        on: jest.fn((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };
      mockSpawn.mockReturnValue(mockChild as any);

      const npxPath = await findNpxPath();

      expect(npxPath).toContain('npx');
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should find npx.cmd on Windows', async () => {
      // Mock Windows environment
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      mockAccess
        .mockRejectedValueOnce(new Error('not found')) // npx not in PATH
        .mockRejectedValueOnce(new Error('not found')) // npx not in node dir
        .mockResolvedValue(undefined); // found npx.cmd

      const mockChild = {
        on: jest.fn((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };
      mockSpawn.mockReturnValue(mockChild as any);

      const npxPath = await findNpxPath();

      expect(npxPath).toContain('npx.cmd');

      // Restore platform
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should throw error when npx not found anywhere', async () => {
      mockAccess.mockRejectedValue(new Error('not found'));

      await expect(findNpxPath()).rejects.toThrow(
        'npx not found. Please ensure Node.js is properly installed with npm.',
      );
    });

    it('should throw error when npx exists but is not functional', async () => {
      mockAccess.mockResolvedValue(undefined);

      const mockChild = {
        on: jest.fn((event: string, callback: Function) => {
          if (event === 'close') {
            callback(1); // Exit code 1 = failure
          }
        }),
      };
      mockSpawn.mockReturnValue(mockChild as any);

      await expect(findNpxPath()).rejects.toThrow(
        'npx not found. Please ensure Node.js is properly installed with npm.',
      );
    });

    it('should handle spawn errors gracefully', async () => {
      mockAccess.mockResolvedValue(undefined);

      const mockChild = {
        on: jest.fn((event: string, callback: Function) => {
          if (event === 'error') {
            callback();
          } else if (event === 'close') {
            callback(1);
          }
        }),
      };
      mockSpawn.mockReturnValue(mockChild as any);

      await expect(findNpxPath()).rejects.toThrow(
        'npx not found. Please ensure Node.js is properly installed with npm.',
      );
    });

    it('should enable debug logging when DEBUG_MCP is set', async () => {
      process.env.DEBUG_MCP = 'true';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockAccess.mockResolvedValue(undefined);

      const mockChild = {
        on: jest.fn((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      };
      mockSpawn.mockReturnValue(mockChild as any);

      await findNpxPath();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Found npx at:'),
      );
      consoleSpy.mockRestore();
    });

    it('should log debug information about search paths', async () => {
      process.env.DEBUG_MCP = 'true';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockAccess.mockRejectedValue(new Error('not found'));

      try {
        await findNpxPath();
      } catch {
        // Expected to fail
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Node.js executable:'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Searching for npx in:'),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('executeToolCall', () => {
    let mockClient: any;
    let mockClients: Map<string, any>;
    let mockTools: any[];

    beforeEach(() => {
      mockClient = {
        callTool: jest.fn(),
      };
      mockClients = new Map([['server1', mockClient]]);
      mockTools = [
        {
          function: { name: 'test_tool' },
          serverId: 'server1',
        },
      ];
    });

    it('should execute tool call successfully with text content', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Tool result text' }],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result).toEqual({
        id: 'call_123',
        name: 'test_tool',
        arguments: { param: 'value' },
        result: 'Tool result text',
        serverId: 'server1',
      });

      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: 'test_tool',
        arguments: { param: 'value' },
      });
    });

    it('should execute tool call with multiple content blocks', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: [
          { type: 'text', text: 'First part' },
          { type: 'text', text: 'Second part' },
        ],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.result).toBe('First part\nSecond part');
    });

    it('should handle string content blocks', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: ['String content 1', 'String content 2'],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.result).toBe('String content 1\nString content 2');
    });

    it('should handle non-text content blocks', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: [
          { type: 'image', data: 'base64data' },
          { type: 'custom', value: 123 },
        ],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.result).toContain('"type": "image"');
      expect(result.result).toContain('"data": "base64data"');
      expect(result.result).toContain('"type": "custom"');
      expect(result.result).toContain('"value": 123');
    });

    it('should handle string content directly', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: 'Direct string content',
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.result).toBe('Direct string content');
    });

    it('should handle object content', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: { key: 'value', nested: { data: 123 } },
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.result).toContain('"key": "value"');
      expect(result.result).toContain('"nested"');
      expect(result.result).toContain('"data": 123');
    });

    it('should handle empty arguments', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: '',
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Success' }],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.arguments).toEqual({});
      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: 'test_tool',
        arguments: {},
      });
    });

    it('should handle missing arguments property', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Success' }],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.arguments).toEqual({});
    });

    it('should throw error when tool not found', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'nonexistent_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      await expect(
        executeToolCall(toolCall, mockTools, mockClients),
      ).rejects.toThrow("Tool 'nonexistent_tool' not found");
    });

    it('should throw error when client not found', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      const toolsWithMissingServer = [
        {
          function: { name: 'test_tool' },
          serverId: 'missing_server',
        },
      ];

      await expect(
        executeToolCall(toolCall, toolsWithMissingServer, mockClients),
      ).rejects.toThrow("Client for server 'missing_server' not found");
    });

    it('should handle malformed JSON arguments', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: 'invalid json{',
        },
      };

      await expect(
        executeToolCall(toolCall, mockTools, mockClients),
      ).rejects.toThrow();
    });

    it('should propagate client errors', async () => {
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockRejectedValue(new Error('Tool execution failed'));

      await expect(
        executeToolCall(toolCall, mockTools, mockClients),
      ).rejects.toThrow('Tool execution failed');
    });

    it('should handle complex nested arguments', async () => {
      const complexArgs = {
        simple: 'string',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: {
          key: 'value',
          deep: {
            level: 'test',
          },
        },
      };

      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify(complexArgs),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Success' }],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.arguments).toEqual(complexArgs);
      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: 'test_tool',
        arguments: complexArgs,
      });
    });
  });
});
