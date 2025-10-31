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
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HistoryIcon from '@mui/icons-material/History';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import type { ConversationRecord } from '../../types';
import { NewChatButton } from './NewChatButton';
import { ConversationList } from './ConversationList';

interface LeftPaneProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  conversations: ConversationRecord[];
  conversationsLoading: boolean;
  conversationsError?: string;
  onSelectConversation: (conversation: ConversationRecord) => void;
  selectedConversationId?: string;
}

export const LeftPane: FC<LeftPaneProps> = ({
  collapsed,
  onToggle,
  onNewChat,
  conversations,
  conversationsLoading,
  conversationsError,
  onSelectConversation,
  selectedConversationId,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: collapsed ? 60 : 280,
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header with toggle */}
      <Box
        sx={{
          padding: '16px',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chats
            </Typography>
          </Box>
        )}
        <IconButton
          size="small"
          onClick={onToggle}
          sx={{ color: theme.palette.text.primary }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Collapsed state - just icons */}
      {collapsed && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 2,
            gap: 2,
          }}
        >
          <IconButton
            size="small"
            onClick={onNewChat}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            title="New Chat"
          >
            <AddIcon />
          </IconButton>
        </Box>
      )}

      {/* Expanded state - full content */}
      {!collapsed && (
        <>
          <NewChatButton onNewChat={onNewChat} />

          <Divider />

          <ConversationList
            conversations={conversations}
            loading={conversationsLoading}
            error={conversationsError}
            onSelectConversation={onSelectConversation}
            selectedConversationId={selectedConversationId}
          />
        </>
      )}
    </Box>
  );
};
