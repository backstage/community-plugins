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
import { useState, useRef } from 'react';
import { useTheme } from '@mui/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Content, Page, ResponseErrorPanel } from '@backstage/core-components';
import { ChatContainer, type ChatContainerRef } from '../ChatContainer';
import { RightPane } from '../RightPane';
import { useProviderStatus, useMcpServers } from '../../hooks';
import { getCustomTheme } from '../../customTheme';

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
  const customTheme = createTheme(getCustomTheme(baseTheme, isDarkMode));

  const providerStatus = useProviderStatus();
  const {
    mcpServers,
    error: mcpServersError,
    handleServerToggle,
  } = useMcpServers();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatContainerRef = useRef<ChatContainerRef>(null);

  // Combine errors from different sources
  const combinedError = error || mcpServersError;

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
            {/* Content Area */}
            <Box
              style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {combinedError ? (
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '20px',
                  }}
                >
                  <ResponseErrorPanel
                    error={new Error(combinedError)}
                    defaultExpanded
                  />
                </Box>
              ) : (
                <>
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
                    providerStatus={providerStatus}
                  />
                </>
              )}
            </Box>
          </Box>
        </Content>
      </Page>
    </ThemeProvider>
  );
};
