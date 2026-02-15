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
import { FC } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { ConversationSearchBar } from './ConversationSearchBar';
import { ConversationItem } from './ConversationItem';
import type { ConversationRecord } from '../../types';

interface ConversationHistoryProps {
  /** Starred conversations */
  starredConversations: ConversationRecord[];
  /** Non-starred (recent) conversations */
  recentConversations: ConversationRecord[];
  /** Whether conversations are loading */
  loading: boolean;
  /** Error message if loading failed */
  error?: string;
  /** Current search query */
  searchQuery: string;
  /** Callback to set search query */
  onSearchChange: (query: string) => void;
  /** Callback to clear search */
  onSearchClear: () => void;
  /** Callback when a conversation is selected */
  onSelectConversation: (conversation: ConversationRecord) => void;
  /** Callback to toggle star status */
  onToggleStar: (id: string) => void;
  /** Callback to delete a conversation */
  onDelete: (id: string) => void;
  /** Currently selected conversation ID */
  selectedConversationId?: string;
}

/**
 * Displays a list of conversation history items with search, star, and delete functionality.
 * Shows starred conversations at the top, followed by recent conversations.
 */
export const ConversationHistory: FC<ConversationHistoryProps> = ({
  starredConversations,
  recentConversations,
  loading,
  error,
  searchQuery,
  onSearchChange,
  onSearchClear,
  onSelectConversation,
  onToggleStar,
  onDelete,
  selectedConversationId,
}) => {
  const theme = useTheme();

  const hasConversations =
    starredConversations.length > 0 || recentConversations.length > 0;
  const isSearchActive = searchQuery.length >= 2;
  const noSearchResults = isSearchActive && !hasConversations;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Search bar */}
      <ConversationSearchBar
        value={searchQuery}
        onChange={onSearchChange}
        onClear={onSearchClear}
      />

      {/* Scrollable content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: theme.spacing(0, 1, 1),
        }}
      >
        {/* Loading state */}
        {loading && !hasConversations && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              padding: theme.spacing(4),
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Error state */}
        {!loading && error && !hasConversations && (
          <Typography
            variant="body2"
            color="error"
            sx={{
              padding: theme.spacing(2),
              textAlign: 'center',
            }}
          >
            {error}
          </Typography>
        )}

        {/* No search results */}
        {noSearchResults && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: theme.spacing(4),
              color: theme.palette.text.secondary,
            }}
          >
            <SearchOffIcon
              sx={{ fontSize: 48, marginBottom: 2, opacity: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              No conversations found
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ marginTop: 1 }}
            >
              Try a different search term
            </Typography>
          </Box>
        )}

        {/* Empty state (no search active) */}
        {!hasConversations && !loading && !error && !isSearchActive && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: theme.spacing(4),
              color: theme.palette.text.secondary,
            }}
          >
            <ChatIcon sx={{ fontSize: 48, marginBottom: 2, opacity: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              No conversations yet
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ marginTop: 1 }}
            >
              Start a new chat to see your history here
            </Typography>
          </Box>
        )}

        {/* Starred conversations section */}
        {starredConversations.length > 0 && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                padding: theme.spacing(1, 0.5),
                color: theme.palette.text.secondary,
              }}
            >
              <StarIcon sx={{ fontSize: 14 }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, textTransform: 'uppercase' }}
              >
                Starred
              </Typography>
            </Box>
            <List dense sx={{ padding: 0 }}>
              {starredConversations.map(conversation => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversationId === conversation.id}
                  onSelect={() => onSelectConversation(conversation)}
                  onToggleStar={() => onToggleStar(conversation.id)}
                  onDelete={() => onDelete(conversation.id)}
                />
              ))}
            </List>
          </>
        )}

        {/* Divider between starred and recent */}
        {starredConversations.length > 0 && recentConversations.length > 0 && (
          <Divider sx={{ my: 1 }} />
        )}

        {/* Recent conversations section */}
        {recentConversations.length > 0 && (
          <>
            {starredConversations.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  padding: theme.spacing(1, 0.5),
                  color: theme.palette.text.secondary,
                }}
              >
                <ChatIcon sx={{ fontSize: 14 }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, textTransform: 'uppercase' }}
                >
                  Recent
                </Typography>
              </Box>
            )}
            <List dense sx={{ padding: 0 }}>
              {recentConversations.map(conversation => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversationId === conversation.id}
                  onSelect={() => onSelectConversation(conversation)}
                  onToggleStar={() => onToggleStar(conversation.id)}
                  onDelete={() => onDelete(conversation.id)}
                />
              ))}
            </List>
          </>
        )}
      </Box>
    </Box>
  );
};
