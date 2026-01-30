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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { mcpChatApiRef } from '../api';
import type { ConversationRecord } from '../types';

/**
 * Check if a user is a guest user based on their userEntityRef.
 * Guest users have userEntityRef like 'user:development/guest'.
 */
function isGuestUser(userEntityRef: string): boolean {
  const guestPattern = /^user:development\/guest$/i;
  return guestPattern.test(userEntityRef);
}

/**
 * Filter conversations by search query.
 * Searches in title and user message content (case-insensitive).
 */
function filterConversations(
  conversations: ConversationRecord[],
  query: string,
): ConversationRecord[] {
  const lowerQuery = query.toLowerCase();
  return conversations.filter(conv => {
    // Check title
    if (conv.title?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    // Check user messages
    return conv.messages.some(
      m => m.role === 'user' && m.content?.toLowerCase().includes(lowerQuery),
    );
  });
}

/**
 * Return type for the useConversations hook.
 * @public
 */
export interface UseConversationsReturn {
  /** List of conversations (filtered if search is active) */
  conversations: ConversationRecord[];
  /** Starred conversations */
  starredConversations: ConversationRecord[];
  /** Non-starred conversations */
  recentConversations: ConversationRecord[];
  /** Whether conversations are currently loading */
  loading: boolean;
  /** Error message if loading failed */
  error?: string;
  /** Current search query */
  searchQuery: string;
  /** Set the search query */
  setSearchQuery: (query: string) => void;
  /** Clear the search */
  clearSearch: () => void;
  /** Load a specific conversation by ID */
  loadConversation: (id: string) => Promise<ConversationRecord>;
  /** Refresh the conversation list */
  refreshConversations: () => void;
  /** Delete a conversation (with optimistic update) */
  deleteConversation: (id: string) => Promise<void>;
  /** Toggle star status (with optimistic update) */
  toggleStar: (id: string) => Promise<void>;
}

/**
 * Hook for managing conversation history.
 * Handles fetching conversations, caching, search, and optimistic updates.
 *
 * @returns Conversation data and helper functions
 * @public
 */
export function useConversations(): UseConversationsReturn {
  const mcpChatApi = useApi(mcpChatApiRef);
  const identityApi = useApi(identityApiRef);
  const [refreshKey, setRefreshKey] = useState(0);
  const [localConversations, setLocalConversations] = useState<
    ConversationRecord[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    value: fetchedConversations,
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
      // Gracefully handle errors by returning empty array
      // Conversation history is a nice-to-have, not critical
      return [];
    }
  }, [mcpChatApi, identityApi, refreshKey]);

  // Sync fetched conversations to local state
  useEffect(() => {
    if (fetchedConversations) {
      setLocalConversations(fetchedConversations);
    }
  }, [fetchedConversations]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const loadConversation = useCallback(
    async (id: string): Promise<ConversationRecord> => {
      // Check if user is a guest
      const identity = await identityApi.getBackstageIdentity();
      if (isGuestUser(identity.userEntityRef)) {
        throw new Error('Guest users cannot load conversations');
      }
      return mcpChatApi.getConversationById(id);
    },
    [mcpChatApi, identityApi],
  );

  const refreshConversations = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      // Optimistic update: remove from local state immediately
      const previousConversations = localConversations;
      setLocalConversations(prev => prev.filter(c => c.id !== id));

      try {
        await mcpChatApi.deleteConversation(id);
      } catch (err) {
        // Rollback on failure
        setLocalConversations(previousConversations);
        throw err;
      }
    },
    [mcpChatApi, localConversations],
  );

  const toggleStar = useCallback(
    async (id: string): Promise<void> => {
      // Optimistic update: toggle star in local state
      const previousConversations = localConversations;
      setLocalConversations(prev =>
        prev.map(c => (c.id === id ? { ...c, isStarred: !c.isStarred } : c)),
      );

      try {
        await mcpChatApi.toggleConversationStar(id);
      } catch (err) {
        // Rollback on failure
        setLocalConversations(previousConversations);
        throw err;
      }
    },
    [mcpChatApi, localConversations],
  );

  // Determine which conversations to show (with local filtering)
  const conversations = useMemo(() => {
    if (searchQuery && searchQuery.length >= 2) {
      return filterConversations(localConversations, searchQuery);
    }
    return localConversations;
  }, [searchQuery, localConversations]);

  // Split into starred and non-starred
  const starredConversations = useMemo(
    () => conversations.filter(c => c.isStarred),
    [conversations],
  );

  const recentConversations = useMemo(
    () => conversations.filter(c => !c.isStarred),
    [conversations],
  );

  return {
    conversations,
    starredConversations,
    recentConversations,
    loading,
    error: error?.message,
    searchQuery,
    setSearchQuery,
    clearSearch,
    loadConversation,
    refreshConversations,
    deleteConversation,
    toggleStar,
  };
}
