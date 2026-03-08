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
import { Fragment } from 'react';
import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';

export function getScoreColor(score: number, theme: Theme): string {
  if (score >= 0.7) return theme.palette.success.main;
  if (score >= 0.4) return theme.palette.warning.main;
  return theme.palette.error.main;
}

export function getScoreLabel(score: number): string {
  if (score >= 0.7) return 'High';
  if (score >= 0.4) return 'Medium';
  return 'Low';
}

export function highlightQueryTerms(
  text: string,
  query: string,
  highlightColor: string,
): React.ReactNode[] {
  if (!query.trim()) return [text];
  const words = query
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 2);
  if (words.length === 0) return [text];

  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);
  const lowerWords = new Set(words.map(w => w.toLowerCase()));

  return parts.map((part, i) => {
    if (part && lowerWords.has(part.toLowerCase())) {
      return (
        <Box
          component="mark"
          key={i}
          sx={{
            bgcolor: highlightColor,
            color: 'inherit',
            borderRadius: '2px',
            px: '2px',
          }}
        >
          {part}
        </Box>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
