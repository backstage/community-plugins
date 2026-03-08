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
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import { useTheme, alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useStatus, useBranding } from '../../hooks';
import { McpIcon } from '../icons';

/**
 * Status Panel - Clean read-only view of MCP server connections
 */
export const StatusPanel = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expanded, setExpanded] = useState(false);
  const { status, loading } = useStatus();
  const { branding } = useBranding();

  // Don't show if no MCP servers
  if (!status?.mcpServers || status.mcpServers.length === 0) {
    return null;
  }

  const connectedCount = status.mcpServers.filter(s => s.connected).length;
  const totalCount = status.mcpServers.length;

  const getStatusText = () => {
    if (loading) return 'Checking...';
    if (connectedCount === totalCount) return `${totalCount} connected`;
    if (connectedCount > 0) return `${connectedCount}/${totalCount}`;
    return 'Offline';
  };

  const getStatusColor = () => {
    if (loading) return theme.palette.text.secondary;
    if (connectedCount === totalCount) return theme.palette.success.main;
    if (connectedCount > 0) return theme.palette.warning.main;
    return theme.palette.error.main;
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
        aria-label={`${expanded ? 'Collapse' : 'Expand'} MCP servers panel`}
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
        <McpIcon sx={{ fontSize: 16, color: branding.successColor }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, fontSize: '0.75rem', flex: 1 }}
        >
          MCP Servers
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontSize: '0.75rem', color: getStatusColor() }}
        >
          • {getStatusText()}
        </Typography>
        <ExpandMoreIcon
          sx={{
            fontSize: 16,
            color: theme.palette.text.secondary,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </Box>

      {/* Server List - Scrollable when content grows */}
      <Collapse in={expanded}>
        <Box
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            maxHeight: 200, // Shows ~6 servers, scrolls for more
            overflowY: 'auto',
            backgroundColor: alpha(theme.palette.background.default, 0.3),
            // Firefox scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(branding.successColor, 0.4)} ${alpha(
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
              backgroundColor: alpha(branding.successColor, 0.4),
              borderRadius: 3,
              '&:hover': {
                backgroundColor: alpha(branding.successColor, 0.6),
              },
            },
          }}
        >
          {status.mcpServers.map(server => (
            <Box
              key={server.id}
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
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: server.connected
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  boxShadow: server.connected
                    ? `0 0 4px ${alpha(theme.palette.success.main, 0.5)}`
                    : 'none',
                }}
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
                    color: server.connected
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                  }}
                >
                  {server.name}
                </Typography>
              </Box>
              <Tooltip
                title={
                  server.connected
                    ? 'Connected'
                    : server.error || 'Disconnected'
                }
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    color: server.connected
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  }}
                >
                  {server.connected ? 'Ready' : 'Off'}
                </Typography>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};
