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
import { ServerConfig } from './types';
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

    const type =
      serverConfig.getOptionalString('type') || serverConfig.has('url')
        ? 'streamable-http'
        : 'stdio';

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
