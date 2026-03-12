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

import { Theme, alpha, SxProps } from '@mui/material/styles';
import {
  getSharedMarkdownSx,
  surfaceOverlay,
  subtleBorder,
  codeBlockBackground,
} from '../../theme/markdown';

/**
 * Keyframe animations used in ChatMessage
 */
export const animations = {
  fadeInUp: {
    '@keyframes fadeInUp': {
      '0%': { opacity: 0, transform: 'translateY(10px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  },
  bounce: {
    '@keyframes bounce': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-3px)' },
    },
  },
};

/**
 * Creates message container styles
 */
export const getMessageContainerSx = (isUser: boolean): SxProps<Theme> => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: isUser ? 'flex-end' : 'flex-start',
  mb: 2.5,
  animation: 'fadeInUp 0.25s ease-out',
  ...animations.fadeInUp,
});

/**
 * Creates message wrapper styles
 */
export const getMessageWrapperSx = (isUser: boolean): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.5,
  maxWidth: isUser ? '75%' : '100%',
  width: isUser ? 'auto' : '100%',
  flexDirection: isUser ? 'row-reverse' : 'row',
});

/**
 * Creates avatar styles
 */
export const getAvatarSx = (theme: Theme, isUser: boolean): SxProps<Theme> => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  backgroundColor: isUser
    ? alpha(theme.palette.text.primary, 0.08)
    : theme.palette.primary.main,
  color: isUser
    ? theme.palette.text.secondary
    : theme.palette.primary.contrastText,
});

/**
 * Creates message label styles
 */
export const getMessageLabelSx = (
  theme: Theme,
  isUser: boolean,
): SxProps<Theme> => ({
  color: theme.palette.text.secondary,
  fontWeight: 600,
  mb: 0.5,
  fontSize: '0.8125rem',
  display: 'block',
  textAlign: isUser ? 'right' : 'left',
});

/**
 * Creates message paper (bubble) styles
 */
export const getMessagePaperSx = (
  theme: Theme,
  isUser: boolean,
): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  if (isUser) {
    return {
      py: 1.5,
      px: 2,
      borderRadius: '16px',
      backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.12 : 0.06),
      color: theme.palette.text.primary,
      border: 'none',
      boxShadow: 'none',
    };
  }

  return {
    p: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    border: 'none',
    boxShadow: 'none',
  };
};

/**
 * Markdown content styles for chat messages.
 * Delegates to the shared implementation in theme/markdown.ts
 * so text does not reflow when a streaming response becomes a ChatMessage.
 */
export const getMarkdownContentSx = (
  theme: Theme,
  isUser: boolean,
): SxProps<Theme> => getSharedMarkdownSx(theme, isUser);

/**
 * Creates collapsible section header styles
 */
export const getCollapsibleHeaderSx = (): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
});

/**
 * Creates tool call container styles
 */
export const getToolCallContainerSx = (
  theme: Theme,
  hasError: boolean,
): SxProps<Theme> => {
  const borderColor = hasError
    ? `${theme.palette.error.main}30`
    : `${theme.palette.success.main}30`;

  return {
    p: 1.5,
    mb: 1,
    borderRadius: 2,
    backgroundColor: surfaceOverlay(theme, 'subtle'),
    border: `1px solid ${borderColor}`,
  };
};

/**
 * Creates code block styles for tool arguments/output
 */
export const getCodeBlockSx = (theme: Theme): SxProps<Theme> => ({
  p: 1,
  borderRadius: 1,
  backgroundColor: codeBlockBackground(theme),
  border: `1px solid ${theme.palette.divider}`,
});

/**
 * Creates RAG source container styles
 */
export const getRagSourceSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    p: 1.5,
    borderRadius: 1,
    backgroundColor: alpha(theme.palette.info.main, isDark ? 0.08 : 0.04),
    border: `1px solid ${alpha(theme.palette.info.main, isDark ? 0.2 : 0.15)}`,
  };
};

/**
 * Creates scroll indicator overlay styles
 */
export const getScrollIndicatorOverlaySx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    borderRadius: '0 0 20px 4px',
    background: isDark
      ? 'linear-gradient(to top, rgba(30,30,30,0.95) 0%, rgba(30,30,30,0.7) 40%, transparent 100%)'
      : 'linear-gradient(to top, rgba(250,250,250,0.98) 0%, rgba(250,250,250,0.7) 40%, transparent 100%)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    pb: 1,
    pointerEvents: 'none',
  };
};

/**
 * Creates scroll indicator pill styles
 */
export const getScrollIndicatorPillSx = (theme: Theme): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1.5,
  py: 0.5,
  borderRadius: '12px',
  backgroundColor: surfaceOverlay(theme, 'strong'),
  border: `1px solid ${subtleBorder(theme, 'strong')}`,
  animation: 'bounce 1.5s ease-in-out infinite',
  ...animations.bounce,
});

/**
 * Creates action button styles (copy, regenerate, feedback)
 */
export const getActionButtonSx = (
  theme: Theme,
  isActive: boolean = false,
): SxProps<Theme> => ({
  width: 28,
  height: 28,
  borderRadius: 1,
  backgroundColor: isActive
    ? alpha(theme.palette.primary.main, 0.08)
    : 'transparent',
  color: isActive ? theme.palette.primary.main : theme.palette.text.disabled,
  transition: 'color 0.15s ease, background-color 0.15s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.06),
    color: theme.palette.text.primary,
  },
});

/**
 * Creates action buttons container styles
 */
export const getActionButtonsContainerSx = (
  isHovered: boolean,
): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  opacity: isHovered ? 1 : 0,
  transform: isHovered ? 'translateY(0)' : 'translateY(-4px)',
  transition: 'all 0.2s ease-in-out',
  pointerEvents: isHovered ? 'auto' : 'none',
  '&:focus-within': {
    opacity: 1,
    transform: 'translateY(0)',
    pointerEvents: 'auto',
  },
});

/**
 * Creates timestamp styles
 */
export const getTimestampSx = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.text.disabled,
  fontSize: '0.75rem',
});

/**
 * Creates user timestamp styles
 */
export const getUserTimestampSx = (theme: Theme): SxProps<Theme> => ({
  mt: 0.5,
  mr: 7,
  alignSelf: 'flex-end',
  color: theme.palette.text.disabled,
  fontSize: '0.75rem',
});
