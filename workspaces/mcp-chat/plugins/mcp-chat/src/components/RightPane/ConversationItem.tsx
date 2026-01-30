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

import { FC, useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { ConversationRecord } from '../../types';

interface ConversationItemProps {
  /** The conversation to display */
  conversation: ConversationRecord;
  /** Whether this conversation is currently selected */
  isSelected: boolean;
  /** Called when the conversation is clicked */
  onSelect: () => void;
  /** Called when the star button is clicked */
  onToggleStar: () => void;
  /** Called when delete is confirmed */
  onDelete: () => void;
}

/**
 * Single conversation item in the history list.
 * Displays title, date, and action buttons (star, delete).
 */
export const ConversationItem: FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onSelect,
  onToggleStar,
  onDelete,
}) => {
  const theme = useTheme();
  const [deleteAnchor, setDeleteAnchor] = useState<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Get display title - use title if available, fallback to first user message
  const getDisplayTitle = (): string => {
    if (conversation.title) {
      return conversation.title;
    }
    const firstUserMessage = conversation.messages.find(m => m.role === 'user');
    const content = firstUserMessage?.content || 'Empty conversation';
    return content.length > 40 ? `${content.substring(0, 40)}...` : content;
  };

  // Format date to relative or absolute
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString();
  };

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setDeleteAnchor(event.currentTarget);
    },
    [],
  );

  const handleDeleteClose = useCallback(() => {
    setDeleteAnchor(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setDeleteAnchor(null);
    onDelete();
  }, [onDelete]);

  const handleStarClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onToggleStar();
    },
    [onToggleStar],
  );

  const showActions = isHovered || isSelected || Boolean(deleteAnchor);

  return (
    <ListItem
      disablePadding
      sx={{ mb: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ListItemButton
        selected={isSelected}
        onClick={onSelect}
        sx={{
          borderRadius: 1,
          padding: theme.spacing(1, 1.5),
          position: 'relative',
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, pr: showActions ? 6 : 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isSelected ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: theme.palette.text.primary,
            }}
          >
            {getDisplayTitle()}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 0.5,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              {formatDate(conversation.updatedAt)}
            </Typography>
            {conversation.toolsUsed && conversation.toolsUsed.length > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.65rem' }}
              >
                {conversation.toolsUsed.length} tool
                {conversation.toolsUsed.length > 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Action buttons - shown on hover or selection */}
        {showActions && (
          <Box
            sx={{
              position: 'absolute',
              right: theme.spacing(1),
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              gap: 0.5,
              backgroundColor: isSelected
                ? theme.palette.action.selected
                : theme.palette.background.paper,
              borderRadius: 1,
              padding: '2px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={handleStarClick}
              sx={{
                padding: 0.5,
                color: conversation.isStarred
                  ? theme.palette.warning.main
                  : theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.warning.main,
                },
              }}
              aria-label={
                conversation.isStarred
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
            >
              {conversation.isStarred ? (
                <StarIcon sx={{ fontSize: 18 }} />
              ) : (
                <StarBorderIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>

            <IconButton
              size="small"
              onClick={handleDeleteClick}
              sx={{
                padding: 0.5,
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.error.main,
                },
              }}
              aria-label="Delete conversation"
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}
      </ListItemButton>

      {/* Delete confirmation popover */}
      <Popover
        open={Boolean(deleteAnchor)}
        anchorEl={deleteAnchor}
        onClose={handleDeleteClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 250 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Delete this conversation? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleDeleteClose}>
              Cancel
            </Button>
            <Button
              size="small"
              color="error"
              variant="contained"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Popover>
    </ListItem>
  );
};
