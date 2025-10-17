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
import { spawn } from 'child_process';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ServerConfig, VALID_ROLES, MCPServerType } from './types';
import { RootConfigService } from '@backstage/backend-plugin-api';

export function loadServerConfigs(config: RootConfigService): ServerConfig[] {
  const mcpServers = config.getOptionalConfigArray('mcpChat.mcpServers') || [];

  return mcpServers?.map(serverConfig => {
    const headers: Record<string, string> | undefined = serverConfig
      .getOptionalConfig('headers')
      ?.get() as Record<string, string> | undefined;

    const env: Record<string, string> | undefined = serverConfig
      .getOptionalConfig('env')
      ?.get() as Record<string, string> | undefined;

    const typeString = serverConfig.getOptionalString('type');
    let type: MCPServerType;

    if (typeString === 'sse') {
      type = MCPServerType.SSE;
    } else if (typeString === 'streamable-http' || serverConfig.has('url')) {
      type = MCPServerType.STREAMABLE_HTTP;
    } else {
      type = MCPServerType.STDIO;
    }

    return {
      id: serverConfig.getString('id'),
      name: serverConfig.getString('name'),
      scriptPath: serverConfig.getOptionalString('scriptPath'),
      npxCommand: serverConfig.getOptionalString('npxCommand'),
      args: serverConfig.getOptionalStringArray('args'),
      env,
      url: serverConfig.getOptionalString('url'),
      headers,
      type,
    };
  });
}

/**
 * Helper function to find npx executable path
 * Searches common installation locations and validates the executable works
 * @returns Promise<string> Path to the npx executable
 * @throws Error if npx cannot be found or is not functional
 */
export async function findNpxPath(): Promise<string> {
  // Get the directory where node is installed
  const nodeDir = path.dirname(process.execPath);

  const possiblePaths = [
    'npx', // Try system PATH first
    path.join(nodeDir, 'npx'), // Same dir as node (Unix)
    path.join(nodeDir, 'npx.cmd'), // Windows
    '/usr/local/bin/npx', // Common installation path
    '/opt/homebrew/bin/npx', // Homebrew on Apple Silicon
  ];

  // Optional: Enable debug logging with environment variable
  if (process.env.DEBUG_MCP) {
    console.log(`Node.js executable: ${process.execPath}`);
    console.log(`Searching for npx in: ${possiblePaths.join(', ')}`);
  }

  for (const npxPath of possiblePaths) {
    try {
      // Check if file exists first
      await fs.access(npxPath);

      // Test if this path works by running npx --version
      const child = spawn(npxPath, ['--version'], { stdio: 'pipe' });
      const exitCode = await new Promise(resolve => {
        child.on('close', resolve);
        child.on('error', () => resolve(1));
      });

      if (exitCode === 0) {
        if (process.env.DEBUG_MCP) {
          console.log(`Found npx at: ${npxPath}`);
        }
        return npxPath;
      }
    } catch (error) {
      // Continue to next path
      if (process.env.DEBUG_MCP) {
        console.log(`npx not found at: ${npxPath}`);
      }
    }
  }

  throw new Error(
    'npx not found. Please ensure Node.js is properly installed with npm.',
  );
}

/**
 * Executes a tool call using the MCP client.
 * Finds the appropriate server based on the tool's serverId and executes the tool call.
 *
 * @param toolCall - The tool call object containing function name and arguments
 * @param tools - List of available tools with their server IDs
 * @param mcpClients - Map of server IDs to MCP clients
 * @returns Promise resolving to the result of the tool call
 */
export async function executeToolCall(
  toolCall: any,
  tools: any[],
  mcpClients: Map<string, Client>,
) {
  const toolName = toolCall.function.name;
  const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

  // Find which server this tool belongs to
  const tool = tools.find(t => t.function.name === toolName);
  if (!tool) {
    throw new Error(`Tool '${toolName}' not found`);
  }

  const client = mcpClients.get(tool.serverId);
  if (!client) {
    throw new Error(`Client for server '${tool.serverId}' not found`);
  }

  const result = await client.callTool({
    name: toolName,
    arguments: toolArgs,
  });

  // Extract and format the result content properly
  let formattedResult: string;
  if (Array.isArray(result.content)) {
    // MCP results are arrays of content blocks
    formattedResult = result.content
      .map((block: any) => {
        if (block.type === 'text') {
          return block.text;
        } else if (typeof block === 'string') {
          return block;
        }
        return JSON.stringify(block, null, 2);
      })
      .join('\n');
  } else if (typeof result.content === 'string') {
    formattedResult = result.content;
  } else {
    formattedResult = JSON.stringify(result.content, null, 2);
  }

  return {
    id: toolCall.id,
    name: toolName,
    arguments: toolArgs,
    result: formattedResult,
    serverId: tool.serverId,
  };
}
/**
 * Validates the MCP server configuration.
 * Ensures that headers and env are objects with string key-value pairs.
 * Throws an error if any configuration is invalid.
 *
 * @param config - The root configuration service
 */
export const validateConfig = (config: RootConfigService) => {
  const providerConfig =
    config.getOptionalConfigArray('mcpChat.providers') || [];
  const mcpServers = config.getOptionalConfigArray('mcpChat.mcpServers') || [];
  if (providerConfig.length === 0) {
    throw new Error(
      'No LLM providers configured in mcpChat.providers. Please add at least one provider.',
    );
  }

  for (const [index, serverConfig] of mcpServers.entries()) {
    try {
      const configs = [
        { config: serverConfig.getOptionalConfig('headers'), name: 'headers' },
        { config: serverConfig.getOptionalConfig('env'), name: 'env' },
      ];

      for (const { config: configItem, name } of configs) {
        if (configItem?.has('')) {
          const value = configItem.get();
          if (typeof value !== 'object' || Array.isArray(value)) {
            throw new Error(
              `${name} must be an object with string key-value pairs`,
            );
          }
        }
      }
    } catch (error) {
      throw new Error(
        `Invalid configuration for MCP server at index ${index}: ${error.message}`,
      );
    }
  }

  // Validate quickPrompts if present
  const quickPrompts =
    config.getOptionalConfigArray('mcpChat.quickPrompts') || [];
  for (const [index, promptConfig] of quickPrompts.entries()) {
    const requiredFields = ['title', 'description', 'prompt', 'category'];
    for (const field of requiredFields) {
      if (!promptConfig.has(field)) {
        throw new Error(
          `QuickPrompt at index ${index} is missing required field: '${field}'`,
        );
      }
      const value = promptConfig.getString(field);
      if (!value || value.trim() === '') {
        throw new Error(
          `QuickPrompt at index ${index} has empty value for required field: '${field}'`,
        );
      }
    }
  }

  // Validate systemPrompt if present
  const systemPrompt = config.getOptionalString('mcpChat.systemPrompt');
  if (systemPrompt !== undefined) {
    if (typeof systemPrompt !== 'string') {
      throw new Error('systemPrompt must be a string');
    }
    if (systemPrompt.trim() === '') {
      throw new Error('systemPrompt cannot be empty or whitespace-only');
    }
  }
};

/**
 * Validates the structure and content of chat messages
 * @param messages - Array of messages to validate
 * @returns Object with isValid boolean and error message if invalid
 */

export const validateMessages = (
  messages: any,
): {
  isValid: boolean;
  error?: string;
} => {
  // Check if messages exists and is an array
  if (!messages) {
    return { isValid: false, error: 'Messages field is required' };
  }

  if (!Array.isArray(messages)) {
    return { isValid: false, error: 'Messages must be an array' };
  }

  if (messages.length === 0) {
    return { isValid: false, error: 'At least one message is required' };
  }

  // Validate each message
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // Check if message is an object
    if (!message || typeof message !== 'object') {
      return {
        isValid: false,
        error: `Message at index ${i} must be an object`,
      };
    }

    // Check required fields
    if (!message.hasOwnProperty('role')) {
      return {
        isValid: false,
        error: `Message at index ${i} is missing required field 'role'`,
      };
    }

    if (!message.hasOwnProperty('content')) {
      return {
        isValid: false,
        error: `Message at index ${i} is missing required field 'content'`,
      };
    }

    // Validate role
    if (!VALID_ROLES.includes(message.role)) {
      return {
        isValid: false,
        error: `Message at index ${i} has invalid role '${
          message.role
        }'. Valid roles are: ${VALID_ROLES.join(', ')}`,
      };
    }

    // Validate content
    if (message.content !== null && typeof message.content !== 'string') {
      return {
        isValid: false,
        error: `Message at index ${i} content must be a string or null`,
      };
    }

    // Check for empty or whitespace-only content
    if (
      message.content === null ||
      (typeof message.content === 'string' && message.content.trim() === '')
    ) {
      // For tool messages, empty content might be acceptable
      if (message.role !== 'tool') {
        return {
          isValid: false,
          error: `Message at index ${i} has empty content`,
        };
      }
    }

    // Validate content length (prevent extremely large messages)
    if (
      typeof message.content === 'string' &&
      message.content.length > 100000
    ) {
      return {
        isValid: false,
        error: `Message at index ${i} content exceeds maximum length of 100,000 characters`,
      };
    }

    // Validate tool-specific fields
    if (message.role === 'tool') {
      if (!message.tool_call_id || typeof message.tool_call_id !== 'string') {
        return {
          isValid: false,
          error: `Tool message at index ${i} must have a valid tool_call_id`,
        };
      }
    }

    // Validate tool_calls if present
    if (message.tool_calls !== undefined) {
      if (!Array.isArray(message.tool_calls)) {
        return {
          isValid: false,
          error: `Message at index ${i} tool_calls must be an array`,
        };
      }

      for (let j = 0; j < message.tool_calls.length; j++) {
        const toolCall = message.tool_calls[j];
        if (!toolCall || typeof toolCall !== 'object') {
          return {
            isValid: false,
            error: `Tool call at index ${j} in message ${i} must be an object`,
          };
        }

        // Basic tool call structure validation
        if (!toolCall.id || typeof toolCall.id !== 'string') {
          return {
            isValid: false,
            error: `Tool call at index ${j} in message ${i} must have a valid id`,
          };
        }

        if (!toolCall.function || typeof toolCall.function !== 'object') {
          return {
            isValid: false,
            error: `Tool call at index ${j} in message ${i} must have a valid function object`,
          };
        }

        if (
          !toolCall.function.name ||
          typeof toolCall.function.name !== 'string'
        ) {
          return {
            isValid: false,
            error: `Tool call at index ${j} in message ${i} must have a valid function name`,
          };
        }
      }
    }
  }

  // Validate conversation flow
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'user') {
    return { isValid: false, error: 'Last message must be from user' };
  }

  // Check for alternating pattern (optional but recommended)
  let hasConsecutiveUserMessages = false;
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === 'user' && messages[i - 1].role === 'user') {
      hasConsecutiveUserMessages = true;
      break;
    }
  }

  // Allow consecutive user messages but log a warning
  if (hasConsecutiveUserMessages) {
    // This is acceptable but not ideal - we'll just log it
    console.warn('Consecutive user messages detected in conversation');
  }

  return { isValid: true };
};
