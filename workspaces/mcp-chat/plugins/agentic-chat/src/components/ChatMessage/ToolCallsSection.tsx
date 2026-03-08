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
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { ToolCallInfo } from '../../types';
import { useBranding } from '../../hooks';
import {
  getCollapsibleHeaderSx,
  getToolCallContainerSx,
  getCodeBlockSx,
} from './styles';
import { ExpandableOutput } from './ExpandableOutput';

interface ToolCallsSectionProps {
  toolCalls: ToolCallInfo[];
}

import { stripToolPrefix } from '../../utils';

function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function summarizeArguments(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    const keys = Object.keys(parsed);
    if (keys.length === 0) return '';
    return keys
      .map(k => `${k}: ${JSON.stringify(parsed[k]).substring(0, 40)}`)
      .join(', ');
  } catch {
    return '';
  }
}

export const ToolCallsSection = ({ toolCalls }: ToolCallsSectionProps) => {
  const theme = useTheme();
  const { branding } = useBranding();
  const [expanded, setExpanded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(prev => !prev);
    }
  };

  return (
    <Box
      sx={{
        mt: 2,
        pt: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} tool calls`}
        sx={getCollapsibleHeaderSx()}
        onClick={() => setExpanded(prev => !prev)}
        onKeyDown={handleKeyDown}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: toolCalls.some(t => t.error)
              ? theme.palette.warning.main
              : theme.palette.text.secondary,
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          <BuildIcon sx={{ fontSize: 14 }} />
          Used {toolCalls.length} tool{toolCalls.length > 1 ? 's' : ''}
          {' \u2014 '}
          {toolCalls
            .map(t => stripToolPrefix(t.name, t.serverLabel))
            .join(', ')}
        </Typography>
        <IconButton size="small" sx={{ p: 0 }} aria-hidden="true">
          {expanded ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ mt: 1 }}>
          {toolCalls.map(tool => (
            <Box key={tool.id} sx={getToolCallContainerSx(theme, !!tool.error)}>
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                {tool.error ? (
                  <ErrorIcon
                    sx={{
                      fontSize: 16,
                      color: theme.palette.error.main,
                    }}
                  />
                ) : (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 16,
                      color: theme.palette.success.main,
                    }}
                  />
                )}
                <BuildIcon
                  sx={{ fontSize: 14, color: branding.warningColor }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}
                >
                  {stripToolPrefix(tool.name, tool.serverLabel)}
                </Typography>
                {tool.serverLabel && (
                  <Chip
                    label={tool.serverLabel}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.75rem',
                      bgcolor: `${branding.successColor}15`,
                      color: branding.successColor,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              {/* Arguments summary */}
              {tool.arguments && (
                <Box sx={{ mb: tool.output ? 0.5 : 0 }}>
                  {summarizeArguments(tool.arguments) ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        display: 'block',
                      }}
                    >
                      {summarizeArguments(tool.arguments)}
                    </Typography>
                  ) : (
                    <Box sx={getCodeBlockSx(theme)}>
                      <Typography
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          m: 0,
                        }}
                      >
                        {formatJson(tool.arguments)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Output with expand/collapse and copy */}
              {tool.output && <ExpandableOutput raw={tool.output} />}

              {/* Error */}
              {tool.error && (
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.error.main,
                      display: 'block',
                    }}
                  >
                    Error: {tool.error}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};
