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
import { useState, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { MCPServer } from '../types';
import { mcpChatApiRef } from '../api';

export interface UseMcpServersReturn {
  mcpServers: MCPServer[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  handleServerToggle: (serverId: string) => void;
}

export const useMcpServers = (): UseMcpServersReturn => {
  const mcpChatApi = useApi(mcpChatApiRef);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);

  const {
    loading: isLoading,
    error,
    retry: refetch,
  } = useAsyncRetry(async () => {
    const mcpServerStatus = await mcpChatApi.getMCPServerStatus();
    const servers =
      mcpServerStatus.servers?.map((server: MCPServer) => ({
        ...server,
        enabled: true, // Default all servers to enabled
      })) || [];
    setMcpServers(servers);
    return servers;
  }, [mcpChatApi]);

  const handleServerToggle = useCallback((serverId: string) => {
    setMcpServers(prev =>
      prev.map(server =>
        server.id === serverId
          ? { ...server, enabled: !server.enabled }
          : server,
      ),
    );
  }, []);

  return {
    mcpServers,
    isLoading,
    error: error?.message || null,
    refetch,
    handleServerToggle,
  };
};
