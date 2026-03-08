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

import { createRef, type ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ChatContainer } from './ChatContainer';
import {
  createApiTestWrapper,
  createAdminMockApi,
  createTestMessage,
} from '../../test-utils';

const theme = createTheme();

function createFullMockApi() {
  const api = createAdminMockApi();
  return {
    ...api,
    getWorkflows: jest.fn().mockResolvedValue([]),
    getQuickActions: jest.fn().mockResolvedValue([]),
    chatStream: jest.fn().mockResolvedValue(undefined),
    createSession: jest
      .fn()
      .mockResolvedValue({ id: 'session-1', title: 'Test' }),
    createConversation: jest
      .fn()
      .mockResolvedValue({ conversationId: 'conv-1' }),
  };
}

function createWrapper(api: ReturnType<typeof createFullMockApi>) {
  const Wrapper = createApiTestWrapper(api);
  return ({ children }: { children: ReactNode }) => (
    <ThemeProvider theme={theme}>
      <Wrapper>{children}</Wrapper>
    </ThemeProvider>
  );
}

describe('ChatContainer', () => {
  const defaultProps = {
    rightPaneCollapsed: false,
    messages: [],
    onMessagesChange: jest.fn(),
  };

  beforeAll(() => {
    // JSDOM does not implement scrollIntoView - mock it
    Element.prototype.scrollIntoView = jest.fn();
    // JSDOM does not implement IntersectionObserver (used by VirtualizedMessageList)
    global.IntersectionObserver = class IntersectionObserver {
      observe = jest.fn();
      disconnect = jest.fn();
      unobserve = jest.fn();
      root = null;
      rootMargin = '';
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders WelcomeScreen when no messages', async () => {
    const api = createFullMockApi();
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      tagline: 'Your AI Assistant',
      inputPlaceholder: 'Ask me anything...',
    });

    render(<ChatContainer {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    expect(
      screen.getByPlaceholderText('Ask me anything...'),
    ).toBeInTheDocument();
  });

  it('renders message area when messages exist', async () => {
    const api = createFullMockApi();
    const messages = [
      createTestMessage({ id: 'm1', text: 'Hello', isUser: true }),
      createTestMessage({ id: 'm2', text: 'Hi there', isUser: false }),
    ];

    render(<ChatContainer {...defaultProps} messages={messages} />, {
      wrapper: createWrapper(api),
    });

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('renders disclosure footer', () => {
    const api = createFullMockApi();

    render(<ChatContainer {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    expect(
      screen.getByText(/AI-generated responses may be inaccurate/i),
    ).toBeInTheDocument();
  });

  it('renders ChatInput', () => {
    const api = createFullMockApi();
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      inputPlaceholder: 'Ask me anything...',
    });

    render(<ChatContainer {...defaultProps} />, {
      wrapper: createWrapper(api),
    });

    expect(
      screen.getByPlaceholderText('Ask me anything...'),
    ).toBeInTheDocument();
  });

  it('renders when rightPaneCollapsed', () => {
    const api = createFullMockApi();

    const { container } = render(
      <ChatContainer {...defaultProps} rightPaneCollapsed />,
      { wrapper: createWrapper(api) },
    );

    expect(container.querySelector('[class*="MuiBox"]')).toBeTruthy();
  });

  it('shows loading state when loadingConversation is true', () => {
    const api = createFullMockApi();
    (api.getBranding as jest.Mock).mockResolvedValue({
      appName: 'AI Chat',
      inputPlaceholder: 'Ask me anything...',
    });

    render(<ChatContainer {...defaultProps} loadingConversation />, {
      wrapper: createWrapper(api),
    });

    // When loading, ChatInput receives isTyping=true and shows Stop button instead of Send
    expect(
      screen.getByRole('button', { name: /Stop message generation/i }),
    ).toBeInTheDocument();
  });

  it('exposes ref API with isStreaming and cancelOngoingRequest', () => {
    const api = createFullMockApi();
    const ref = createRef<import('./ChatContainer').ChatContainerRef>();

    render(<ChatContainer {...defaultProps} ref={ref} />, {
      wrapper: createWrapper(api),
    });

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current!.isStreaming()).toBe('boolean');
    expect(() => ref.current!.cancelOngoingRequest()).not.toThrow();
  });

  it('calls onNewChat when new chat action is triggered', () => {
    const api = createFullMockApi();
    const onNewChat = jest.fn();
    const messages = [
      createTestMessage({ id: 'm1', text: 'Hello', isUser: true }),
      createTestMessage({ id: 'm2', text: 'Hi', isUser: false }),
    ];

    render(
      <ChatContainer
        {...defaultProps}
        messages={messages}
        onNewChat={onNewChat}
      />,
      { wrapper: createWrapper(api) },
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Start new conversation/i }),
    );

    expect(onNewChat).toHaveBeenCalledTimes(1);
  });
});
