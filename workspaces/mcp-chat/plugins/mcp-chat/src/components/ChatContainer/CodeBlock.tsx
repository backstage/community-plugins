/*
 * Copyright 2026 The Backstage Authors
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

import { useState, ReactNode, ReactElement } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useTheme } from '@mui/material/styles';

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as ReactElement).props.children);
  }
  return '';
}

export interface CodeBlockProps {
  children?: ReactNode;
  maxHeight?: string;
}

export function CodeBlock({ children, maxHeight }: CodeBlockProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await window.navigator.clipboard.writeText(extractText(children));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text');
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="pre"
        sx={{
          maxHeight,
          overflow: 'auto',
          backgroundColor: isDarkMode
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.04)',
          borderRadius: 1,
          p: 1,
          m: 0,
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: theme.palette.text.primary,
        }}
      >
        {children}
      </Box>
      <IconButton
        size="small"
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy code'}
        sx={{
          position: 'absolute',
          top: theme.spacing(0.5),
          right: theme.spacing(2),
          padding: theme.spacing(0.5),
          minWidth: 'auto',
          color: theme.palette.text.secondary,
          opacity: 0.6,
          '&:hover': {
            opacity: 1,
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <FileCopyIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
