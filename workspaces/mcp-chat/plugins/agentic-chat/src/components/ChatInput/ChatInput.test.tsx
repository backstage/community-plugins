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

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ChatInput, ChatInputProps } from './ChatInput';

const theme = createTheme();

const defaultProps: ChatInputProps = {
  value: '',
  onChange: jest.fn(),
  onSend: jest.fn(),
  onStop: jest.fn(),
  placeholder: 'Type a message...',
  isTyping: false,
};

const renderChatInput = (props: Partial<ChatInputProps> = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <ChatInput {...defaultProps} {...props} />
    </ThemeProvider>,
  );
};

describe('ChatInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the input field', () => {
      renderChatInput();
      expect(
        screen.getByPlaceholderText('Type a message...'),
      ).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      renderChatInput({ placeholder: 'Ask me anything...' });
      expect(
        screen.getByPlaceholderText('Ask me anything...'),
      ).toBeInTheDocument();
    });

    it('should render send button when not typing', () => {
      renderChatInput({ isTyping: false });
      expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    });

    it('should render stop button when typing', () => {
      renderChatInput({ isTyping: true });
      expect(
        screen.getByLabelText('Stop message generation'),
      ).toBeInTheDocument();
    });

    it('should not render new chat button by default', () => {
      renderChatInput();
      expect(
        screen.queryByLabelText('Start new conversation'),
      ).not.toBeInTheDocument();
    });

    it('should render new chat button when showNewChatButton is true', () => {
      renderChatInput({
        showNewChatButton: true,
        onNewChat: jest.fn(),
      });
      expect(
        screen.getByLabelText('Start new conversation'),
      ).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onChange when typing', async () => {
      const onChange = jest.fn();
      renderChatInput({ onChange });

      const input = screen.getByPlaceholderText('Type a message...');
      await userEvent.type(input, 'Hello');

      expect(onChange).toHaveBeenCalledTimes(5); // One for each character
      // Each call receives the single character typed (not cumulative)
      expect(onChange).toHaveBeenNthCalledWith(1, 'H');
      expect(onChange).toHaveBeenNthCalledWith(5, 'o');
    });

    it('should call onSend when clicking send button', async () => {
      const onSend = jest.fn();
      renderChatInput({ value: 'Hello', onSend });

      const sendButton = screen.getByLabelText('Send message');
      await userEvent.click(sendButton);

      expect(onSend).toHaveBeenCalledTimes(1);
    });

    it('should call onSend when pressing Enter', async () => {
      const onSend = jest.fn();
      renderChatInput({ value: 'Hello', onSend });

      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(onSend).toHaveBeenCalledTimes(1);
    });

    it('should not call onSend when pressing Shift+Enter', async () => {
      const onSend = jest.fn();
      renderChatInput({ value: 'Hello', onSend });

      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

      expect(onSend).not.toHaveBeenCalled();
    });

    it('should call onStop when clicking stop button', async () => {
      const onStop = jest.fn();
      renderChatInput({ isTyping: true, onStop });

      const stopButton = screen.getByLabelText('Stop message generation');
      await userEvent.click(stopButton);

      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('should call onNewChat when clicking new chat button', async () => {
      const onNewChat = jest.fn();
      renderChatInput({ showNewChatButton: true, onNewChat });

      const newChatButton = screen.getByLabelText('Start new conversation');
      await userEvent.click(newChatButton);

      expect(onNewChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('disabled states', () => {
    it('should disable input when isTyping is true', () => {
      renderChatInput({ isTyping: true });
      const input = screen.getByPlaceholderText('Type a message...');
      expect(input).toBeDisabled();
    });

    it('should disable send button when value is empty', () => {
      renderChatInput({ value: '' });
      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toBeDisabled();
    });

    it('should disable send button when value is whitespace only', () => {
      renderChatInput({ value: '   ' });
      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when value has content', () => {
      renderChatInput({ value: 'Hello' });
      const sendButton = screen.getByLabelText('Send message');
      expect(sendButton).not.toBeDisabled();
    });

    it('should disable new chat button when isTyping', () => {
      renderChatInput({
        isTyping: true,
        showNewChatButton: true,
        onNewChat: jest.fn(),
      });
      const newChatButton = screen.getByLabelText('Start new conversation');
      expect(newChatButton).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have accessible label on send button', () => {
      renderChatInput();
      expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    });

    it('should have accessible label on stop button', () => {
      renderChatInput({ isTyping: true });
      expect(
        screen.getByLabelText('Stop message generation'),
      ).toBeInTheDocument();
    });

    it('should have accessible label on new chat button', () => {
      renderChatInput({ showNewChatButton: true, onNewChat: jest.fn() });
      expect(
        screen.getByLabelText('Start new conversation'),
      ).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const onSend = jest.fn();
      renderChatInput({ value: 'test', onSend });

      const sendButton = screen.getByLabelText('Send message');
      sendButton.focus();
      fireEvent.keyDown(sendButton, { key: 'Enter' });

      // Button should be focusable
      expect(document.activeElement).toBe(sendButton);
    });
  });
});
