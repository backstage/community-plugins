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

import { MarkdownContent } from '@backstage/core-components';
import {
  identityApiRef,
  useApi,
  alertApiRef,
} from '@backstage/core-plugin-api';
import { Box, Typography, makeStyles, IconButton } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import useAsync from 'react-use/esm/useAsync';
import { Message } from '../types';

const useStyles = makeStyles(theme => ({
  messageBox: {
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
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
}));

/**
 * Properties for the ChatMessage component
 * @public
 */
export interface ChatMessageProps {
  message: Message;
}

/**
 * Individual chat message component with user profile integration
 * @public
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const alertApi = useApi(alertApiRef);
  const { value: profile } = useAsync(() => identityApi.getProfileInfo());

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

  if (message.isUser) {
    return (
      <Box className={`${classes.messageBox} ${classes.userMessage}`}>
        <Box
          display="flex"
          alignItems="center"
          marginBottom={1}
          style={{ gap: 8 }}
        >
          <Box
            width={20}
            height={20}
            borderRadius="50%"
            style={{
              backgroundColor: '#1b0b34',
              backgroundImage: profile?.picture
                ? `url("${profile.picture}")`
                : undefined,
              backgroundSize: 'cover',
            }}
          />
          <Typography
            variant="caption"
            style={{ fontWeight: 700, color: 'inherit' }}
          >
            You
          </Typography>
        </Box>
        <Box
          style={{
            wordBreak: 'break-word',
            color: 'inherit',
          }}
        >
          <MarkdownContent
            content={message.text || ''}
            transformLinkUri={uri => (uri.startsWith('http') ? uri : '')}
            linkTarget="_blank"
          />
        </Box>
        <Typography
          variant="caption"
          style={{
            opacity: 0.7,
            fontSize: '0.75rem',
            color: 'inherit',
            display: 'block',
            marginTop: 4,
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
        <MarkdownContent
          content={message.text || ''}
          transformLinkUri={uri => (uri.startsWith('http') ? uri : '')}
          linkTarget="_blank"
        />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="caption"
          style={{
            opacity: 0.7,
            fontSize: '0.75rem',
            color: 'inherit',
          }}
        >
          {message.timestamp}
        </Typography>
        <IconButton
          className={classes.copyButton}
          size="small"
          onClick={handleCopyToClipboard}
          title="Copy message"
        >
          <FileCopyIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
