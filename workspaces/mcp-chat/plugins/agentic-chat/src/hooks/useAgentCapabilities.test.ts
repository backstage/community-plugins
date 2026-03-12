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
import { renderHook } from '@testing-library/react';
import type { MCPServerStatus } from '../types';
import { useAgentCapabilities } from './useAgentCapabilities';

describe('useAgentCapabilities', () => {
  it('returns empty capabilities when config is null', () => {
    const { result } = renderHook(() => useAgentCapabilities(null, undefined));
    expect(result.current.model).toBe('');
    expect(result.current.enableWebSearch).toBe(false);
    expect(result.current.mcpTools).toEqual([]);
    expect(result.current.ragEnabled).toBe(false);
  });

  it('extracts model and built-in tools from config', () => {
    const config = {
      model: 'llama-3',
      enableWebSearch: true,
      enableCodeInterpreter: true,
      vectorStoreIds: [],
    };
    const { result } = renderHook(() => useAgentCapabilities(config, []));
    expect(result.current.model).toBe('llama-3');
    expect(result.current.enableWebSearch).toBe(true);
    expect(result.current.enableCodeInterpreter).toBe(true);
    expect(result.current.ragEnabled).toBe(false);
  });

  it('detects RAG from non-empty vectorStoreIds', () => {
    const config = { vectorStoreIds: ['vs-1', 'vs-2'] };
    const { result } = renderHook(() => useAgentCapabilities(config, []));
    expect(result.current.ragEnabled).toBe(true);
    expect(result.current.vectorStoreNames).toEqual(['vs-1', 'vs-2']);
  });

  it('detects RAG from vectorStoreName when vectorStoreIds is empty', () => {
    const config = { vectorStoreIds: [], vectorStoreName: 'techx-db' };
    const { result } = renderHook(() => useAgentCapabilities(config, []));
    expect(result.current.ragEnabled).toBe(true);
    expect(result.current.vectorStoreNames).toEqual(['techx-db']);
  });

  it('discovers MCP tools from connected servers', () => {
    const servers: MCPServerStatus[] = [
      {
        id: 's1',
        name: 'K8s Tools',
        url: 'http://k8s',
        connected: true,
        tools: [
          { name: 'get_pods', description: 'List pods' },
          { name: 'get_logs', description: 'Get pod logs' },
        ],
        toolCount: 2,
      },
      {
        id: 's2',
        name: 'Offline Server',
        url: 'http://off',
        connected: false,
        tools: [{ name: 'should_not_appear' }],
        toolCount: 1,
      },
    ];

    const { result } = renderHook(() => useAgentCapabilities({}, servers));
    expect(result.current.mcpTools).toHaveLength(2);
    expect(result.current.mcpTools[0]).toEqual({
      name: 'get_pods',
      description: 'List pods',
      serverLabel: 'K8s Tools',
      serverId: 's1',
    });
    expect(result.current.mcpTools[1].name).toBe('get_logs');
  });

  it('lists configured MCP servers from effective config even when offline', () => {
    const config = {
      mcpServers: [
        { id: 'openshift', name: 'OpenShift MCP Server' },
        { id: 'jira', name: 'Jira MCP' },
      ],
    };
    const { result } = renderHook(() => useAgentCapabilities(config, []));
    expect(result.current.mcpServers).toHaveLength(2);
    expect(result.current.mcpServers[0].name).toBe('OpenShift MCP Server');
    expect(result.current.mcpServers[0].connected).toBe(false);
    expect(result.current.mcpServers[0].tools).toEqual([]);
    expect(result.current.mcpServers[1].name).toBe('Jira MCP');
  });

  it('merges configured servers with live status and tools', () => {
    const config = {
      mcpServers: [{ id: 's1', name: 'K8s Server' }],
    };
    const servers: MCPServerStatus[] = [
      {
        id: 's1',
        name: 'K8s Server',
        url: 'http://k8s',
        connected: true,
        tools: [{ name: 'get_pods', description: 'List pods' }],
        toolCount: 1,
      },
    ];
    const { result } = renderHook(() => useAgentCapabilities(config, servers));
    expect(result.current.mcpServers).toHaveLength(1);
    expect(result.current.mcpServers[0].connected).toBe(true);
    expect(result.current.mcpServers[0].tools).toHaveLength(1);
    expect(result.current.mcpTools).toHaveLength(1);
  });

  it('extracts safety configuration', () => {
    const config = {
      safetyEnabled: true,
      inputShields: ['content-safety'],
      outputShields: ['pii-filter'],
    };
    const { result } = renderHook(() => useAgentCapabilities(config, []));
    expect(result.current.safetyEnabled).toBe(true);
    expect(result.current.safetyShields).toEqual([
      'content-safety',
      'pii-filter',
    ]);
  });

  it('extracts evaluation configuration', () => {
    const config = { evaluationEnabled: true };
    const { result } = renderHook(() => useAgentCapabilities(config, []));
    expect(result.current.evaluationEnabled).toBe(true);
  });
});
