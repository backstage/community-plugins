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
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../../api';
import { ChatSessionSummary } from '../../types';
import { debugError } from '../../utils';

export interface UseConversationHistoryParams {
  /** Trigger a refresh when this value changes (e.g., after a new chat completes) */
  refreshTrigger?: number;
  /** Whether the current user has admin privileges */
  isAdmin?: boolean;
}

export interface UseConversationHistoryReturn {
  sessions: ChatSessionSummary[];
  loading: boolean;
  deletingId: string | null;
  confirmDeleteId: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showAllUsers: boolean;
  setShowAllUsers: (v: boolean) => void;
  loadSessions: () => Promise<void>;
  handleDeleteClick: (sessionId: string, e: React.MouseEvent) => void;
  handleConfirmDelete: (
    sessionId: string,
    e: React.MouseEvent,
  ) => Promise<void>;
  handleCancelDelete: (e: React.MouseEvent) => void;
  formatTime: (date: Date) => string;
  groupedSessions: { label: string; sessions: ChatSessionSummary[] }[];
  filteredSessions: ChatSessionSummary[];
  listContainerRef: React.RefObject<HTMLDivElement>;
  handleListScroll: () => void;
  loadingMore: boolean;
}

const PAGE_SIZE = 50;

/**
 * Format timestamp - matches official Llama Stack UI pattern
 * Uses the exact timestamp from the Responses API (created_at)
 */
function formatTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function useConversationHistory({
  refreshTrigger,
  isAdmin = false,
}: UseConversationHistoryParams): UseConversationHistoryReturn {
  const api = useApi(agenticChatApiRef);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setHasMore(true);
    try {
      const list =
        isAdmin && showAllUsers
          ? await api.listAllSessions()
          : await api.listSessions(PAGE_SIZE, 0);
      setSessions(list);
      if (list.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      debugError('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [api, isAdmin, showAllUsers]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || (isAdmin && showAllUsers)) return;
    setLoadingMore(true);
    try {
      const list = await api.listSessions(PAGE_SIZE, sessions.length);
      if (list.length < PAGE_SIZE) setHasMore(false);
      if (list.length > 0) {
        setSessions(prev => [...prev, ...list]);
      }
    } catch (err) {
      debugError('Failed to load more sessions:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [api, sessions.length, loadingMore, hasMore, isAdmin, showAllUsers]);

  const handleListScroll = useCallback(() => {
    const el = listContainerRef.current;
    if (!el || !hasMore || loadingMore) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom) loadMore();
  }, [hasMore, loadingMore, loadMore]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadSessions();
    }
  }, [refreshTrigger, loadSessions]);

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmDeleteId(sessionId);
    confirmTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 5000);
  };

  const handleConfirmDelete = async (
    sessionId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmDeleteId(null);
    setDeletingId(sessionId);
    try {
      const success = await api.deleteSession(sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (err) {
      debugError('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmDeleteId(null);
  };

  const filteredSessions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return query
      ? sessions.filter(s => s.title.toLowerCase().includes(query))
      : sessions;
  }, [sessions, searchQuery]);

  const groupedSessions = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    const groups: { label: string; sessions: ChatSessionSummary[] }[] = [];
    const buckets: Record<string, ChatSessionSummary[]> = {};

    for (const session of filteredSessions) {
      const d = new Date(session.updatedAt);
      let label: string;
      if (d.toDateString() === today) label = 'Today';
      else if (d.toDateString() === yesterday) label = 'Yesterday';
      else if (d >= weekAgo) label = 'This week';
      else label = 'Older';

      if (!buckets[label]) buckets[label] = [];
      buckets[label].push(session);
    }

    for (const label of ['Today', 'Yesterday', 'This week', 'Older']) {
      if (buckets[label]?.length) {
        groups.push({ label, sessions: buckets[label] });
      }
    }
    return groups;
  }, [filteredSessions]);

  return {
    sessions,
    loading,
    deletingId,
    confirmDeleteId,
    searchQuery,
    setSearchQuery,
    showAllUsers,
    setShowAllUsers,
    loadSessions,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    formatTime,
    groupedSessions,
    filteredSessions,
    listContainerRef,
    handleListScroll,
    loadingMore,
  };
}
