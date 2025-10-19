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
  identityApiRef,
  useApi,
  alertApiRef,
} from '@backstage/core-plugin-api';
import {
  Box,
  Typography,
  makeStyles,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import useAsync from 'react-use/esm/useAsync';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  messageBox: {
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    width: 'fit-content',
    maxWidth: '75%',
  },
  userMessage: {
    backgroundColor: theme.palette.type === 'dark' ? '#0099ff' : '#0288d1',
    color: '#ffffff',
    marginLeft: 'auto',
    textAlign: 'right',
  },
  botMessage: {
    backgroundColor:
      theme.palette.type === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
    color: theme.palette.text.primary,
    marginRight: 'auto',
  },
  copyButton: {
    padding: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  markdownTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    fontSize: '0.875rem',
    '& th': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? theme.palette.grey[700]
          : theme.palette.grey[200],
      color: theme.palette.text.primary,
      fontWeight: 600,
      padding: theme.spacing(1),
      border: `1px solid ${theme.palette.divider}`,
      textAlign: 'left',
    },
    '& td': {
      padding: theme.spacing(1),
      border: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.primary,
    },
    '& tr:nth-of-type(even)': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(0, 0, 0, 0.02)',
    },
  },
}));

/**
 * Properties for the ChatMessage component
 * @public
 */
export interface ChatMessageProps {
  message: Message;
  fontSizes?: {
    messageText?: string;
    codeBlock?: string;
    inlineCode?: string;
    timestamp?: string;
  };
}

/**
 * Individual chat message component with user profile integration
 * @public
 */
export function ChatMessage({ message, fontSizes }: ChatMessageProps) {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const alertApi = useApi(alertApiRef);
  const { value: profile } = useAsync(() => identityApi.getProfileInfo());
  const theme = useTheme();

  const handleCopyToClipboard = async () => {
    try {
      await window.navigator.clipboard.writeText(message.text || '');
      alertApi.post({
        message: 'Message copied to clipboard',
        severity: 'success',
      });
    } catch (error) {
      alertApi.post({
        message: 'Failed to copy message',
        severity: 'error',
      });
    }
  };

  const handleCodeCopy = async (code: string) => {
    try {
      await window.navigator.clipboard.writeText(code);
      alertApi.post({
        message: 'Code copied to clipboard',
        severity: 'success',
      });
    } catch (error) {
      alertApi.post({
        message: 'Failed to copy code',
        severity: 'error',
      });
    }
  };

  // Custom code component with syntax highlighting
  const CodeBlock = ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    if (!inline && match) {
      return (
        <div style={{ position: 'relative' }}>
          <Tooltip title="Copy code">
            <IconButton
              size="small"
              onClick={() => handleCodeCopy(codeString)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                padding: 4,
                zIndex: 1,
                backgroundColor: theme.palette.background.paper,
                opacity: 0.7,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '0.7';
              }}
            >
              <FileCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <SyntaxHighlighter
            style={theme.palette.type === 'dark' ? vscDarkPlus : vs}
            language={match[1]}
            PreTag="div"
            customStyle={{
              fontSize: fontSizes?.codeBlock || '0.9rem',
              lineHeight: '1.5',
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code
        className={className}
        style={{ fontSize: fontSizes?.inlineCode || '0.875rem' }}
        {...props}
      >
        {children}
      </code>
    );
  };

  if (message.isUser) {
    return (
      <Box className={`${classes.messageBox} ${classes.userMessage}`}>
        <Box
          display="flex"
          alignItems="center"
          marginBottom={0.5}
          style={{ gap: 8 }}
        >
          <Box
            width={20}
            height={20}
            borderRadius="50%"
            style={{
              backgroundColor:
                theme.palette.type === 'dark' ? '#0099ff' : '#0288d1',
              backgroundImage: profile?.picture
                ? `url("${profile.picture}")`
                : undefined,
              backgroundSize: 'cover',
            }}
          />
          <Typography
            variant="caption"
            style={{ fontWeight: 700, color: '#ffffff' }}
          >
            You
          </Typography>
        </Box>
        <Box
          style={{
            wordBreak: 'break-word',
            color: '#ffffff',
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              a: ({ href, children, ...props }) => (
                <a
                  href={href?.startsWith('http') ? href : ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#b3d9ff',
                    textDecoration: 'underline',
                    fontWeight: 500,
                  }}
                  {...props}
                >
                  {children}
                </a>
              ),
              p: ({ children, ...props }) => (
                <p
                  style={{
                    color: '#ffffff',
                    margin: '0.5em 0',
                    fontSize: fontSizes?.messageText || '0.875rem',
                  }}
                  {...props}
                >
                  {children}
                </p>
              ),
              table: ({ children, ...props }) => (
                <table className={classes.markdownTable} {...props}>
                  {children}
                </table>
              ),
            }}
          >
            {message.text || ''}
          </ReactMarkdown>
        </Box>
        <Typography
          variant="caption"
          style={{
            opacity: 0.85,
            fontSize: fontSizes?.timestamp || '0.75rem',
            color: '#ffffff',
            display: 'block',
            marginTop: 2,
          }}
        >
          {message.timestamp}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={`${classes.messageBox} ${classes.botMessage}`}>
      <Box
        style={{
          wordBreak: 'break-word',
          color: 'inherit',
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: CodeBlock,
            a: ({ href, children, ...props }) => (
              <a
                href={href?.startsWith('http') ? href : ''}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.palette.type === 'dark' ? '#90caf9' : '#1976d2',
                  textDecoration: 'underline',
                }}
                {...props}
              >
                {children}
              </a>
            ),
            p: ({ children, ...props }) => (
              <p
                style={{ fontSize: fontSizes?.messageText || '0.875rem' }}
                {...props}
              >
                {children}
              </p>
            ),
            table: ({ children, ...props }) => (
              <table className={classes.markdownTable} {...props}>
                {children}
              </table>
            ),
          }}
        >
          {message.text || ''}
        </ReactMarkdown>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="caption"
          style={{
            opacity: 0.7,
            fontSize: fontSizes?.timestamp || '0.75rem',
            color: 'inherit',
          }}
        >
          {message.timestamp}
        </Typography>
        <Tooltip title="Copy message">
          <IconButton
            className={classes.copyButton}
            size="small"
            onClick={handleCopyToClipboard}
          >
            <FileCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
