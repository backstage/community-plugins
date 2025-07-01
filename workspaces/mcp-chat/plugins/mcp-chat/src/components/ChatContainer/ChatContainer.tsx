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
import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { useApi } from '@backstage/core-plugin-api';
import { mcpChatApiRef } from '../../api';
import type { ChatMessage as ApiChatMessage } from '../../api/McpChatApi';
import { ChatMessage } from './ChatMessage';
import { QuickStart } from './QuickStart';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  tools?: string[];
  toolsUsed?: string[];
  toolResponses?: any[]; // Store the actual tool response objects
}

interface MCPServer {
  id?: string;
  name: string;
  enabled: boolean;
  type?: string;
  hasUrl?: boolean;
  hasNpxCommand?: boolean;
  hasScriptPath?: boolean;
}

interface ChatContainerProps {
  customTheme: any;
  sidebarCollapsed: boolean;
  mcpServers: MCPServer[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export interface ChatContainerRef {
  cancelOngoingRequest: () => void;
}

export const ChatContainer = forwardRef<ChatContainerRef, ChatContainerProps>(
  (
    { customTheme, sidebarCollapsed, mcpServers, messages, setMessages },
    ref,
  ) => {
    const mcpChatApi = useApi(mcpChatApiRef);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Function to cancel ongoing requests
    const cancelOngoingRequest = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsTyping(false);
      }
    };

    // Expose the cancel function through ref
    useImperativeHandle(
      ref,
      () => ({
        cancelOngoingRequest,
      }),
      [],
    );

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    // Cleanup: cancel any ongoing requests when component unmounts
    useEffect(() => {
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    // Shared function to send messages to API
    const sendMessageToAPI = async (messageText: string) => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(true);

      try {
        // Convert messages to API format including the new message
        const apiMessages: ApiChatMessage[] = [
          ...messages.map(msg => ({
            role: msg.isUser ? ('user' as const) : ('assistant' as const),
            content: msg.text,
          })),
          {
            role: 'user' as const,
            content: messageText,
          },
        ];

        // Get enabled tools from MCP servers
        const enabledTools = mcpServers
          .filter(server => server.enabled)
          .map(server => server.name);

        const response = await mcpChatApi.sendChatMessage(
          apiMessages,
          enabledTools,
          abortControllerRef.current.signal,
        );

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setIsTyping(false);
        abortControllerRef.current = null;

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.content,
          isUser: false,
          timestamp: new Date(),
          tools: response.toolResponses?.map(tool => tool.toolName) || [],
          toolsUsed: response.toolsUsed || [],
          toolResponses: response.toolResponses || [],
        };
        setMessages(prev => [...prev, botResponse]);
      } catch (err) {
        // Check if error is due to abortion
        if (err instanceof Error && err.name === 'AbortError') {
          // eslint-disable-next-line no-console
          console.error('Request was cancelled');
          return;
        }

        setIsTyping(false);
        abortControllerRef.current = null;
        // eslint-disable-next-line no-console
        console.error('Failed to send message:', err);

        let errorMessage =
          'Sorry, I encountered an error processing your request.';

        if (err instanceof Error) {
          if (err.message.includes('404')) {
            errorMessage =
              'The MCP Chat service is not available. Please check if the backend is running.';
          } else if (err.message.includes('Network')) {
            errorMessage =
              'Network error. Please check your connection and try again.';
          } else {
            errorMessage = `Error: ${err.message}`;
          }
        }

        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          isUser: false,
          timestamp: new Date(),
          tools: [],
          toolsUsed: [],
          toolResponses: [],
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    };

    const handleSuggestionClick = async (suggestion: string) => {
      await sendMessageToAPI(suggestion);
    };

    const handleSendMessage = async () => {
      if (inputValue.trim()) {
        const messageText = inputValue;
        setInputValue(''); // Clear input immediately
        await sendMessageToAPI(messageText);
      }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };

    return (
      <Box
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginRight: sidebarCollapsed ? 60 : 400,
          transition: 'margin-right 0.3s ease',
        }}
      >
        {messages.length === 0 ? (
          <QuickStart onSuggestionClick={handleSuggestionClick} />
        ) : (
          <Box
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: customTheme.spacing(6),
              paddingBottom: customTheme.spacing(10), // Add padding to account for fixed input
              paddingRight: customTheme.spacing(14),
              display: 'flex',
              flexDirection: 'column',
              gap: customTheme.spacing(1),
              backgroundColor: customTheme.palette.background.paper,
              scrollbarGutter: 'stable',
            }}
          >
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </Box>
        )}

        <Box
          style={{
            marginLeft: '14rem',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: sidebarCollapsed ? 60 : 400, // Account for sidebar width
            padding: customTheme.spacing(2),
            borderTop: `1px solid ${customTheme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: customTheme.spacing(1),
            backgroundColor: customTheme.palette.background.paper,
            zIndex: 1000,
            transition: 'right 0.3s ease',
          }}
        >
          <TextField
            style={{
              marginLeft: customTheme.spacing(5),
              marginRight: customTheme.spacing(5),
              flex: 1,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: customTheme.spacing(3),
                backgroundColor:
                  customTheme.palette.mode === 'dark' ? '#2a2a2a' : '#f8f8f8',
              },
            }}
            placeholder="Message Assistant..."
            variant="outlined"
            multiline
            maxRows={4}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            disabled={isTyping}
            color="primary"
          />
          <IconButton
            style={{
              backgroundColor:
                !inputValue.trim() || isTyping
                  ? '#ccc'
                  : customTheme.palette.primary.main,
              color:
                !inputValue.trim() || isTyping
                  ? '#888'
                  : customTheme.palette.primary.contrastText,
            }}
            sx={{
              '&:hover': {
                backgroundColor:
                  !inputValue.trim() || isTyping
                    ? '#ccc'
                    : customTheme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: '#888',
              },
            }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    );
  },
);
