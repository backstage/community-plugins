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
import MemoryIcon from '@mui/icons-material/Memory';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

interface MCPServer {
  id?: string;
  name: string;
  enabled: boolean;
  type?: string;
  hasUrl?: boolean;
  hasNpxCommand?: boolean;
  hasScriptPath?: boolean;
}

interface ActiveMcpServersProps {
  mcpServers: MCPServer[];
  onServerToggle: (serverName: string) => void;
}

export const ActiveMcpServers = ({
  mcpServers,
  onServerToggle,
}: ActiveMcpServersProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Helper functions to avoid nested ternary expressions
  const getChipBackgroundColor = (server: MCPServer) => {
    if (server.enabled) {
      return isDarkMode ? '#2d4a2d' : '#e8f5e8';
    }
    return 'transparent';
  };

  const getChipColor = (server: MCPServer) => {
    if (server.enabled) {
      return '#4CAF50';
    }
    return isDarkMode ? '#999999' : '#666666';
  };

  const getChipBorder = (server: MCPServer) => {
    if (server.enabled) {
      return '2px solid #4CAF50';
    }
    return `2px solid ${isDarkMode ? '#555555' : '#ddd'}`;
  };

  return (
    <Box
      sx={{
        padding: theme.spacing(2),
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: isDarkMode ? '#2a2a2a' : '#fafafa',
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <MemoryIcon
          style={{
            marginRight: '4px',
            marginBottom: '2.5px',
            color: theme.palette.text.primary,
            fontSize: '1.1rem',
          }}
        />
        <Typography
          variant="caption"
          style={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          Active MCP Servers
        </Typography>
      </Box>
      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {mcpServers.map(server => (
          <Tooltip
            key={server.name}
            title={`Click to ${server.enabled ? 'disable' : 'enable'} ${
              server.name
            } server`}
            arrow
          >
            <Chip
              label={server.name}
              clickable
              onClick={() => onServerToggle(server.name)}
              sx={{
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                backgroundColor: getChipBackgroundColor(server),
                color: getChipColor(server),
                border: getChipBorder(server),
                fontSize: '0.75rem',
                fontWeight: server.enabled ? 600 : 400,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                },
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
