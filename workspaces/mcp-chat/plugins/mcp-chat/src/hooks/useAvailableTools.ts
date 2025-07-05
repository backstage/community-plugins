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
import { mcpChatApiRef } from '../api';
import { MCPServer, Tool } from '../types';

export interface UseAvailableToolsReturn {
  availableTools: Tool[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAvailableTools = (
  mcpServers: MCPServer[],
): UseAvailableToolsReturn => {
  const mcpChatApi = useApi(mcpChatApiRef);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const toolsResponse = await mcpChatApi.getAvailableTools();
      setAvailableTools(toolsResponse.availableTools);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch available tools';
      // eslint-disable-next-line no-console
      console.error('Failed to fetch tools:', err);
      setError(errorMessage);
      setAvailableTools([]);
    } finally {
      setIsLoading(false);
    }
  }, [mcpChatApi]);

  useEffect(() => {
    // Only fetch tools if there are MCP servers available
    if (mcpServers && mcpServers.length > 0) {
      fetchTools();
    } else {
      // Clear tools if no servers are available
      setAvailableTools([]);
      setError(null);
      setIsLoading(false);
    }
  }, [mcpServers, fetchTools]);

  return {
    availableTools,
    isLoading,
    error,
    refetch: fetchTools,
  };
};
