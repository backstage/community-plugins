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
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import ReactMarkdown from 'react-markdown';
import { BotIcon } from '../BotIcon';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  message: {
    text: string;
    isUser: boolean;
  };
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
  onCopy?: (text: string) => void;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

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
          </Box>
        </Card>
      </Box>
    </Box>
  );
};
