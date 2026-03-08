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

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children?: ReactNode;
  className?: string;
  inline?: boolean;
  node?: unknown;
  [key: string]: unknown;
}

/**
 * Custom code block renderer for ReactMarkdown.
 * - Inline code: renders as styled <code>
 * - Block code: renders with syntax highlighting, language label, and copy button
 *
 * Designed to match ChatGPT/Claude code block UX.
 */
export const CodeBlock = ({
  children,
  className,
  inline,
  ...rest
}: CodeBlockProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const languageMatch = /language-(\w+)/.exec(className || '');
  const language = languageMatch ? languageMatch[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(() => {
    window.navigator.clipboard
      .writeText(codeString)
      .then(() => {
        setCopied(true);
        copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* clipboard API unavailable (e.g. non-HTTPS) */
      });
  }, [codeString]);

  if (inline) {
    return (
      <code
        className={className}
        style={{
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.05)',
          padding: '2px 6px',
          borderRadius: 4,
          fontFamily:
            '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          fontSize: '0.85em',
          fontWeight: 400,
        }}
        {...rest}
      >
        {children}
      </code>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        my: 2,
        borderRadius: '8px',
        overflow: 'hidden',
        border: `1px solid ${
          isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }`,
      }}
    >
      {/* Header bar with language label and copy button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(0,0,0,0.03)',
          borderBottom: `1px solid ${
            isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
          }`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'lowercase',
            fontFamily:
              '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          }}
        >
          {language || 'code'}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton
            size="small"
            onClick={handleCopy}
            aria-label="Copy code"
            sx={{
              color: copied
                ? theme.palette.success.main
                : theme.palette.text.secondary,
              p: 0.5,
              '&:hover': {
                color: theme.palette.text.primary,
              },
            }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 14 }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Syntax-highlighted code */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '16px',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          fontFamily:
            '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          background: 'transparent',
          border: 'none',
        }}
        codeTagProps={{
          style: {
            fontFamily:
              '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          },
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </Box>
  );
};
