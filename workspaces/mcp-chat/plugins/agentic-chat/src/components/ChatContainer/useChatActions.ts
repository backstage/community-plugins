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
import { useCallback } from 'react';
import type { Workflow, QuickAction, Message } from '../../types';

export interface UseChatActionsParams {
  sendMessage: (text: string, msgs: Message[]) => void;
  cancelRequest: () => void;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
}

export interface UseChatActionsReturn {
  handleWorkflowSelect: (workflow: Workflow) => void;
  handleQuickActionSelect: (action: QuickAction) => void;
  handleRegenerate: () => void;
  handleEditMessage: (messageId: string, newText: string) => void;
  handleSendMessage: () => void;
  handleStopGeneration: () => void;
}

export function useChatActions({
  sendMessage,
  cancelRequest,
  messages,
  onMessagesChange,
  inputValue,
  setInputValue,
}: UseChatActionsParams): UseChatActionsReturn {
  const handleWorkflowSelect = useCallback(
    (workflow: Workflow) => {
      if (workflow.steps.length > 0) {
        sendMessage(workflow.steps[0].prompt, messages);
      }
    },
    [sendMessage, messages],
  );

  const handleQuickActionSelect = useCallback(
    (action: QuickAction) => {
      sendMessage(action.prompt, messages);
    },
    [sendMessage, messages],
  );

  const handleRegenerate = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.isUser);
    if (!lastUserMessage) return;

    // Remove all messages after (and including) the last assistant response
    const lastAssistantIdx = messages.reduce(
      (acc, m, i) => (!m.isUser ? i : acc),
      -1,
    );
    const kept =
      lastAssistantIdx >= 0 ? messages.slice(0, lastAssistantIdx) : messages;

    onMessagesChange(kept);
    sendMessage(lastUserMessage.text, kept);
  }, [messages, onMessagesChange, sendMessage]);

  const handleEditMessage = useCallback(
    (messageId: string, newText: string) => {
      const msgIndex = messages.findIndex(m => m.id === messageId);
      if (msgIndex === -1) return;

      // Truncate everything after the edited message and update its text
      const truncated = messages.slice(0, msgIndex).concat({
        ...messages[msgIndex],
        text: newText,
      });
      onMessagesChange(truncated);
      sendMessage(newText, truncated);
    },
    [messages, onMessagesChange, sendMessage],
  );

  const handleSendMessage = useCallback(() => {
    if (inputValue.trim()) {
      const messageText = inputValue;
      setInputValue('');
      sendMessage(messageText, messages);
    }
  }, [inputValue, messages, sendMessage, setInputValue]);

  const handleStopGeneration = useCallback(() => {
    cancelRequest();
  }, [cancelRequest]);

  return {
    handleWorkflowSelect,
    handleQuickActionSelect,
    handleRegenerate,
    handleEditMessage,
    handleSendMessage,
    handleStopGeneration,
  };
}
