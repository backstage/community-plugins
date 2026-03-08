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

import { useCallback, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import {
  getDialogContainerSx,
  getHeaderSx,
  getSeverityLabelSx,
  getServerLabelSx,
} from './styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BuildIcon from '@mui/icons-material/Build';
import {
  ToolArgumentsEditor,
  type ToolArgumentsEditorState,
} from './ToolArgumentsEditor';
import { useApprovalKeyboardShortcuts } from './useApprovalKeyboardShortcuts';
import { ApprovalActionButtons } from './ApprovalActionButtons';

import { stripToolPrefix } from '../../utils';

/**
 * Pending tool approval from the backend
 */
export interface PendingApproval {
  approvalId: string;
  responseId: string;
  toolCall: {
    callId: string;
    name: string;
    serverLabel: string;
    arguments: string;
    parsedArguments: Record<string, unknown>;
  };
  requestedAt: string;
  confirmationMessage?: string;
  severity: 'info' | 'warning' | 'critical';
}

interface ToolApprovalDialogProps {
  pendingApproval: PendingApproval;
  onApprove: (approvalId: string, modifiedArguments?: string) => void;
  onReject: (approvalId: string, reason?: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

/**
 * ToolApprovalDialog - Human-in-the-Loop approval dialog for tool execution
 *
 * Features:
 * - Glassmorphism design matching the Agentic Chat theme
 * - Clear display of tool name, arguments, and severity
 * - Option to edit arguments before approval
 * - Approve/Reject buttons with keyboard shortcuts
 */
export function ToolApprovalDialog({
  pendingApproval,
  onApprove,
  onReject,
  isSubmitting = false,
  error = null,
}: ToolApprovalDialogProps) {
  const theme = useTheme();
  const [editorState, setEditorState] = useState<ToolArgumentsEditorState>({
    editedArguments: JSON.stringify(
      pendingApproval.toolCall.parsedArguments ?? {},
      null,
      2,
    ),
    isValidJson: true,
    showEditor: false,
  });

  // Reset editor when a different approval arrives
  useEffect(() => {
    setEditorState({
      editedArguments: JSON.stringify(
        pendingApproval.toolCall.parsedArguments ?? {},
        null,
        2,
      ),
      isValidJson: true,
      showEditor: false,
    });
  }, [pendingApproval.approvalId, pendingApproval.toolCall.parsedArguments]);

  const handleEditedChange = useCallback(
    (state: ToolArgumentsEditorState) => setEditorState(state),
    [],
  );

  const handleApprove = useCallback(() => {
    if (editorState.showEditor && editorState.isValidJson) {
      onApprove(pendingApproval.approvalId, editorState.editedArguments);
    } else {
      onApprove(pendingApproval.approvalId);
    }
  }, [
    pendingApproval.approvalId,
    onApprove,
    editorState.showEditor,
    editorState.isValidJson,
    editorState.editedArguments,
  ]);

  const handleReject = useCallback(() => {
    onReject(pendingApproval.approvalId, 'User rejected');
  }, [pendingApproval.approvalId, onReject]);

  useApprovalKeyboardShortcuts(handleApprove, handleReject, isSubmitting);

  // Severity-based styling - compact icons
  const getSeverityConfig = () => {
    switch (pendingApproval.severity) {
      case 'critical':
        return {
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          borderColor: alpha(theme.palette.error.main, 0.3),
          icon: (
            <WarningAmberIcon
              sx={{ color: theme.palette.error.main, fontSize: 16 }}
            />
          ),
          label: 'Destructive Operation',
        };
      case 'warning':
        return {
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          borderColor: alpha(theme.palette.warning.main, 0.3),
          icon: (
            <WarningAmberIcon
              sx={{ color: theme.palette.warning.main, fontSize: 16 }}
            />
          ),
          label: 'Requires Approval',
        };
      default:
        return {
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, 0.1),
          borderColor: alpha(theme.palette.info.main, 0.3),
          icon: (
            <BuildIcon sx={{ color: theme.palette.info.main, fontSize: 16 }} />
          ),
          label: 'Tool Execution',
        };
    }
  };

  const severityConfig = getSeverityConfig();

  return (
    <Box sx={getDialogContainerSx(theme, severityConfig.color)}>
      <Box sx={getHeaderSx()}>
        {severityConfig.icon}
        <Typography
          variant="subtitle2"
          sx={getSeverityLabelSx(severityConfig.color)}
        >
          {severityConfig.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            ...(getServerLabelSx(theme) as Record<string, unknown>),
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {pendingApproval.toolCall.serverLabel}
        </Typography>
      </Box>

      {/* Clean tool name and arguments */}
      <ToolArgumentsEditor
        toolName={stripToolPrefix(
          pendingApproval.toolCall.name,
          pendingApproval.toolCall.serverLabel,
        )}
        parsedArguments={pendingApproval.toolCall.parsedArguments ?? {}}
        approvalId={pendingApproval.approvalId}
        onEditedChange={handleEditedChange}
      />

      {/* Custom message - compact */}
      {pendingApproval.confirmationMessage && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(severityConfig.color, 0.08),
            color: theme.palette.text.secondary,
            borderLeft: `2px solid ${severityConfig.color}`,
            fontSize: '0.75rem',
          }}
        >
          {pendingApproval.confirmationMessage}
        </Typography>
      )}

      {/* Action buttons */}
      <ApprovalActionButtons
        onApprove={handleApprove}
        onReject={handleReject}
        isSubmitting={isSubmitting}
        approveDisabled={editorState.showEditor && !editorState.isValidJson}
      />

      {error && (
        <Typography
          variant="caption"
          sx={{
            color: 'error.main',
            mt: 1,
            textAlign: 'center',
            display: 'block',
          }}
        >
          {error}
        </Typography>
      )}

      {/* Keyboard hints - minimal */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mt: 1.5,
          pt: 1,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.disabled,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            component="kbd"
            aria-label="Enter key"
            sx={{
              px: 0.5,
              py: 0.1,
              borderRadius: 0.5,
              bgcolor: alpha(theme.palette.action.active, 0.05),
              fontFamily: 'monospace',
              fontSize: '0.6rem',
            }}
          >
            ↵
          </Box>
          approve
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.disabled,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            component="kbd"
            aria-label="Escape key"
            sx={{
              px: 0.5,
              py: 0.1,
              borderRadius: 0.5,
              bgcolor: alpha(theme.palette.action.active, 0.05),
              fontFamily: 'monospace',
              fontSize: '0.6rem',
            }}
          >
            esc
          </Box>
          reject
        </Typography>
      </Box>
    </Box>
  );
}
