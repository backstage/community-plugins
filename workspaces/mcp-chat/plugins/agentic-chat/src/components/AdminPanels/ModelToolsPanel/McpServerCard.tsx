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
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LockIcon from '@mui/icons-material/Lock';
import BuildIcon from '@mui/icons-material/Build';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GppGoodIcon from '@mui/icons-material/GppGood';
import { useTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { MCPServerStatus } from '../../../types';
import type { McpServer } from './mcpServerTypes';

function chipLabel(
  isDisabled: boolean | undefined,
  isOverridden: boolean | undefined,
  isYaml: boolean,
): string {
  if (isDisabled) return 'Disabled';
  if (isOverridden) return 'Overridden';
  if (isYaml) return 'YAML';
  return 'Admin';
}

function chipBgColor(
  theme: Theme,
  isDisabled: boolean | undefined,
  isOverridden: boolean | undefined,
  isYaml: boolean,
): string {
  if (isDisabled) return alpha(theme.palette.text.disabled, 0.1);
  if (isOverridden) return alpha(theme.palette.warning.main, 0.15);
  if (isYaml) return alpha(theme.palette.info.main, 0.1);
  return alpha(theme.palette.warning.main, 0.1);
}

function chipFgColor(
  theme: Theme,
  isDisabled: boolean | undefined,
  isOverridden: boolean | undefined,
  isYaml: boolean,
): string {
  if (isDisabled) return theme.palette.text.disabled;
  if (isOverridden) return theme.palette.warning.dark;
  if (isYaml) return theme.palette.info.main;
  return theme.palette.warning.main;
}

export interface McpServerCardProps {
  server: McpServer;
  statusInfo?: MCPServerStatus;
  isYaml: boolean;
  isOverridden?: boolean;
  isDisabled?: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  onDisable?: () => void;
}

export function McpServerCard({
  server,
  statusInfo,
  isYaml,
  isOverridden,
  isDisabled,
  onRemove,
  onEdit,
  onDisable,
}: McpServerCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const connected = statusInfo?.connected ?? false;
  const tools = statusInfo?.tools ?? [];
  const toolCount = statusInfo?.toolCount ?? tools.length;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        mb: 1,
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.25,
          gap: 1.5,
          cursor: connected && toolCount > 0 ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (connected && toolCount > 0) setExpanded(!expanded);
        }}
      >
        {/* Status indicator */}
        <Tooltip
          title={connected ? 'Connected' : statusInfo?.error || 'Disconnected'}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {connected ? (
              <CheckCircleIcon
                sx={{ fontSize: 18, color: theme.palette.success.main }}
              />
            ) : (
              <ErrorIcon
                sx={{ fontSize: 18, color: theme.palette.error.main }}
              />
            )}
          </Box>
        </Tooltip>

        {/* Server name and ID */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {server.name || server.id}
            </Typography>
            {isYaml && !isOverridden && !isDisabled && (
              <Tooltip title="Defined in YAML — click edit to override">
                <LockIcon
                  sx={{
                    fontSize: 14,
                    color: theme.palette.text.disabled,
                  }}
                />
              </Tooltip>
            )}
          </Box>
          <Typography
            variant="caption"
            color="textSecondary"
            noWrap
            sx={{ display: 'block' }}
          >
            {server.id} · {server.type}
            {server.allowedTools && server.allowedTools.length > 0 && (
              <> · {server.allowedTools.length} tools allowed</>
            )}
          </Typography>
        </Box>

        {/* Tools badge */}
        {connected && toolCount > 0 && (
          <Chip
            icon={<BuildIcon sx={{ fontSize: '14px !important' }} />}
            label={`${toolCount} tool${toolCount !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            color="success"
            sx={{ '&.MuiChip-root': { fontSize: '0.75rem' } }}
          />
        )}

        {/* HITL badge */}
        {server.requireApproval === 'always' && (
          <Tooltip title="Human-in-the-loop: tool calls require approval">
            <Chip
              icon={<GppGoodIcon sx={{ fontSize: '14px !important' }} />}
              label="HITL"
              size="small"
              variant="outlined"
              color="info"
              sx={{ '&.MuiChip-root': { fontSize: '0.7rem' } }}
            />
          </Tooltip>
        )}

        {/* Type badge */}
        <Chip
          label={server.type}
          size="small"
          variant="outlined"
          sx={{ '&.MuiChip-root': { fontSize: '0.7rem' } }}
        />

        {/* Source badge */}
        <Chip
          label={chipLabel(isDisabled, isOverridden, isYaml)}
          size="small"
          sx={{
            '&.MuiChip-root': {
              fontSize: '0.7rem',
              backgroundColor: chipBgColor(
                theme,
                isDisabled,
                isOverridden,
                isYaml,
              ),
              color: chipFgColor(theme, isDisabled, isOverridden, isYaml),
            },
          }}
        />

        {/* Actions */}
        {onEdit && !isDisabled && (
          <Tooltip title="Edit server">
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {isYaml && onDisable && (
          <Tooltip title={isDisabled ? 'Re-enable server' : 'Disable server'}>
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                onDisable();
              }}
            >
              <BlockIcon
                fontSize="small"
                sx={{
                  color: isDisabled
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
        {!isYaml && onRemove && (
          <Tooltip title="Remove server">
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Expand toggle for tools */}
        {connected && toolCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: -0.5 }}>
            {expanded ? (
              <ExpandLessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            )}
          </Box>
        )}
      </Box>

      {/* Error message for disconnected servers */}
      {!connected && statusInfo?.error && (
        <Box
          sx={{
            px: 2,
            pb: 1,
            pt: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: theme.palette.error.main }}
          >
            {statusInfo.error}
          </Typography>
        </Box>
      )}

      {/* Expandable tools list */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2,
            pb: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            pt: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              display: 'block',
              mb: 0.75,
            }}
          >
            Available Tools
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tools.map(tool => (
              <Tooltip
                key={tool.name}
                title={tool.description || 'No description'}
                placement="top"
              >
                <Chip
                  label={tool.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    '&.MuiChip-root': {
                      fontSize: '0.7rem',
                      height: 24,
                    },
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
