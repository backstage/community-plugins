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
import MemoryIcon from '@mui/icons-material/Memory';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { ActiveMcpServers } from './ActiveMcpServers';
import { ActiveTools } from './ActiveTools';
import { ProviderStatus } from './ProviderStatus';
import { BotIcon } from '../BotIcon';
import { MCPServer } from '../../types';
import { UseProviderStatusReturn, useAvailableTools } from '../../hooks';

interface RightPaneProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  mcpServers: MCPServer[];
  onServerToggle: (serverName: string) => void;
  providerStatus: UseProviderStatusReturn;
}

export const RightPane: FC<RightPaneProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  mcpServers,
  onServerToggle,
  providerStatus,
}: RightPaneProps) => {
  const theme = useTheme();
  const { availableTools, isLoading: toolsLoading } =
    useAvailableTools(mcpServers);

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

          <ProviderStatus
            providerStatusData={providerStatus.providerStatusData}
            isLoading={providerStatus.isLoading}
            error={providerStatus.error}
          />

          {/* Active Tools Section - Now taking the main space */}
          <ActiveTools
            mcpServers={mcpServers}
            availableTools={availableTools}
            toolsLoading={toolsLoading}
          />
        </>
      )}

      {/* MCP Servers Section - Separate box at the bottom */}
      {!sidebarCollapsed && (
        <ActiveMcpServers
          mcpServers={mcpServers}
          onServerToggle={onServerToggle}
        />
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
          </Box>

          {/* Bottom section - MCP Servers */}
          <Box>
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
                onClick={onToggleSidebar}
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
