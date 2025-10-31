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

import { useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { mcpChatApiRef } from '../api';
import type { ConversationRecord } from '../types';

export function useConversations() {
  const mcpChatApi = useApi(mcpChatApiRef);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    value: conversations,
    loading,
    error,
  } = useAsync(async () => {
    try {
      const response = await mcpChatApi.getConversations();
      return response.conversations;
    } catch (err: any) {
      if (
        err?.message?.includes('500') ||
        err?.message?.includes('Internal Server Error')
      ) {
        return [];
      }
      throw err;
    }
  }, [mcpChatApi, refreshKey]);

  const loadConversation = async (id: string): Promise<ConversationRecord> => {
    return await mcpChatApi.getConversationById(id);
  };

  const refreshConversations = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    conversations: conversations || [],
    loading,
    error: error?.message,
    loadConversation,
    refreshConversations,
  };
}
