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
  spacing,
  borderRadius,
  shadows,
  colors,
  transitions,
  GlassConfig,
} from './tokens';

/**
 * Creates elevated surface styles (replaces glassmorphism)
 *
 * @param theme - MUI theme object
 * @param glassConfig - Optional configuration for backward compatibility
 * @returns SxProps with surface styles
 */
export const createGlassStyles = (
  theme: Theme,
  glassConfig?: Partial<GlassConfig>,
): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  const bgOpacity = glassConfig?.backgroundOpacity ?? 0.06;
  const borderOpacity = glassConfig?.borderOpacity ?? 0.12;

  return {
    backgroundColor: isDark
      ? `rgba(255, 255, 255, ${bgOpacity})`
      : `rgba(0, 0, 0, ${bgOpacity * 0.5})`,
    border: `1px solid ${
      isDark
        ? `rgba(255, 255, 255, ${borderOpacity})`
        : `rgba(0, 0, 0, ${borderOpacity})`
    }`,
    boxShadow: shadows.sm,
  };
};

/**
 * Creates elevated card styles with hover effect
 */
export const createGlassCardStyles = (
  theme: Theme,
  glassConfig?: Partial<GlassConfig>,
): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  const bgOpacity = glassConfig?.backgroundOpacity ?? 0.06;
  const borderOpacity = glassConfig?.borderOpacity ?? 0.12;
  const hoverBgOpacity = Math.min(bgOpacity * 1.5, 0.09);
  const hoverBorderOpacity = Math.min(borderOpacity * 1.5, 0.18);

  return {
    ...createGlassStyles(theme, glassConfig),
    borderRadius: borderRadius.lg,
    transition: transitions.normal,
    '&:hover': {
      backgroundColor: isDark
        ? `rgba(255, 255, 255, ${hoverBgOpacity})`
        : `rgba(0, 0, 0, ${hoverBgOpacity * 0.5})`,
      borderColor: isDark
        ? `rgba(255, 255, 255, ${hoverBorderOpacity})`
        : `rgba(0, 0, 0, ${hoverBorderOpacity})`,
      transform: 'translateY(-1px)',
      boxShadow: shadows.md,
    },
  };
};

/**
 * Premium scrollbar styles (WebKit + Firefox standard properties)
 */
export const createScrollbarStyles = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';
  const trackColor = isDark
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)';

  return {
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
};

/**
 * Minimal scrollbar for compact areas (WebKit + Firefox standard properties)
 */
export const createMinimalScrollbarStyles = (theme: Theme): SxProps<Theme> => {
  const thumbColor = `rgba(${
    theme.palette.mode === 'dark' ? '255,255,255' : '0,0,0'
  }, 0.15)`;

  return {
    scrollbarWidth: 'thin',
    scrollbarColor: `${thumbColor} transparent`,
    '&::-webkit-scrollbar': {
      width: 5,
      height: 5,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: thumbColor,
      borderRadius: 3,
    },
  };
};

/**
 * Creates primary button styles (solid, professional)
 */
export const createGradientButtonStyles = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  return {
    backgroundColor: colors.brand.primary,
    color: theme.palette.common.white,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: borderRadius.sm,
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
};

/**
 * Creates badge/chip styles
 */
export const createBadgeStyles = (
  theme: Theme,
  variant: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default',
): SxProps<Theme> => {
  const colorMap = {
    success: { bg: colors.semantic.successBg, color: colors.semantic.success },
    warning: { bg: colors.semantic.warningBg, color: colors.semantic.warning },
    error: { bg: colors.semantic.errorBg, color: colors.semantic.error },
    info: { bg: colors.semantic.infoBg, color: colors.semantic.info },
    default: {
      bg: `rgba(${
        theme.palette.mode === 'dark' ? '255,255,255' : '0,0,0'
      }, 0.08)`,
      color: theme.palette.text.secondary,
    },
  };

  const { bg, color } = colorMap[variant];

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    px: spacing.sm,
    py: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: bg,
    color: color,
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
  };
};

/**
 * Creates panel header styles
 */
export const createPanelHeaderStyles = (theme: Theme): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  pb: spacing.md,
  mb: spacing.sm,
  borderBottom: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)'
  }`,
});

/**
 * Creates floating input styles (chat input)
 */
export const createFloatingInputStyles = (theme: Theme): SxProps<Theme> => {
  return {
    ...createGlassStyles(theme),
    borderRadius: borderRadius.xxl,
    p: spacing.md,
    boxShadow: shadows.sm,
    transition: transitions.normal,
    '&:focus-within': {
      borderColor: colors.brand.primary,
      boxShadow: `0 0 0 2px ${alpha(colors.brand.primary, 0.15)}`,
    },
  };
};

/**
 * Creates message bubble styles
 */
export const createMessageBubbleStyles = (
  theme: Theme,
  role: 'user' | 'assistant',
): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';

  if (role === 'user') {
    return {
      backgroundColor: isDark
        ? colors.chat.userBubbleDark
        : colors.chat.userBubble,
      color: theme.palette.text.primary,
      borderRadius: `${borderRadius.md * 8}px`,
      px: spacing.lg,
      py: spacing.md,
      maxWidth: '80%',
      alignSelf: 'flex-end',
    };
  }

  return {
    backgroundColor: 'transparent',
    p: `${spacing.sm * 8}px 0`,
    maxWidth: '100%',
  };
};

/**
 * Fade-in animation keyframes (to be used with @keyframes)
 */
export const animations = {
  fadeInUp: {
    '@keyframes fadeInUp': {
      from: {
        opacity: 0,
        transform: 'translateY(10px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
    animation: 'fadeInUp 0.3s ease-out',
  },

  pulse: {
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    animation: 'pulse 2s infinite',
  },

  shimmer: {
    '@keyframes shimmer': {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    animation: 'shimmer 2s infinite linear',
  },
};
