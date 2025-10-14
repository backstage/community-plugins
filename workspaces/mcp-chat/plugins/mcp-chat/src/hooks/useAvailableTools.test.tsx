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
import { renderHook, waitFor, act } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { mcpChatApiRef } from '../api';
import { useAvailableTools } from './useAvailableTools';
import { MCPServer, Tool, MCPServerType } from '../types';

describe('useAvailableTools', () => {
  const mockTools: Tool[] = [
    {
      type: 'function',
      function: {
        name: 'search_web',
        description: 'Search the web',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string' } },
        },
      },
      serverId: 'server-1',
    },
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get weather information',
        parameters: {
          type: 'object',
          properties: { location: { type: 'string' } },
        },
      },
      serverId: 'server-2',
    },
  ];

  const mockServers: MCPServer[] = [
    {
      id: 'server-1',
      name: 'server-1',
      type: MCPServerType.STDIO,
      status: { valid: true, connected: true },
      enabled: true,
    },
    {
      id: 'server-2',
      name: 'server-2',
      type: MCPServerType.SSE,
      url: 'http://localhost:7007',
      status: { valid: true, connected: true },
      enabled: true,
    },
  ];

  const mockMcpChatApi = {
    getAvailableTools: jest.fn(),
  };

  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <TestApiProvider apis={[[mcpChatApiRef, mockMcpChatApi]]}>
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return tools when servers are available', async () => {
    mockMcpChatApi.getAvailableTools.mockResolvedValue({
      availableTools: mockTools,
    });
    const { result } = renderHook(() => useAvailableTools(mockServers), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.availableTools).toEqual(mockTools);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch tools when no servers are provided', async () => {
    const { result } = renderHook(() => useAvailableTools([]), {
      wrapper: Wrapper,
    });
    // Wait for the hook to settle and return empty array
    await waitFor(() => expect(result.current.availableTools).toEqual([]));
    expect(mockMcpChatApi.getAvailableTools).not.toHaveBeenCalled();
  });

  it('should not fetch tools when servers array is null', async () => {
    const { result } = renderHook(() => useAvailableTools(null as any), {
      wrapper: Wrapper,
    });
    // Wait for the hook to settle and return empty array
    await waitFor(() => expect(result.current.availableTools).toEqual([]));
    expect(mockMcpChatApi.getAvailableTools).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    mockMcpChatApi.getAvailableTools.mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() => useAvailableTools(mockServers), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.availableTools).toEqual([]);
    expect(result.current.error).toBe('API Error');
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockMcpChatApi.getAvailableTools.mockRejectedValue(networkError);
    const { result } = renderHook(() => useAvailableTools(mockServers), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.availableTools).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-Error exceptions', async () => {
    mockMcpChatApi.getAvailableTools.mockRejectedValue('String error');
    const { result } = renderHook(() => useAvailableTools(mockServers), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.availableTools).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch available tools');
  });

  it('should refetch tools when refetch is called', async () => {
    mockMcpChatApi.getAvailableTools.mockResolvedValue({
      availableTools: mockTools,
    });
    const { result } = renderHook(() => useAvailableTools(mockServers), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const newTools = [
      {
        ...mockTools[0],
        function: { ...mockTools[0].function, name: 'new_search' },
      },
    ];
    mockMcpChatApi.getAvailableTools.mockResolvedValue({
      availableTools: newTools,
    });
    act(() => {
      result.current.refetch();
    });
    await waitFor(() =>
      expect(result.current.availableTools[0].function.name).toBe('new_search'),
    );
    expect(mockMcpChatApi.getAvailableTools).toHaveBeenCalledTimes(2);
  });

  it('should handle errors during refetch', async () => {
    mockMcpChatApi.getAvailableTools.mockResolvedValue({
      availableTools: mockTools,
    });
    const { result } = renderHook(() => useAvailableTools(mockServers), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const errorMessage = 'Refetch failed';
    mockMcpChatApi.getAvailableTools.mockRejectedValue(new Error(errorMessage));
    act(() => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.error).toBe(errorMessage));
    expect(result.current.availableTools).toEqual([]);
  });

  it('should show loading state initially', () => {
    mockMcpChatApi.getAvailableTools.mockImplementation(
      () => new Promise(() => {}),
    );
    const { result } = renderHook(() => useAvailableTools(mockServers), {
      wrapper: Wrapper,
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.availableTools).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should return correct interface structure', async () => {
    mockMcpChatApi.getAvailableTools.mockResolvedValue({
      availableTools: mockTools,
    });
    const { result } = renderHook(() => useAvailableTools(mockServers), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current).toHaveProperty('availableTools');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');
    expect(typeof result.current.refetch).toBe('function');
  });
});
