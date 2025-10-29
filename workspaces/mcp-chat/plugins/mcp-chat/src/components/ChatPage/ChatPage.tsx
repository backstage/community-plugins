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
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Content, Page, ResponseErrorPanel } from '@backstage/core-components';
import { ChatContainer, type ChatContainerRef } from '../ChatContainer';
import { RightPane } from '../RightPane';
import { useProviderStatus, useMcpServers } from '../../hooks';

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
  const theme = useTheme();

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

  const handleMessagesChange = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  return (
    <Page themeId="tool">
      <Content noPadding>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: theme.palette.background.default,
          }}
        >
          {/* Content Area */}
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {combinedError ? (
              <Box
                sx={{
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
                  sidebarCollapsed={sidebarCollapsed}
                  mcpServers={mcpServers}
                  messages={messages}
                  onMessagesChange={handleMessagesChange}
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
  );
};
