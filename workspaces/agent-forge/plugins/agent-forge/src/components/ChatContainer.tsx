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
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import SendIcon from '@material-ui/icons/Send';
import { useEffect, useRef } from 'react';
import { Message } from '../types';
import { ChatMessage } from './ChatMessage';

const useStyles = makeStyles(theme => ({
  chatContainer: {
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    overflow: 'hidden',
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
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
  suggestionsContainer: {
    padding: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
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
  botName: string;
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
  botName,
  onMessageSubmit,
  onReset,
  onSuggestionClick,
}: ChatContainerProps) {
  const classes = useStyles();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
          <ChatMessage key={index} message={message} />
        ))}

        {isTyping && (
          <Box className={classes.typingIndicator}>
            <CircularProgress size={16} />
            <Typography variant="caption" style={{ marginLeft: 8 }}>
              {botName} is thinking...
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
          placeholder={`Ask ${botName} anything...`}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
        />
        <IconButton
          color="primary"
          onClick={() => onMessageSubmit()}
          disabled={isInputDisabled || !userInput.trim()}
          aria-label="send message"
        >
          <SendIcon />
        </IconButton>
        <IconButton
          color="secondary"
          onClick={onReset}
          aria-label="reset chat"
          disabled={isInputDisabled}
        >
          <RefreshIcon />
        </IconButton>
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
            />
          ))}
        </Box>
      )}
    </div>
  );
}
