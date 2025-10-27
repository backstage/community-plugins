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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import AssignmentIcon from '@material-ui/icons/Assignment';
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
import { memo, useState, useEffect, useRef, useCallback } from 'react';

const useStyles = makeStyles(theme => ({
  messageBox: {
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    width: 'fit-content',
    maxWidth: '90%',
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
    marginBottom: theme.spacing(0.4), // Reduced from 1 to 0.5 for smaller vertical spacing
    backgroundColor: theme.palette.type === 'dark' 
      ? 'rgba(76, 175, 80, 0.15)' 
      : 'rgba(76, 175, 80, 0.08)',
    borderRadius: theme.spacing(0.25), // Reduced border radius for more compact look
    border: `1px solid ${theme.palette.type === 'dark' 
      ? 'rgba(76, 175, 80, 0.3)' 
      : 'rgba(76, 175, 80, 0.2)'}`,
    overflow: 'hidden',
    width: '100%', // Set width to 70% of parent container
  },
  executionPlanHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0.15, 0.50), // Further reduced vertical padding (0.5→0.25) for smaller height
    cursor: 'pointer',
    backgroundColor: theme.palette.type === 'dark' 
      ? 'rgba(76, 175, 80, 0.2)' 
      : 'rgba(76, 175, 80, 0.12)',
    minHeight: '30px', // Set a compact minimum height
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' 
        ? 'rgba(76, 175, 80, 0.3)' 
        : 'rgba(76, 175, 80, 0.18)',
    },
  },
  executionPlanContent: {
    padding: theme.spacing(0.25, 0.75), // Further reduced vertical padding (0.5→0.25) for smaller height
    fontSize: '0.30rem', // Slightly smaller font for more compact look
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    backgroundColor: theme.palette.type === 'dark' 
      ? 'rgba(76, 175, 80, 0.1)' 
      : 'rgba(76, 175, 80, 0.05)',
    lineHeight: '0.2', // Keep the reduced line height
    // Removed maxHeight and overflowY to allow auto-height adjustment
    '& p': {
      margin: '0.04em 0', // Further reduced paragraph margins for even tighter spacing
    },
    '& br': {
      lineHeight: '0.32', // Keep the compressed line breaks
    },
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
    width: '100%',
    overflowX: 'auto', // Allow horizontal scroll for wide tables if needed
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
  executionPlanBuffer?: Record<string, string>;
  autoExpandExecutionPlans?: Set<string>;
  isLastMessage?: boolean;
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
  executionPlanBuffer,
  autoExpandExecutionPlans,
  isLastMessage,
}: ChatMessageProps) {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const alertApi = useApi(alertApiRef);
  const { value: profile } = useAsync(() => identityApi.getProfileInfo());
  const theme = useTheme();
  const [isResponseExpanded, setIsResponseExpanded] = useState(true);
  const [isExecutionPlanExpanded, setIsExecutionPlanExpanded] = useState(false); // Default to collapsed
  const [isExecutionPlanModalOpen, setIsExecutionPlanModalOpen] = useState(false);
  const hasAutoCollapsed = useRef(false);
  const hasAutoExpanded = useRef(false);
  const userHasInteracted = useRef(false);
  
  // Message key for execution plan identification
  const messageKey = message.messageId || 'unknown';
  
  // Get execution plan from buffer or current message - only show if message is meant to have execution plan
  const bufferedExecutionPlan = executionPlanBuffer?.[messageKey];
  
  // 🔧 STRICT EXECUTION PLAN ISOLATION: Only show execution plan if message actually owns it
  const messageHasExecutionPlanProperty = message.hasOwnProperty('executionPlan');
  const messageHasOwnExecutionPlan = !!(message.executionPlan && message.executionPlan.trim());
  const bufferHasExecutionPlanForThisMessage = !!(bufferedExecutionPlan && bufferedExecutionPlan.trim());
  
  // Only show execution plan if:
  // 1. Message has its OWN execution plan content, OR
  // 2. Message has executionPlan property AND buffer has content specifically for this messageId
  const currentExecutionPlan = messageHasExecutionPlanProperty && (messageHasOwnExecutionPlan || bufferHasExecutionPlanForThisMessage)
    ? (message.executionPlan || bufferedExecutionPlan || '')
    : '';
  const hasExecutionPlan = currentExecutionPlan && currentExecutionPlan.trim().length > 0;
  
  // // Enhanced debug logging for execution plan correlation and contamination tracing
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🔍 EXECUTION PLAN DEBUG:', {
  //     messageId: message.messageId,
  //     messageTimestamp: message.timestamp,
  //     messageKey: messageKey,
  //     messageText: message.text?.substring(0, 50) + '...',
  //     hasExecutionPlanProperty: messageHasExecutionPlanProperty,
  //     messageHasOwnExecutionPlan: messageHasOwnExecutionPlan,
  //     bufferHasExecutionPlanForThisMessage: bufferHasExecutionPlanForThisMessage,
  //     bufferKeys: Object.keys(executionPlanBuffer || {}),
  //     bufferContents: Object.entries(executionPlanBuffer || {}).map(([key, value]) => ({
  //       key,
  //       contentPreview: value ? value.substring(0, 80) + '...' : 'EMPTY',
  //       isForThisMessage: key === messageKey
  //     })),
  //     finalHasExecutionPlan: hasExecutionPlan,
  //     currentExecutionPlan: currentExecutionPlan ? currentExecutionPlan.substring(0, 100) + '...' : 'EMPTY',
  //     executionPlanSource: message.executionPlan ? 'MESSAGE' : bufferedExecutionPlan ? 'BUFFER' : 'NONE',
  //     isolation: messageHasExecutionPlanProperty && (messageHasOwnExecutionPlan || bufferHasExecutionPlanForThisMessage) ? '✅ ALLOWED' : '🚫 BLOCKED',
  //     contamination: !messageHasExecutionPlanProperty && Object.keys(executionPlanBuffer || {}).length > 0 ? '🚨 POTENTIAL CONTAMINATION' : '✅ CLEAN'
  //   });
  // }
  
  // Simple toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isToastOpen, setIsToastOpen] = useState(false);

  // Function to show toast notification
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setIsToastOpen(true);
  }, []);

  // Handle toast close
  const handleToastClose = useCallback((_?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsToastOpen(false);
  }, []);

  // Reset execution plan state completely when message changes (detect by timestamp + text combination)
  const messageId = `${message.timestamp}-${message.text?.slice(0, 20)}`;
  const prevMessageIdRef = useRef<string>('');
  
  useEffect(() => {
    const currentMessageId = `${message.timestamp}-${message.text?.slice(0, 20)}`;
    // console.log('🆔 MESSAGE ID CHECK:', {
    //   current: currentMessageId,
    //   previous: prevMessageIdRef.current,
    //   isNewMessage: currentMessageId !== prevMessageIdRef.current
    // });
    
    if (currentMessageId !== prevMessageIdRef.current) {
      // console.log('🔄 NEW MESSAGE DETECTED - resetting execution plan state');
      // Reset all execution plan state for new message
      hasAutoCollapsed.current = false;
      hasAutoExpanded.current = false; // Also reset auto-expand state
      userHasInteracted.current = false; // Reset user interaction tracking
      
      // Default to collapsed (in-memory only, no localStorage)
      setIsExecutionPlanExpanded(false);
      // console.log('📂 RESET EXECUTION PLAN STATE TO COLLAPSED (in-memory)');
      
      prevMessageIdRef.current = currentMessageId;
    }
  }, [messageId]);

  // Auto-collapse execution plan when streaming completes - only once and only if user hasn't interacted
  // 🚫 Don't auto-collapse on the last (most recent) streamed message
  useEffect(() => {
    if (hasExecutionPlan && message.isStreaming === false && !hasAutoCollapsed.current && isExecutionPlanExpanded && !userHasInteracted.current && !hasAutoExpanded.current && !isLastMessage) {
      // console.log('🔄 AUTO-COLLAPSING EXECUTION PLAN - message finished streaming');
      // Small delay to let user see the plan briefly before collapsing
      const timer = setTimeout(() => {
        setIsExecutionPlanExpanded(false);
        hasAutoCollapsed.current = true; // Mark as auto-collapsed to prevent repeated triggers
      }, 100);

      return () => clearTimeout(timer);
    } else if (message.isStreaming === true && hasExecutionPlan) {
      // console.log('⏸️ EXECUTION PLAN AUTO-COLLAPSE PREVENTED - message still processing');
    } else if (userHasInteracted.current) {
      // console.log('⏸️ EXECUTION PLAN AUTO-COLLAPSE PREVENTED - user has interacted');
    } else if (hasAutoExpanded.current) {
      // console.log('⏸️ EXECUTION PLAN AUTO-COLLAPSE PREVENTED - auto-expanded, keeping open');
    } else if (isLastMessage) {
      // console.log('⏸️ EXECUTION PLAN AUTO-COLLAPSE PREVENTED - this is the last (most recent) message');
    }
    return undefined;
  }, [message.isStreaming, hasExecutionPlan, isExecutionPlanExpanded, isLastMessage]);

  // Save execution plan expansion state to localStorage whenever it changes
  // Execution plan expansion state is now purely in-memory (no localStorage persistence needed)

  // Auto-expand execution plan if it's marked for auto-expansion (only once)
  useEffect(() => {
    if (hasExecutionPlan && message.timestamp && autoExpandExecutionPlans?.has(messageKey) && !isExecutionPlanExpanded && !hasAutoExpanded.current && !userHasInteracted.current) {
      // console.log('🔄 AUTO-EXPANDING EXECUTION PLAN for messageKey:', messageKey);
      setIsExecutionPlanExpanded(true);
      hasAutoExpanded.current = true; // Mark as auto-expanded to prevent repeated expansion
    }
  }, [hasExecutionPlan, message.timestamp, autoExpandExecutionPlans, isExecutionPlanExpanded, messageKey]);

  // Handle user interaction with execution plan expand/collapse
  const handleExecutionPlanToggle = useCallback(() => {
    // console.log('👆 USER MANUALLY TOGGLED EXECUTION PLAN - from:', isExecutionPlanExpanded, 'to:', !isExecutionPlanExpanded);
    userHasInteracted.current = true; // Mark that user has interacted
    setIsExecutionPlanExpanded(!isExecutionPlanExpanded);
  }, [isExecutionPlanExpanded]);

  const handleCopyToClipboard = async () => {
    try {
      let textToCopy = '';

      // Include execution plan if present (from buffer or message)
      if (hasExecutionPlan) {
        textToCopy += `📋 Execution Plan\n${currentExecutionPlan}\n\n`;
      }

      // Add main message text
      if (message.text) {
        textToCopy += message.text.replace(/⟦|⟧/g, '');
      }

      await window.navigator.clipboard.writeText(textToCopy);
      showToast('Message copied to clipboard');
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
      showToast('Code copied to clipboard');
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
            {(message.text || '').replace(/⟦|⟧/g, '')}
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
      {/* Execution Plan - collapsible if present and not empty (from buffer or message) */}
      {hasExecutionPlan && (
        <Box className={classes.executionPlanContainer}>
          <Box 
            className={classes.executionPlanHeader}
            onClick={handleExecutionPlanToggle}
          >
            <Typography 
              variant="subtitle2" 
              style={{ 
                fontWeight: 600,
                fontSize: '0.75rem', // Reduced font size for more compact header
                display: 'flex',
                alignItems: 'center'
              }}
            >
              📋 Execution Plan
            </Typography>
            <IconButton 
              size="small"
              style={{ 
                padding: '1px', // Reduced padding for more compact button
                opacity: 0.7,
                transition: 'opacity 0.2s',
                width: '20px', // Set smaller fixed width
                height: '20px' // Set smaller fixed height
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleExecutionPlanToggle();
              }}
            >
              {isExecutionPlanExpanded ? <ExpandLessIcon style={{ fontSize: '16px' }} /> : <ExpandMoreIcon style={{ fontSize: '16px' }} />}
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
                {currentExecutionPlan}
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
                {(message.text || '').replace(/⟦|⟧/g, '')}
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
        <Box display="flex" alignItems="center" style={{ gap: theme.spacing(0.5) }}>
          {/* Execution Plan button - commented out as per user request */}
          {/* <Tooltip title={hasExecutionPlan ? "View Execution Plan" : "No execution plan available for this message"}>
            <span>
              <IconButton
                className={classes.copyButton}
                size="small"
                disabled={!hasExecutionPlan}
                onClick={() => hasExecutionPlan && setIsExecutionPlanModalOpen(true)}
                style={{
                  opacity: hasExecutionPlan ? 1 : 0.8,
                  cursor: hasExecutionPlan ? 'pointer' : 'not-allowed',
                  width: '24px',
                  height: '24px',
                  padding: '0px',
                }}
              >
                <AssignmentIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip> */}
          <Tooltip title="Copy message">
            <IconButton
              className={classes.copyButton}
              size="small"
              onClick={handleCopyToClipboard}
              style={{
                width: '24px',  // Explicit width for consistency
                height: '24px', // Explicit height for consistency  
                padding: '0px', // Explicit padding for consistency
              }}
            >
              <FileCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Execution Plan Modal */}
      <Dialog
        open={isExecutionPlanModalOpen}
        onClose={() => setIsExecutionPlanModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: theme.palette.background.paper,
            minHeight: '400px',
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <AssignmentIcon style={{ marginRight: theme.spacing(1) }} />
            <Typography variant="h6">📋 Execution Plan</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            style={{
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.4',
              padding: theme.spacing(1),
              backgroundColor: theme.palette.type === 'dark' 
                ? 'rgba(76, 175, 80, 0.1)' 
                : 'rgba(76, 175, 80, 0.05)',
              borderRadius: theme.spacing(0.5),
              border: `1px solid ${theme.palette.type === 'dark' 
                ? 'rgba(76, 175, 80, 0.3)' 
                : 'rgba(76, 175, 80, 0.2)'}`,
              maxHeight: '60vh',
              overflow: 'auto',
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
                    style={{ 
                      fontSize: '0.8rem',
                      margin: '0.3em 0',
                      fontFamily: 'monospace',
                      lineHeight: '1.4',
                    }}
                    {...props}
                  >
                    {children}
                  </p>
                ),
                h1: ({ children, ...props }) => (
                  <h1
                    style={{ 
                      fontSize: '1rem',
                      fontWeight: 600,
                      margin: '0.4em 0 0.3em 0',
                      fontFamily: 'monospace',
                      lineHeight: '1.3',
                    }}
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2
                    style={{ 
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      margin: '0.3em 0 0.2em 0',
                      fontFamily: 'monospace',
                      lineHeight: '1.3',
                    }}
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3
                    style={{ 
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      margin: '0.25em 0 0.15em 0',
                      fontFamily: 'monospace',
                      lineHeight: '1.3',
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
                      paddingLeft: '1.4em',
                      margin: '0.3em 0',
                      lineHeight: '1.4',
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
                      paddingLeft: '1.4em',
                      margin: '0.3em 0',
                      lineHeight: '1.4',
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
                      margin: '0.15em 0',
                      lineHeight: '1.4',
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
              {currentExecutionPlan}
            </ReactMarkdown>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              try {
                await window.navigator.clipboard.writeText(currentExecutionPlan);
                showToast('Execution plan copied to clipboard');
              } catch (error) {
                alertApi.post({
                  message: 'Failed to copy execution plan',
                  severity: 'error',
                });
              }
            }}
            startIcon={<FileCopyIcon />}
            variant="outlined"
          >
            Copy
          </Button>
          <Button
            onClick={() => setIsExecutionPlanModalOpen(false)}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Toast Notification */}
      <Snackbar
        open={isToastOpen}
        autoHideDuration={5000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleToastClose} severity="success" style={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
});
