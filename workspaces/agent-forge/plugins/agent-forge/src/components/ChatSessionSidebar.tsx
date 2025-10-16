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
  Box,
  Button,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { ChatSession } from '../types/chat';

const useStyles = makeStyles(theme => ({
  sidebar: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
  },
  newChatButton: {
    width: '100%',
    marginBottom: 0,
  },
  sessionsList: {
    flex: 1,
    overflow: 'auto',
    padding: 0,
    minHeight: 0, // Allows flex item to shrink
  },
  sessionItem: {
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  activeSession: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  sessionText: {
    paddingRight: theme.spacing(1),
  },
  deleteButton: {
    padding: theme.spacing(0.5),
  },
  emptyState: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

/**
 * Props for ChatSessionSidebar component
 * @public
 */
export interface ChatSessionSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSwitch: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

/**
 * Component for managing chat sessions
 * @public
 */
export function ChatSessionSidebar({
  sessions,
  currentSessionId,
  onSessionSwitch,
  onNewSession,
  onDeleteSession,
}: ChatSessionSidebarProps) {
  const classes = useStyles();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <Card className={classes.sidebar}>
      <Box className={classes.header}>
        <Typography variant="h6" style={{ marginBottom: 8 }}>
          Chat Sessions
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onNewSession}
          className={classes.newChatButton}
        >
          New Chat
        </Button>
      </Box>

      {sessions.length === 0 ? (
        <Box className={classes.emptyState}>
          <Typography variant="body2">
            No chat sessions yet.
            <br />
            Start a new conversation!
          </Typography>
        </Box>
      ) : (
        <List className={classes.sessionsList}>
          {sessions.map(session => (
            <ListItem
              key={session.id}
              className={`${classes.sessionItem} ${
                session.id === currentSessionId ? classes.activeSession : ''
              }`}
              onClick={() => onSessionSwitch(session.id)}
            >
              <ListItemText
                className={classes.sessionText}
                primary={session.title}
                secondary={formatDate(session.updatedAt)}
                primaryTypographyProps={{
                  variant: 'body2',
                  noWrap: true,
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                }}
              />
              <IconButton
                size="small"
                className={classes.deleteButton}
                onClick={e => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Card>
  );
}
