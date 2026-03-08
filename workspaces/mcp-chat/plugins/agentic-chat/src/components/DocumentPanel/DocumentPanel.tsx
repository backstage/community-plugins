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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import { useTheme, alpha } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDocuments } from '../../hooks';

/**
 * Document Panel - Clean read-only view of knowledge base documents
 */
export const DocumentPanel = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expanded, setExpanded] = useState(false);
  const { documents, loading, error, refresh } = useDocuments();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasDocuments = documents.length > 0;
  const allCompleted = documents.every(d => d.status === 'completed');

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error';
    if (!hasDocuments) return 'Empty';
    if (allCompleted) return `${documents.length} ready`;
    return `${documents.length} docs`;
  };

  const getStatusColor = () => {
    if (loading) return theme.palette.warning.main;
    if (error) return theme.palette.error.main;
    if (!hasDocuments) return theme.palette.text.secondary;
    if (allCompleted) return theme.palette.success.main;
    return theme.palette.text.secondary;
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        backgroundColor: isDark
          ? alpha(theme.palette.background.paper, 0.4)
          : alpha(theme.palette.background.paper, 0.8),
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} knowledge base panel`}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.3),
          },
        }}
      >
        <FolderIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, fontSize: '0.75rem', flex: 1 }}
        >
          Vector RAG
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontSize: '0.75rem', color: getStatusColor() }}
        >
          • {getStatusText()}
        </Typography>
        <Tooltip title="Refresh">
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              refresh();
            }}
            disabled={loading}
            sx={{ p: 0.25 }}
          >
            <RefreshIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <ExpandMoreIcon
          sx={{
            fontSize: 16,
            color: theme.palette.text.secondary,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </Box>

      {/* Document List - Scrollable when content grows */}
      <Collapse in={expanded}>
        <Box
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            maxHeight: 300, // Shows ~7-8 items comfortably, scrolls for more
            overflowY: 'auto',
            backgroundColor: alpha(theme.palette.background.default, 0.3),
            // Firefox scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(theme.palette.primary.main, 0.4)} ${alpha(
              theme.palette.divider,
              0.2,
            )}`,
            // Webkit scrollbar - always visible style
            '&::-webkit-scrollbar': {
              width: 6,
              backgroundColor: alpha(theme.palette.divider, 0.15),
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.4),
              borderRadius: 3,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.6),
              },
            },
          }}
        >
          {error && (
            <Typography
              variant="caption"
              sx={{ p: 1, color: theme.palette.error.main, display: 'block' }}
            >
              Failed to load
            </Typography>
          )}
          {!loading && !error && documents.length === 0 && (
            <Typography
              variant="caption"
              sx={{
                p: 1,
                color: theme.palette.text.secondary,
                display: 'block',
              }}
            >
              No documents
            </Typography>
          )}
          {documents.map(doc => (
            <Box
              key={doc.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1,
                py: 0.5,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                '&:last-child': { borderBottom: 'none' },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.3),
                },
              }}
            >
              <DescriptionIcon
                sx={{ fontSize: 12, color: theme.palette.text.secondary }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {doc.fileName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  {formatFileSize(doc.fileSize)}
                </Typography>
              </Box>
              {doc.status === 'completed' && (
                <CheckCircleIcon
                  sx={{ fontSize: 12, color: theme.palette.success.main }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};
