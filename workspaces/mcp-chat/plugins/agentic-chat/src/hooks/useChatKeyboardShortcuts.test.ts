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
import { renderHook } from '@testing-library/react';
import { useChatKeyboardShortcuts } from './useChatKeyboardShortcuts';

describe('useChatKeyboardShortcuts', () => {
  const createChatInputRef = () => {
    return { current: null };
  };

  it('calls onNewChat when Cmd+Shift+O is pressed', () => {
    const onNewChat = jest.fn();
    const chatInputRef = createChatInputRef();

    renderHook(() =>
      useChatKeyboardShortcuts({
        onNewChat,
        isTyping: false,
        cancelRequest: jest.fn(),
        chatInputRef,
      }),
    );

    const event = new KeyboardEvent('keydown', {
      key: 'O',
      shiftKey: true,
      metaKey: true,
    });
    Object.defineProperty(event, 'target', {
      value: document.createElement('div'),
    });
    window.dispatchEvent(event);

    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('calls cancelRequest when Escape is pressed and isTyping is true', () => {
    const cancelRequest = jest.fn();
    const chatInputRef = createChatInputRef();

    renderHook(() =>
      useChatKeyboardShortcuts({
        onNewChat: jest.fn(),
        isTyping: true,
        cancelRequest,
        chatInputRef,
      }),
    );

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    Object.defineProperty(event, 'target', {
      value: document.createElement('div'),
    });
    window.dispatchEvent(event);

    expect(cancelRequest).toHaveBeenCalledTimes(1);
  });

  it('does NOT call cancelRequest when Escape is pressed and isTyping is false', () => {
    const cancelRequest = jest.fn();
    const chatInputRef = createChatInputRef();

    renderHook(() =>
      useChatKeyboardShortcuts({
        onNewChat: jest.fn(),
        isTyping: false,
        cancelRequest,
        chatInputRef,
      }),
    );

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    Object.defineProperty(event, 'target', {
      value: document.createElement('div'),
    });
    window.dispatchEvent(event);

    expect(cancelRequest).not.toHaveBeenCalled();
  });

  it('handles missing onNewChat callback gracefully', () => {
    const chatInputRef = createChatInputRef();

    expect(() => {
      renderHook(() =>
        useChatKeyboardShortcuts({
          onNewChat: undefined,
          isTyping: false,
          cancelRequest: jest.fn(),
          chatInputRef,
        }),
      );
    }).not.toThrow();

    const event = new KeyboardEvent('keydown', {
      key: 'O',
      shiftKey: true,
      metaKey: true,
    });
    Object.defineProperty(event, 'target', {
      value: document.createElement('div'),
    });
    window.dispatchEvent(event);
  });

  it('focuses chat input when "/" is pressed and not editing', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    const chatInputRef = { current: textarea };
    const focusSpy = jest.spyOn(textarea, 'focus');

    renderHook(() =>
      useChatKeyboardShortcuts({
        onNewChat: jest.fn(),
        isTyping: false,
        cancelRequest: jest.fn(),
        chatInputRef,
      }),
    );

    const event = new KeyboardEvent('keydown', { key: '/' });
    Object.defineProperty(event, 'target', {
      value: document.createElement('div'),
    });
    window.dispatchEvent(event);

    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(textarea);
  });
});
