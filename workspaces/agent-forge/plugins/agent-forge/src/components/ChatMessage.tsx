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
  Collapse,
} from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
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
import { memo, useState, useEffect, useRef } from 'react';

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
  executionPlanContainer: {
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.type === 'dark' 
      ? 'rgba(76, 175, 80, 0.15)' 
      : 'rgba(76, 175, 80, 0.08)',
    borderRadius: theme.spacing(0.5),
    border: `1px solid ${theme.palette.type === 'dark' 
      ? 'rgba(76, 175, 80, 0.3)' 
      : 'rgba(76, 175, 80, 0.2)'}`,
    overflow: 'hidden',
  },
  executionPlanHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0.75, 1.5),
    cursor: 'pointer',
    backgroundColor: theme.palette.type === 'dark' 
      ? 'rgba(76, 175, 80, 0.2)' 
      : 'rgba(76, 175, 80, 0.12)',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' 
        ? 'rgba(76, 175, 80, 0.3)' 
        : 'rgba(76, 175, 80, 0.18)',
    },
  },
  executionPlanContent: {
    padding: theme.spacing(0.75, 1),
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    backgroundColor: theme.palette.type === 'dark' 
      ? 'rgba(76, 175, 80, 0.1)' 
      : 'rgba(76, 175, 80, 0.05)',
    lineHeight: '1.3',
  },
  collapseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5),
    padding: theme.spacing(0.5, 0),
    cursor: 'pointer',
    borderRadius: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  collapseButton: {
    padding: theme.spacing(0.25),
    marginLeft: theme.spacing(0.5),
    opacity: 0.6,
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 1,
      backgroundColor: theme.palette.action.hover,
    },
  },
  responseContent: {
    transition: 'all 0.3s ease',
  },
}));

/**
 * Properties for the ChatMessage component
 * @public
 */
export interface ChatMessageProps {
  message: Message;
  botName?: string;
  botIcon?: string;
  fontSizes?: {
    messageText?: string;
    codeBlock?: string;
    inlineCode?: string;
    timestamp?: string;
  };
}

/**
 * Individual chat message component with user profile integration
 * Memoized to prevent unnecessary re-renders when props haven't changed
 * @public
 */
export const ChatMessage = memo(function ChatMessage({
  message,
  botName,
  botIcon,
  fontSizes,
}: ChatMessageProps) {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const alertApi = useApi(alertApiRef);
  const { value: profile } = useAsync(() => identityApi.getProfileInfo());
  const theme = useTheme();
  const [isResponseExpanded, setIsResponseExpanded] = useState(true);
  const [isExecutionPlanExpanded, setIsExecutionPlanExpanded] = useState(true);
  const hasAutoCollapsed = useRef(false);

  // Reset execution plan state completely when message changes (detect by timestamp + text combination)
  const messageId = `${message.timestamp}-${message.text?.slice(0, 20)}`;
  const prevMessageIdRef = useRef<string>('');
  
  useEffect(() => {
    const currentMessageId = `${message.timestamp}-${message.text?.slice(0, 20)}`;
    console.log('🆔 MESSAGE ID CHECK:', {
      current: currentMessageId,
      previous: prevMessageIdRef.current,
      isNewMessage: currentMessageId !== prevMessageIdRef.current
    });
    
    if (currentMessageId !== prevMessageIdRef.current) {
      console.log('🔄 NEW MESSAGE DETECTED - resetting execution plan state');
      // Reset all execution plan state for new message
      hasAutoCollapsed.current = false;
      setIsExecutionPlanExpanded(true);
      prevMessageIdRef.current = currentMessageId;
    }
  }, [messageId]);

  // Auto-collapse execution plan when streaming completes - only once
  useEffect(() => {
    if (message.executionPlan && message.executionPlan.trim().length > 0 && message.isStreaming === false && !hasAutoCollapsed.current && isExecutionPlanExpanded) {
      console.log('🔄 AUTO-COLLAPSING EXECUTION PLAN');
      // Small delay to let user see the plan briefly before collapsing
      const timer = setTimeout(() => {
        setIsExecutionPlanExpanded(false);
        hasAutoCollapsed.current = true; // Mark as auto-collapsed to prevent repeated triggers
      }, 100);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message.isStreaming, message.executionPlan, isExecutionPlanExpanded]);

  const handleCopyToClipboard = async () => {
    try {
      let textToCopy = '';

      // Include execution plan if present
      if (message.executionPlan) {
        textToCopy += `📋 Execution Plan\n${message.executionPlan}\n\n`;
      }

      // Add main message text
      if (message.text) {
        textToCopy += message.text;
      }

      await window.navigator.clipboard.writeText(textToCopy);
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
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
              backgroundColor: '#ffffff',
              backgroundImage: profile?.picture
                ? `url("${profile.picture}")`
                : undefined,
              backgroundSize: 'cover',
              border: profile?.picture
                ? 'none'
                : '2px solid rgba(255, 255, 255, 0.7)',
              fontSize: '10px',
              fontWeight: 600,
              color: theme.palette.type === 'dark' ? '#0099ff' : '#0288d1',
            }}
          >
            {!profile?.picture &&
              (profile?.displayName?.[0]?.toUpperCase() || 'U')}
          </Box>
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
        display="flex"
        alignItems="center"
        marginBottom={0.5}
        style={{ gap: 8 }}
      >
        {botIcon && (
          <Box
            width={20}
            height={20}
            borderRadius="50%"
            style={{
              backgroundImage: `url(${botIcon})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {!botIcon && botName && (
          <Box
            width={20}
            height={20}
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
              backgroundColor: theme.palette.primary.main,
              fontSize: '10px',
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {botName[0]?.toUpperCase()}
          </Box>
        )}
        {botName && (
          <Typography
            variant="caption"
            style={{ fontWeight: 700, color: 'inherit' }}
          >
            {botName}
          </Typography>
        )}
      </Box>
      {/* Execution Plan - collapsible if present and not empty */}
      {message.executionPlan && message.executionPlan.trim().length > 0 && (
        <Box className={classes.executionPlanContainer}>
          <Box 
            className={classes.executionPlanHeader}
            onClick={() => setIsExecutionPlanExpanded(!isExecutionPlanExpanded)}
          >
            <Typography 
              variant="subtitle2" 
              style={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              📋 Execution Plan
            </Typography>
            <IconButton 
              size="small"
              style={{ 
                padding: '2px',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsExecutionPlanExpanded(!isExecutionPlanExpanded);
              }}
            >
              {isExecutionPlanExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>
          <Collapse in={isExecutionPlanExpanded}>
            <Box className={classes.executionPlanContent}>
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
                      style={{ 
                        fontSize: '0.8rem',
                        margin: '0.2em 0',
                        fontFamily: 'monospace',
                        lineHeight: '1.3',
                      }}
                      {...props}
                    >
                      {children}
                    </p>
                  ),
                  h1: ({ children, ...props }) => (
                    <h1
                      style={{ 
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        margin: '0.3em 0 0.2em 0',
                        fontFamily: 'monospace',
                        lineHeight: '1.2',
                      }}
                      {...props}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      style={{ 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        margin: '0.25em 0 0.15em 0',
                        fontFamily: 'monospace',
                        lineHeight: '1.2',
                      }}
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      style={{ 
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        margin: '0.2em 0 0.1em 0',
                        fontFamily: 'monospace',
                        lineHeight: '1.2',
                      }}
                      {...props}
                    >
                      {children}
                    </h3>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul
                      style={{ 
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        paddingLeft: '1.2em',
                        margin: '0.2em 0',
                        lineHeight: '1.3',
                      }}
                      {...props}
                    >
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol
                      style={{ 
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        paddingLeft: '1.2em',
                        margin: '0.2em 0',
                        lineHeight: '1.3',
                      }}
                      {...props}
                    >
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li
                      style={{ 
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        margin: '0.1em 0',
                        lineHeight: '1.3',
                      }}
                      {...props}
                    >
                      {children}
                    </li>
                  ),
                  strong: ({ children, ...props }) => (
                    <strong
                      style={{ 
                        fontWeight: 600,
                        fontFamily: 'monospace',
                      }}
                      {...props}
                    >
                      {children}
                    </strong>
                  ),
                  table: ({ children, ...props }) => (
                    <table className={classes.markdownTable} {...props}>
                      {children}
                    </table>
                  ),
                }}
              >
                {message.executionPlan || ''}
              </ReactMarkdown>
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Collapsible Response Content */}
      {message.text && (
        <Box>
          {/* Subtle Collapse Header - only show for bot messages with content */}
          {!message.isUser && message.text && (
            <Box 
              className={classes.collapseHeader}
              onClick={() => setIsResponseExpanded(!isResponseExpanded)}
            >
              <Typography 
                variant="caption" 
                style={{ 
                  opacity: 0.7,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Response
              </Typography>
              <IconButton 
                className={classes.collapseButton}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsResponseExpanded(!isResponseExpanded);
                }}
              >
                {isResponseExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Box>
          )}

          {/* Main Content */}
          <Collapse in={message.isUser || isResponseExpanded}>
            <Box
              className={classes.responseContent}
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
          </Collapse>
        </Box>
      )}
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
});
