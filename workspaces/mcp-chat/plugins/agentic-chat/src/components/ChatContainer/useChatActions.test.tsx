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

import { renderHook, act } from '@testing-library/react';
import { useChatActions } from './useChatActions';
import type { Message, Workflow, QuickAction } from '../../types';
import { createTestMessage } from '../../test-utils/factories';

function createParams(
  overrides: Partial<{
    sendMessage: (text: string, msgs: Message[]) => void;
    cancelRequest: () => void;
    messages: Message[];
    onMessagesChange: (messages: Message[]) => void;
    inputValue: string;
    setInputValue: (v: string) => void;
  }> = {},
) {
  return {
    sendMessage: jest.fn(),
    cancelRequest: jest.fn(),
    messages: [] as Message[],
    onMessagesChange: jest.fn(),
    inputValue: '',
    setInputValue: jest.fn(),
    ...overrides,
  };
}

describe('useChatActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWorkflowSelect', () => {
    it('sends first step prompt when workflow has steps', () => {
      const sendMessage = jest.fn();
      const messages = [createTestMessage({ isUser: true, text: 'Hi' })];
      const { result } = renderHook(() =>
        useChatActions(createParams({ sendMessage, messages })),
      );

      act(() => {
        result.current.handleWorkflowSelect({
          id: 'wf-1',
          name: 'Test',
          description: '',
          steps: [{ title: 'Step 1', prompt: 'Run analysis' }],
        } as Workflow);
      });

      expect(sendMessage).toHaveBeenCalledWith('Run analysis', messages);
    });

    it('does nothing when workflow has no steps', () => {
      const sendMessage = jest.fn();
      const { result } = renderHook(() =>
        useChatActions(createParams({ sendMessage })),
      );

      act(() => {
        result.current.handleWorkflowSelect({
          id: 'wf-1',
          name: 'Empty',
          description: '',
          steps: [],
        } as Workflow);
      });

      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('handleQuickActionSelect', () => {
    it('sends action prompt', () => {
      const sendMessage = jest.fn();
      const messages = [createTestMessage({ isUser: true })];
      const { result } = renderHook(() =>
        useChatActions(createParams({ sendMessage, messages })),
      );

      act(() => {
        result.current.handleQuickActionSelect({
          title: 'Summarize',
          prompt: 'Summarize the conversation',
        } as QuickAction);
      });

      expect(sendMessage).toHaveBeenCalledWith(
        'Summarize the conversation',
        messages,
      );
    });
  });

  describe('handleRegenerate', () => {
    it('truncates to before last assistant and resends last user message', () => {
      const sendMessage = jest.fn();
      const onMessagesChange = jest.fn();
      const userMsg = createTestMessage({
        id: 'u1',
        isUser: true,
        text: 'Hello',
      });
      const assistantMsg = createTestMessage({
        id: 'a1',
        isUser: false,
        text: 'Hi there',
      });
      const messages = [userMsg, assistantMsg];

      const { result } = renderHook(() =>
        useChatActions(
          createParams({ sendMessage, onMessagesChange, messages }),
        ),
      );

      act(() => {
        result.current.handleRegenerate();
      });

      expect(onMessagesChange).toHaveBeenCalledWith([userMsg]);
      expect(sendMessage).toHaveBeenCalledWith('Hello', [userMsg]);
    });

    it('does nothing when no user message exists', () => {
      const sendMessage = jest.fn();
      const onMessagesChange = jest.fn();
      const messages = [createTestMessage({ isUser: false })];

      const { result } = renderHook(() =>
        useChatActions(
          createParams({ sendMessage, onMessagesChange, messages }),
        ),
      );

      act(() => {
        result.current.handleRegenerate();
      });

      expect(onMessagesChange).not.toHaveBeenCalled();
      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('handleEditMessage', () => {
    it('truncates after edited message and sends new text', () => {
      const sendMessage = jest.fn();
      const onMessagesChange = jest.fn();
      const m1 = createTestMessage({
        id: 'm1',
        isUser: true,
        text: 'Original',
      });
      const m2 = createTestMessage({ id: 'm2', isUser: false });
      const messages = [m1, m2];

      const { result } = renderHook(() =>
        useChatActions(
          createParams({ sendMessage, onMessagesChange, messages }),
        ),
      );

      act(() => {
        result.current.handleEditMessage('m1', 'Edited text');
      });

      expect(onMessagesChange).toHaveBeenCalledWith([
        { ...m1, text: 'Edited text' },
      ]);
      expect(sendMessage).toHaveBeenCalledWith('Edited text', [
        { ...m1, text: 'Edited text' },
      ]);
    });

    it('does nothing when message id not found', () => {
      const sendMessage = jest.fn();
      const onMessagesChange = jest.fn();
      const messages = [createTestMessage({ id: 'm1' })];

      const { result } = renderHook(() =>
        useChatActions(
          createParams({ sendMessage, onMessagesChange, messages }),
        ),
      );

      act(() => {
        result.current.handleEditMessage('nonexistent', 'New text');
      });

      expect(onMessagesChange).not.toHaveBeenCalled();
      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('handleSendMessage', () => {
    it('sends message and clears input', () => {
      const sendMessage = jest.fn();
      const setInputValue = jest.fn();
      const messages = [createTestMessage()];

      const { result } = renderHook(() =>
        useChatActions(
          createParams({
            sendMessage,
            setInputValue,
            messages,
            inputValue: '  Hello world  ',
          }),
        ),
      );

      act(() => {
        result.current.handleSendMessage();
      });

      expect(setInputValue).toHaveBeenCalledWith('');
      expect(sendMessage).toHaveBeenCalledWith('  Hello world  ', messages);
    });

    it('does nothing when input is empty or whitespace only', () => {
      const sendMessage = jest.fn();
      const setInputValue = jest.fn();

      const { result } = renderHook(() =>
        useChatActions(
          createParams({
            sendMessage,
            setInputValue,
            inputValue: '   ',
          }),
        ),
      );

      act(() => {
        result.current.handleSendMessage();
      });

      expect(sendMessage).not.toHaveBeenCalled();
      expect(setInputValue).not.toHaveBeenCalled();
    });
  });

  describe('handleStopGeneration', () => {
    it('calls cancelRequest', () => {
      const cancelRequest = jest.fn();
      const { result } = renderHook(() =>
        useChatActions(createParams({ cancelRequest })),
      );

      act(() => {
        result.current.handleStopGeneration();
      });

      expect(cancelRequest).toHaveBeenCalled();
    });
  });
});
