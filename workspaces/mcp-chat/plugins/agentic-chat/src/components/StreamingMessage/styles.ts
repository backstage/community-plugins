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

import { Theme, SxProps } from '@mui/material/styles';
import {
  getSharedMarkdownSx,
  surfaceOverlay,
  codeBlockBackground,
} from '../../theme/markdown';

/**
 * Keyframe animations for StreamingMessage
 */
export const streamingAnimations = {
  spin: {
    '@keyframes spin': {
      '100%': { transform: 'rotate(360deg)' },
    },
  },
  bounce: {
    '@keyframes bounce': {
      '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
      '40%': { transform: 'scale(1)', opacity: 1 },
    },
  },
  blink: {
    '@keyframes blink': {
      '0%, 50%': { opacity: 1 },
      '51%, 100%': { opacity: 0 },
    },
  },
};

/**
 * Main container styles — matches ChatMessage getMessageWrapperSx for
 * assistant messages so layout does not shift on completion.
 */
export const getContainerSx = (): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.5,
  width: '100%',
});

/**
 * Avatar styles with optional spinner
 */
export const getAvatarSx = (
  theme: Theme,
  _phaseColor: string,
  _isCompleted: boolean,
): SxProps<Theme> => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  flexShrink: 0,
});

/**
 * Content container styles
 */
export const getContentContainerSx = (_theme: Theme): SxProps<Theme> => ({
  p: 0,
  borderRadius: 0,
  bgcolor: 'transparent',
  border: 'none',
  minHeight: 40,
});

/**
 * Phase chip styles
 */
export const getPhaseChipSx = (color: string): SxProps<Theme> => ({
  height: 20,
  fontSize: '0.75rem',
  fontWeight: 600,
  bgcolor: `${color}20`,
  color: color,
  border: `1px solid ${color}40`,
  '& .MuiChip-label': { px: 1 },
});

/**
 * Semantic colors for tool status (passed from branding)
 */
export interface StatusColors {
  success: string;
  error: string;
  primary: string;
}

/**
 * Build default status colors from theme palette
 */
function getDefaultStatusColors(theme: Theme): StatusColors {
  return {
    success: theme.palette.success.dark,
    error: theme.palette.error.main,
    primary: theme.palette.primary.dark,
  };
}

/**
 * Tool call container styles
 */
export const getToolCallContainerSx = (
  theme: Theme,
  status: string,
  colors?: StatusColors,
): SxProps<Theme> => {
  const c = colors || getDefaultStatusColors(theme);
  const borderColor = (() => {
    if (status === 'completed') return `${c.success}30`;
    if (status === 'failed') return `${c.error}30`;
    return `${c.primary}30`;
  })();

  return {
    mb: 1.5,
    p: 1.5,
    borderRadius: 2,
    bgcolor: surfaceOverlay(theme, 'faint'),
    border: `1px solid ${borderColor}`,
  };
};

/**
 * Code block styles for arguments/output
 */
export const getCodeBlockSx = (theme: Theme): SxProps<Theme> => ({
  p: 1,
  borderRadius: 1,
  bgcolor: codeBlockBackground(theme),
  border: `1px solid ${theme.palette.divider}`,
});

/**
 * Markdown content styles for streaming messages.
 * Delegates to the shared implementation in theme/markdown.ts
 * so text does not reflow when streaming completes.
 */
export const getMarkdownContentSx = (theme: Theme): SxProps<Theme> =>
  getSharedMarkdownSx(theme, false);

/**
 * Typing cursor styles
 */
export const getTypingCursorSx = (): SxProps<Theme> => ({
  display: 'inline-block',
  width: 2,
  height: '1em',
  bgcolor: 'primary.main',
  ml: 0.25,
  animation: 'blink 0.8s infinite',
  verticalAlign: 'text-bottom',
  ...streamingAnimations.blink,
});

/**
 * Loading dots styles
 */
export const getLoadingDotSx = (
  color: string,
  delay: number,
): SxProps<Theme> => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  bgcolor: color,
  animation: 'bounce 1.4s infinite',
  animationDelay: `${delay}s`,
  ...streamingAnimations.bounce,
});

/**
 * Progress bar styles
 */
export const getProgressBarSx = (
  theme: Theme,
  color: string,
): SxProps<Theme> => ({
  mt: 1.5,
  height: 2,
  borderRadius: 1,
  bgcolor: surfaceOverlay(theme, 'medium'),
  '& .MuiLinearProgress-bar': {
    bgcolor: color,
  },
});

/**
 * Server label chip styles
 * @param color - Color from branding (defaults to theme.palette.success.main)
 * @param theme - MUI theme (required when color is not provided)
 */
export const getServerLabelChipSx = (
  theme: Theme,
  color?: string,
): SxProps<Theme> => {
  const c = color ?? theme.palette.success.main;
  return {
    height: 18,
    fontSize: '0.75rem',
    bgcolor: `${c}15`,
    color: c,
    fontWeight: 600,
  };
};

/**
 * Result count chip styles
 * @param color - Color from branding (defaults to theme.palette.info.main)
 * @param theme - MUI theme (required when color is not provided)
 */
export const getResultCountChipSx = (
  theme: Theme,
  color?: string,
): SxProps<Theme> => {
  const c = color ?? theme.palette.info.main;
  return {
    height: 18,
    fontSize: '0.75rem',
    bgcolor: `${c}15`,
    color: c,
  };
};
