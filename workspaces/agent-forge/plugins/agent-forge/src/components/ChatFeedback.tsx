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
import React from 'react';
import { Message, Feedback } from '../types';
import ChatMessages from './ChatMessages';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { IChatbotApi } from '../apis';

interface ChatFeedbackProps {
  handleMessageSubmit: (msg?: string) => void;
  chatbotApi: IChatbotApi;
  messages: Message[];
  feedback: { [key: number]: Feedback };
  isTyping: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  setFeedback: React.Dispatch<
    React.SetStateAction<{ [key: number]: Feedback }>
  >;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  handleOptionSelection: (option: string) => void;
  renderOptions?: boolean;
  providerModelsMap: { [key: string]: string[] };
}

function ChatFeedback({
  handleMessageSubmit,
  chatbotApi,
  messages,
  feedback,
  isTyping,
  chatContainerRef,
  setFeedback,
  setMessages,
  handleOptionSelection,
  providerModelsMap,
}: ChatFeedbackProps) {
  const alertApi = useApi(alertApiRef);

  function handleFeedback(index: number, type: string) {
    setFeedback(prevFeedback => {
      const newFeedback = { ...prevFeedback };
      if (!newFeedback[index]) {
        newFeedback[index] = {};
      }

      if (newFeedback[index].type === type) {
        newFeedback[index].type = undefined;
        newFeedback[index].showFeedbackOptions = false;
      } else {
        newFeedback[index].type = type;
        newFeedback[index].showFeedbackOptions = true;
      }

      return newFeedback;
    });
  }

  function handleFeedbackReason(index: number, reason: string) {
    setFeedback(prevFeedback => {
      const newFeedback = { ...prevFeedback };
      if (!newFeedback[index]) {
        newFeedback[index] = {};
      }
      newFeedback[index].reason = reason;
      newFeedback[index].promptForFeedback = reason === 'Other';
      return newFeedback;
    });
  }

  async function handleSubmitFeedback(index: number) {
    const feedbackData = feedback[index];
    if (!feedbackData) {
      return;
    }

    try {
      chatbotApi.submitFeedback(messages[index], feedbackData);
      alertApi.post({
        severity: 'success',
        message: 'Thank you for your feedback!',
      });
      setFeedback(prevFeedback => {
        const newFeedback = { ...prevFeedback };
        newFeedback[index].submitted = true;
        newFeedback[index].showFeedbackOptions = false;
        return newFeedback;
      });
      const updatedMessages = messages.map((msg, i) => {
        if (i === index) {
          return { ...msg, showFeedbackOptions: false };
        }
        return msg;
      });
      setMessages(updatedMessages);
    } catch (error) {
      alertApi.post({
        severity: 'error',
        message:
          'There was an error submitting your feedback. Please try again.',
      });
    }
  }

  return (
    <ChatMessages
      handleMessageSubmit={handleMessageSubmit}
      messages={messages}
      feedback={feedback}
      isTyping={isTyping}
      chatContainerRef={chatContainerRef}
      handleFeedback={handleFeedback}
      handleFeedbackReason={handleFeedbackReason}
      handleSubmitFeedback={handleSubmitFeedback}
      handleOptionSelection={handleOptionSelection}
      setFeedback={setFeedback}
      providerModelsMap={providerModelsMap}
    />
  );
}

export default ChatFeedback;
