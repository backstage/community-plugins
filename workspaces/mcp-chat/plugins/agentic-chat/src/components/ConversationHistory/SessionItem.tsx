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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import { alpha, useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { ChatSessionSummary } from '../../types';

export interface DeleteState {
  confirmDeleteId: string | null;
  deletingId: string | null;
  onDeleteClick: (id: string) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function extractUsername(userRef?: string): string {
  if (!userRef) return '';
  const parts = userRef.split('/');
  return parts[parts.length - 1] || userRef;
}

export interface SessionItemProps {
  /** Session data */
  session: ChatSessionSummary;
  /** Whether this session is currently active */
  isActive: boolean;
  /** Whether to show user attribution (admin view) */
  showAllUsers: boolean;
  /** Delete confirmation and handlers */
  deleteState: DeleteState;
  /** Format timestamp for display */
  formatTime: (date: Date) => string;
  /** Called when session is selected */
  onSelect: () => void;
  /** Fade-in delay index for staggered animation */
  fadeIndex?: number;
}

export function SessionItem({
  session,
  isActive,
  showAllUsers,
  deleteState,
  formatTime,
  onSelect,
  fadeIndex = 0,
}: SessionItemProps) {
  const {
    confirmDeleteId,
    deletingId,
    onDeleteClick,
    onConfirmDelete,
    onCancelDelete,
  } = deleteState;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isConfirming = confirmDeleteId === session.id;

  return (
    <Fade in timeout={200 + fadeIndex * 50}>
      <Box
        sx={{
          p: 1.5,
          cursor: 'pointer',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
          background: isActive
            ? alpha(theme.palette.primary.main, 0.1)
            : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: alpha(
              theme.palette.primary.main,
              isActive ? 0.15 : 0.05,
            ),
            '& .delete-btn': {
              opacity: 1,
            },
          },
          '&:last-child': {
            borderBottom: 'none',
          },
        }}
        onClick={onSelect}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.primary.main, 0.1),
              flexShrink: 0,
            }}
          >
            <SmartToyIcon
              sx={{
                fontSize: 14,
                color: theme.palette.primary.main,
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.8rem',
                lineHeight: 1.4,
              }}
            >
              {session.title}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.5,
              }}
            >
              {showAllUsers && session.userRef && (
                <>
                  <PersonIcon
                    sx={{
                      fontSize: 11,
                      color: theme.palette.info.main,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.info.main,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      mr: 0.5,
                    }}
                  >
                    {extractUsername(session.userRef)}
                  </Typography>
                </>
              )}
              <AccessTimeIcon
                sx={{
                  fontSize: 11,
                  color: theme.palette.text.secondary,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                }}
              >
                {formatTime(new Date(session.updatedAt))}
              </Typography>
            </Box>
          </Box>
          {isConfirming ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
              }}
              onClick={e => e.stopPropagation()}
            >
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={e => {
                  e.stopPropagation();
                  onConfirmDelete();
                }}
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.25,
                  fontSize: '0.65rem',
                  textTransform: 'none',
                  lineHeight: 1.4,
                }}
              >
                Delete
              </Button>
              <Button
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  onCancelDelete();
                }}
                sx={{
                  minWidth: 0,
                  px: 0.75,
                  py: 0.25,
                  fontSize: '0.65rem',
                  textTransform: 'none',
                  color: theme.palette.text.secondary,
                  lineHeight: 1.4,
                }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Tooltip title="Delete conversation">
              <IconButton
                className="delete-btn"
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  onDeleteClick(session.id);
                }}
                disabled={deletingId === session.id}
                aria-label="Delete conversation"
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  color: theme.palette.error.main,
                  '&:focus': { opacity: 1 },
                  '&:hover': {
                    background: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                {deletingId === session.id ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Fade>
  );
}
