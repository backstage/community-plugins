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

import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { colors, borderRadius, shadows, transitions, spacing } from './tokens';

/**
 * Glass Panel - Elevated surface container
 */
export const GlassPanel = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    backgroundColor: isDark
      ? colors.surface.background
      : colors.surface.backgroundLight,
    border: `1px solid ${
      isDark ? colors.surface.border : colors.surface.borderLight
    }`,
    borderRadius: theme.spacing(borderRadius.lg),
    boxShadow: shadows.sm,
  };
});

/**
 * Glass Card - Clickable card with solid surface and hover effects
 */
export const GlassCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    backgroundColor: isDark
      ? colors.surface.background
      : colors.surface.backgroundLight,
    border: `1px solid ${
      isDark ? colors.surface.border : colors.surface.borderLight
    }`,
    borderRadius: theme.spacing(borderRadius.lg),
    boxShadow: shadows.sm,
    transition: transitions.normal,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: isDark
        ? colors.surface.backgroundHover
        : colors.surface.backgroundHoverLight,
      borderColor: isDark
        ? colors.surface.borderHover
        : colors.surface.borderHoverLight,
      transform: 'translateY(-2px)',
      boxShadow: shadows.md,
    },

    '&:active': {
      transform: 'translateY(0)',
    },
  };
});

/**
 * Gradient Button - Primary action button with solid brand color
 */
export const GradientButton = styled(Button)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    backgroundColor: colors.brand.primary,
    color: theme.palette.common.white,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: theme.spacing(borderRadius.sm),
    boxShadow: shadows.sm,
    transition: transitions.normal,

    '&:hover': {
      backgroundColor: colors.brand.primaryHover,
      boxShadow: shadows.md,
    },

    '&:active': {
      backgroundColor: colors.brand.primary,
    },

    '&:disabled': {
      background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
      boxShadow: 'none',
    },
  };
});

/**
 * Glass Icon Button - Subtle icon button
 */
export const GlassIconButton = styled(IconButton)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    backgroundColor: isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)',
    color: theme.palette.text.secondary,
    transition: transitions.normal,

    '&:hover': {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.08)',
      color: theme.palette.text.primary,
    },
  };
});

/**
 * Glass Input Container - Floating input area
 */
export const GlassInputContainer = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    backgroundColor: isDark
      ? colors.surface.background
      : colors.surface.backgroundLight,
    border: `1px solid ${
      isDark ? colors.surface.border : colors.surface.borderLight
    }`,
    borderRadius: theme.spacing(borderRadius.xxl),
    padding: theme.spacing(spacing.md),
    boxShadow: shadows.sm,
    transition: transitions.normal,

    '&:focus-within': {
      borderColor: colors.brand.primary,
      boxShadow: `0 0 0 2px ${alpha(colors.brand.primary, 0.15)}`,
    },
  };
});

/**
 * User Message Bubble - subtle background, doesn't overpower assistant text
 */
export const UserBubble = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    backgroundColor: isDark
      ? colors.chat.userBubbleDark
      : colors.chat.userBubble,
    color: theme.palette.text.primary,
    borderRadius: theme.spacing(borderRadius.md),
    padding: theme.spacing(spacing.md, spacing.lg),
    maxWidth: '80%',
    alignSelf: 'flex-end',
  };
});

/**
 * Assistant Message Bubble - clean, borderless, full-width
 */
export const AssistantBubble = styled(Box)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: theme.spacing(spacing.sm, 0),
  maxWidth: '100%',
}));

/**
 * Status Badge - Semantic status indicator
 */
export const StatusBadge = styled(Box, {
  shouldForwardProp: prop => prop !== 'status',
})<{ status?: 'success' | 'warning' | 'error' | 'info' | 'default' }>(
  ({ theme, status = 'default' }) => {
    const colorMap = {
      success: {
        bg: colors.semantic.successBg,
        color: colors.semantic.success,
      },
      warning: {
        bg: colors.semantic.warningBg,
        color: colors.semantic.warning,
      },
      error: { bg: colors.semantic.errorBg, color: colors.semantic.error },
      info: { bg: colors.semantic.infoBg, color: colors.semantic.info },
      default: {
        bg: alpha(theme.palette.text.primary, 0.08),
        color: theme.palette.text.secondary,
      },
    };

    const { bg, color } = colorMap[status];

    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: theme.spacing(spacing.xs),
      padding: theme.spacing(spacing.xs, spacing.sm),
      borderRadius: '9999px',
      backgroundColor: bg,
      color: color,
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    };
  },
);

/**
 * Scroll Container - Premium scrollbar styling (WebKit + Firefox)
 */
export const ScrollContainer = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const trackColor = isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)';

  return {
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${colors.scrollbar.thumb} ${trackColor}`,

    '&::-webkit-scrollbar': {
      width: 10,
      height: 10,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: trackColor,
      borderRadius: 10,
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: colors.scrollbar.thumb,
      borderRadius: 10,
      border: '2px solid transparent',
      backgroundClip: 'content-box',
      transition: transitions.normal,
    },

    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: colors.scrollbar.thumbHover,
    },
  };
});

/**
 * Sidebar Panel - Right/Left sidebar container
 */
export const SidebarPanel = styled(Box)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.default,
  borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  display: 'flex',
  flexDirection: 'column',
  transition: transitions.normal,
}));
