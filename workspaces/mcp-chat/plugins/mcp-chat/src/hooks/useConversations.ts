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

import { useState, useEffect } from 'react';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { mcpChatApiRef } from '../api';
import type { ConversationRecord } from '../types';

/**
 * Check if a user is a guest user based on their userEntityRef
 * Guest users have userEntityRef like 'user:development/guest'
 */
function isGuestUser(userEntityRef: string): boolean {
  const guestPattern = /^user:development\/guest$/i;
  return guestPattern.test(userEntityRef);
}

export function useConversations() {
  const mcpChatApi = useApi(mcpChatApiRef);
  const identityApi = useApi(identityApiRef);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cachedConversations, setCachedConversations] = useState<
    ConversationRecord[]
  >([]);

  const {
    value: conversations,
    loading,
    error,
  } = useAsync(async () => {
    try {
      // Check if user is a guest - skip API call for guests
      const identity = await identityApi.getBackstageIdentity();
      if (isGuestUser(identity.userEntityRef)) {
        return [];
      }

      const response = await mcpChatApi.getConversations();
      return response.conversations;
    } catch (err: any) {
      // Gracefully handle all errors by returning empty array
      // Conversation history is a nice-to-have feature, not critical
      return [];
    }
  }, [mcpChatApi, identityApi, refreshKey]);

  // Cache conversations to prevent flickering during refetch
  useEffect(() => {
    if (conversations) {
      setCachedConversations(conversations);
    }
  }, [conversations]);

  const loadConversation = async (id: string): Promise<ConversationRecord> => {
    // Check if user is a guest - throw error for guests
    const identity = await identityApi.getBackstageIdentity();
    if (isGuestUser(identity.userEntityRef)) {
      throw new Error('Guest users cannot load conversations');
    }
    return await mcpChatApi.getConversationById(id);
  };

  const refreshConversations = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    conversations: conversations || cachedConversations,
    loading,
    error: error?.message,
    loadConversation,
    refreshConversations,
  };
}
