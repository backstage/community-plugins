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

import { ChatbotApi } from '../apis';
import { DEFAULT_BOT_CONFIG } from '../constants';
import { Message } from '../types';
import { createTimestamp } from '../utils';
import { ChatContainer } from './ChatContainer';
import { PageHeader } from './PageHeader';
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
}));

const INITIAL_SUGGESTIONS = [
  'What can you do?',
  'How do I configure agents?',
  'Help me with platform engineering tasks',
];

/**
 * Agent Forge page component
 * @public
 */
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

  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { ...message, timestamp: createTimestamp() },
    ]);
  }, []);

  const addStreamingMessage = useCallback((initialText: string = '') => {
    const newMessage: Message = {
      text: initialText,
      isUser: false,
      timestamp: createTimestamp(),
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  }, []);

  const updateStreamingMessage = useCallback((text: string) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages];
      const lastMessageIndex = newMessages.length - 1;
      if (lastMessageIndex >= 0) {
        newMessages[lastMessageIndex] = {
          ...newMessages[lastMessageIndex],
          text: text,
        };
      }
      return newMessages;
    });
  }, []);

  const finishStreamingMessage = useCallback(() => {
    setIsTyping(false);
  }, []);

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

  const handleMessageSubmit = useCallback(
    async (messageText?: string) => {
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
        const taskResult = await chatbotApi.submitA2ATask(
          newContext,
          inputText,
        );
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
          addMessage({
            text: resultText,
            isUser: false,
            timestamp: createTimestamp(),
          });
        }
        setIsTyping(false); // Set to false for non-streaming responses
      } catch (error) {
        const err = error as Error;
        setApiError(err.message);
        addMessage({
          text: `🚫 **${botName} Multi-Agent System Disconnected**\n\nError: ${err.message}`,
          isUser: false,
          timestamp: createTimestamp(),
        });
        setIsTyping(false); // Always set to false on error
      }
      // Note: isTyping is set to false by finishStreamingMessage() for streaming responses
      // or by the normal flow for non-streaming responses
    },
    [
      userInput,
      chatbotApi,
      botName,
      newContext,
      addMessage,
      setUserInput,
      setIsTyping,
      setSuggestions,
      setNewContext,
      setApiError,
      addStreamingMessage,
      updateStreamingMessage,
      finishStreamingMessage,
    ],
  );

  const handleSuggestionClick = (suggestion: string) => {
    handleMessageSubmit(suggestion);
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
        <HeaderLabel label="Version" value={`v${packageInfo.version}`} />
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
                <PageHeader botName={botName} botIcon={botIcon} />
                <ChatContainer
                  messages={messages}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  isTyping={isTyping}
                  suggestions={suggestions}
                  botName={botName}
                  onMessageSubmit={handleMessageSubmit}
                  onReset={resetChat}
                  onSuggestionClick={handleSuggestionClick}
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
