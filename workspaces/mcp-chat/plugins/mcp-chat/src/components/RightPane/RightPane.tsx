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
import { FC, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MemoryIcon from '@mui/icons-material/Memory';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ActiveMcpServers } from './ActiveMcpServers';
import { ActiveTools } from './ActiveTools';
import { ProviderStatus } from './ProviderStatus';
import { ConversationHistory } from './ConversationHistory';
import { BotIcon } from '../BotIcon';
import { MCPServer, ConversationRecord } from '../../types';
import { UseProviderStatusReturn, useAvailableTools } from '../../hooks';

type TabType = 'status' | 'history';

interface RightPaneProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  mcpServers: MCPServer[];
  onServerToggle: (serverName: string) => void;
  providerStatus: UseProviderStatusReturn;
  // Conversation history props
  starredConversations: ConversationRecord[];
  recentConversations: ConversationRecord[];
  conversationsLoading: boolean;
  conversationsError?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
  onSelectConversation: (conversation: ConversationRecord) => void;
  onToggleStar: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  selectedConversationId?: string;
}

export const RightPane: FC<RightPaneProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  mcpServers,
  onServerToggle,
  providerStatus,
  starredConversations,
  recentConversations,
  conversationsLoading,
  conversationsError,
  searchQuery,
  onSearchChange,
  onSearchClear,
  onSelectConversation,
  onToggleStar,
  onDeleteConversation,
  selectedConversationId,
}: RightPaneProps) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('status');
  const { availableTools, isLoading: toolsLoading } =
    useAvailableTools(mcpServers);

  const handleTabChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTab: TabType | null,
  ) => {
    if (newTab !== null) {
      setActiveTab(newTab);
    }
  };

  return (
    <Box
      sx={{
        width: sidebarCollapsed ? 60 : 400,
        backgroundColor: theme.palette.background.paper,
        borderLeft: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {!sidebarCollapsed && (
        <IconButton
          sx={{
            position: 'absolute',
            top: theme.spacing(1),
            left: -20,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '50%',
            width: 40,
            height: 40,
            zIndex: 2,
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          onClick={onToggleSidebar}
          size="small"
        >
          <ChevronRightIcon />
        </IconButton>
      )}

      {/* Header */}
      <Box
        sx={{
          padding: sidebarCollapsed ? theme.spacing(1) : theme.spacing(2),
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 64,
        }}
      >
        {!sidebarCollapsed && (
          <>
            <BotIcon size={25} color={theme.palette.text.primary} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                marginLeft: theme.spacing(1),
                color: theme.palette.text.primary,
              }}
            >
              MCP Chat
            </Typography>
          </>
        )}
        {sidebarCollapsed && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '8px',
            }}
          >
            <IconButton
              size="small"
              onClick={onToggleSidebar}
              sx={{ color: theme.palette.text.primary }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {!sidebarCollapsed && (
        <>
          {/* New Chat Button */}
          <Box sx={{ padding: '16px 16px 8px' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  background: theme.palette.primary.dark,
                },
                borderRadius: theme.spacing(1),
                textTransform: 'none',
                padding: theme.spacing(1, 2),
                fontWeight: 600,
              }}
              size="small"
              fullWidth
              onClick={onNewChat}
            >
              New chat
            </Button>
          </Box>

          {/* Tab Buttons */}
          <Box sx={{ padding: '8px 16px' }}>
            <ToggleButtonGroup
              value={activeTab}
              exclusive
              onChange={handleTabChange}
              size="small"
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: theme.spacing(0.75, 2),
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  },
                },
              }}
            >
              <ToggleButton value="status">
                <SettingsIcon sx={{ fontSize: 18, mr: 0.5 }} />
                Status
              </ToggleButton>
              <ToggleButton value="history">
                <HistoryIcon sx={{ fontSize: 18, mr: 0.5 }} />
                History
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Tab Content */}
          {activeTab === 'status' && (
            <>
              <ProviderStatus
                providerStatusData={providerStatus.providerStatusData}
                isLoading={providerStatus.isLoading}
                error={providerStatus.error}
              />

              <ActiveTools
                mcpServers={mcpServers}
                availableTools={availableTools}
                toolsLoading={toolsLoading}
              />

              <ActiveMcpServers
                mcpServers={mcpServers}
                onServerToggle={onServerToggle}
              />
            </>
          )}

          {activeTab === 'history' && (
            <ConversationHistory
              starredConversations={starredConversations}
              recentConversations={recentConversations}
              loading={conversationsLoading}
              error={conversationsError}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSearchClear={onSearchClear}
              onSelectConversation={onSelectConversation}
              onToggleStar={onToggleStar}
              onDelete={onDeleteConversation}
              selectedConversationId={selectedConversationId}
            />
          )}
        </>
      )}

      {sidebarCollapsed && (
        <Box
          sx={{
            padding: '16px 8px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Top section - buttons that stay at top */}
          <Box>
            {/* Add button when collapsed */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <IconButton
                size="small"
                onClick={onNewChat}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {/* History button when collapsed */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '8px',
              }}
            >
              <IconButton
                size="small"
                title="History"
                onClick={() => {
                  onToggleSidebar();
                  setActiveTab('history');
                }}
                sx={{ color: theme.palette.text.secondary }}
              >
                <HistoryIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Bottom section - MCP Servers */}
          <Box sx={{ marginTop: 'auto' }}>
            {/* Separator line */}
            <Box
              sx={{
                borderTop: `2px solid ${theme.palette.divider}`,
                margin: '0 8px 16px 8px',
              }}
            />

            {/* MCP Servers Section Icon */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <IconButton
                size="medium"
                title="MCP Configuration"
                onClick={() => {
                  onToggleSidebar();
                  setActiveTab('status');
                }}
                sx={{ color: theme.palette.text.primary }}
              >
                <MemoryIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
