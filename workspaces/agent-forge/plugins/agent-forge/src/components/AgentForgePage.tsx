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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Content,
  Header,
  HeaderLabel,
  MarkdownContent,
  Page,
  Progress,
} from '@backstage/core-components';
import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import RefreshIcon from '@material-ui/icons/Refresh';
import { makeStyles } from '@material-ui/core/styles';

import { ChatbotApi } from '../apis';
import { DEFAULT_BOT_CONFIG } from '../constants';
import { Message } from '../types';
import { createTimestamp } from '../utils';

const useStyles = makeStyles(theme => ({
  chatContainer: {
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  messageBox: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginLeft: 'auto',
    textAlign: 'right',
  },
  botMessage: {
    backgroundColor:
      theme.palette.type === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
    color: theme.palette.text.primary,
    marginRight: 'auto',
  },
  inputContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'flex-end',
  },
  inputField: {
    flex: 1,
  },
  suggestionChip: {
    margin: theme.spacing(0.5),
    cursor: 'pointer',
  },
  suggestionsContainer: {
    marginBottom: theme.spacing(2),
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  errorBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'contain' as const,
  },
}));

const INITIAL_SUGGESTIONS = [
  'What can you do?',
  'Give me information about SRE team onboarding',
  'How do I configure agents?',
  'Help me with platform engineering tasks',
];

export function AgentForgePage() {
  const classes = useStyles();
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);

  const botName =
    config.getOptionalString('agentForge.botName') || DEFAULT_BOT_CONFIG.name;
  const botIcon =
    config.getOptionalString('agentForge.botIcon') || DEFAULT_BOT_CONFIG.icon;
  const backendUrl =
    config.getOptionalString('agentForge.baseUrl') ||
    config.getString('backend.baseUrl');

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [newContext, setNewContext] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);

  const chatbotApi = useMemo(() => {
    try {
      const api = new ChatbotApi(backendUrl, { identityApi });
      setApiError(null);
      return api;
    } catch (error) {
      setApiError('Failed to initialize chat service');
      return null;
    }
  }, [backendUrl, identityApi]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { ...message, timestamp: createTimestamp() },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Add initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
        isUser: false,
        timestamp: createTimestamp(),
      });
    }
  }, [botName, messages.length, addMessage]);

  const handleMessageSubmit = async (messageText?: string) => {
    const inputText = messageText || userInput.trim();
    if (!inputText) return;

    const userMessage: Message = {
      text: inputText,
      isUser: true,
      timestamp: createTimestamp(),
    };
    addMessage(userMessage);
    setUserInput('');
    setIsTyping(true);
    setSuggestions([]); // Clear suggestions after first message

    if (!chatbotApi) {
      addMessage({
        text: `🚫 **${botName} Multi-Agent System Disconnected**\n\nI'm unable to connect to the ${botName} Multi-Agent System at this time. Please check your configuration and try again.`,
        isUser: false,
        timestamp: createTimestamp(),
      });
      setIsTyping(false);
      return;
    }

    try {
      const taskResult = await chatbotApi.submitA2ATask(newContext, inputText);
      setNewContext(false);

      // Handle streaming response from history array
      let resultText = '';
      if (taskResult.status.state === 'completed' && taskResult.artifacts) {
        const part = taskResult.artifacts[0].parts[0];
        if (part.kind === 'text') {
          resultText = part.text;
        }
      } else if (taskResult.status.message) {
        const part = taskResult.status.message.parts[0];
        if (part.kind === 'text') {
          resultText = part.text;
        }
      }

      // If no text from status/artifacts, collect from streaming history
      if (!resultText && taskResult.history && taskResult.history.length > 0) {
        // Find the last user message
        let lastUserIndex = -1;
        for (let i = taskResult.history.length - 1; i >= 0; i--) {
          if (taskResult.history[i].role === 'user') {
            lastUserIndex = i;
            break;
          }
        }

        // Collect all agent messages after the last user message
        const agentWords = [];
        if (lastUserIndex >= 0) {
          for (let i = lastUserIndex + 1; i < taskResult.history.length; i++) {
            const message = taskResult.history[i];
            if (
              message.role === 'agent' &&
              message.parts &&
              message.parts[0] &&
              message.parts[0].kind === 'text'
            ) {
              agentWords.push(message.parts[0].text);
            }
          }
        }

        // Join all the words together without extra spaces
        resultText = agentWords.join('').trim();
      }

      addMessage({
        text: resultText,
        isUser: false,
        timestamp: createTimestamp(),
      });
    } catch (error) {
      const err = error as Error;
      setApiError(err.message);
      addMessage({
        text: `🚫 **${botName} Multi-Agent System Disconnected**\n\nError: ${err.message}`,
        isUser: false,
        timestamp: createTimestamp(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleMessageSubmit(suggestion);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleMessageSubmit();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
        isUser: false,
        timestamp: createTimestamp(),
      },
    ]);
    setNewContext(true);
    setSuggestions(INITIAL_SUGGESTIONS);
    setApiError(null);
  };

  return (
    <Page themeId="tool">
      <Header title={botName} subtitle="AI Platform Engineer Assistant">
        <HeaderLabel
          label="Status"
          value={chatbotApi ? 'Connected' : 'Disconnected'}
        />
        <HeaderLabel label="Version" value="v1.0" />
      </Header>
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {apiError && (
              <Paper className={classes.errorBox}>
                <Typography variant="h6">Connection Error</Typography>
                <Typography variant="body2">{apiError}</Typography>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                  style={{ marginTop: 8, color: 'inherit' }}
                >
                  Retry Connection
                </Button>
              </Paper>
            )}

            <Card>
              <CardContent>
                {/* Welcome header with avatar */}
                {botIcon && (
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                    className={classes.headerContent}
                  >
                    <img
                      src={botIcon}
                      alt={botName}
                      className={classes.botAvatar}
                    />
                    <Typography variant="h6" color="textPrimary">
                      {botName} - AI Platform Engineer
                    </Typography>
                  </Box>
                )}

                <div className={classes.chatContainer}>
                  <div className={classes.messagesContainer}>
                    {messages.map((message, index) => (
                      <Box
                        key={index}
                        className={`${classes.messageBox} ${
                          message.isUser
                            ? classes.userMessage
                            : classes.botMessage
                        }`}
                      >
                        <Box
                          style={{
                            wordBreak: 'break-word',
                            color: 'inherit',
                          }}
                        >
                          <MarkdownContent
                            content={message.text || ''}
                            transformLinkUri={uri =>
                              uri.startsWith('http') ? uri : ''
                            }
                            linkTarget="_blank"
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          style={{
                            opacity: 0.7,
                            fontSize: '0.75rem',
                            color: 'inherit',
                            display: 'block',
                            marginTop: 4,
                          }}
                        >
                          {message.timestamp}
                        </Typography>
                      </Box>
                    ))}

                    {isTyping && (
                      <Box className={classes.typingIndicator}>
                        <Progress />
                        <Typography variant="body2" style={{ marginLeft: 8 }}>
                          {botName} is thinking...
                        </Typography>
                      </Box>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {suggestions.length > 0 && (
                    <Box className={classes.suggestionsContainer}>
                      <Typography variant="subtitle2" gutterBottom>
                        Suggested questions:
                      </Typography>
                      {suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={classes.suggestionChip}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  )}

                  <Divider style={{ margin: '16px 0' }} />

                  <Box className={classes.inputContainer}>
                    <TextField
                      className={classes.inputField}
                      multiline
                      maxRows={4}
                      variant="outlined"
                      placeholder={`Ask ${botName} anything...`}
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isTyping}
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleMessageSubmit()}
                      disabled={isTyping || !userInput.trim()}
                    >
                      <SendIcon />
                    </IconButton>
                    <IconButton onClick={resetChat} title="Reset conversation">
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}

export default AgentForgePage;
