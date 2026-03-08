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
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Message } from '../../types';
import { WelcomeScreen } from '../WelcomeScreen';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { StreamingMessage } from '../StreamingMessage';
import { ToolApprovalDialog } from '../ToolApprovalDialog';
import { ChatInput } from '../ChatInput';
import { useBranding, useStreamingChat, useToolApproval } from '../../hooks';
import {
  useWelcomeData,
  useChatKeyboardShortcuts,
  useScrollToBottom,
} from '../../hooks';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ChatScrollArea } from './ChatScrollArea';
import { useChatActions } from './useChatActions';

// ============================================================================
// Main Component
// ============================================================================

interface ChatContainerProps {
  rightPaneCollapsed: boolean;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  onNewChat?: () => void;
  onSessionCreated?: (sessionId: string) => void;
  loadingConversation?: boolean;
}

export interface ChatContainerRef {
  cancelOngoingRequest: () => void;
  resetConversation: () => void;
  setPreviousResponseId: (id: string | undefined) => void;
  setConversationId: (id: string | undefined) => void;
  setSessionId: (id: string | undefined) => void;
  isStreaming: () => boolean;
}

export const ChatContainer = forwardRef<ChatContainerRef, ChatContainerProps>(
  (
    {
      rightPaneCollapsed,
      messages,
      onMessagesChange,
      onNewChat,
      onSessionCreated,
      loadingConversation = false,
    },
    ref,
  ) => {
    const theme = useTheme();
    const { branding } = useBranding();

    const [inputValue, setInputValue] = useState('');
    const { workflows, quickActions, swimLanes } = useWelcomeData();

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

    const { showScrollFab, scrollToBottom, handleScroll } = useScrollToBottom(
      scrollContainerRef,
      messagesEndRef,
      [messages],
    );

    // Streaming chat hook
    const {
      streamingState,
      isTyping,
      sendMessage,
      cancelRequest,
      resetConversation,
      setStreamingState,
      setIsTyping,
      setPreviousResponseId,
      setConversationId,
      setSessionId,
    } = useStreamingChat({
      enableRAG: true,
      onMessagesChange,
      onScrollToBottom: scrollToBottom,
      onSessionCreated,
    });

    // Tool approval hook (HITL)
    const {
      pendingApproval,
      isApprovalSubmitting,
      approvalError,
      handleApprove,
      handleReject,
    } = useToolApproval({
      streamingState,
      messages,
      onMessagesChange,
      onClearStreamingState: () => setStreamingState(null),
      onSetTyping: setIsTyping,
    });

    // Track isTyping in a ref so the imperative handle stays current
    const isTypingRef = useRef(isTyping);
    isTypingRef.current = isTyping;

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        cancelOngoingRequest: cancelRequest,
        resetConversation,
        setPreviousResponseId,
        setConversationId,
        setSessionId,
        isStreaming: () => isTypingRef.current,
      }),
      [
        cancelRequest,
        resetConversation,
        setPreviousResponseId,
        setConversationId,
        setSessionId,
      ],
    );

    const {
      handleQuickActionSelect,
      handleRegenerate,
      handleEditMessage,
      handleSendMessage,
      handleStopGeneration,
    } = useChatActions({
      sendMessage,
      cancelRequest,
      messages,
      onMessagesChange,
      inputValue,
      setInputValue,
    });

    useChatKeyboardShortcuts({
      onNewChat,
      isTyping,
      cancelRequest,
      chatInputRef,
    });

    useEffect(() => {
      if (!isTyping) {
        chatInputRef.current?.focus();
      }
    }, [isTyping]);

    // Determine what to show in the message area
    const showWelcome = messages.length === 0 && !isTyping && !streamingState;
    // Show streaming message during generation OR while waiting for approval
    const showStreaming = !!streamingState;

    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          marginRight: rightPaneCollapsed ? '56px' : '340px',
          transition: 'margin-right 0.3s ease',
          willChange: 'margin-right',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Messages Area */}
        <ChatScrollArea
          scrollContainerRef={scrollContainerRef}
          messagesEndRef={messagesEndRef}
          onScroll={handleScroll}
          showScrollFab={showScrollFab}
          onScrollToBottom={scrollToBottom}
        >
          {showWelcome ? (
            <WelcomeScreen
              workflows={workflows}
              quickActions={quickActions}
              onQuickActionSelect={handleQuickActionSelect}
              swimLanes={swimLanes}
            />
          ) : (
            <Box
              sx={{
                px: { xs: 2, sm: 3, md: 4 },
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: '1200px',
                  width: '100%',
                  mx: 'auto',
                }}
              >
                <VirtualizedMessageList
                  messages={messages}
                  onRegenerate={handleRegenerate}
                  onEditMessage={handleEditMessage}
                />
                {showStreaming && <StreamingMessage state={streamingState} />}
                {isTyping && !streamingState && <ThinkingIndicator />}
              </Box>
            </Box>
          )}
        </ChatScrollArea>

        {/* Tool Approval Dialog (HITL) - centered modal */}
        <Dialog
          open={!!pendingApproval}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
            },
          }}
        >
          {pendingApproval && (
            <ToolApprovalDialog
              pendingApproval={pendingApproval}
              onApprove={handleApprove}
              onReject={handleReject}
              isSubmitting={isApprovalSubmitting}
              error={approvalError}
            />
          )}
        </Dialog>

        {/* Input Area */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          onStop={handleStopGeneration}
          onNewChat={onNewChat}
          placeholder={branding.inputPlaceholder}
          isTyping={isTyping || loadingConversation}
          showNewChatButton={messages.length > 0}
          inputRef={chatInputRef}
        />

        {/* Disclosure Footer */}
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            color: theme.palette.text.disabled,
            fontSize: '0.6875rem',
            py: 0.5,
            px: 2,
            flexShrink: 0,
          }}
        >
          AI-generated responses may be inaccurate. Verify important
          information.
        </Typography>
      </Box>
    );
  },
);

ChatContainer.displayName = 'ChatContainer';
