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
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@mui/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Content, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { mcpChatApiRef } from '../../api';
import type { ConfigStatus } from '../../api/McpChatApi';
import { ChatContainer, type ChatContainerRef } from '../ChatContainer';
import { RightPane } from '../RightPane';

interface MCPServer {
  id?: string;
  name: string;
  enabled: boolean;
  type?: string;
  hasUrl?: boolean;
  hasNpxCommand?: boolean;
  hasScriptPath?: boolean;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  tools?: string[];
  toolsUsed?: string[];
  toolResponses?: any[];
}

export const ChatPage = () => {
  const baseTheme = useTheme();
  const isDarkMode = baseTheme.palette.mode === 'dark';

  // Create a custom theme that adapts to dark/light mode
  const customTheme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      primary: {
        main: '#4CAF50', // Green primary color
        light: '#81C784',
        dark: '#388E3C',
        contrastText: '#ffffff',
      },
      background: {
        ...baseTheme.palette.background,
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        ...baseTheme.palette.text,
        primary: isDarkMode ? '#ffffff' : '#333333',
        secondary: isDarkMode ? '#b3b3b3' : '#666666',
      },
      divider: isDarkMode ? '#333333' : '#e0e0e0',
    },
    components: {
      ...baseTheme.components,
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8',
              '& fieldset': {
                borderColor: isDarkMode ? '#444444' : '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? '#666666' : '#c0c0c0',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4CAF50',
              },
            },
            '& .MuiInputBase-input': {
              color: isDarkMode ? '#ffffff' : '#333333',
            },
            '& .MuiInputBase-input::placeholder': {
              color: isDarkMode ? '#888888' : '#999999',
              opacity: 1,
            },
          },
        },
      },
    },
  });

  const mcpChatApi = useApi(mcpChatApiRef);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatContainerRef = useRef<ChatContainerRef>(null);

  // Load configuration on component mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await mcpChatApi.getConfigStatus();
        setConfigStatus(config);
        setMcpServers(
          config.mcpServers.map(server => ({
            ...server,
            enabled: true, // Default all servers to enabled
          })),
        );
      } catch (err) {
        setError(`Failed to load configuration: ${err}`);
        // eslint-disable-next-line no-console
        console.error('Failed to load configuration:', err);
      }
    };

    loadConfig();
  }, [mcpChatApi]);

  const handleServerToggle = (serverName: string) => {
    setMcpServers(prev =>
      prev.map(server =>
        server.name === serverName
          ? { ...server, enabled: !server.enabled }
          : server,
      ),
    );
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNewChat = () => {
    // Cancel any ongoing request first
    if (chatContainerRef.current) {
      chatContainerRef.current.cancelOngoingRequest();
    }

    setError(null);
    setMessages([]);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Page themeId="tool">
        <Content noPadding>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              backgroundColor: customTheme.palette.background.default,
            }}
          >
            {/* Top Bar - Full Width */}
            {/* <Box className={classes.topBar}>
              <Typography variant="h5" style={{ fontWeight: 600 }}>
                How can I help you today?
              </Typography>
              <IconButton
                onClick={handleMenuClick}
                style={{ marginLeft: 'auto' }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <SettingsIcon style={{ marginRight: 8 }} />
                  Settings
                </MenuItem>
              </Menu>
            </Box> */}
            {/* <Header
              title="How can I help you today?"
              subtitle="Start a conversation with our AI assistant powered by MCP tools"
            /> */}

            {/* Content Area */}
            <Box
              style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Error Display */}
              {error && (
                <Box
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1001,
                    backgroundColor: isDarkMode ? '#2d1b1b' : '#ffebee',
                    color: isDarkMode ? '#ff6b6b' : '#c62828',
                    padding: '8px 16px',
                    borderBottom: `1px solid ${
                      isDarkMode ? '#4a2c2c' : '#ef5350'
                    }`,
                  }}
                >
                  <Typography variant="body2">{error}</Typography>
                </Box>
              )}

              {/* Chat Container */}
              <ChatContainer
                ref={chatContainerRef}
                customTheme={customTheme}
                sidebarCollapsed={sidebarCollapsed}
                mcpServers={mcpServers}
                messages={messages}
                setMessages={setMessages}
              />

              {/* Sidebar - Right Side */}
              <RightPane
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={toggleSidebar}
                onNewChat={handleNewChat}
                mcpServers={mcpServers}
                onServerToggle={handleServerToggle}
                configStatus={configStatus}
              />
            </Box>
          </Box>
        </Content>
      </Page>
    </ThemeProvider>
  );
};
