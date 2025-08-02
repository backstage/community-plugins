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
import { useApi } from '@backstage/core-plugin-api';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { mcpChatApiRef } from '../api';
import { MCPServer, Tool } from '../types';

export interface UseAvailableToolsReturn {
  availableTools: Tool[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAvailableTools = (
  mcpServers: MCPServer[],
): UseAvailableToolsReturn => {
  const mcpChatApi = useApi(mcpChatApiRef);

  const {
    value: availableTools,
    loading: isLoading,
    error,
    retry: refetch,
  } = useAsyncRetry(async () => {
    // Only fetch tools if there are MCP servers available
    if (!mcpServers || mcpServers.length === 0) {
      return [];
    }

    try {
      const toolsResponse = await mcpChatApi.getAvailableTools();
      return toolsResponse.availableTools;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch available tools';
      // eslint-disable-next-line no-console
      console.error('Failed to fetch tools:', err);
      throw new Error(errorMessage);
    }
  }, [mcpChatApi, mcpServers]);

  return {
    availableTools: availableTools || [],
    isLoading,
    error: error?.message || null,
    refetch,
  };
};
