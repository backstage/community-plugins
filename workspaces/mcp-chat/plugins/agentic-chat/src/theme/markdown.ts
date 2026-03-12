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
import type { Theme, SxProps } from '@mui/material/styles';
import { colors } from './tokens';

/**
 * Mode-aware surface opacity helpers.
 * Use these instead of hardcoding rgba values throughout component styles.
 *
 * Scale:
 *   faint  — barely visible (containers holding interactive elements)
 *   subtle — default card / panel background
 *   medium — general-purpose overlay
 *   strong — emphasis, pills, hover states
 */
export function surfaceOverlay(
  theme: Theme,
  level: 'faint' | 'subtle' | 'medium' | 'strong' = 'medium',
): string {
  const isDark = theme.palette.mode === 'dark';
  const map = {
    faint: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
    subtle: isDark ? colors.surface.background : colors.surface.backgroundLight,
    medium: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    strong: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
  };
  return map[level];
}

export function subtleBorder(
  theme: Theme,
  level: 'subtle' | 'strong' = 'subtle',
): string {
  const isDark = theme.palette.mode === 'dark';
  if (level === 'strong') {
    return isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  }
  return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
}

/**
 * Inset code-block background — uses a black overlay in both modes
 * for consistent depth perception.
 */
export function codeBlockBackground(theme: Theme): string {
  const isDark = theme.palette.mode === 'dark';
  return isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)';
}

/**
 * Shared markdown content styles used by both ChatMessage and StreamingMessage.
 * Extracted to avoid the ~150 lines of duplicated styles that previously
 * had to be manually kept in sync across both components.
 *
 * @param theme - MUI theme
 * @param isUser - Whether this is a user message (affects text/link colors).
 *                 Default false for assistant/streaming context.
 */
export function getSharedMarkdownSx(
  theme: Theme,
  isUser: boolean = false,
): SxProps<Theme> {
  const isDark = theme.palette.mode === 'dark';

  const textColor = theme.palette.text.primary;
  const secondaryTextColor = theme.palette.text.secondary;

  let codeBg: string;
  if (isUser) {
    codeBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  } else {
    codeBg = surfaceOverlay(theme);
  }

  const border = subtleBorder(theme);

  return {
    fontSize: '0.9375rem',
    lineHeight: 1.65,
    color: textColor,
    wordBreak: 'break-word',

    '& p': { margin: 0 },
    '& p + p': { mt: 1.5 },

    '& h1': {
      fontSize: '1.375rem',
      mt: 3,
      mb: 1,
      fontWeight: 700,
      lineHeight: 1.3,
      color: textColor,
    },
    '& h2': {
      fontSize: '1.2rem',
      mt: 2.5,
      mb: 1,
      fontWeight: 650,
      lineHeight: 1.35,
      color: textColor,
    },
    '& h3': {
      fontSize: '1.0625rem',
      mt: 2,
      mb: 0.75,
      fontWeight: 600,
      lineHeight: 1.4,
      color: textColor,
    },
    '& h4': {
      fontSize: '0.9375rem',
      mt: 1.5,
      mb: 0.5,
      fontWeight: 600,
      lineHeight: 1.4,
      color: textColor,
    },

    '& strong, & b': { fontWeight: 600, color: textColor },
    '& em, & i': { fontStyle: 'italic' },

    '& code': {
      backgroundColor: codeBg,
      padding: '2px 6px',
      borderRadius: '4px',
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: '0.85em',
      fontWeight: 400,
      wordBreak: 'break-all' as const,
    },

    '& pre': {
      backgroundColor: 'transparent',
      padding: 0,
      margin: 0,
      border: 'none',
      borderRadius: 0,
      overflowX: 'auto',
      '& code': {
        backgroundColor: 'transparent',
        padding: 0,
        fontSize: '0.8125rem',
        fontWeight: 400,
        wordBreak: 'normal' as const,
      },
    },

    '& ul, & ol': {
      pl: 2.5,
      my: 1.25,
      '& li': {
        mb: 0.5,
        lineHeight: 1.6,
        '&::marker': { color: secondaryTextColor },
      },
    },
    '& li > ul, & li > ol': { mt: 0.5, mb: 0 },

    '& a': {
      color: isUser ? textColor : theme.palette.primary.main,
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      '&:hover': {
        textDecorationColor: isUser ? textColor : theme.palette.primary.main,
      },
    },

    '& blockquote': {
      borderLeft: `3px solid ${
        isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
      }`,
      pl: 2,
      ml: 0,
      my: 1.5,
      color: secondaryTextColor,
      fontStyle: 'italic',
    },

    '& hr': { border: 'none', borderTop: `1px solid ${border}`, my: 2 },

    '& input[type="checkbox"]': { mr: 1 },

    '& .table-scroll-wrapper': {
      overflowX: 'auto' as const,
      width: '100%',
      my: 1.5,
      WebkitOverflowScrolling: 'touch' as const,
    },
    '& table': {
      borderCollapse: 'collapse' as const,
      width: '100%',
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      tableLayout: 'auto' as const,
    },
    '& th, & td': {
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(0.75, 1.25),
      textAlign: 'left' as const,
      wordBreak: 'normal' as const,
      overflowWrap: 'break-word' as const,
    },
    '& th': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
      fontWeight: 600,
      color: textColor,
      whiteSpace: 'nowrap' as const,
    },
    '& tr:nth-of-type(even)': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
    },

    '& img': { maxWidth: '100%', borderRadius: '8px' },
  };
}
