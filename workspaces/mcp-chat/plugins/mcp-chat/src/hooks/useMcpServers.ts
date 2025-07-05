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
import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { MCPServer } from '../types';
import { mcpChatApiRef } from '../api';

export interface UseMcpServersReturn {
  mcpServers: MCPServer[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  handleServerToggle: (serverName: string) => void;
}

export const useMcpServers = (): UseMcpServersReturn => {
  const mcpChatApi = useApi(mcpChatApiRef);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMcpServers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mcpServerStatus = await mcpChatApi.getMCPServerStatus();
      setMcpServers(
        mcpServerStatus.servers?.map((server: MCPServer) => ({
          ...server,
          enabled: true, // Default all servers to enabled
        })) || [],
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load MCP servers';
      // eslint-disable-next-line no-console
      console.error('Failed to load MCP servers:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mcpChatApi]);

  const handleServerToggle = useCallback((serverName: string) => {
    setMcpServers(prev =>
      prev.map(server =>
        server.name === serverName
          ? { ...server, enabled: !server.enabled }
          : server,
      ),
    );
  }, []);

  useEffect(() => {
    fetchMcpServers();
  }, [fetchMcpServers]);

  return {
    mcpServers,
    isLoading,
    error,
    refetch: fetchMcpServers,
    handleServerToggle,
  };
};
