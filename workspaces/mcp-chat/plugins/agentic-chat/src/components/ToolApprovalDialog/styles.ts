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

/**
 * ToolApprovalDialog Styles
 *
 * Style factories for the human-in-the-loop approval dialog.
 */

import { Theme, alpha, SxProps } from '@mui/material/styles';

// =============================================================================
// CONTAINER STYLES
// =============================================================================

/**
 * Main dialog container with glassmorphism effect
 */
export const getDialogContainerSx = (
  theme: Theme,
  accentColor: string,
): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    background: alpha(theme.palette.background.paper, isDark ? 0.97 : 0.98),
    border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.6 : 0.8)}`,
    borderRadius: 3,
    boxShadow: isDark
      ? `0 8px 32px ${alpha(
          theme.palette.common.black,
          0.4,
        )}, 0 0 0 1px ${alpha(theme.palette.common.white, 0.03)}`
      : `0 8px 32px ${alpha(
          theme.palette.common.black,
          0.1,
        )}, 0 0 0 1px ${alpha(theme.palette.common.black, 0.02)}`,
    p: 2.5,
    position: 'relative',
    overflow: 'hidden',
    // Subtle left accent bar
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 16,
      bottom: 16,
      left: 0,
      width: '3px',
      borderRadius: '0 3px 3px 0',
      background: accentColor,
      opacity: 0.9,
    },
  };
};

// =============================================================================
// HEADER STYLES
// =============================================================================

/**
 * Dialog header row
 */
export const getHeaderSx = (): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mb: 2,
  pl: 1,
});

/**
 * Severity label typography
 */
export const getSeverityLabelSx = (color: string): SxProps<Theme> => ({
  fontWeight: 600,
  color,
  flex: 1,
  fontSize: '0.875rem',
});

/**
 * Server label chip
 */
export const getServerLabelSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    px: 1.5,
    py: 0.5,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.background.default, isDark ? 0.8 : 0.8),
    color: theme.palette.text.secondary,
    fontWeight: 500,
    fontSize: '0.7rem',
  };
};

// =============================================================================
// TOOL INFO STYLES
// =============================================================================

/**
 * Tool info section container
 */
export const getToolInfoSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    bgcolor: alpha(theme.palette.background.default, isDark ? 0.5 : 0.8),
    borderRadius: 2,
    p: 2,
    mb: 2,
  };
};

/**
 * Tool name typography
 */
export const getToolNameSx = (theme: Theme): SxProps<Theme> => {
  return {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontWeight: 600,
    color: theme.palette.text.primary,
    fontSize: '0.95rem',
  };
};

// =============================================================================
// ARGUMENTS SECTION STYLES
// =============================================================================

/**
 * Arguments section container
 */
export const getArgumentsSectionSx = (): SxProps<Theme> => ({
  mt: 1.5,
});

/**
 * Arguments code block
 */
export const getArgumentsCodeSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    mt: 0.75,
    p: 1.5,
    bgcolor: alpha(theme.palette.background.default, isDark ? 0.6 : 0.9),
    borderRadius: 1.5,
    border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.5 : 0.8)}`,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: '0.75rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    color: theme.palette.text.primary,
    maxHeight: 150,
    overflow: 'auto',
    '&::-webkit-scrollbar': { width: 6 },
    '&::-webkit-scrollbar-thumb': {
      bgcolor: alpha(theme.palette.text.secondary, 0.5),
      borderRadius: 3,
    },
  };
};

// =============================================================================
// BUTTON STYLES
// =============================================================================

/**
 * Button container row
 */
export const getButtonRowSx = (): SxProps<Theme> => ({
  display: 'flex',
  gap: 1.5,
  mt: 2,
});

/**
 * Approve button styles
 */
export const getApproveButtonSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    flex: 1,
    borderRadius: 2,
    py: 1,
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'none',
    bgcolor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    '&:hover': {
      bgcolor: theme.palette.success.dark,
    },
    '&:disabled': {
      bgcolor: alpha(theme.palette.success.main, isDark ? 0.3 : 0.4),
      color: alpha(theme.palette.success.contrastText, isDark ? 0.5 : 0.7),
    },
  };
};

/**
 * Reject button styles
 */
export const getRejectButtonSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    flex: 1,
    borderRadius: 2,
    py: 1,
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'none',
    bgcolor: alpha(theme.palette.text.secondary, isDark ? 0.2 : 0.12),
    color: theme.palette.text.primary,
    '&:hover': {
      bgcolor: alpha(theme.palette.text.secondary, isDark ? 0.3 : 0.2),
    },
    '&:disabled': {
      opacity: 0.5,
    },
  };
};

/**
 * Edit button styles
 */
export const getEditButtonSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    borderRadius: 2,
    py: 1,
    px: 1.5,
    fontWeight: 500,
    fontSize: '0.75rem',
    textTransform: 'none',
    color: theme.palette.text.secondary,
    border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.5 : 0.8)}`,
    '&:hover': {
      bgcolor: alpha(theme.palette.background.default, isDark ? 0.5 : 0.8),
      borderColor: alpha(theme.palette.divider, isDark ? 0.7 : 0.9),
    },
  };
};

// =============================================================================
// KEYBOARD HINT STYLES
// =============================================================================

/**
 * Keyboard hint container
 */
export const getKeyboardHintSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    display: 'flex',
    justifyContent: 'center',
    gap: 2,
    mt: 1.5,
    pt: 1.5,
    borderTop: `1px solid ${alpha(theme.palette.divider, isDark ? 0.4 : 0.6)}`,
  };
};

/**
 * Keyboard shortcut key styling
 */
export const getKeyboardKeySx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    px: 0.75,
    py: 0.25,
    borderRadius: 0.75,
    bgcolor: alpha(theme.palette.background.default, 0.8),
    border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.5 : 0.8)}`,
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    fontWeight: 600,
  };
};
