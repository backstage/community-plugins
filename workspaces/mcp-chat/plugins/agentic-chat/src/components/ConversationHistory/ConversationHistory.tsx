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
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useBranding } from '../../hooks';
import { agenticChatApiRef } from '../../api';
import type { ChatSessionSummary } from '../../types';
import { debugError } from '../../utils';
import { SessionSearchBar } from './SessionSearchBar';
import { ConversationSkeleton } from './ConversationSkeleton';
import { EmptyConversationState } from './EmptyConversationState';
import { GroupedSessionList } from './GroupedSessionList';

interface ConversationHistoryProps {
  /** Callback when a session is selected */
  onSelectSession: (sessionId: string, adminView?: boolean) => void;
  /** Called when the currently active session is deleted so the parent can clear the chat */
  onActiveSessionDeleted?: () => void;
  /** Currently active session ID */
  activeSessionId?: string;
  /** Trigger a refresh when this value changes (e.g., after a new chat completes) */
  refreshTrigger?: number;
  /** Whether the current user has admin privileges */
  isAdmin?: boolean;
}

/**
 * ConversationHistory component - displays chat sessions from local DB.
 * Mirrors the ai-virtual-agent pattern: sessions are the sidebar's source
 * of truth, LlamaStack only stores message content.
 */
export const ConversationHistory = ({
  onSelectSession,
  onActiveSessionDeleted,
  activeSessionId,
  refreshTrigger,
  isAdmin = false,
}: ConversationHistoryProps) => {
  const theme = useTheme();
  const api = useApi(agenticChatApiRef);
  const { branding } = useBranding();
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

  const PAGE_SIZE = 50;

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
    if (loading || loadingMore || !hasMore || (isAdmin && showAllUsers)) return;
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
  }, [
    api,
    sessions.length,
    loading,
    loadingMore,
    hasMore,
    isAdmin,
    showAllUsers,
  ]);

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

  const handleDeleteClick = (sessionId: string) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmDeleteId(sessionId);
    confirmTimerRef.current = setTimeout(() => setConfirmDeleteId(null), 5000);
  };

  const handleConfirmDelete = async (sessionId: string) => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmDeleteId(null);
    setDeletingId(sessionId);
    try {
      const success = await api.deleteSession(sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (sessionId === activeSessionId) {
          onActiveSessionDeleted?.();
        }
      }
    } catch (err) {
      debugError('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setConfirmDeleteId(null);
  };

  /**
   * Format timestamp - matches official Llama Stack UI pattern
   * Uses the exact timestamp from the Responses API (created_at)
   */
  const formatTime = (date: Date) => {
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Header with count and refresh */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
          mb: 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {sessions.length} conversation
          {sessions.length !== 1 ? 's' : ''} • {branding.appName}
        </Typography>
        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={() => loadSessions()}
            disabled={loading}
            aria-label="Refresh conversation history"
            sx={{
              color: theme.palette.text.secondary,
              p: 0.5,
              '&:hover': {
                color: theme.palette.primary.main,
                background: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {loading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <RefreshIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <SessionSearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showAllUsers={showAllUsers}
        onShowAllUsersChange={setShowAllUsers}
        isAdmin={isAdmin}
        showSearch={sessions.length > 0}
      />

      {/* Conversation List */}
      <Box
        ref={listContainerRef}
        onScroll={handleListScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(
            theme.palette.primary.main,
            0.2,
          )} transparent`,
          '&::-webkit-scrollbar': {
            width: 5,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: 3,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.35),
            },
          },
        }}
      >
        {/* eslint-disable-next-line no-nested-ternary */}
        {sessions.length === 0 && loading ? (
          <ConversationSkeleton />
        ) : sessions.length === 0 ? (
          <EmptyConversationState />
        ) : (
          <GroupedSessionList
            groups={groupedSessions}
            activeSessionId={activeSessionId}
            showAllUsers={showAllUsers}
            searchQuery={searchQuery}
            deleteState={{
              confirmDeleteId,
              deletingId,
              onDeleteClick: handleDeleteClick,
              onConfirmDelete: () =>
                confirmDeleteId && void handleConfirmDelete(confirmDeleteId),
              onCancelDelete: handleCancelDelete,
            }}
            formatTime={formatTime}
            onSelectSession={onSelectSession}
          />
        )}

        {/* Loading indicator at bottom */}
        {(loading || loadingMore) && sessions.length > 0 && (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <CircularProgress size={18} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
