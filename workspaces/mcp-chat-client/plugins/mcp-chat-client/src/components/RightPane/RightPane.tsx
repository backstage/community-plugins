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
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MemoryIcon from '@mui/icons-material/Memory';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useApi } from '@backstage/core-plugin-api';
import { mcpChatApiRef } from '../../api';
import type { ConfigStatus, Tool } from '../../api/McpChatApi';
import { ActiveMcpServers } from './ActiveMcpServers';
import { ActiveTools } from './ActiveTools';
import { ProviderStatus } from './ProviderStatus';
import { BotIcon } from '../BotIcon';

interface MCPServer {
  id?: string;
  name: string;
  enabled: boolean;
  type?: string;
  hasUrl?: boolean;
  hasNpxCommand?: boolean;
  hasScriptPath?: boolean;
}

interface RightPaneProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  mcpServers: MCPServer[];
  onServerToggle: (serverName: string) => void;
  configStatus: ConfigStatus | null;
}

export const RightPane: React.FC<RightPaneProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
  onNewChat,
  mcpServers,
  onServerToggle,
  configStatus,
}) => {
  const theme = useTheme();
  const mcpChatApi = useApi(mcpChatApiRef);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [providerConnectionStatus, setProviderConnectionStatus] = useState<{
    connected: boolean;
    models?: string[];
    error?: string;
    loading: boolean;
  }>({
    connected: false,
    models: undefined,
    error: undefined,
    loading: true,
  });

  // Fetch available tools when component mounts or servers change
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setToolsLoading(true);
        const toolsResponse = await mcpChatApi.getAvailableTools();
        setAvailableTools(toolsResponse.availableTools);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch tools:', error);
        setAvailableTools([]);
      } finally {
        setToolsLoading(false);
      }
    };

    if (mcpServers.length > 0) {
      fetchTools();
    }
  }, [mcpChatApi, mcpServers]);

  // Test provider connection when component mounts or config changes
  useEffect(() => {
    const testConnection = async () => {
      try {
        setProviderConnectionStatus(prev => ({ ...prev, loading: true }));
        const result = await mcpChatApi.testProviderConnection();
        setProviderConnectionStatus({
          connected: result.connected,
          models: result.models,
          error: result.error,
          loading: false,
        });
      } catch (error) {
        setProviderConnectionStatus({
          connected: false,
          models: undefined,
          error:
            error instanceof Error ? error.message : 'Connection test failed',
          loading: false,
        });
      }
    };

    if (configStatus?.provider) {
      testConnection();
    }
  }, [mcpChatApi, configStatus]);

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
              style={{
                fontWeight: 600,
                marginLeft: theme.spacing(1),
                color: theme.palette.text.primary,
              }}
            >
              MCP Chat Client
            </Typography>
          </>
        )}
        {sidebarCollapsed && (
          <Box
            style={{
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
          <Box style={{ padding: '16px 16px 8px' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: `linear-gradient(45deg, #185A4B, #1B5F4F, #2A6C5F, #437E72)`,
                color: 'white',
                '&:hover': {
                  background: `linear-gradient(45deg, #1E6B59, #226860, #2F7A6E, #4B8C7F)`,
                  boxShadow: '0 4px 12px rgba(24, 90, 75, 0.3)',
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
            configStatus={configStatus}
            providerConnectionStatus={providerConnectionStatus}
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
          style={{
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
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <IconButton
                size="small"
                onClick={onNewChat}
                style={{
                  backgroundColor: '#1E6253',
                  color: 'white',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#367568';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#1E6253';
                  e.currentTarget.style.transform = 'scale(1)';
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
              style={{
                borderTop: `2px solid ${theme.palette.divider}`,
                margin: '0 8px 16px 8px',
              }}
            />

            {/* MCP Servers Section Icon */}
            <Box
              style={{
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
