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
import { ReactNode, FC } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { mcpChatApiRef } from '../api';
import { useMcpServers } from './useMcpServers';
import { MCPServer, MCPServerType } from '../types';

describe('useMcpServers', () => {
  const mockServers: MCPServer[] = [
    {
      id: 'server-1',
      name: 'Test Server 1',
      type: MCPServerType.STDIO,
      status: { valid: true, connected: true },
      enabled: true,
    },
    {
      id: 'server-2',
      name: 'Test Server 2',
      type: MCPServerType.SSE,
      url: 'http://localhost:7007',
      status: { valid: true, connected: false },
      enabled: true,
    },
  ];

  const mockMcpChatApi = {
    getMCPServerStatus: jest.fn(),
  };

  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return servers with enabled true by default', async () => {
    mockMcpChatApi.getMCPServerStatus.mockResolvedValue({
      servers: mockServers,
    });
    const { result } = renderHook(() => useMcpServers(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.mcpServers).toHaveLength(2);
    expect(result.current.mcpServers.every(s => s.enabled)).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    mockMcpChatApi.getMCPServerStatus.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useMcpServers(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.mcpServers).toEqual([]);
    expect(result.current.error).toBe('fail');
  });

  it('should toggle server enabled state', async () => {
    mockMcpChatApi.getMCPServerStatus.mockResolvedValue({
      servers: mockServers,
    });
    const { result } = renderHook(() => useMcpServers(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleServerToggle('server-1');
    });

    expect(
      result.current.mcpServers.find(s => s.id === 'server-1')?.enabled,
    ).toBe(false);

    act(() => {
      result.current.handleServerToggle('server-1');
    });

    expect(
      result.current.mcpServers.find(s => s.id === 'server-1')?.enabled,
    ).toBe(true);
  });

  it('should refetch servers', async () => {
    mockMcpChatApi.getMCPServerStatus.mockResolvedValue({
      servers: mockServers,
    });
    const { result } = renderHook(() => useMcpServers(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const newServers = [
      { ...mockServers[0], name: 'Updated Server 1' },
      { ...mockServers[1], name: 'Updated Server 2' },
    ];
    mockMcpChatApi.getMCPServerStatus.mockResolvedValue({
      servers: newServers,
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.mcpServers[0].name).toBe('Updated Server 1'),
    );
  });

  it('should handle empty server list', async () => {
    mockMcpChatApi.getMCPServerStatus.mockResolvedValue({ servers: [] });
    const { result } = renderHook(() => useMcpServers(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.mcpServers).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
