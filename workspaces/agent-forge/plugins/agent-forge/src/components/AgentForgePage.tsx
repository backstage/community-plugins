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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Content, Header, HeaderLabel, Page } from '@backstage/core-components';
import {
  configApiRef,
  identityApiRef,
  useApi,
  alertApiRef,
} from '@backstage/core-plugin-api';
import {
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { makeStyles } from '@material-ui/core/styles';
import { v4 as uuidv4 } from 'uuid';

import { ChatbotApi } from '../apis';
import { DEFAULT_BOT_CONFIG, DEFAULT_SUGGESTIONS } from '../constants';
import { Message } from '../types';
import { ChatSession, ChatStorage } from '../types/chat';
import { createTimestamp } from '../utils';
import { ChatContainer } from './ChatContainer';
import { PageHeader } from './PageHeader';
import { ChatSessionSidebar } from './ChatSessionSidebar';
import { useTokenAuthentication } from './ChatAssistantToken';
// @ts-ignore
import packageInfo from '../../package.json';

const useStyles = makeStyles(theme => ({
  errorBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  mainContent: {
    height: 'calc(100vh - 200px)',
  },
}));

const STORAGE_KEY = 'agent-forge-chat-sessions';

/**
 * Agent Forge page component with chat sessions and message queuing
 * @public
 */
export function AgentForgePage() {
  const classes = useStyles();
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const alertApi = useApi(alertApiRef);

  const botName =
    config.getOptionalString('agentForge.botName') || DEFAULT_BOT_CONFIG.name;
  const botIcon =
    config.getOptionalString('agentForge.botIcon') || DEFAULT_BOT_CONFIG.icon;
  const initialSuggestions =
    config.getOptionalStringArray('agentForge.initialSuggestions') ||
    DEFAULT_SUGGESTIONS;
  const backendUrl =
    config.getOptionalString('agentForge.baseUrl') ||
    config.getString('backend.baseUrl');

  // Chat session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // UI state
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);

  // Token authentication for external system integration
  const { tokenMessage, isTokenRequest } = useTokenAuthentication();

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

  // Get current session
  const currentSession = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ChatStorage = JSON.parse(stored);
        const sessionsWithDates = data.sessions.map(s => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        setSessions(sessionsWithDates);
        setCurrentSessionId(data.currentSessionId);
      } else {
        // Only create initial session if no stored data exists
        const initialSession: ChatSession = {
          id: uuidv4(),
          title: 'Chat 1',
          messages: [
            {
              text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
              isUser: false,
              timestamp: createTimestamp(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSessions([initialSession]);
        setCurrentSessionId(initialSession.id);
      }
    } catch (error) {
      alertApi.post({
        message: 'Failed to load chat history. Starting with a fresh session.',
        severity: 'warning',
      });
    }
  }, [botName, alertApi]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    try {
      const data: ChatStorage = {
        sessions,
        currentSessionId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // console.warn('Failed to save chat sessions to storage:', error);
    }
  }, [sessions, currentSessionId]);

  // Create new session
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `Chat ${sessions.length + 1}`,
      messages: [
        {
          text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
          isUser: false,
          timestamp: createTimestamp(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSuggestions(initialSuggestions);
  }, [sessions.length, botName, initialSuggestions]);

  // Switch to session
  const switchToSession = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      const session = sessions.find(s => s.id === sessionId);
      if (session && session.messages.length <= 1) {
        setSuggestions(initialSuggestions);
      } else {
        setSuggestions([]);
      }
    },
    [sessions, initialSuggestions],
  );

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setCurrentSessionId(
          remainingSessions.length > 0 ? remainingSessions[0].id : null,
        );
      }
    },
    [sessions, currentSessionId],
  );

  // Remove this useEffect since we handle initial session creation in the load effect

  // Add message to current session
  const addMessageToSession = useCallback(
    (message: Message) => {
      if (!currentSessionId) return;

      setSessions(prev =>
        prev.map(session => {
          if (session.id === currentSessionId) {
            const updatedMessages = [
              ...session.messages,
              { ...message, timestamp: createTimestamp() },
            ];
            return {
              ...session,
              messages: updatedMessages,
              updatedAt: new Date(),
              // Update title based on first user message
              title:
                session.messages.length === 1 && message.isUser
                  ? message.text?.substring(0, 50) +
                      (message.text && message.text.length > 50 ? '...' : '') ||
                    session.title
                  : session.title,
            };
          }
          return session;
        }),
      );
    },
    [currentSessionId],
  );

  // Message streaming functions
  const addStreamingMessage = useCallback(
    (initialText: string = '') => {
      const newMessage: Message = {
        text: initialText,
        isUser: false,
        timestamp: createTimestamp(),
      };
      addMessageToSession(newMessage);
    },
    [addMessageToSession],
  );

  const updateStreamingMessage = useCallback(
    (text: string) => {
      if (!currentSessionId) return;

      setSessions(prev =>
        prev.map(session => {
          if (session.id === currentSessionId) {
            const updatedMessages = [...session.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && !lastMessage.isUser) {
              lastMessage.text = text;
            }
            return { ...session, messages: updatedMessages };
          }
          return session;
        }),
      );
    },
    [currentSessionId],
  );

  const finishStreamingMessage = useCallback(() => {
    setIsTyping(false);
  }, []);

  // Main message submission handler
  const handleMessageSubmit = useCallback(
    async (messageText?: string) => {
      const inputText = messageText || userInput.trim();
      if (!inputText) return;

      // Auto-create session if none exist
      let sessionToUse = currentSessionId;
      if (sessions.length === 0 || !currentSessionId) {
        const newSessionId = uuidv4();
        const newSession: ChatSession = {
          id: newSessionId,
          title:
            inputText.length > 50
              ? `${inputText.substring(0, 50)}...`
              : inputText,
          messages: [
            {
              text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
              isUser: false,
              timestamp: createTimestamp(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSessions([newSession]);
        setCurrentSessionId(newSessionId);
        sessionToUse = newSessionId;
      }

      const userMessage: Message = {
        text: inputText,
        isUser: true,
        timestamp: createTimestamp(),
      };

      // Add message to the correct session (either current or newly created)
      setSessions(prev =>
        prev.map(session => {
          if (session.id === sessionToUse) {
            const updatedMessages = [
              ...session.messages,
              { ...userMessage, timestamp: createTimestamp() },
            ];
            return {
              ...session,
              messages: updatedMessages,
              updatedAt: new Date(),
              // Update title based on first user message if it's a new session
              title:
                session.messages.length === 1 && userMessage.isUser
                  ? userMessage.text?.substring(0, 50) +
                      (userMessage.text && userMessage.text.length > 50
                        ? '...'
                        : '') || session.title
                  : session.title,
            };
          }
          return session;
        }),
      );
      setUserInput('');
      setIsTyping(true);
      setSuggestions([]); // Clear suggestions after first message

      if (!chatbotApi) {
        setSessions(prev =>
          prev.map(session => {
            if (session.id === sessionToUse) {
              return {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    text: `🚫 **${botName} Multi-Agent System Disconnected**\n\nI'm unable to connect to the ${botName} Multi-Agent System at this time. Please check your configuration and try again.`,
                    isUser: false,
                    timestamp: createTimestamp(),
                  },
                ],
                updatedAt: new Date(),
              };
            }
            return session;
          }),
        );
        setIsTyping(false);
        return;
      }

      try {
        // Get the session we're working with (either current or newly created)
        const workingSession =
          sessions.find(s => s.id === sessionToUse) ||
          (sessionToUse === currentSessionId ? currentSession : null);

        // console.log('Submitting message with contextId:', workingSession?.contextId);
        const taskResult = await chatbotApi.submitA2ATask(
          !workingSession?.contextId, // newContext = true if no contextId exists
          inputText,
          workingSession?.contextId, // Pass the session's contextId
        );

        // console.log('Received taskResult with contextId:', taskResult.contextId);

        // Update session with contextId for continuity
        if (taskResult.contextId && sessionToUse) {
          setSessions(prev =>
            prev.map(session =>
              session.id === sessionToUse
                ? { ...session, contextId: taskResult.contextId }
                : session,
            ),
          );
        }

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
        if (
          !resultText &&
          taskResult.history &&
          taskResult.history.length > 0
        ) {
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
            for (
              let i = lastUserIndex + 1;
              i < taskResult.history.length;
              i++
            ) {
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

          // Implement streaming display for long responses (>300 words)
          if (agentWords.length > 300) {
            addStreamingMessage();

            let currentText = '';
            agentWords.forEach((word, index) => {
              setTimeout(() => {
                currentText += word;
                updateStreamingMessage(currentText.trim());

                // Finish streaming on last word
                if (index === agentWords.length - 1) {
                  setTimeout(() => {
                    finishStreamingMessage();
                  }, 50);
                }
              }, index * 10); // delay (milliseconds) between words
            });
            return; // Exit early - isTyping will be set to false by finishStreamingMessage
          }

          // Fallback: join all words if no streaming
          resultText = agentWords.join('').trim();
        }

        // Add message normally if not streaming
        if (resultText) {
          setSessions(prev =>
            prev.map(session => {
              if (session.id === sessionToUse) {
                return {
                  ...session,
                  messages: [
                    ...session.messages,
                    {
                      text: resultText,
                      isUser: false,
                      timestamp: createTimestamp(),
                    },
                  ],
                  updatedAt: new Date(),
                };
              }
              return session;
            }),
          );
        }
        setIsTyping(false); // Set to false for non-streaming responses
      } catch (error) {
        const err = error as Error;
        setApiError(err.message);
        setSessions(prev =>
          prev.map(session => {
            if (session.id === sessionToUse) {
              return {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    text: `🚫 **${botName} Multi-Agent System Disconnected**\n\nError: ${err.message}`,
                    isUser: false,
                    timestamp: createTimestamp(),
                  },
                ],
                updatedAt: new Date(),
              };
            }
            return session;
          }),
        );
        setIsTyping(false); // Always set to false on error
      }
    },
    [
      userInput,
      chatbotApi,
      botName,
      currentSession,
      currentSessionId,
      addStreamingMessage,
      updateStreamingMessage,
      finishStreamingMessage,
      sessions,
      setSessions,
      setCurrentSessionId,
    ],
  );

  const handleSuggestionClick = (suggestion: string) => {
    handleMessageSubmit(suggestion);
  };

  const resetChat = () => {
    if (currentSessionId) {
      setSessions(prev =>
        prev.map(session =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [
                  {
                    text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
                    isUser: false,
                    timestamp: createTimestamp(),
                  },
                ],
                contextId: undefined, // Reset context
                updatedAt: new Date(),
              }
            : session,
        ),
      );
    }
    setUserInput('');
    setSuggestions(initialSuggestions);
    setApiError(null);
  };

  return (
    <Page themeId="tool">
      <Header title={botName} subtitle="AI Platform Engineer Assistant">
        <HeaderLabel
          label="Status"
          value={chatbotApi ? 'Connected' : 'Disconnected'}
        />
        <HeaderLabel label="Version" value={`v${packageInfo.version}`} />
      </Header>
      <Content>
        <Grid container spacing={1} className={classes.mainContent}>
          {/* Chat Sessions Sidebar */}
          <Grid item xs={12} md={3} style={{ height: '100%' }}>
            <ChatSessionSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSessionSwitch={switchToSession}
              onNewSession={createNewSession}
              onDeleteSession={deleteSession}
            />
          </Grid>

          {/* Main Chat Area */}
          <Grid item xs={12} md={9} style={{ height: '100%' }}>
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

            {isTokenRequest && tokenMessage && (
              <Card style={{ marginBottom: 16 }}>
                <CardContent>
                  <Typography variant="h6">Authentication</Typography>
                  <Typography variant="body2">{tokenMessage}</Typography>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <PageHeader botName={botName} botIcon={botIcon} />

                <ChatContainer
                  messages={currentSession?.messages || []}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  onMessageSubmit={handleMessageSubmit}
                  onSuggestionClick={handleSuggestionClick}
                  onReset={resetChat}
                  isTyping={isTyping}
                  suggestions={suggestions}
                  botName={botName}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}

export default AgentForgePage;
