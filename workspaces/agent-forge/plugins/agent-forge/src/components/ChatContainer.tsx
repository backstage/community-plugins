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
import { useEffect, useRef, useState } from 'react';
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
}

/**
 * Chat container component that handles message display and input
 * @public
 */
export function ChatContainer({
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
}: ChatContainerProps) {
  const classes = useStyles();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      <div className={classes.messagesContainer}>
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            botName={botName}
            botIcon={botIcon}
            fontSizes={{
              messageText: fontSizes?.messageText,
              codeBlock: fontSizes?.codeBlock,
              inlineCode: fontSizes?.inlineCode,
              timestamp: fontSizes?.timestamp,
            }}
          />
        ))}

        {isTyping && (
          <Box className={classes.typingIndicator}>
            <div className={classes.spinnerDots}>
              <span />
              <span />
              <span />
            </div>
            <Typography variant="caption" style={{ marginLeft: 8 }}>
              {thinkingMessages[thinkingMessageIndex]}...
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
}
