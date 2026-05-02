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
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';
import { useApi } from '@backstage/core-plugin-api';
import { mcpChatApiRef } from '../../api';
import {
  ChatMessage as Message,
  ChatResponse,
  ApprovalStatus,
  ConfirmedStatus,
} from '../../types';
import { extractLastToolRequests } from '../../utils';
import { ChatMessage } from './ChatMessage';
import { QuickStart } from './QuickStart';
import { TypingIndicator } from './TypingIndicator';
import { ToolCallCard } from './ToolCallCard';
import { useToolApproval, useApiRequest } from '../../hooks';

interface MCPServer {
  id: string;
  name: string;
  enabled: boolean;
  type?: string;
  hasUrl?: boolean;
  hasNpxCommand?: boolean;
  hasScriptPath?: boolean;
}

interface ChatContainerProps {
  sidebarCollapsed: boolean;
  mcpServers: MCPServer[];
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  conversationId?: string;
  onConversationUpdated?: (conversationId: string) => void;
  toolRequests?: Record<string, ApprovalStatus>;
  setToolRequests: (
    requests: Record<string, ApprovalStatus> | undefined,
  ) => void;
}

export interface ChatContainerRef {
  cancelOngoingRequest: () => void;
}

export const ChatContainer = forwardRef<ChatContainerRef, ChatContainerProps>(
  (
    {
      sidebarCollapsed,
      mcpServers,
      messages,
      onMessagesChange,
      conversationId,
      onConversationUpdated,
      toolRequests,
      setToolRequests,
    },
    ref,
  ) => {
    const theme = useTheme();
    const mcpChatApi = useApi(mcpChatApiRef);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const { isTyping, execute, cancelOngoingRequest } = useApiRequest();

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Expose the cancel function through ref
    useImperativeHandle(
      ref,
      () => ({
        cancelOngoingRequest,
      }),
      [cancelOngoingRequest],
    );

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const resolveServerName = (serverId?: string): string => {
      if (!serverId) return 'Unknown Server';
      const server = mcpServers.find(s => s.id === serverId);
      return server?.name || serverId;
    };

    const handleApiSuccess = useCallback(
      (response: ChatResponse) => {
        if (response.conversationId && onConversationUpdated) {
          onConversationUpdated(response.conversationId);
        }
        onMessagesChange(response.messages);
      },
      [onConversationUpdated, onMessagesChange],
    );

    const handleApiError = useCallback(
      (msgs: Message[], err: Error) => {
        let errorMessage =
          'Sorry, I encountered an error processing your request.';

        if (err.message.includes('404')) {
          errorMessage =
            'The MCP Chat service is not available. Please check if the backend is running.';
        } else if (err.message.includes('Network')) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }

        const errorResponse: Message = {
          role: 'assistant',
          content: errorMessage,
          metadata: {
            id: (Date.now() + 1).toString(),
            timestamp: new Date().toISOString(),
          },
        };
        onMessagesChange([...msgs, errorResponse]);
      },
      [onMessagesChange],
    );

    // Shared function to send messages to API
    const sendMessageToAPI = async (messageText: string) => {
      const newMessage: Message = {
        role: 'user',
        content: messageText,
        metadata: {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        },
      };
      const withUser = [...messages, newMessage];
      onMessagesChange(withUser);

      const enabledTools = mcpServers
        .filter(server => server.enabled)
        .map(server => server.id);

      await execute(
        signal =>
          mcpChatApi.sendChatMessage(
            messages,
            messageText,
            enabledTools,
            signal,
            conversationId,
          ),
        response => {
          handleApiSuccess(response);
          const pendingToolRequests = extractLastToolRequests(
            response.messages,
          );
          if (pendingToolRequests) {
            setToolRequests(pendingToolRequests);
          }
        },
        err => {
          // eslint-disable-next-line no-console
          console.error('Failed to send message:', err);
          handleApiError(withUser, err);
        },
      );
    };

    const sendApprovalToAPI = useCallback(
      async (decisions: Record<string, ConfirmedStatus>) => {
        await execute(
          signal =>
            mcpChatApi.sendApprovedToolCalls(
              messages,
              decisions,
              signal,
              conversationId,
            ),
          handleApiSuccess,
          err => {
            // eslint-disable-next-line no-console
            console.error('Failed to process tool approvals:', err);
            handleApiError(messages, err);
            setToolRequests(undefined);
          },
        );
      },
      [
        conversationId,
        mcpChatApi,
        messages,
        execute,
        handleApiSuccess,
        handleApiError,
        setToolRequests,
      ],
    );

    const onApprovalComplete = useCallback(
      async (decisions: Record<string, ConfirmedStatus>) => {
        await sendApprovalToAPI(decisions);
        setToolRequests(undefined);
      },
      [sendApprovalToAPI, setToolRequests],
    );

    const { approve, reject } = useToolApproval(
      toolRequests,
      setToolRequests,
      onApprovalComplete,
    );

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

    const renderMessage = (message: Message) => {
      if (message.role === 'user') {
        return (
          <ChatMessage
            key={message.metadata.id}
            message={{
              isUser: true,
              text: message.content ?? '',
            }}
          />
        );
      } else if (message.role === 'assistant') {
        if (message.content && !message.tool_calls) {
          return (
            <ChatMessage
              key={message.metadata.id}
              message={{
                isUser: false,
                text: message.content,
              }}
            />
          );
        } else if (message.tool_calls) {
          return (
            <Fragment key={message.metadata.id}>
              {message.tool_calls.map(toolCall => {
                const toolResponseMessage = messages.find(
                  msg =>
                    msg.role === 'tool' && msg.tool_call_id === toolCall.id,
                );
                return (
                  <ToolCallCard
                    key={toolCall.id}
                    toolCall={toolCall}
                    approvalStatus={
                      toolRequests?.[toolCall.id] ??
                      toolCall.metadata?.approval_status ??
                      'approved'
                    }
                    serverName={resolveServerName(toolCall.metadata?.serverId)}
                    onApprove={approve}
                    onReject={reject}
                    toolResult={toolResponseMessage?.content ?? undefined}
                  />
                );
              })}
            </Fragment>
          );
        }
        // Assistant messages should either have:
        // - content and no tool_calls (LLM response)
        // - tool_calls and no content (LLM requested to call a tool)
        // eslint-disable-next-line no-console
        console.error(
          `Received assistant message with unexpected format:`,
          message,
        );
      }
      return null;
    };

    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginRight: sidebarCollapsed ? '60px' : '400px',
          transition: 'margin-right 0.3s ease',
        }}
      >
        {messages.length === 0 ? (
          <QuickStart onSuggestionClick={handleSuggestionClick} />
        ) : (
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              padding: theme.spacing(6),
              paddingBottom: theme.spacing(10),
              paddingRight: theme.spacing(14),
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing(1),
              backgroundColor: theme.palette.background.default,
              scrollbarGutter: 'stable',
            }}
          >
            {messages.map(renderMessage)}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </Box>
        )}

        <Box
          sx={{
            marginLeft: '14rem',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: sidebarCollapsed ? '60px' : '400px',
            padding: theme.spacing(2),
            borderTop: `1px solid ${theme.palette.divider}`,
            borderLeft: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
            backgroundColor: theme.palette.background.paper,
            zIndex: 1000,
            transition: 'right 0.3s ease',
          }}
        >
          <TextField
            sx={{
              marginLeft: theme.spacing(5),
              marginRight: theme.spacing(5),
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.spacing(3),
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
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
            disabled={isTyping || toolRequests !== undefined}
            color="primary"
          />
          <IconButton
            sx={{
              backgroundColor:
                !inputValue.trim() || isTyping
                  ? theme.palette.action.disabledBackground
                  : theme.palette.primary.main,
              color:
                !inputValue.trim() || isTyping
                  ? theme.palette.text.disabled
                  : theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor:
                  !inputValue.trim() || isTyping
                    ? theme.palette.action.disabledBackground
                    : theme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.text.disabled,
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
