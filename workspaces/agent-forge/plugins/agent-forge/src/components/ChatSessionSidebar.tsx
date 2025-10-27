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

import React from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { ChatSession } from '../types/chat';

const useStyles = makeStyles(theme => ({
  sidebar: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease-in-out',
    position: 'relative',
    overflowX: 'hidden',
  },
  collapsed: {
    width: '48px',
  },
  header: {
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    overflowX: 'hidden',
    maxWidth: '100%',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newChatButton: {
    width: '100%',
    marginBottom: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: theme.palette.type === 'dark' ? '#0099ff' : '#0288d1',
    color: '#ffffff',
    borderColor: theme.palette.type === 'dark' ? '#00ccff' : '#0277bd',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#00ccff' : '#01579b',
      borderColor: theme.palette.type === 'dark' ? '#00ffff' : '#004d7a',
    },
  },
  sessionsList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: 0,
    minHeight: 0, // Allows flex item to shrink
  },
  sessionItem: {
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5),
    maxWidth: '100%',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(0, 153, 255, 0.15)'
          : 'rgba(2, 136, 209, 0.1)',
    },
  },
  activeSession: {
    backgroundColor: theme.palette.type === 'dark' ? '#0099ff' : '#0288d1',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#00ccff' : '#01579b',
    },
  },
  sessionText: {
    paddingRight: theme.spacing(1),
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  deleteButton: {
    padding: theme.spacing(0.5),
  },
  emptyState: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  toggleButton: {
    padding: theme.spacing(0.5),
  },
  collapsedContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
  collapsedSessionDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: theme.palette.action.hover,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  collapsedActiveDot: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  noteText: {
    padding: theme.spacing(1.5),
    borderTop: `1px solid ${theme.palette.divider}`,
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
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
  onCollapseChange?: (isCollapsed: boolean) => void;
  sidebarTextFontSize?: string;
  isCollapsed?: boolean;
}

/**
 * Component for managing chat history
 * @public
 */
export function ChatSessionSidebar({
  sessions,
  currentSessionId,
  onSessionSwitch,
  onNewSession,
  onDeleteSession,
  onCollapseChange,
  sidebarTextFontSize,
  isCollapsed: isCollapsedProp,
}: ChatSessionSidebarProps) {
  const classes = useStyles();
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);

  // Use prop if provided, otherwise use internal state
  const isCollapsed =
    isCollapsedProp !== undefined ? isCollapsedProp : internalCollapsed;

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

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    // Update internal state only if not controlled by prop
    if (isCollapsedProp === undefined) {
      setInternalCollapsed(newCollapsedState);
    }
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  if (isCollapsed) {
    return (
      <Card className={`${classes.sidebar} ${classes.collapsed}`}>
        <Box className={classes.collapsedContent}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              size="small"
              onClick={toggleCollapse}
              className={classes.toggleButton}
            >
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="New Chat" placement="right">
            <IconButton size="small" onClick={onNewSession} color="primary">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Box style={{ flex: 1, overflow: 'auto', width: '100%' }}>
            {sessions.map((session, index) => (
              <Tooltip key={session.contextId} title={session.title} placement="right">
                <Box
                  className={`${classes.collapsedSessionDot} ${
                    session.contextId === currentSessionId
                      ? classes.collapsedActiveDot
                      : ''
                  }`}
                  onClick={() => onSessionSwitch(session.contextId)}
                  style={{ marginBottom: 8 }}
                >
                  <Typography variant="caption">{index + 1}</Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card className={classes.sidebar}>
      <Box className={classes.header}>
        <Box className={classes.headerTop}>
          <Typography variant="h6">Chat History</Typography>
          <Tooltip title="Collapse sidebar">
            <IconButton
              size="small"
              onClick={toggleCollapse}
              className={classes.toggleButton}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title="Start a new chat session">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onNewSession}
            className={classes.newChatButton}
          >
            New Chat
          </Button>
        </Tooltip>
      </Box>

      {sessions.length === 0 ? (
        <Box className={classes.emptyState}>
          <Typography variant="body2">
            No chat history yet.
            <br />
            Start a new conversation!
          </Typography>
        </Box>
      ) : (
        <List className={classes.sessionsList}>
          {sessions.map(session => (
            <ListItem
              key={session.contextId}
              className={`${classes.sessionItem} ${
                session.contextId === currentSessionId ? classes.activeSession : ''
              }`}
              onClick={() => onSessionSwitch(session.contextId)}
            >
              <ListItemText
                className={classes.sessionText}
                primary={session.title}
                secondary={formatDate(session.updatedAt)}
                primaryTypographyProps={{
                  variant: 'body2',
                  noWrap: false,
                  style: { fontSize: sidebarTextFontSize || '0.875rem' },
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  style: { fontSize: sidebarTextFontSize || '0.875rem' },
                }}
              />
              <Tooltip title="Delete this chat session">
                <IconButton
                  size="small"
                  className={classes.deleteButton}
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteSession(session.contextId);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      )}
      <Box className={classes.noteText}>
        <Typography variant="caption">
          Note: Chat history is stored locally in your browser and is not saved
          on the server
        </Typography>
      </Box>
    </Card>
  );
}
