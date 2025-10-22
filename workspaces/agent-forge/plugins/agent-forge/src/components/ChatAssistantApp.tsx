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

/* eslint-disable react/react-in-jsx-scope*/

import ChatFeedback from './ChatFeedback';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatTabs from './ChatTabs';
import { useState, useEffect, useRef, useMemo } from 'react';
import WebexLogo from '../icons/jarvis.png';
import useStyles from './useStyles';
import { ChatSuggestionOptions } from './ChatSuggestionOptions';
import { Message, Feedback, UserResponse } from '../types';
import {
  appThemeApiRef,
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { createTimestamp, delay, makeLinksClickable } from '../utils';
import { ChatbotApi } from '../apis';
import useObservable from 'react-use/esm/useObservable';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface IChatFeedback {
  [key: number]: Feedback;
}

/** @public */
function ChatAssistantApp() {
  const styles = useStyles();
  const config = useApi(configApiRef);
  const appThemeApi = useApi(appThemeApiRef);
  const logEnabled = false;
  const activeThemeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );
  const logWithContext = (message: string) => {
    // TODO: we should find a better way to handle this down the road
    if (logEnabled) {
      // eslint-disable-next-line
      console.log(`[ChatAssistantApp] ${message}`);
    }
  };
  const backendUrl =
    config.getOptionalString('agentForge.baseUrl') ||
    config.getString('backend.baseUrl');
  logWithContext(`backendUrl determined: ${backendUrl}`);

  if (config.getOptionalString('agentForge.baseUrl')) {
    logWithContext(
      `Using agentForge.baseUrl from config: ${config.getOptionalString(
        'agentForge.baseUrl',
      )}`,
    );
  } else {
    logWithContext(
      `Using backend.baseUrl from config: ${config.getString(
        'backend.baseUrl',
      )}`,
    );
  }
  const identityApi = useApi(identityApiRef);
  const showOptions = config.getOptionalBoolean('agentForge.showOptions');

  const chatbotApi = useMemo(
    () => new ChatbotApi(backendUrl, { identityApi }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [backendUrl],
  );
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [newContext, setNewContext] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<IChatFeedback>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasQuestion, setHasQuestion] = useState<boolean>(false);
  const [isPromptShown, setShowPrompt] = useState<boolean>(false);
  const [isInitialState, setIsInitialState] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFormMode, setShowFormMode] = useState<boolean>(true);

  const [providerModelsMap] = useState<{
    [key: string]: string[];
  }>({});

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const fullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  const toggleFormMode = () => {
    setShowFormMode(prev => !prev);
  };

  const resetChatContext = () => {
    setNewContext(true);
  };

  const resetChat = () => {
    setMessages(_ => []);
    setFeedback({});
    setShowPrompt(false);
    setIsTyping(false);
    setHasQuestion(false);
    setIsInitialState(true);
    resetChatContext();
  };

  const startQuestion = () => setHasQuestion(true);
  const endQuestion = () => setHasQuestion(false);
  const showPrompt = () => setShowPrompt(true);
  const hidePrompt = () => setShowPrompt(false);

  useEffect(() => {
    const applyClickableLinksToBotMessages = () => {
      document
        .querySelectorAll<HTMLElement>('.bot-message')
        ?.forEach(message => {
          const originalContent = message.innerHTML;
          const newContent = makeLinksClickable(originalContent);
          // Ensure there is a change before replacing the innerHTML
          if (newContent !== originalContent) {
            message.innerHTML = newContent;
          }
        });
    };
    applyClickableLinksToBotMessages();
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    if (messages.length > 0 && !isInitialState && !isPromptShown) {
      inactivityTimeoutRef.current = setTimeout(async () => {
        if (!hasQuestion && !isPromptShown) {
          await addBotMessage({
            text: 'Do you have any other questions I can answer?',
            isUser: false,
            timestamp: createTimestamp(),
          });
          showPrompt();
        }
      }, 300000);
    }

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [
    addBotMessage,
    hasQuestion,
    isInitialState,
    isPromptShown,
    messages.length,
  ]);

  useEffect(() => {
    resetChatContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOptionSelection(_confirmation: string): Promise<void> {}

  async function handleMessageSubmit(msg?: string) {
    const input = userInput || msg;
    if (!input) {
      return;
    }
    setIsInitialState(false);

    await addUserMessage({ text: input, isUser: true });
    const timestamp = createTimestamp();
    const contMsg = await continueMessaging(input);
    switch (contMsg) {
      case UserResponse.RESET:
        // console.log('Reset Chat ID:', getChatId());
        setIsTyping(false);
        addBotMessage({
          text: 'Alright! If you have any more questions later, feel free to ask. Have a great day!',
          isUser: false,
          timestamp,
        });
        // Reset task to allow for new message / input
        resetChatContext();
        await delay(500);
        addBotMessage({
          text: 'Cleaning up previous chat. Minimizing Jarvis...',
          isUser: false,
          timestamp,
        });
        await delay(3000);
        resetChat();
        closeChat();
        break;
      case UserResponse.NEW:
        resetChatContext();
        addBotMessage({
          text: 'I am Jarvis, your AI Platform Engineer. How can I help you today?',
          // Add welcome message suggestions:
          suggestions: [],
          isUser: false,
          timestamp,
        });
        break;
      case UserResponse.CONTINUE:
      default: {
        startQuestion();
        addIntentionalTypingDelay();
        try {
          const taskResult = await chatbotApi.submitA2ATask(newContext, input);
          setNewContext(false);

          // Check if the task requires input
          if (
            taskResult.status.state === 'input-required' &&
            taskResult.status.message?.metadata?.input_fields
          ) {
            // Extract text from the message parts
            let resultText = '';
            if (
              taskResult.status.message.parts &&
              taskResult.status.message.parts[0]
            ) {
              const part = taskResult.status.message.parts[0];
              if (part.kind === 'text') {
                resultText = part.text || '';
              }
            }

            // Add message with form metadata AND the actual text
            addBotMessage({
              text: resultText,
              suggestions: [],
              isUser: false,
              timestamp,
              metadata: taskResult.status.message.metadata,
            });
          } else {
            // Handle regular completed task
            let resultText = '';
            if (
              taskResult.status.state === 'completed' &&
              taskResult.artifacts
            ) {
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

            addBotMessage({
              text: resultText,
              suggestions: [],
              isUser: false,
              timestamp,
            });
          }
        } catch (error) {
          const err = error as Error;
          await addBotMessage({
            text: `Error submitting question: ${err.message}`,
            isUser: false,
            timestamp: createTimestamp(),
          });
        } finally {
          endQuestion();
          setIsTyping(false);
          document.getElementById('your-input-field-id')?.focus();
        }
        break;
      }
    }
  }

  async function addIntentionalTypingDelay(): Promise<void> {
    setIsTyping(true);
    // await delay(typingDelay);
    // setIsTyping(false);
  }

  async function typeMessageToUser(message: Message): Promise<void> {
    const messageText = message.text || '';
    const words = messageText.split(' ') || [];
    const currentMessage = { ...message, text: '' };
    setMessages(prevMessages => [...prevMessages, currentMessage]);
    for (const word of words) {
      // await delay(10);
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage) {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            text: `${(lastMessage.text || '') + word} `,
          };
        }
        return newMessages;
      });
    }
  }

  async function addUserMessage(message: Message): Promise<void> {
    setMessages(prevMessages => [
      ...prevMessages,
      {
        ...message,
        timestamp: createTimestamp(),
      },
    ]);
    setUserInput('');
    hidePrompt();
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function addBotMessage(message: Message): Promise<void> {
    const { options = [] } = message;
    if (options.length <= 0) {
      // Check if message has metadata that requires form display
      if (message.metadata?.input_fields) {
        // Add message directly with metadata preserved
        setMessages(prevMessages => [
          ...prevMessages,
          {
            ...message,
            timestamp: createTimestamp(),
          },
        ]);
      } else {
        // Use typing effect for regular messages
        await typeMessageToUser(message);
      }
      return;
    }
    setMessages(prevMessages => [
      ...prevMessages,
      {
        ...message,
        renderOptions: true,
        optionsMarkup: (
          <ChatSuggestionOptions
            suggestions={options}
            optionSelected={handleOptionSelection}
          />
        ),
      },
    ]);
  }

  async function continueMessaging(input = 'hi'): Promise<UserResponse> {
    const [yesNo, ...additionalInput] = input.toLocaleLowerCase().split(' ');

    if (additionalInput.length > 0) {
      return UserResponse.CONTINUE;
    }
    const greetings = ['hi', 'hello', 'hey'];

    switch (true) {
      case greetings.some(greeting => yesNo.startsWith(greeting)):
        return UserResponse.NEW;
      case yesNo.startsWith('reset'):
        return UserResponse.RESET;
      default:
        return UserResponse.CONTINUE;
    }
  }
  if (showOptions && suggestions.length === 0) {
    chatbotApi.getSkillExamples().then(value => {
      if (value) {
        setSuggestions(value);
      }
    });
  }

  if (!isOpen) {
    return (
      <Button
        onClick={openChat}
        type="button"
        title="Button"
        className={`${styles.buttonOpenChat}`}
      >
        <img
          src={WebexLogo}
          style={{ width: 100, height: 100, objectFit: 'contain' }}
          alt="Click this Webex Logo to open AgentForge"
        />
      </Button>
    );
  }

  return (
    <div
      className={`App ${
        activeThemeId === 'dark' ? styles.darkMode : styles.lightMode
      }`}
    >
      <div
        className={`${styles.chatPanel} ${isOpen ? 'open' : ''} ${
          isFullScreen ? styles.chatPanelMaximized : ''
        }`}
      >
        <ChatHeader
          clearChat={resetChat}
          handleCloseChat={closeChat}
          handleFullScreenToggle={fullScreen}
          onToggleFormMode={toggleFormMode}
          showFormMode={showFormMode}
        />
        {isInitialState && !hasQuestion ? (
          <ChatTabs
            isFullScreen={isFullScreen}
            handleMessageSubmit={handleMessageSubmit}
            suggestions={suggestions}
          />
        ) : (
          <>
            {messages.length > 0 && (
              <div className={styles.todayContainer}>
                <div className={styles.todayLine} />
                <div className={styles.todayText}>Today</div>
                <div className={styles.todayLine} />
              </div>
            )}
            <Box
              display="flex"
              justifyContent="center"
              width={isFullScreen ? '80%' : '100%'}
              height="100%"
              margin={isFullScreen ? 'auto' : '2px'}
            >
              <ChatFeedback
                handleMessageSubmit={handleMessageSubmit}
                chatbotApi={chatbotApi}
                messages={messages}
                feedback={feedback}
                isTyping={isTyping}
                chatContainerRef={chatContainerRef}
                setFeedback={setFeedback}
                setMessages={setMessages}
                handleOptionSelection={handleOptionSelection}
                providerModelsMap={providerModelsMap}
                showFormMode={showFormMode}
              />
            </Box>
          </>
        )}

        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          style={{ zIndex: 1000 }}
        >
          <ChatInput
            disabled={isTyping}
            input={userInput}
            setInput={setUserInput}
            handleMessageSubmit={handleMessageSubmit}
          />
        </Box>
      </div>
    </div>
  );
}

/** @public */
export default ChatAssistantApp;
