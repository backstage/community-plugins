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

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';
import type { AgentCapabilities, DiscoveredTool } from '../../../hooks';

export interface McpToolsSectionProps {
  capabilities: Pick<AgentCapabilities, 'mcpServers' | 'mcpTools'>;
  selectedTools: Set<string>;
  onToolToggle: (key: string) => void;
  disabled?: boolean;
}

/**
 * McpToolsSection - MCP servers and tools selector with expandable tool list
 */
export function McpToolsSection({
  capabilities,
  selectedTools,
  onToolToggle,
  disabled,
}: McpToolsSectionProps) {
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const toolsByServer = useMemo(() => {
    const map = new Map<string, DiscoveredTool[]>();
    for (const t of capabilities.mcpTools) {
      const key = t.serverLabel;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [capabilities.mcpTools]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: capabilities.mcpTools.length > 0 ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (capabilities.mcpTools.length > 0) setToolsExpanded(e => !e);
        }}
        role="button"
        tabIndex={0}
      >
        <BuildIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          MCP Servers ({capabilities.mcpServers.length})
          {capabilities.mcpTools.length > 0 &&
            ` · ${selectedTools.size}/${capabilities.mcpTools.length} tools selected`}
        </Typography>
        {capabilities.mcpTools.length > 0 && (
          <IconButton size="small" sx={{ ml: 'auto' }}>
            <ExpandMoreIcon
              sx={{
                transform: toolsExpanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
                fontSize: 18,
              }}
            />
          </IconButton>
        )}
      </Box>

      {/* Server chips (always visible) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
        {capabilities.mcpServers.map(server => (
          <Tooltip
            key={server.id}
            title={
              server.connected
                ? `Connected · ${server.tools.length} tools`
                : 'Offline — server name will still be included in instructions'
            }
            arrow
          >
            <Chip
              label={server.name}
              size="small"
              variant="filled"
              color={server.connected ? 'success' : 'default'}
              sx={{ fontSize: '0.75rem' }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Expandable tool list (only when tools are discovered) */}
      {capabilities.mcpTools.length > 0 && (
        <Collapse in={toolsExpanded}>
          <Box
            sx={{
              pl: 1,
              pt: 0.75,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {Array.from(toolsByServer.entries()).map(([serverLabel, tools]) => (
              <Box key={serverLabel}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, mb: 0.25, display: 'block' }}
                >
                  {serverLabel}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {tools.map(tool => {
                    const key = `${tool.serverId}::${tool.name}`;
                    const selected = selectedTools.has(key);
                    return (
                      <Tooltip
                        key={key}
                        title={tool.description || 'No description available'}
                        arrow
                        placement="top"
                      >
                        <Chip
                          label={tool.name}
                          size="small"
                          variant={selected ? 'filled' : 'outlined'}
                          color={selected ? 'info' : 'default'}
                          onClick={() => onToolToggle(key)}
                          disabled={disabled}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
