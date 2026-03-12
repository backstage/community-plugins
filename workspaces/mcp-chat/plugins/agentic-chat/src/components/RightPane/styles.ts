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
  transitions,
  layout,
  colors,
} from '../../theme/tokens';
import { createMinimalScrollbarStyles } from '../../theme/styles';

/**
 * RightPane component styles
 * Extracted for maintainability and enterprise customization
 */
export const createRightPaneStyles = (theme: Theme, collapsed: boolean) => {
  return {
    /** Main container - uses flexbox for RHDH compatibility */
    container: {
      width: collapsed
        ? layout.sidebar.widthCollapsed
        : layout.sidebar.widthExpanded,
      minWidth: collapsed
        ? layout.sidebar.widthCollapsed
        : layout.sidebar.widthExpanded,
      height: '100%',
      borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: transitions.normal,
    } as SxProps<Theme>,

    /** Header with toggle button */
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'flex-end',
      p: spacing.sm,
      minHeight: 48,
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    } as SxProps<Theme>,

    /** Toggle button */
    toggleButton: {
      backgroundColor: alpha(theme.palette.action.active, 0.05),
      color: theme.palette.text.secondary,
      transition: transitions.normal,
      '&:hover': {
        color: theme.palette.text.primary,
        backgroundColor: alpha(theme.palette.action.hover, 0.8),
      },
    } as SxProps<Theme>,

    /** Content area with scroll */
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    } as SxProps<Theme>,

    /** Scrollable section */
    scrollSection: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.lg,
      p: spacing.lg,
      ...createMinimalScrollbarStyles(theme),
    } as SxProps<Theme>,

    /** New chat button container */
    newChatContainer: {
      display: 'flex',
      justifyContent: 'center',
    } as SxProps<Theme>,

    /** New chat button */
    newChatButton: {
      py: 1.25,
      px: spacing.xl,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.brand.primary,
      color: theme.palette.common.white,
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
      boxShadow: shadows.sm,
      transition: transitions.normal,
      '&:hover': {
        backgroundColor: colors.brand.primaryHover,
        boxShadow: shadows.md,
      },
    } as SxProps<Theme>,

    /** Collapsible section header */
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      p: spacing.md,
      mx: spacing.lg,
      borderRadius: borderRadius.sm,
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      transition: transitions.normal,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.text.primary,
      },
    } as SxProps<Theme>,

    /** Collapsed state icons */
    collapsedIcons: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.lg,
      py: spacing.lg,
    } as SxProps<Theme>,

    /** Collapsed icon button */
    collapsedIconButton: {
      color: theme.palette.text.secondary,
      '&:hover': {
        color: theme.palette.text.primary,
        backgroundColor: alpha(theme.palette.action.hover, 0.1),
      },
    } as SxProps<Theme>,
  };
};

export type RightPaneStyles = ReturnType<typeof createRightPaneStyles>;
