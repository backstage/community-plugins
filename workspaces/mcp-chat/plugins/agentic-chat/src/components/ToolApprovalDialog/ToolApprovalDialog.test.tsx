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
import { TestApiProvider } from '@backstage/test-utils';
import { ToolApprovalDialog, PendingApproval } from './ToolApprovalDialog';
import { agenticChatApiRef, type AgenticChatApi } from '../../api';

const theme = createTheme();

const mockApi: Partial<AgenticChatApi> = {
  getBranding: jest.fn().mockResolvedValue({
    appName: 'Agentic Chat',
    tagline: 'Test',
    inputPlaceholder: 'Test',
    primaryColor: '#9333ea',
    secondaryColor: '#8b5cf6',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    infoColor: '#0ea5e9',
  }),
};

const basePendingApproval: PendingApproval = {
  approvalId: 'approval-123',
  responseId: 'response-456',
  toolCall: {
    callId: 'call-789',
    name: 'get_pods',
    serverLabel: 'k8s-server',
    arguments: '{"namespace":"default"}',
    parsedArguments: { namespace: 'default' },
  },
  requestedAt: new Date().toISOString(),
  severity: 'info',
};

const renderDialog = (
  props: Partial<{
    pendingApproval: PendingApproval;
    onApprove: (approvalId: string, modifiedArguments?: string) => void;
    onReject: (approvalId: string, reason?: string) => void;
    isSubmitting: boolean;
  }> = {},
) => {
  const defaultProps = {
    pendingApproval: basePendingApproval,
    onApprove: jest.fn(),
    onReject: jest.fn(),
    isSubmitting: false,
    ...props,
  };

  return render(
    <TestApiProvider apis={[[agenticChatApiRef, mockApi as AgenticChatApi]]}>
      <ThemeProvider theme={theme}>
        <ToolApprovalDialog {...defaultProps} />
      </ThemeProvider>
    </TestApiProvider>,
  );
};

describe('ToolApprovalDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should display tool name', () => {
      renderDialog();
      expect(screen.getByText('get_pods')).toBeInTheDocument();
    });

    it('should display server label', () => {
      renderDialog();
      expect(screen.getByText('k8s-server')).toBeInTheDocument();
    });

    it('should display parsed arguments', () => {
      renderDialog();
      expect(screen.getByText('namespace:')).toBeInTheDocument();
      expect(screen.getByText('default')).toBeInTheDocument();
    });

    it('should display approve and reject buttons', () => {
      renderDialog();
      expect(
        screen.getByRole('button', { name: /approve/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reject/i }),
      ).toBeInTheDocument();
    });

    it('should display keyboard hints', () => {
      renderDialog();
      expect(screen.getByText('approve')).toBeInTheDocument();
      expect(screen.getByText('reject')).toBeInTheDocument();
    });
  });

  describe('severity levels', () => {
    it('should display info severity styling', () => {
      renderDialog({
        pendingApproval: { ...basePendingApproval, severity: 'info' },
      });
      expect(screen.getByText('Tool Execution')).toBeInTheDocument();
    });

    it('should display warning severity styling', () => {
      renderDialog({
        pendingApproval: { ...basePendingApproval, severity: 'warning' },
      });
      expect(screen.getByText('Requires Approval')).toBeInTheDocument();
    });

    it('should display critical severity styling', () => {
      renderDialog({
        pendingApproval: { ...basePendingApproval, severity: 'critical' },
      });
      expect(screen.getByText('Destructive Operation')).toBeInTheDocument();
    });
  });

  describe('confirmation message', () => {
    it('should display confirmation message when provided', () => {
      renderDialog({
        pendingApproval: {
          ...basePendingApproval,
          confirmationMessage: 'Are you sure you want to proceed?',
        },
      });
      expect(
        screen.getByText('Are you sure you want to proceed?'),
      ).toBeInTheDocument();
    });

    it('should not display confirmation message when not provided', () => {
      renderDialog();
      expect(
        screen.queryByText('Are you sure you want to proceed?'),
      ).not.toBeInTheDocument();
    });
  });

  describe('approve action', () => {
    it('should call onApprove when clicking approve button', async () => {
      const onApprove = jest.fn();
      renderDialog({ onApprove });

      await userEvent.click(screen.getByRole('button', { name: /approve/i }));

      expect(onApprove).toHaveBeenCalledWith('approval-123');
    });

    it('should call onApprove when pressing Enter key', async () => {
      const onApprove = jest.fn();
      renderDialog({ onApprove });

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(onApprove).toHaveBeenCalledWith('approval-123');
    });

    it('should not call onApprove when typing in editor', async () => {
      const onApprove = jest.fn();
      renderDialog({ onApprove });

      // Open editor
      const editButton = screen.getByRole('button', {
        name: 'Edit arguments',
      });
      await userEvent.click(editButton);

      // Find the textarea and type in it
      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'test');

      // Press Enter in textarea
      fireEvent.keyDown(textarea, { key: 'Enter' });

      // onApprove should NOT be called because we're in the editor
      expect(onApprove).not.toHaveBeenCalled();
    });
  });

  describe('reject action', () => {
    it('should call onReject when clicking reject button', async () => {
      const onReject = jest.fn();
      renderDialog({ onReject });

      await userEvent.click(screen.getByRole('button', { name: /reject/i }));

      expect(onReject).toHaveBeenCalledWith('approval-123', 'User rejected');
    });

    it('should call onReject when pressing Escape key', async () => {
      const onReject = jest.fn();
      renderDialog({ onReject });

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onReject).toHaveBeenCalledWith('approval-123', 'User rejected');
    });
  });

  describe('argument editing', () => {
    it('should toggle editor when clicking edit button', async () => {
      renderDialog();

      // Editor should be collapsed initially
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      // Click edit button
      const editButton = screen.getByRole('button', {
        name: 'Edit arguments',
      });
      await userEvent.click(editButton);

      // Editor should be visible
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should show JSON in editor', async () => {
      renderDialog();

      const editButton = screen.getByRole('button', {
        name: 'Edit arguments',
      });
      await userEvent.click(editButton);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      // The textarea contains formatted JSON
      expect(textarea.value).toContain('namespace');
    });

    it('should validate JSON and show error for invalid JSON', async () => {
      renderDialog();

      const editButton = screen.getByRole('button', {
        name: 'Edit arguments',
      });
      await userEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      await userEvent.clear(textarea);
      // Use fireEvent for special characters
      fireEvent.change(textarea, { target: { value: 'invalid json' } });

      expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
    });

    it('should disable approve button when JSON is invalid', async () => {
      renderDialog();

      const editButton = screen.getByRole('button', {
        name: 'Edit arguments',
      });
      await userEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'not valid json' } });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      expect(approveButton).toBeDisabled();
    });

    it('should pass modified arguments when approving', async () => {
      const onApprove = jest.fn();
      renderDialog({ onApprove });

      const editButton = screen.getByRole('button', {
        name: 'Edit arguments',
      });
      await userEvent.click(editButton);

      const textarea = screen.getByRole('textbox');
      // Use fireEvent.change for JSON with special characters
      fireEvent.change(textarea, {
        target: { value: '{"namespace":"production"}' },
      });

      await userEvent.click(screen.getByRole('button', { name: /approve/i }));

      expect(onApprove).toHaveBeenCalledWith(
        'approval-123',
        '{"namespace":"production"}',
      );
    });
  });

  describe('submitting state', () => {
    it('should disable buttons when submitting', () => {
      renderDialog({ isSubmitting: true });

      expect(screen.getByRole('button', { name: /running/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled();
    });

    it('should show loading indicator when submitting', () => {
      renderDialog({ isSubmitting: true });

      expect(
        screen.getByRole('button', { name: /running/i }),
      ).toBeInTheDocument();
    });

    it('should not respond to keyboard shortcuts when submitting', () => {
      const onApprove = jest.fn();
      const onReject = jest.fn();
      renderDialog({ onApprove, onReject, isSubmitting: true });

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onApprove).not.toHaveBeenCalled();
      expect(onReject).not.toHaveBeenCalled();
    });
  });

  describe('complex arguments', () => {
    it('should handle nested object arguments', () => {
      const complexApproval: PendingApproval = {
        ...basePendingApproval,
        toolCall: {
          ...basePendingApproval.toolCall,
          parsedArguments: {
            config: { replicas: 3, image: 'nginx:latest' },
            labels: { app: 'test' },
          },
        },
      };
      renderDialog({ pendingApproval: complexApproval });

      expect(screen.getByText('config:')).toBeInTheDocument();
      expect(screen.getByText('labels:')).toBeInTheDocument();
    });

    it('should handle array arguments', () => {
      const arrayApproval: PendingApproval = {
        ...basePendingApproval,
        toolCall: {
          ...basePendingApproval.toolCall,
          parsedArguments: {
            pods: ['pod-1', 'pod-2', 'pod-3'],
          },
        },
      };
      renderDialog({ pendingApproval: arrayApproval });

      expect(screen.getByText('pods:')).toBeInTheDocument();
    });

    it('should render without crashing when parsedArguments is null', () => {
      const nullArgsApproval: PendingApproval = {
        ...basePendingApproval,
        toolCall: {
          ...basePendingApproval.toolCall,
          parsedArguments: null as unknown as Record<string, unknown>,
        },
      };
      renderDialog({ pendingApproval: nullArgsApproval });

      expect(screen.getByText('get_pods')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /approve/i }),
      ).toBeInTheDocument();
    });

    it('should render without crashing when parsedArguments is undefined', () => {
      const undefinedArgsApproval: PendingApproval = {
        ...basePendingApproval,
        toolCall: {
          ...basePendingApproval.toolCall,
          parsedArguments: undefined as unknown as Record<string, unknown>,
        },
      };
      renderDialog({ pendingApproval: undefinedArgsApproval });

      expect(screen.getByText('get_pods')).toBeInTheDocument();
    });
  });
});
