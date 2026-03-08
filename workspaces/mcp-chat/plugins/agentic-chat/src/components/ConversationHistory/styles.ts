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
 * ConversationHistory Styles
 *
 * Style factories for the conversation history sidebar component.
 */

import { Theme, alpha, SxProps } from '@mui/material/styles';

// =============================================================================
// CONTAINER STYLES
// =============================================================================

/**
 * Main container for conversation history
 */
export const getContainerSx = (): SxProps<Theme> => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

/**
 * Header row with title and actions
 */
export const getHeaderSx = (): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 1.5,
  px: 0.5,
});

/**
 * Header title typography
 */
export const getHeaderTitleSx = (): SxProps<Theme> => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'text.secondary',
});

// =============================================================================
// CONVERSATION ITEM STYLES
// =============================================================================

/**
 * Scrollable list container
 */
export const getListContainerSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';
  const accent = theme.palette.primary.main;

  return {
    flex: 1,
    overflow: 'auto',
    pr: 0.5,
    '&::-webkit-scrollbar': { width: 6 },
    '&::-webkit-scrollbar-thumb': {
      bgcolor: alpha(accent, isDark ? 0.3 : 0.2),
      borderRadius: 3,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      bgcolor: alpha(accent, isDark ? 0.5 : 0.4),
    },
  };
};

/**
 * Individual conversation item
 */
export const getConversationItemSx = (
  theme: Theme,
  isActive: boolean,
): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';
  const accent = theme.palette.primary.main;
  const white = theme.palette.common.white;
  const black = theme.palette.common.black;

  return {
    p: 1.5,
    mb: 1,
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: (() => {
      if (isActive) return `1px solid ${alpha(accent, isDark ? 0.5 : 0.4)}`;
      return `1px solid ${alpha(isDark ? white : black, 0.06)}`;
    })(),
    bgcolor: (() => {
      if (isActive) return alpha(accent, isDark ? 0.15 : 0.1);
      return alpha(isDark ? white : black, 0.02);
    })(),
    '&:hover': {
      bgcolor: (() => {
        if (isActive) return alpha(accent, isDark ? 0.2 : 0.15);
        return alpha(isDark ? white : black, isDark ? 0.05 : 0.04);
      })(),
      borderColor: (() => {
        if (isActive) return alpha(accent, isDark ? 0.6 : 0.5);
        return alpha(isDark ? white : black, 0.1);
      })(),
    },
    position: 'relative',
    overflow: 'hidden',
  };
};

/**
 * Active indicator line on left edge
 */
export const getActiveIndicatorSx = (theme: Theme): SxProps<Theme> => ({
  position: 'absolute',
  left: 0,
  top: 8,
  bottom: 8,
  width: 3,
  borderRadius: '0 4px 4px 0',
  bgcolor: theme.palette.primary.main,
});

/**
 * Conversation title typography
 */
export const getConversationTitleSx = (theme: Theme): SxProps<Theme> => ({
  fontSize: '0.8rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
});

/**
 * Conversation metadata row
 */
export const getMetadataRowSx = (): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mt: 0.75,
});

/**
 * Metadata text (date, message count, etc.)
 */
export const getMetadataTextSx = (): SxProps<Theme> => ({
  fontSize: '0.7rem',
  color: 'text.secondary',
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
});

// =============================================================================
// ACTION BUTTON STYLES
// =============================================================================

/**
 * Action button (refresh, delete, etc.)
 */
export const getActionButtonSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';
  const neutral = isDark
    ? theme.palette.common.white
    : theme.palette.common.black;

  return {
    p: 0.75,
    borderRadius: 1.5,
    color: 'text.secondary',
    '&:hover': {
      bgcolor: alpha(neutral, isDark ? 0.08 : 0.06),
      color: theme.palette.primary.main,
    },
  };
};

/**
 * Delete button (danger style)
 */
export const getDeleteButtonSx = (theme: Theme): SxProps<Theme> => ({
  p: 0.5,
  borderRadius: 1,
  opacity: 0,
  transition: 'opacity 0.2s ease',
  color: theme.palette.error.main,
  '.MuiBox-root:hover &': {
    opacity: 1,
  },
  '&:hover': {
    bgcolor: alpha(theme.palette.error.main, 0.1),
  },
});

// =============================================================================
// EMPTY STATE STYLES
// =============================================================================

/**
 * Empty state container
 */
export const getEmptyStateSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';
  const neutral = isDark
    ? theme.palette.common.white
    : theme.palette.common.black;

  return {
    textAlign: 'center',
    py: 4,
    px: 2,
    color: 'text.secondary',
    bgcolor: alpha(neutral, 0.02),
    borderRadius: 2,
    border: `1px dashed ${alpha(neutral, 0.08)}`,
  };
};

/**
 * Empty state icon
 */
export const getEmptyStateIconSx = (theme: Theme): SxProps<Theme> => ({
  fontSize: 40,
  mb: 1,
  opacity: 0.5,
  color: theme.palette.primary.main,
});

// =============================================================================
// LOADING STATE STYLES
// =============================================================================

/**
 * Loading indicator container
 */
export const getLoadingContainerSx = (): SxProps<Theme> => ({
  display: 'flex',
  justifyContent: 'center',
  py: 3,
});

/**
 * Load more button
 */
export const getLoadMoreButtonSx = (theme: Theme): SxProps<Theme> => {
  const isDark = theme.palette.mode === 'dark';
  const neutral = isDark
    ? theme.palette.common.white
    : theme.palette.common.black;

  return {
    width: '100%',
    py: 1,
    mt: 1,
    borderRadius: 2,
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'none',
    color: 'text.secondary',
    border: `1px solid ${alpha(neutral, 0.08)}`,
    '&:hover': {
      bgcolor: alpha(neutral, isDark ? 0.05 : 0.03),
      borderColor: alpha(neutral, 0.12),
    },
  };
};
