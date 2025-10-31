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
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import SendIcon from '@material-ui/icons/Send';
import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';

const useStyles = makeStyles(theme => ({
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    overflow: 'hidden',
    minHeight: 0,
    position: 'relative', // Enable absolute positioning for load more button
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    minHeight: 0,
  },
  inputContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'flex-end',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontSize: '14px',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    fontStyle: 'italic',
  },
  spinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(1),
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
  spinner: {
    width: 20,
    height: 20,
    border: `3px solid ${
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.1)'
    }`,
    borderTop: `3px solid ${theme.palette.primary.main}`,
    borderRadius: '50%',
    animation: '$spin 0.8s linear infinite',
  },
  spinnerDots: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    '& > span': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      animation: '$pulse 1.4s ease-in-out infinite',
      '&:nth-child(1)': {
        animationDelay: '0s',
      },
      '&:nth-child(2)': {
        animationDelay: '0.2s',
      },
      '&:nth-child(3)': {
        animationDelay: '0.4s',
      },
    },
  },
  suggestionsContainer: {
    padding: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  inputField: {
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.type === 'dark' ? '#00ccff' : undefined,
      opacity: theme.palette.type === 'dark' ? 1 : undefined,
    },
  },
  suggestionChip: {
    backgroundColor: 'transparent',
    borderColor: theme.palette.type === 'dark' ? '#0099ff' : '#0288d1',
    color: theme.palette.type === 'dark' ? '#00ccff' : '#0277bd',
    '&:hover': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(0, 153, 255, 0.15)'
          : 'rgba(2, 136, 209, 0.1)',
      borderColor: theme.palette.type === 'dark' ? '#00ccff' : '#01579b',
    },
    '&:active': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(0, 204, 255, 0.25)'
          : 'rgba(2, 136, 209, 0.2)',
    },
  },
  loadMoreButton: {
    position: 'absolute',
    top: theme.spacing(2),
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1, 2),
    boxShadow: theme.shadows[4],
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  loadingIndicator: {
    position: 'absolute',
    top: theme.spacing(1),
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
  },
  autoScrollToggle: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 10,
  },
}));

/**
 * Props for the ChatContainer component
 * @public
 */
export interface ChatContainerProps {
  messages: Message[];
  userInput: string;
  setUserInput: (input: string) => void;
  isTyping: boolean;
  suggestions: string[];
  thinkingMessages: string[];
  thinkingMessagesInterval?: number;
  botName: string;
  botIcon?: string;
  inputPlaceholder?: string;
  fontSizes?: {
    messageText?: string;
    codeBlock?: string;
    inlineCode?: string;
    suggestionChip?: string;
    inputField?: string;
    timestamp?: string;
  };
  onMessageSubmit: (messageText?: string) => void;
  onReset: () => void;
  onSuggestionClick: (suggestion: string) => void;
  onMetadataSubmit?: (messageId: string, data: Record<string, any>) => void;
  
  // Scroll-based message loading
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
  onLoadMore?: () => void;
  executionPlanLoading?: Set<string>;
  hasMoreMessages?: boolean;
  showLoadMoreButton?: boolean;
  loadMoreIncrement?: number;
  executionPlanBuffer?: Record<string, string>;
  autoExpandExecutionPlans?: Set<string>;
  
  // Auto-scroll control (moved from internal state to prevent loss during remounts)
  autoScrollEnabled?: boolean;
  setAutoScrollEnabled?: (enabled: boolean) => void;
  
  // Operational mode for special handling of system messages
  currentOperation?: string | null;
  isInOperationalMode?: boolean;
}

/**
 * Memoized messages list to prevent re-renders when only input changes
 */
const MessagesList = memo(function MessagesList({
  messages,
  botName,
  botIcon,
  fontSizes,
  executionPlanBuffer,
  autoExpandExecutionPlans,
  executionPlanLoading,
  onMetadataSubmit,
}: {
  messages: Message[];
  botName: string;
  botIcon?: string;
  fontSizes?: {
    messageText?: string;
    codeBlock?: string;
    inlineCode?: string;
    timestamp?: string;
  };
  executionPlanBuffer?: Record<string, string>;
  autoExpandExecutionPlans?: Set<string>;
  executionPlanLoading?: Set<string>;
  onMetadataSubmit?: (messageId: string, data: Record<string, any>) => void;
}) {
  // Memoize font sizes to prevent re-creating object on every render
  const memoizedFontSizes = useMemo(() => ({
    messageText: fontSizes?.messageText,
    codeBlock: fontSizes?.codeBlock,
    inlineCode: fontSizes?.inlineCode,
    timestamp: fontSizes?.timestamp,
  }), [fontSizes?.messageText, fontSizes?.codeBlock, fontSizes?.inlineCode, fontSizes?.timestamp]);

  return (
    <>
      {messages.map((message, index) => (
             <div key={`${index}-${message.timestamp}`} data-message-timestamp={message.timestamp}>
               <ChatMessage
                 message={message}
                 botName={botName}
                 botIcon={botIcon}
                 fontSizes={memoizedFontSizes}
                 executionPlanBuffer={executionPlanBuffer}
                 autoExpandExecutionPlans={autoExpandExecutionPlans}
                 executionPlanLoading={executionPlanLoading}
                 isLastMessage={index === messages.length - 1}
                 onMetadataSubmit={onMetadataSubmit}
               />
             </div>
           ))}
    </>
  );
});


/**
 * Chat container component that handles message display and input
 * Memoized to prevent re-renders when only input changes
 * 
 * SCROLL MODE: Currently running in MANUAL mode by default
 * - Auto-scroll is disabled by default
 * - Users have full control over scroll position
 * - Progressive loading: "Load Earlier Messages" shows next 20 messages each time
 * - If user scrolls up past loaded messages, button appears again
 * - Gradual auto-collapse to 5 recent messages when scrolling to bottom (smooth performance optimization)
 * 
 * TO RE-ENABLE AUTO-SCROLL:
 * 1. Change autoScrollEnabled default to true in AgentForgePage.tsx and ChatContainer.tsx
 * 2. Change {false && ...} to {true && ...} for the toggle button UI below
 * 
 * @public
 */
export const ChatContainer = memo(function ChatContainer({
  messages,
  userInput,
  setUserInput,
  isTyping,
  suggestions,
  thinkingMessages,
  thinkingMessagesInterval = 7000,
  botName,
  botIcon,
  inputPlaceholder,
  fontSizes,
  onMessageSubmit,
  onReset,
  onSuggestionClick,
  onMetadataSubmit,
  onScroll,
  onLoadMore,
  hasMoreMessages = false,
  showLoadMoreButton = false,
  loadMoreIncrement = 5,
  executionPlanBuffer = {},
  autoExpandExecutionPlans,
  executionPlanLoading,
  autoScrollEnabled = false, // Default to manual mode
  setAutoScrollEnabled,
  currentOperation,
  isInOperationalMode,
}: ChatContainerProps) {
  const classes = useStyles();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);
  const [isManualLoading, setIsManualLoading] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  // Handle manual loading of earlier messages - SIMPLIFIED
  const handleManualLoadEarlier = useCallback(() => {
    if (!onLoadMore) return;
    
    console.log('🔵 Manual load earlier messages clicked');
    
    // Set manual loading flag
    setIsManualLoading(true);
    
    // Safety timeout to clear manual loading flag
    setTimeout(() => {
      console.log('🛡️ Safety timeout - clearing manual loading flag');
      setIsManualLoading(false);
    }, 2000);
    
    // Call the parent's load more function - NO SCROLL RESTORATION
    onLoadMore();
  }, [onLoadMore]);


  // AUTO-SCROLL DISABLED - No automatic scrolling behavior

  // SCROLL RESTORATION DISABLED - No automatic scroll positioning

  // Simple scroll event handler - NO AUTO-SCROLL LOGIC
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !onScroll) return;

    const handleScrollEvent = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Simply pass scroll information to parent - no automatic behavior
      onScroll(scrollTop, scrollHeight, clientHeight);
    };

    container.addEventListener('scroll', handleScrollEvent);
    return () => container.removeEventListener('scroll', handleScrollEvent);
  }, [onScroll]);

  // Reset loading flag when messages change significantly (e.g., new session)
  useEffect(() => {
    if (messages.length === 0) {
      setIsManualLoading(false);
    }
  }, [messages.length]);



  // Show random thinking messages while typing
  useEffect(() => {
    if (isTyping) {
      // Start with a random message
      setThinkingMessageIndex(
        Math.floor(Math.random() * thinkingMessages.length),
      );

      const interval = setInterval(() => {
        // Pick a random message each time
        setThinkingMessageIndex(
          Math.floor(Math.random() * thinkingMessages.length),
        );
      }, thinkingMessagesInterval);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isTyping, thinkingMessages.length, thinkingMessagesInterval]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onMessageSubmit();
    }
  };

  const isInputDisabled = isTyping;

  return (
    <div className={classes.chatContainer}>
        {/* Auto-scroll Toggle - HIDDEN (kept for future use) */}
        {false && (
          <div className={classes.autoScrollToggle}>
            <Tooltip title={autoScrollEnabled ? "Disable auto-scroll and auto-loading" : "Enable auto-scroll and auto-loading"}>
              <IconButton
                size="small"
                onClick={() => {
                  console.log('🔄 Toggling auto-scroll:', !autoScrollEnabled);
                  setAutoScrollEnabled?.(!autoScrollEnabled);
                }}
                style={{
                  backgroundColor: autoScrollEnabled ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  color: autoScrollEnabled ? '#4caf50' : '#f44336',
                  border: autoScrollEnabled ? 'none' : '2px solid #f44336',
                }}
              >
                {autoScrollEnabled ? '📍' : '⏸️'}
              </IconButton>
            </Tooltip>
            
            {/* Manual scroll to bottom when auto-scroll is disabled */}
            {!autoScrollEnabled && (
              <Tooltip title="Scroll to bottom">
                <IconButton
                  size="small"
                  onClick={() => {
                    console.log('📍 Manual scroll to bottom');
                    scrollToBottom();
                  }}
                  style={{
                    marginLeft: '4px',
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    color: '#2196f3',
                  }}
                >
                  ⬇️
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}

        {/* Visual indicator when auto-scroll is disabled - HIDDEN (kept for future use) */}
        {false && !autoScrollEnabled && (
          <div style={{
            position: 'absolute',
            top: '40px',
            right: '8px',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            color: '#f44336',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 9,
            border: '1px solid rgba(244, 67, 54, 0.3)',
          }}>
            Manual Mode
          </div>
        )}

        {/* Load More Button - appears when scrolling up, shows "No More Messages" when all loaded */}
        {showLoadMoreButton && !autoScrollEnabled && (
          <div className={classes.loadingIndicator}>
            <Tooltip
              title={
                isTyping 
                  ? "🔒 Button disabled: Please wait for the current message to complete before loading more" 
                  : isManualLoading 
                    ? "⏳ Button disabled: Currently loading earlier messages..."
                    : !hasMoreMessages
                      ? "✅ No more messages: All conversation history has been loaded"
                      : `📜 Click to load the next ${loadMoreIncrement} earlier messages`
              }
              placement="top"
              arrow
            >
              <span>
                <Button
                  onClick={hasMoreMessages ? handleManualLoadEarlier : undefined}
                  variant="contained"
                  size="small"
                  disabled={isTyping || isManualLoading || !hasMoreMessages}
                  style={{
                    backgroundColor: 
                      isTyping || isManualLoading ? '#bdbdbd' : 
                      !hasMoreMessages ? '#757575' : '#2196f3',
                    color: 
                      isTyping || isManualLoading ? '#757575' : 
                      !hasMoreMessages ? '#ffffff' : 'white',
                    fontSize: '12px',
                    padding: '4px 12px',
                    cursor: 
                      isTyping || isManualLoading ? 'not-allowed' : 
                      !hasMoreMessages ? 'default' : 'pointer',
                    opacity: isTyping || isManualLoading ? 0.6 : 1,
                  }}
                >
                  {
                    isManualLoading ? "⏳ Loading..." : 
                    !hasMoreMessages ? "🔚 No More Messages" : 
                    "📜 Load Earlier Messages"
                  }
                </Button>
              </span>
            </Tooltip>
          </div>
        )}


        
        <div className={classes.messagesContainer} ref={messagesContainerRef} data-testid="messages-container">
        <MessagesList
          messages={messages}
          botName={botName}
          botIcon={botIcon}
          fontSizes={fontSizes}
          executionPlanBuffer={executionPlanBuffer}
          autoExpandExecutionPlans={autoExpandExecutionPlans}
          executionPlanLoading={executionPlanLoading}
          onMetadataSubmit={onMetadataSubmit}
        />

        {isTyping && (
          <Box className={classes.typingIndicator}>
            <div className={classes.spinnerDots}>
              <span />
              <span />
              <span />
            </div>
            <Typography variant="caption" style={{ marginLeft: 8 }}>
              {isInOperationalMode && currentOperation 
                ? currentOperation 
                : `${thinkingMessages[thinkingMessageIndex]}...`}
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </div>
      <Divider />
      <Box p={2} className={classes.inputContainer}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          variant="outlined"
          placeholder={inputPlaceholder || `Ask ${botName} anything...`}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
          className={classes.inputField}
          InputProps={{
            style: { fontSize: fontSizes?.inputField || '1rem' },
          }}
        />
        <Tooltip title="Send message">
          <span>
            <IconButton
              color="primary"
              onClick={() => onMessageSubmit()}
              disabled={isInputDisabled || !userInput.trim()}
              aria-label="send message"
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Reset chat">
          <span>
            <IconButton
              color="secondary"
              onClick={onReset}
              aria-label="reset chat"
              disabled={isInputDisabled}
            >
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      {suggestions.length > 0 && (
        <Box className={classes.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <Chip
              key={index}
              label={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
              clickable
              color="primary"
              variant="outlined"
              disabled={isInputDisabled}
              className={classes.suggestionChip}
              style={{ fontSize: fontSizes?.suggestionChip || '0.875rem' }}
            />
          ))}
        </Box>
      )}
    </div>
  );
});
