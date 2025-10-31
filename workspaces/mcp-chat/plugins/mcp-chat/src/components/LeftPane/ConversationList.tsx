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
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import type { ConversationRecord } from '../../types';

interface ConversationListProps {
  conversations: ConversationRecord[];
  loading: boolean;
  error?: string;
  onSelectConversation: (conversation: ConversationRecord) => void;
  selectedConversationId?: string;
}

export const ConversationList: FC<ConversationListProps> = ({
  conversations,
  loading,
  error,
  onSelectConversation,
  selectedConversationId,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          padding: '8px 12px',
          display: 'block',
          color: theme.palette.text.secondary,
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '0.7rem',
        }}
      >
        Recent Conversations
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ padding: 2, display: 'block', textAlign: 'center' }}
        >
          {error}
        </Typography>
      )}

      {!loading && !error && conversations.length === 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ padding: 2, display: 'block', textAlign: 'center' }}
        >
          No conversations yet
        </Typography>
      )}

      {!loading && !error && conversations.length > 0 && (
        <List dense sx={{ padding: 0 }}>
          {conversations.map(conversation => {
            const firstUserMessage = conversation.messages.find(
              m => m.role === 'user',
            );
            const preview =
              firstUserMessage?.content.substring(0, 50) ||
              'Empty conversation';
            const isSelected = selectedConversationId === conversation.id;

            return (
              <ListItem key={conversation.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onSelectConversation(conversation)}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isSelected ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {preview.length < firstUserMessage?.content.length!
                          ? `${preview}...`
                          : preview}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};
