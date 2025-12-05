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
import { LeftPane } from '../LeftPane';
import { RightPane } from '../RightPane';
import {
  useProviderStatus,
  useMcpServers,
  useConversations,
} from '../../hooks';
import type { ConversationRecord } from '../../types';

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
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    loadConversation,
    refreshConversations,
  } = useConversations();

  const [leftPaneCollapsed, setLeftPaneCollapsed] = useState(false);
  const [rightPaneCollapsed, setRightPaneCollapsed] = useState(true);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();
  const [currentConversationId, setCurrentConversationId] = useState<string>();

  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatContainerRef = useRef<ChatContainerRef>(null);

  // Combine errors from different sources
  const combinedError = error || mcpServersError;

  const toggleLeftPane = () => {
    setLeftPaneCollapsed(!leftPaneCollapsed);
  };

  const toggleRightPane = () => {
    setRightPaneCollapsed(!rightPaneCollapsed);
  };

  const handleNewChat = () => {
    // Cancel any ongoing request first
    if (chatContainerRef.current) {
      chatContainerRef.current.cancelOngoingRequest();
    }

    setError(null);
    setMessages([]);
    setSelectedConversationId(undefined);
    setCurrentConversationId(undefined);
  };

  const handleMessagesChange = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  const handleSelectConversation = async (conversation: ConversationRecord) => {
    try {
      // Cancel any ongoing request first
      if (chatContainerRef.current) {
        chatContainerRef.current.cancelOngoingRequest();
      }

      // Load the full conversation
      const fullConversation = await loadConversation(conversation.id);

      // Convert conversation messages to UI messages
      const uiMessages: Message[] = fullConversation.messages.map(
        (msg, index) => ({
          id: `${conversation.id}-${index}`,
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date(fullConversation.createdAt),
          toolsUsed:
            msg.role === 'assistant' ? fullConversation.toolsUsed : undefined,
        }),
      );

      setMessages(uiMessages);
      setSelectedConversationId(conversation.id);
      setCurrentConversationId(conversation.id);
      setError(null);
    } catch (err) {
      setError(`Failed to load conversation: ${err}`);
    }
  };

  const handleConversationIdReceived = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    if (!selectedConversationId) {
      setSelectedConversationId(conversationId);
    }
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
                {/* Left Pane - Conversation History & New Chat */}
                <LeftPane
                  collapsed={leftPaneCollapsed}
                  onToggle={toggleLeftPane}
                  onNewChat={handleNewChat}
                  conversations={conversations}
                  conversationsLoading={conversationsLoading}
                  conversationsError={conversationsError}
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversationId}
                />

                {/* Chat Container - Center */}
                <ChatContainer
                  ref={chatContainerRef}
                  sidebarCollapsed={rightPaneCollapsed}
                  mcpServers={mcpServers}
                  messages={messages}
                  onMessagesChange={handleMessagesChange}
                  conversationId={currentConversationId}
                  onConversationIdReceived={handleConversationIdReceived}
                  onConversationUpdated={refreshConversations}
                />

                {/* Right Pane - Provider Status & MCP Servers */}
                <RightPane
                  sidebarCollapsed={rightPaneCollapsed}
                  onToggleSidebar={toggleRightPane}
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
