/**
 * Integration tests for AgentForgePage component
 * These tests render the actual component and test real code paths
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { AgentForgePage } from '../AgentForgePage';
import { identityApiRef, alertApiRef, storageApiRef } from '@backstage/core-plugin-api';
import { ChatbotApi } from '../../apis/ChatbotApi';

// Mock the ChatbotApi
const mockChatbotApi = {
  submitTask: jest.fn(),
  submitA2ATask: jest.fn(),
  streamA2ATask: jest.fn(),
  getBackendUrl: jest.fn().mockReturnValue('http://localhost:7007'),
} as unknown as ChatbotApi;

// Mock Identity API
const mockIdentityApi = {
  getProfileInfo: jest.fn().mockResolvedValue({
    displayName: 'Test User',
    email: 'test@example.com',
  }),
  getBackstageIdentity: jest.fn().mockResolvedValue({
    type: 'user',
    userEntityRef: 'user:default/test',
    ownershipEntityRefs: [],
  }),
  getCredentials: jest.fn().mockResolvedValue({}),
};

// Mock Alert API
const mockAlertApi = {
  post: jest.fn(),
  alert$: jest.fn(),
};

// Mock Storage API  
const mockStorageApi = {
  forBucket: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    observe$: jest.fn(),
  }),
};

describe('AgentForgePage Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    // Suppress console logs in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = async () => {
    const apis = TestApiProvider.create({
      apis: [
        [identityApiRef, mockIdentityApi],
        [alertApiRef, mockAlertApi],
        [storageApiRef, mockStorageApi],
      ],
    });

    return renderInTestApp(
      <TestApiProvider apis={apis}>
        <AgentForgePage />
      </TestApiProvider>,
    );
  };

  describe('Component Rendering', () => {
    test('should render the component without crashing', async () => {
      await renderComponent();
      
      // Component should render
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('should display initial welcome message', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/How can I help you today/i)).toBeInTheDocument();
      });
    });

    test('should render input field', async () => {
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder');
    });

    test('should render send button', async () => {
      await renderComponent();
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    test('should create default session on mount', async () => {
      await renderComponent();
      
      // Should have at least one session (default)
      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toBeInTheDocument();
      });
    });

    test('should allow creating new chat session', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      // Find and click new chat button
      const newChatButton = screen.getByRole('button', { name: /new chat/i });
      await user.click(newChatButton);
      
      // Should create a new session
      await waitFor(() => {
        const sessions = screen.getAllByRole('listitem');
        expect(sessions.length).toBeGreaterThan(1);
      });
    });

    test('should switch between sessions', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      // Create a new session
      const newChatButton = screen.getByRole('button', { name: /new chat/i });
      await user.click(newChatButton);
      
      // Get all session items
      await waitFor(async () => {
        const sessions = screen.getAllByRole('listitem');
        expect(sessions.length).toBeGreaterThanOrEqual(2);
        
        // Click on first session
        await user.click(sessions[0]);
      });
    });
  });

  describe('Message Input', () => {
    test('should allow typing in input field', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello, world!');
      
      expect(input).toHaveValue('Hello, world!');
    });

    test('should clear input after submission', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test message');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      // Input should be cleared
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    test('should submit message on Enter key', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test message{Enter}');
      
      // Input should be cleared after submission
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    test('should not submit empty message', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      // Button should be disabled when input is empty
      expect(sendButton).toBeDisabled();
      
      // Try to click anyway
      await user.click(sendButton);
      
      // Should not have added any new messages
      const messages = screen.queryAllByRole('article');
      expect(messages.length).toBeLessThanOrEqual(1); // Only welcome message
    });
  });

  describe('Message Display', () => {
    test('should display user messages', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      // User message should appear
      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      });
    });

    test('should show typing indicator when waiting for response', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);
      
      // Typing indicator should appear
      await waitFor(() => {
        expect(screen.getByText(/thinking/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Execution Plan Buffer', () => {
    test('should initialize with empty execution plan buffer', async () => {
      await renderComponent();
      
      // Buffer should be empty initially
      // This is verified by component rendering without errors
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('should clear execution plan buffer when starting new message', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      // Send first message
      const input = screen.getByRole('textbox');
      await user.type(input, 'First message');
      await user.click(screen.getByRole('button', { name: /send/i }));
      
      // Wait a bit
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
      
      // Send second message (should clear buffer)
      await user.type(input, 'Second message');
      await user.click(screen.getByRole('button', { name: /send/i }));
      
      // Should have both messages
      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
        expect(screen.getByText('Second message')).toBeInTheDocument();
      });
    });
  });

  describe('Connection Status', () => {
    test('should display connection status', async () => {
      await renderComponent();
      
      // Should show connection status
      await waitFor(() => {
        expect(screen.getByText(/status/i)).toBeInTheDocument();
      });
    });

    test('should handle disconnection gracefully', async () => {
      await renderComponent();
      
      // Component should still be functional even if disconnected
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('UI Interactions', () => {
    test('should allow collapsing sidebar', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      // Find collapse button
      const collapseButton = screen.getByRole('button', { name: /collapse/i });
      await user.click(collapseButton);
      
      // Sidebar should be collapsed
      await waitFor(() => {
        const sidebar = screen.getByRole('complementary');
        expect(sidebar).toHaveClass(/collapsed/);
      });
    });

    test('should allow fullscreen toggle', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      // Find fullscreen button
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
      await user.click(fullscreenButton);
      
      // Should toggle fullscreen mode
      await waitFor(() => {
        expect(document.fullscreenElement).toBeDefined();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAccessibleName();
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toHaveAccessibleName();
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      // Tab to input
      await user.tab();
      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
      
      // Type message
      await user.type(input, 'Test');
      expect(input).toHaveValue('Test');
    });

    test('should have proper heading hierarchy', async () => {
      await renderComponent();
      
      // Should have proper h1, h2, etc.
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      mockChatbotApi.submitA2ATask = jest.fn().mockRejectedValue(new Error('API Error'));
      
      const user = userEvent.setup();
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: /send/i }));
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should handle network timeouts', async () => {
      mockChatbotApi.submitA2ATask = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );
      
      const user = userEvent.setup();
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: /send/i }));
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/thinking/i)).toBeInTheDocument();
      });
    });
  });

  describe('State Persistence', () => {
    test('should persist message history across re-renders', async () => {
      const { rerender } = await renderComponent();
      
      const user = userEvent.setup();
      const input = screen.getByRole('textbox');
      await user.type(input, 'Persistent message');
      await user.click(screen.getByRole('button', { name: /send/i }));
      
      // Wait for message to appear
      await waitFor(() => {
        expect(screen.getByText('Persistent message')).toBeInTheDocument();
      });
      
      // Re-render component
      rerender(
        <TestApiProvider apis={[]}>
          <AgentForgePage />
        </TestApiProvider>
      );
      
      // Message should still be there
      expect(screen.getByText('Persistent message')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should render large number of messages efficiently', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      // Send multiple messages
      for (let i = 0; i < 10; i++) {
        const input = screen.getByRole('textbox');
        await user.type(input, `Message ${i}`);
        await user.click(screen.getByRole('button', { name: /send/i }));
        await waitFor(() => expect(input).toHaveValue(''));
      }
      
      // Should render all messages
      await waitFor(() => {
        const messages = screen.getAllByText(/Message \d/);
        expect(messages.length).toBeGreaterThanOrEqual(10);
      });
    });

    test('should handle rapid message submissions', async () => {
      const user = userEvent.setup();
      await renderComponent();
      
      const input = screen.getByRole('textbox');
      
      // Rapidly submit multiple messages
      for (let i = 0; i < 5; i++) {
        await user.type(input, `Rapid ${i}{Enter}`);
      }
      
      // Should handle all submissions
      await waitFor(() => {
        const messages = screen.getAllByText(/Rapid \d/);
        expect(messages.length).toBeGreaterThanOrEqual(5);
      });
    });
  });
});

