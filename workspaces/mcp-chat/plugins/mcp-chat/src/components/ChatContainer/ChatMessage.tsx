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
import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ReactMarkdown from 'react-markdown';
import { BotIcon } from '../BotIcon';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    tools?: string[];
    toolsUsed?: string[];
    toolResponses?: any[];
  };
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
  onCopy?: (text: string) => void;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // Helper functions to avoid nested ternary expressions
  const getAvatarBackgroundColor = () => {
    if (message.isUser) return theme.palette.success.main;
    return isDarkMode
      ? theme.palette.background.paper
      : theme.palette.background.paper;
  };

  const getAvatarColor = () => {
    if (message.isUser) return theme.palette.success.contrastText;
    return isDarkMode
      ? theme.palette.text.primary
      : theme.palette.text.secondary;
  };

  const getCardBackgroundColor = () => {
    if (!message.isUser) return 'transparent';
    return isDarkMode
      ? theme.palette.background.paper
      : theme.palette.background.default;
  };

  const getCardBorder = () => {
    if (!message.isUser) return 'none';
    return `1px solid ${theme.palette.divider}`;
  };

  const handleCopyCode = async (text: string) => {
    try {
      await window.navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text:', err);
    }
  };

  const handleTooltipToggle = (toolName: string) => {
    setSelectedTool(selectedTool === toolName ? null : toolName);
  };

  const getToolResponseForTool = (toolName: string) => {
    if (!message.toolsUsed || !message.toolResponses) {
      return 'No tools used or no tool responses available';
    }

    const toolResponse = message.toolResponses.find(
      response => response.name === toolName,
    );

    if (!toolResponse) {
      return `No response data found for tool: ${toolName}`;
    }

    return JSON.stringify(toolResponse, null, 2);
  };

  const handleCopyToolResponse = async (toolName: string) => {
    try {
      const toolResponse = getToolResponseForTool(toolName);
      await window.navigator.clipboard.writeText(toolResponse);
      setCopiedText(toolResponse);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy tool response:', err);
    }
  };

  const CodeBlock = ({ children, ...props }: any) => {
    const codeText = children?.props?.children || '';
    return (
      <Box sx={{ position: 'relative' }}>
        <pre {...props}>{children}</pre>
        <IconButton
          size="small"
          onClick={() => handleCopyCode(codeText)}
          title={copiedText === codeText ? 'Copied!' : 'Copy code'}
          sx={{
            position: 'absolute',
            top: theme.spacing(0.5),
            right: theme.spacing(0.5),
            padding: theme.spacing(0.5),
            minWidth: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          <FileCopyIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const formatMessage = (text: string) => {
    // Don't render empty or whitespace-only messages as markdown
    if (!text || !text.trim()) {
      return (
        <Typography
          variant="body1"
          sx={{
            fontSize: '0.95rem',
            lineHeight: message.isUser ? 1.5 : 1.6,
            color: theme.palette.text.primary,
            fontWeight: message.isUser ? 500 : 'normal',
            fontFamily: message.isUser
              ? 'inherit'
              : '"Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
        >
          {text}
        </Typography>
      );
    }

    // Check if the message contains markdown-like content
    const hasMarkdown =
      /[#*_`\[\]]/g.test(text) ||
      text.includes('```') ||
      text.includes('\n') ||
      text.includes('|') || // tables
      text.includes('> '); // blockquotes

    if (hasMarkdown) {
      return (
        <Box
          sx={{
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(1),
              fontWeight: 600,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            },
            '& h1': {
              fontSize: '1.5rem',
            },
            '& h2': {
              fontSize: '1.3rem',
            },
            '& h3': {
              fontSize: '1.1rem',
            },
            '& p': {
              margin: theme.spacing(0.5, 0),
              lineHeight: 1.6,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            },
            '& ul, & ol': {
              margin: theme.spacing(0.5, 0),
              paddingLeft: theme.spacing(3),
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            },
            '& li': {
              margin: theme.spacing(0.25, 0),
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            },
            '& blockquote': {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              paddingLeft: theme.spacing(2),
              margin: theme.spacing(1, 0),
              fontStyle: 'italic',
              backgroundColor: theme.palette.background.default,
              padding: theme.spacing(1, 1, 1, 2),
              borderRadius: theme.spacing(0.5),
            },
            '& code': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.text.primary,
              padding: '2px 4px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              fontSize: '0.875em',
            },
            '& pre': {
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.spacing(0.5),
              padding: theme.spacing(1.5),
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              margin: theme.spacing(1, 0),
              overflow: 'auto',
              position: 'relative',
              '& code': {
                backgroundColor: 'transparent',
                padding: 0,
                color: theme.palette.text.primary,
              },
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              margin: theme.spacing(1, 0),
            },
            '& th, & td': {
              border: `1px solid ${theme.palette.divider}`,
              padding: theme.spacing(0.5, 1),
              textAlign: 'left',
            },
            '& th': {
              backgroundColor: theme.palette.action.hover,
              fontWeight: 600,
            },
            '& a': {
              color: theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            '& hr': {
              border: 'none',
              borderTop: `1px solid ${theme.palette.divider}`,
              margin: theme.spacing(2, 0),
            },
          }}
        >
          <ReactMarkdown
            components={{
              pre: CodeBlock,
            }}
          >
            {text}
          </ReactMarkdown>
        </Box>
      );
    }

    // For simple text messages, use Typography with appropriate styling
    return (
      <Typography
        variant="body1"
        sx={{
          fontSize: '0.95rem',
          lineHeight: message.isUser ? 1.5 : 1.6,
          color: theme.palette.text.primary,
          fontWeight: message.isUser ? 500 : 'normal',
          fontFamily: message.isUser
            ? 'inherit'
            : '"Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {text}
      </Typography>
    );
  };

  return (
    <Box
      data-testid="message-container"
      className={message.isUser ? 'user-message' : 'bot-message'}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing(4),
        marginBottom: theme.spacing(3),
      }}
    >
      <Avatar
        sx={{
          width: message.isUser ? 32 : 35,
          height: message.isUser ? 32 : 35,
          fontSize: '1rem',
          marginTop: theme.spacing(0.25),
          backgroundColor: getAvatarBackgroundColor(),
          color: getAvatarColor(),
        }}
      >
        {message.isUser ? (
          <PersonIcon data-testid="person-icon" />
        ) : (
          <BotIcon
            data-testid="bot-icon"
            color={
              isDarkMode
                ? theme.palette.text.primary
                : theme.palette.text.secondary
            }
          />
        )}
      </Avatar>

      <Box>
        <Card
          sx={{
            maxWidth: '100%',
            position: 'relative',
            backgroundColor: getCardBackgroundColor(),
            color: 'inherit',
            border: getCardBorder(),
            borderRadius: message.isUser ? theme.spacing(1) : 0,
            boxShadow: message.isUser ? theme.shadows[1] : 'none',
            '&:hover .message-actions': {
              opacity: 1,
            },
          }}
        >
          <Box
            sx={{
              padding: message.isUser ? theme.spacing(1) : 0,
            }}
          >
            {formatMessage(message.text)}

            {/* Show tools section for tools that were used */}
            {(message.toolsUsed || message.tools) &&
              (message.toolsUsed || message.tools)!.length > 0 && (
                <Box
                  sx={{
                    marginTop: theme.spacing(1.5),
                    padding: theme.spacing(1, 0),
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing(0.5),
                      marginBottom: theme.spacing(1),
                      color: theme.palette.text.primary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      flexWrap: 'wrap',
                    }}
                  >
                    <BuildIcon fontSize="small" />
                    <Typography
                      variant="caption"
                      style={{ fontWeight: 'bold' }}
                    >
                      Tools used ({(message.toolsUsed || message.tools)!.length}
                      )
                    </Typography>
                    {(message.toolsUsed || message.tools)!.map(tool => (
                      <Chip
                        key={tool}
                        label={tool}
                        size="small"
                        clickable
                        onClick={() => handleTooltipToggle(tool)}
                        icon={<CodeIcon fontSize="small" />}
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: 'transparent',
                          color:
                            selectedTool === tool
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                          margin: '0 4px 0 8px',
                          border:
                            selectedTool === tool
                              ? `2px solid ${theme.palette.primary.main}`
                              : `1px solid ${theme.palette.divider}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.text.primary,
                            transform: 'translateY(-1px)',
                          },
                        }}
                      />
                    ))}
                  </Box>

                  {/* Tool responses - shown below the chips */}
                  {(message.toolsUsed || message.tools)!.map(tool => (
                    <Collapse
                      key={`collapse-${tool}`}
                      in={selectedTool === tool}
                    >
                      <Card
                        sx={{
                          marginTop: theme.spacing(1),
                          backgroundColor: theme.palette.background.default,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: theme.spacing(1),
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: theme.spacing(1, 1.5),
                            backgroundColor: theme.palette.action.hover,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.spacing(1, 1, 0, 0),
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                            }}
                          >
                            {tool} Response
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToolResponse(tool)}
                            title={copiedText ? 'Copied!' : 'Copy response'}
                            sx={{
                              color: theme.palette.text.primary,
                            }}
                          >
                            <FileCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box
                          sx={{
                            padding: theme.spacing(1.5),
                            maxHeight: '300px',
                            overflow: 'auto',
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: theme.spacing(0.5),
                              padding: theme.spacing(1.5),
                              fontFamily:
                                'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
                              fontSize: '0.8rem',
                              lineHeight: 1.4,
                              overflow: 'auto',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              color: theme.palette.text.primary,
                            }}
                          >
                            {getToolResponseForTool(tool)}
                          </Box>
                        </Box>
                      </Card>
                    </Collapse>
                  ))}
                </Box>
              )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};
