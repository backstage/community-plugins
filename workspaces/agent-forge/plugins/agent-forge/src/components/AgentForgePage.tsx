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
import { Content, Page } from '@backstage/core-components';
import {
  configApiRef,
  identityApiRef,
  useApi,
  alertApiRef,
} from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { makeStyles } from '@material-ui/core/styles';
import { v4 as uuidv4 } from 'uuid';

import { ChatbotApi } from '../apis';
import {
  DEFAULT_BOT_CONFIG,
  DEFAULT_SUGGESTIONS,
  DEFAULT_THINKING_MESSAGES,
} from '../constants';
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
    padding: theme.spacing(1),
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
    wordBreak: 'break-word',
    fontSize: '0.8125rem',
    lineHeight: 1.3,
  },
  mainContent: {
    height: 'calc(100vh - 80px)',
    overflow: 'hidden',
    margin: 0,
    width: '100%',
    '& .MuiGrid-spacing-xs-1': {
      margin: 0,
      width: '100%',
      height: '100%',
    },
    '& .MuiGrid-spacing-xs-1 > .MuiGrid-item': {
      padding: theme.spacing(0.5),
    },
  },
  fullscreenContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
  },
  fullscreenContent: {
    flex: 1,
    overflow: 'hidden',
    padding: theme.spacing(2),
    display: 'flex',
    minHeight: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 500,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    lineHeight: 1.2,
    margin: 0,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontWeight: 400,
    opacity: 0.95,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    lineHeight: 1.3,
    margin: 0,
  },
  sidebarColumn: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatColumn: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  chatCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatCardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  fullscreenButton: {
    color: '#FFFFFF',
  },
  pageContainer: {
    height: 'calc(100vh - 64px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    '& > *': {
      flex: 1,
      overflow: 'hidden',
      minHeight: 0,
    },
  },
  contentWrapper: {
    height: '100%',
    overflow: 'hidden',
    padding: theme.spacing(1),
    width: '100%',
    boxSizing: 'border-box',
  },
  customHeaderContainer: {
    background:
      'linear-gradient(135deg, #004D40 0%, #00695C 25%, #00838F 50%, #1565C0 100%)',
    padding: theme.spacing(1, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#FFFFFF',
    minHeight: '56px',
    width: '100%',
    boxSizing: 'border-box',
  },
  customHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flex: '0 0 auto',
  },
  customHeaderTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  headerBotAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'contain' as const,
  },
  customHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(4),
    flex: '0 0 auto',
    marginLeft: 'auto',
  },
  customHeaderStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '120px',
  },
  customHeaderLabel: {
    fontSize: '0.75rem',
    opacity: 0.85,
    fontWeight: 500,
    marginBottom: theme.spacing(0.25),
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  customHeaderValue: {
    fontSize: '0.9rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
}));

const STORAGE_KEY = 'agent-forge-chat-sessions';

/**
 * Agent Forge page component with chat history and message queuing
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
  const thinkingMessages =
    config.getOptionalStringArray('agentForge.thinkingMessages') ||
    DEFAULT_THINKING_MESSAGES;
  const thinkingMessagesInterval =
    config.getOptionalNumber('agentForge.thinkingMessagesInterval') || 7000;
  const backendUrl =
    config.getOptionalString('agentForge.baseUrl') ||
    config.getString('backend.baseUrl');
  const requestTimeout =
    config.getOptionalNumber('agentForge.requestTimeout') || 300;
  const headerTitle =
    config.getOptionalString('agentForge.headerTitle') || botName;
  const headerSubtitle =
    config.getOptionalString('agentForge.headerSubtitle') ||
    'AI Platform Engineer Assistant';
  const inputPlaceholder =
    config.getOptionalString('agentForge.inputPlaceholder') ||
    `Ask ${botName} anything...`;

  // Font size configuration
  const fontSizes = {
    headerTitle:
      config.getOptionalString('agentForge.fontSize.headerTitle') || '1.125rem',
    headerSubtitle:
      config.getOptionalString('agentForge.fontSize.headerSubtitle') ||
      '0.75rem',
    messageText:
      config.getOptionalString('agentForge.fontSize.messageText') || '0.875rem',
    codeBlock:
      config.getOptionalString('agentForge.fontSize.codeBlock') || '0.9rem',
    inlineCode:
      config.getOptionalString('agentForge.fontSize.inlineCode') || '0.875rem',
    suggestionChip:
      config.getOptionalString('agentForge.fontSize.suggestionChip') ||
      '0.875rem',
    sidebarText:
      config.getOptionalString('agentForge.fontSize.sidebarText') || '0.875rem',
    inputField:
      config.getOptionalString('agentForge.fontSize.inputField') || '1rem',
    timestamp:
      config.getOptionalString('agentForge.fontSize.timestamp') || '0.75rem',
  };

  // Chat session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // UI state
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking');

  // Token authentication for external system integration
  const { tokenMessage, isTokenRequest } = useTokenAuthentication();

  const chatbotApi = useMemo(() => {
    try {
      const api = new ChatbotApi(
        backendUrl,
        { identityApi },
        { requestTimeout },
      );
      setApiError(null);
      return api;
    } catch (error) {
      setApiError('Failed to initialize chat service');
      return null;
    }
  }, [backendUrl, identityApi, requestTimeout]);

  // Check agent connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (!chatbotApi) {
        setConnectionStatus('disconnected');
        return;
      }

      setConnectionStatus('checking');
      try {
        // Try to get the agent card to verify connection
        await chatbotApi.getSkillExamples();
        setConnectionStatus('connected');
        setApiError(null);
      } catch (error: any) {
        setConnectionStatus('disconnected');
        setApiError(
          error.message ||
            'Unable to connect to agent service. Please check the configuration.',
        );
      }
    };

    checkConnection();
  }, [chatbotApi]);

  // Get current session
  const currentSession = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  // Load chat history from localStorage on mount
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

  // Save chat history to localStorage whenever they change
  useEffect(() => {
    try {
      const data: ChatStorage = {
        sessions,
        currentSessionId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // console.warn('Failed to save chat history to storage:', error);
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
      // Always keep suggestions visible
      setSuggestions(initialSuggestions);
    },
    [initialSuggestions],
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
      // Keep suggestions visible

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

        // Check if it's a timeout error and display it directly without additional prefix
        const isTimeoutError = err.message.includes('timed out');
        const errorMessage = isTimeoutError
          ? `⏱️ ${err.message}`
          : `🚫 **${botName} Multi-Agent System Disconnected**\n\nError: ${err.message}`;

        setSessions(prev =>
          prev.map(session => {
            if (session.id === sessionToUse) {
              return {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    text: errorMessage,
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => (
    <Grid container spacing={1} className={classes.mainContent} wrap="nowrap">
      {/* Chat History Sidebar */}
      <Grid
        item
        className={classes.sidebarColumn}
        style={
          isSidebarCollapsed
            ? { flexShrink: 0, width: 'auto' }
            : { flexShrink: 0, width: 'auto', minWidth: 250, maxWidth: 300 }
        }
      >
        <ChatSessionSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionSwitch={switchToSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
          onCollapseChange={setIsSidebarCollapsed}
          sidebarTextFontSize={fontSizes.sidebarText}
          isCollapsed={isSidebarCollapsed}
        />
      </Grid>

      {/* Main Chat Area */}
      <Grid item className={classes.chatColumn}>
        {apiError && (
          <Paper className={classes.errorBox}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Typography
                variant="subtitle2"
                style={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                Connection Error
              </Typography>
              <IconButton
                size="small"
                onClick={() => setApiError(null)}
                style={{ color: 'inherit', padding: 2 }}
                title="Dismiss"
              >
                ×
              </IconButton>
            </div>
            <Typography
              variant="body2"
              style={{
                marginBottom: 6,
                fontSize: '0.8125rem',
                lineHeight: 1.3,
              }}
            >
              {apiError}
            </Typography>
            <Button
              size="small"
              startIcon={<RefreshIcon style={{ fontSize: '1rem' }} />}
              onClick={() => window.location.reload()}
              variant="outlined"
              style={{
                color: 'inherit',
                borderColor: 'currentColor',
                fontSize: '0.8125rem',
                padding: '4px 10px',
              }}
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

        <Card className={classes.chatCard}>
          <CardContent className={classes.chatCardContent}>
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
              thinkingMessages={thinkingMessages}
              thinkingMessagesInterval={thinkingMessagesInterval}
              botName={botName}
              botIcon={botIcon}
              inputPlaceholder={inputPlaceholder}
              fontSizes={{
                messageText: fontSizes.messageText,
                codeBlock: fontSizes.codeBlock,
                inlineCode: fontSizes.inlineCode,
                suggestionChip: fontSizes.suggestionChip,
                inputField: fontSizes.inputField,
                timestamp: fontSizes.timestamp,
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (isFullscreen) {
    return (
      <div className={classes.fullscreenContainer}>
        <Box className={classes.customHeaderContainer}>
          <Box className={classes.customHeaderLeft}>
            {botIcon && (
              <img
                src={botIcon}
                alt={botName}
                className={classes.headerBotAvatar}
              />
            )}
            <Tooltip title="Visit CAIPE Documentation" placement="bottom">
              <Box className={classes.customHeaderTextContainer}>
                <Typography
                  variant="h5"
                  className={classes.headerTitle}
                  style={{ fontSize: fontSizes.headerTitle }}
                >
                  {headerTitle}
                </Typography>
                <Typography
                  variant="body2"
                  className={classes.headerSubtitle}
                  component="a"
                  href="https://cnoe-io.github.io/ai-platform-engineering/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: fontSizes.headerSubtitle,
                  }}
                >
                  {headerSubtitle}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
          <Box className={classes.customHeaderRight}>
            <Tooltip title={`Agent URL: ${backendUrl}`} placement="bottom">
              <Box className={classes.customHeaderStatus}>
                <Typography className={classes.customHeaderLabel}>
                  Status
                </Typography>
                <Typography className={classes.customHeaderValue}>
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'checking' && 'Connecting...'}
                  {connectionStatus === 'disconnected' && 'Disconnected'}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip
              title="View on NPM: @caipe/plugin-agent-forge"
              placement="bottom"
            >
              <Box
                className={classes.customHeaderStatus}
                onClick={() =>
                  window.open(
                    'https://www.npmjs.com/package/@caipe/plugin-agent-forge',
                    '_blank',
                  )
                }
                style={{ cursor: 'pointer' }}
              >
                <Typography className={classes.customHeaderLabel}>
                  Plugin Version
                </Typography>
                <Typography className={classes.customHeaderValue}>
                  v{packageInfo.version}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Exit Fullscreen">
              <IconButton
                onClick={toggleFullscreen}
                className={classes.fullscreenButton}
              >
                <FullscreenExitIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <div className={classes.fullscreenContent}>{renderContent()}</div>
      </div>
    );
  }

  return (
    <>
      <Box className={classes.customHeaderContainer}>
        <Box className={classes.customHeaderLeft}>
          {botIcon && (
            <img
              src={botIcon}
              alt={botName}
              className={classes.headerBotAvatar}
            />
          )}
          <Tooltip title="Visit CAIPE Documentation" placement="bottom">
            <Box className={classes.customHeaderTextContainer}>
              <Typography
                variant="h5"
                className={classes.headerTitle}
                style={{ fontSize: fontSizes.headerTitle }}
              >
                {headerTitle}
              </Typography>
              <Typography
                variant="body2"
                className={classes.headerSubtitle}
                component="a"
                href="https://cnoe-io.github.io/ai-platform-engineering/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontSize: fontSizes.headerSubtitle,
                }}
              >
                {headerSubtitle}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        <Box className={classes.customHeaderRight}>
          <Tooltip title={`Agent URL: ${backendUrl}`} placement="bottom">
            <Box className={classes.customHeaderStatus}>
              <Typography className={classes.customHeaderLabel}>
                Status
              </Typography>
              <Typography className={classes.customHeaderValue}>
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'checking' && 'Connecting...'}
                {connectionStatus === 'disconnected' && 'Disconnected'}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip
            title="View on NPM: @caipe/plugin-agent-forge"
            placement="bottom"
          >
            <Box
              className={classes.customHeaderStatus}
              onClick={() =>
                window.open(
                  'https://www.npmjs.com/package/@caipe/plugin-agent-forge',
                  '_blank',
                )
              }
              style={{ cursor: 'pointer' }}
            >
              <Typography className={classes.customHeaderLabel}>
                Plugin Version
              </Typography>
              <Typography className={classes.customHeaderValue}>
                v{packageInfo.version}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton
              onClick={toggleFullscreen}
              className={classes.fullscreenButton}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box className={classes.pageContainer}>
        <Page themeId="tool">
          <Content noPadding>
            <Box className={classes.contentWrapper}>{renderContent()}</Box>
          </Content>
        </Page>
      </Box>
    </>
  );
}

export default AgentForgePage;
