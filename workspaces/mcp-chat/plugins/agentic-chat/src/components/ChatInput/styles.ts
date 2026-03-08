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

import { Theme, SxProps, alpha } from '@mui/material/styles';

/**
 * Helper functions for button styling — use theme palette tokens
 */
export const getSendButtonBackground = (
  isTyping: boolean,
  isDark: boolean,
  theme: Theme,
): string => {
  if (isTyping) {
    return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  }
  const main = theme.palette.success.main;
  const dark = theme.palette.success.dark;
  return isDark
    ? `linear-gradient(135deg, ${alpha(main, 0.2)} 0%, ${alpha(
        dark,
        0.15,
      )} 100%)`
    : `linear-gradient(135deg, ${alpha(main, 0.12)} 0%, ${alpha(
        dark,
        0.08,
      )} 100%)`;
};

export const getSendButtonBorder = (
  isTyping: boolean,
  isDark: boolean,
  dividerColor: string,
  theme: Theme,
): string => {
  if (isTyping) {
    return dividerColor;
  }
  return alpha(theme.palette.success.main, isDark ? 0.4 : 0.35);
};

export const getSendButtonShadow = (
  isTyping: boolean,
  isDark: boolean,
  theme: Theme,
): string => {
  if (isTyping) {
    return 'none';
  }
  const shadowColor = alpha(theme.palette.success.main, isDark ? 0.25 : 0.2);
  return isDark
    ? `0 4px 16px ${shadowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
    : `0 4px 16px ${shadowColor}, inset 0 1px 0 rgba(255,255,255,0.9)`;
};

export const getInnerCircleBackground = (
  isTyping: boolean,
  isDark: boolean,
  theme: Theme,
): string => {
  if (isTyping) {
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  }
  return `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`;
};

function getNewChatButtonBg(
  isTyping: boolean,
  isDark: boolean,
  theme: Theme,
): string {
  if (isTyping) return isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  return theme.palette.success.main;
}

function getNewChatButtonBorder(
  isTyping: boolean,
  isDark: boolean,
  theme: Theme,
): string {
  if (isTyping) return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  return theme.palette.success.main;
}

function getNewChatButtonHoverBg(
  isTyping: boolean,
  isDark: boolean,
  theme: Theme,
): string {
  if (isTyping) return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  return theme.palette.success.dark;
}

function getNewChatButtonHoverBorder(
  isTyping: boolean,
  isDark: boolean,
  theme: Theme,
): string {
  if (isTyping) return isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  return theme.palette.success.dark;
}

/**
 * ChatInput component styles factory
 */
export const createChatInputStyles = (theme: Theme, isTyping: boolean) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    /** Outer container */
    container: {
      px: { xs: 2, sm: 3, md: 4 },
      py: 2,
      background: 'transparent',
      flexShrink: 0,
    } as SxProps<Theme>,

    /** Centered wrapper — matches the message area maxWidth so the "+"
        button left-aligns with message avatars above. */
    centeredWrapper: {
      maxWidth: '1200px',
      width: '100%',
      mx: 'auto',
    } as SxProps<Theme>,

    /** Input row */
    inputRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    } as SxProps<Theme>,

    /** New chat button */
    newChatButton: {
      '&.MuiIconButton-root': {
        width: 40,
        height: 40,
        borderRadius: '50%',
        flexShrink: 0,
        backgroundColor: getNewChatButtonBg(isTyping, isDark, theme),
        border: `1px solid ${getNewChatButtonBorder(isTyping, isDark, theme)}`,
        color: isTyping
          ? theme.palette.text.disabled
          : theme.palette.success.contrastText,
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: getNewChatButtonHoverBg(isTyping, isDark, theme),
          borderColor: getNewChatButtonHoverBorder(isTyping, isDark, theme),
        },
        '&.Mui-disabled': {
          opacity: 0.4,
        },
      },
    } as SxProps<Theme>,

    /** New chat icon */
    newChatIcon: {
      fontSize: 18,
    } as SxProps<Theme>,

    /** Input pill container */
    inputPill: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      py: 0.75,
      px: 2,
      borderRadius: '28px',
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(255, 255, 255, 0.95)',
      border: `1px solid ${
        isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
      }`,
      boxShadow: isDark
        ? '0 1px 3px rgba(0,0,0,0.2)'
        : '0 1px 3px rgba(0,0,0,0.08)',
      transition: 'all 0.2s ease',
      '&:focus-within': {
        borderColor: alpha(theme.palette.primary.dark, isDark ? 0.6 : 0.4),
        boxShadow: `0 0 0 2px ${alpha(
          theme.palette.primary.dark,
          isDark ? 0.2 : 0.12,
        )}`,
      },
    } as SxProps<Theme>,

    /** Sparkle icon */
    sparkleIcon: {
      color: theme.palette.text.secondary,
      fontSize: 18,
      opacity: 0.5,
      flexShrink: 0,
    } as SxProps<Theme>,

    /** Text field */
    textField: {
      flex: 1,
      '& .MuiOutlinedInput-root': {
        padding: 0,
        fontSize: '0.9rem',
        lineHeight: 1.5,
        color: theme.palette.text.primary,
        '& fieldset': { border: 'none' },
      },
      '& .MuiInputBase-input': {
        padding: '8px 0',
        minHeight: '20px',
        color: theme.palette.text.primary,
        fontWeight: 400,
        '&::placeholder': {
          color: theme.palette.text.secondary,
          opacity: isDark ? 0.7 : 0.6,
          fontWeight: 400,
        },
      },
    } as SxProps<Theme>,

    /** Stop button */
    stopButton: {
      '&.MuiIconButton-root': {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        width: 36,
        height: 36,
        borderRadius: '50%',
        flexShrink: 0,
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: theme.palette.error.dark,
        },
      },
    } as SxProps<Theme>,

    /** Send button (dynamic based on input value) */
    createSendButton: (hasValue: boolean): SxProps<Theme> => {
      const inactiveBackground = isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.06)';
      const inactiveHoverBackground = isDark
        ? 'rgba(255,255,255,0.12)'
        : 'rgba(0,0,0,0.1)';
      return {
        '&.MuiIconButton-root': {
          backgroundColor: hasValue
            ? theme.palette.primary.main
            : inactiveBackground,
          color: hasValue
            ? theme.palette.primary.contrastText
            : theme.palette.text.disabled,
          width: 36,
          height: 36,
          borderRadius: '50%',
          flexShrink: 0,
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: hasValue
              ? theme.palette.primary.dark
              : inactiveHoverBackground,
          },
        },
      };
    },
  };
};

export type ChatInputStyles = ReturnType<typeof createChatInputStyles>;
