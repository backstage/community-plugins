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
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MemoryIcon from '@mui/icons-material/Memory';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { MCPServer } from '../../types';

interface ActiveMcpServersProps {
  mcpServers: MCPServer[];
  onServerToggle: (serverId: string) => void;
}

const getChipBackgroundColor = (server: MCPServer, theme: any) => {
  if (!server.status?.connected) {
    return 'transparent';
  }
  if (server.enabled) {
    return theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : 'transparent';
  }
  return 'transparent';
};

const getChipColor = (server: MCPServer, theme: any) => {
  if (!server.status?.connected) {
    return theme.palette.error.main;
  }
  if (server.enabled) {
    return theme.palette.mode === 'dark'
      ? theme.palette.success.light
      : theme.palette.success.dark;
  }
  return theme.palette.text.secondary;
};

const getChipBorder = (server: MCPServer, theme: any) => {
  if (!server.status?.connected) {
    return `2px solid ${theme.palette.error.main}`;
  }
  return server.enabled
    ? `2px solid ${theme.palette.success.main}`
    : `2px solid ${theme.palette.divider}`;
};

const getDotColor = (server: MCPServer, theme: any) => {
  if (!server.status?.connected) {
    return theme.palette.error.main;
  }
  return server.enabled ? theme.palette.success.main : theme.palette.grey[500];
};

export const ActiveMcpServers = ({
  mcpServers,
  onServerToggle,
}: ActiveMcpServersProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        padding: theme.spacing(2),
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 1.5,
        }}
      >
        <MemoryIcon
          sx={{
            marginRight: 0.5,
            marginBottom: '2.5px',
            color: theme.palette.text.primary,
            fontSize: '1.1rem',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          Active MCP Servers
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {mcpServers.map(server => (
          <Tooltip
            key={server.id}
            title={
              server.status?.connected
                ? `Click to ${server.enabled ? 'disable' : 'enable'} ${
                    server.name
                  } server`
                : `Not connected: ${server.status?.error || 'Unknown error'}`
            }
            arrow
          >
            <Chip
              label={server.name}
              clickable={server.status?.connected}
              onClick={
                server.status?.connected
                  ? () => onServerToggle(server.id)
                  : undefined
              }
              icon={
                <FiberManualRecordIcon
                  sx={{
                    fill: getDotColor(server, theme),
                    fontSize: '10px !important',
                    marginLeft: '8px',
                  }}
                />
              }
              sx={{
                transition: 'all 0.2s ease',
                cursor: server.status?.connected ? 'pointer' : 'help',
                backgroundColor: getChipBackgroundColor(server, theme),
                color: getChipColor(server, theme),
                border: getChipBorder(server, theme),
                fontSize: '0.75rem',
                fontWeight: server.enabled ? 600 : 400,
                '& .MuiChip-icon': {
                  marginLeft: '8px',
                  marginRight: '4px',
                },
                ...(server.status?.connected && {
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[2],
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: theme.shadows[1],
                  },
                }),
              }}
              size="small"
            />
          </Tooltip>
        ))}
      </Box>
      {mcpServers.length === 0 && (
        <Typography
          variant="caption"
          style={{
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
            textAlign: 'center',
            display: 'block',
            padding: '12px 0',
          }}
        >
          No MCP servers configured
        </Typography>
      )}
    </Box>
  );
};
