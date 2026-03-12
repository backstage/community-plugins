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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';
import { McpIcon } from '../icons';
import { StatusDot } from './StatusDot';
import { useStatus } from '../../hooks';

export interface AgentInfoSectionProps {
  expanded: boolean;
  onToggleExpanded: () => void;
}

export const AgentInfoSection = ({
  expanded,
  onToggleExpanded,
}: AgentInfoSectionProps) => {
  const theme = useTheme();
  const { status, loading } = useStatus();

  const providerConnected = status?.provider.connected ?? false;
  const vectorStoreConnected = status?.vectorStore.connected ?? false;
  const vectorStoreId = status?.vectorStore.id;
  const docCount = status?.vectorStore.totalDocuments ?? 0;
  const mcpServers = status?.mcpServers ?? [];
  const mcpConnected = mcpServers.filter(s => s.connected).length;
  const modelName = status?.provider.model || 'Unknown';

  const overallReady = !loading && providerConnected;

  const agentStatusColor = (() => {
    if (overallReady) return theme.palette.success.main;
    if (loading) return theme.palette.warning.main;
    return theme.palette.error.main;
  })();

  const agentStatusText = (() => {
    if (loading) return 'Connecting...';
    if (overallReady) return 'Ready';
    return 'Offline';
  })();

  return (
    <Box
      sx={{
        flexShrink: 0,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
      }}
    >
      {/* Header — toggles detail view */}
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} agent info`}
        onClick={onToggleExpanded}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpanded();
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.5),
          },
        }}
      >
        <SmartToyIcon
          sx={{
            fontSize: 18,
            color: agentStatusColor,
          }}
        />
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: '0.8125rem', flex: 1 }}
        >
          Agent Info
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            color: agentStatusColor,
          }}
        >
          {agentStatusText}
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

      {/* Status rows */}
      {expanded && (
        <Box
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            px: 1.5,
            py: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          {/* LLM Model */}
          <Tooltip title={modelName} placement="left">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'help',
              }}
            >
              <CloudOutlinedIcon
                sx={{
                  fontSize: 15,
                  color: theme.palette.text.secondary,
                }}
              />
              <Typography
                variant="caption"
                noWrap
                sx={{
                  fontSize: '0.75rem',
                  flex: 1,
                  color: theme.palette.text.primary,
                }}
              >
                {modelName}
              </Typography>
              <StatusDot connected={providerConnected} loading={loading} />
            </Box>
          </Tooltip>

          {/* Vector RAG */}
          <Tooltip
            title={
              vectorStoreConnected
                ? `Vector store: ${vectorStoreId || 'connected'}`
                : 'Vector store unavailable (optional)'
            }
            placement="left"
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'help',
              }}
            >
              <FolderOutlinedIcon
                sx={{
                  fontSize: 15,
                  color: theme.palette.text.secondary,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  flex: 1,
                  color: theme.palette.text.primary,
                }}
              >
                Vector RAG
                {vectorStoreConnected && docCount > 0
                  ? ` (${docCount} docs)`
                  : ''}
              </Typography>
              <StatusDot connected={vectorStoreConnected} optional />
            </Box>
          </Tooltip>

          {/* MCP Servers */}
          {mcpServers.length > 0 && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <McpIcon
                  sx={{
                    fontSize: 15,
                    color: theme.palette.text.secondary,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    flex: 1,
                    color: theme.palette.text.primary,
                  }}
                >
                  MCP Servers ({mcpConnected}/{mcpServers.length})
                </Typography>
                <StatusDot
                  connected={mcpConnected === mcpServers.length}
                  optional
                />
              </Box>

              {mcpServers.map(server => (
                <Tooltip
                  key={server.id}
                  title={
                    server.connected
                      ? `Connected: ${server.url}${
                          server.toolCount ? ` · ${server.toolCount} tools` : ''
                        }`
                      : server.error || 'Disconnected'
                  }
                  placement="left"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      pl: 3.5,
                      cursor: 'help',
                    }}
                  >
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        fontSize: '0.75rem',
                        flex: 1,
                        color: server.connected
                          ? theme.palette.text.secondary
                          : alpha(theme.palette.text.secondary, 0.5),
                      }}
                    >
                      {server.name || server.id}
                    </Typography>
                    {server.connected && (server.toolCount ?? 0) > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.25,
                        }}
                      >
                        <BuildIcon
                          sx={{
                            fontSize: 11,
                            color: theme.palette.text.disabled,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.65rem',
                            color: theme.palette.text.disabled,
                          }}
                        >
                          {server.toolCount}
                        </Typography>
                      </Box>
                    )}
                    <StatusDot connected={server.connected} optional />
                  </Box>
                </Tooltip>
              ))}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};
