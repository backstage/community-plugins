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
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import { useStatus, useDocuments } from '../../hooks';
import { useBranding } from '../../hooks';

/**
 * Agent Status Panel - Clean view of agent status
 */
export const AgentStatusPanel = () => {
  const theme = useTheme();
  const { branding } = useBranding();
  const isDark = theme.palette.mode === 'dark';
  const [expanded, setExpanded] = useState(true); // Default expanded
  const { status, loading } = useStatus();
  const { documents } = useDocuments();

  const providerConnected = status?.provider.connected ?? false;
  const vectorStoreConnected = status?.vectorStore.connected ?? false;
  const mcpAvailable = status?.capabilities?.mcpTools.available ?? false;
  const mcpConfigured = (status?.mcpServers?.length ?? 0) > 0;

  const getStatusText = () => {
    if (loading) return 'Connecting...';
    if (!providerConnected) return 'Offline';
    return 'Ready';
  };

  const getStatusColor = () => {
    if (loading) return theme.palette.warning.main;
    if (!providerConnected) return theme.palette.error.main;
    return theme.palette.success.main;
  };

  const modelName = status?.provider.model || 'Unknown';
  const docCount = documents.length;

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
        aria-label={`${expanded ? 'Collapse' : 'Expand'} agent status panel`}
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
        <SmartToyIcon sx={{ fontSize: 16, color: branding.secondaryColor }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, fontSize: '0.75rem', flex: 1 }}
        >
          {branding.appName} Agent
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

      {/* Details */}
      <Collapse in={expanded}>
        <Box
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            backgroundColor: alpha(theme.palette.background.default, 0.3),
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {/* LLM Provider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CloudIcon
              sx={{ fontSize: 12, color: theme.palette.text.secondary }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', flex: 1 }}>
              {modelName}
            </Typography>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: providerConnected
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
            />
          </Box>

          {/* RAG / Vector Store (optional) */}
          <Tooltip
            title={
              vectorStoreConnected
                ? `RAG enabled: ${status?.vectorStore.id || 'connected'}`
                : 'RAG unavailable (optional) — chat works without it'
            }
            placement="left"
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'help',
              }}
            >
              <StorageIcon
                sx={{ fontSize: 12, color: theme.palette.text.secondary }}
              />
              <Typography
                variant="caption"
                sx={{ fontSize: '0.75rem', flex: 1 }}
              >
                {docCount > 0 ? `RAG: ${docCount} docs` : 'RAG'}
              </Typography>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: vectorStoreConnected
                    ? theme.palette.success.main
                    : alpha(theme.palette.text.secondary, 0.3),
                }}
              />
            </Box>
          </Tooltip>

          {/* MCP Tools (optional) */}
          {mcpConfigured && (
            <Tooltip
              title={
                mcpAvailable
                  ? `MCP tools available: ${status?.mcpServers
                      ?.filter(s => s.connected)
                      .map(s => s.name || s.id)
                      .join(', ')}`
                  : 'MCP tools unavailable (optional) — chat works without them'
              }
              placement="left"
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  cursor: 'help',
                }}
              >
                <BuildIcon
                  sx={{ fontSize: 12, color: theme.palette.text.secondary }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.75rem', flex: 1 }}
                >
                  MCP Tools
                </Typography>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: mcpAvailable
                      ? theme.palette.success.main
                      : alpha(theme.palette.text.secondary, 0.3),
                  }}
                />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
