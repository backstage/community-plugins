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

/**
 * ToolCallDisplay Component
 *
 * Displays individual tool calls with their name, arguments, output, and status.
 * Also includes RAG search activity display.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import ErrorIcon from '@mui/icons-material/Error';

import { stripToolPrefix } from '../../utils';
import { Theme } from '@mui/material/styles';

import { BrandingConfig } from '../../types';
import { ToolCallState } from './StreamingMessage.types';
import { TOOL_STATUS } from './StreamingMessage.constants';
import {
  getToolCallContainerSx,
  getCodeBlockSx,
  getServerLabelChipSx,
  getResultCountChipSx,
  StatusColors,
} from './styles';

// =============================================================================
// PROPS
// =============================================================================

export interface ToolCallDisplayProps {
  /** The tool call state to display */
  tc: ToolCallState;
  theme: Theme;
  branding: BrandingConfig;
  statusColors: StatusColors;
}

export interface RAGSearchDisplayProps {
  /** List of files searched */
  filesSearched: string[];
  theme: Theme;
  branding: BrandingConfig;
  statusColors: StatusColors;
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

/**
 * Renders the appropriate status icon for a tool call
 */
function ToolStatusIcon({
  status,
  branding,
}: {
  status: string;
  branding: BrandingConfig;
}) {
  if (status === TOOL_STATUS.COMPLETED) {
    return (
      <CheckCircleIcon sx={{ fontSize: 16, color: branding.successColor }} />
    );
  }
  if (status === TOOL_STATUS.FAILED) {
    return <ErrorIcon sx={{ fontSize: 16, color: branding.errorColor }} />;
  }
  return (
    <CircularProgress
      size={14}
      thickness={4}
      sx={{ color: branding.primaryColor }}
    />
  );
}

/**
 * Formats and displays tool arguments
 */
function ToolArguments({ args, theme }: { args: string; theme: Theme }) {
  const formattedArgs = (() => {
    try {
      return JSON.stringify(JSON.parse(args || '{}'), null, 2);
    } catch {
      return args;
    }
  })();

  return (
    <Box sx={getCodeBlockSx(theme)}>
      <Typography
        component="pre"
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          m: 0,
          color: 'text.primary',
        }}
      >
        {formattedArgs}
      </Typography>
    </Box>
  );
}

// =============================================================================
// MAIN COMPONENTS
// =============================================================================

/**
 * Renders a single tool call with name, server label, arguments, output, and error
 */
export function ToolCallDisplay({
  tc,
  theme,
  branding,
  statusColors,
}: ToolCallDisplayProps) {
  return (
    <Box sx={getToolCallContainerSx(theme, tc.status, statusColors)}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <ToolStatusIcon status={tc.status} branding={branding} />
        <BuildIcon sx={{ fontSize: 14, color: branding.warningColor }} />
        <Typography
          variant="caption"
          sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}
        >
          {stripToolPrefix(tc.name || tc.type, tc.serverLabel)}
        </Typography>
        {tc.serverLabel && (
          <Chip
            label={tc.serverLabel}
            size="small"
            sx={getServerLabelChipSx(theme, branding.successColor)}
          />
        )}
      </Box>

      {/* Arguments */}
      {tc.arguments && (
        <Box sx={{ mb: tc.output ? 1 : 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              mb: 0.5,
              display: 'block',
            }}
          >
            Arguments
          </Typography>
          <ToolArguments args={tc.arguments} theme={theme} />
        </Box>
      )}

      {/* Output */}
      {tc.output && tc.status === TOOL_STATUS.COMPLETED && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              mb: 0.5,
              display: 'block',
            }}
          >
            Output
          </Typography>
          <Box
            sx={{ ...getCodeBlockSx(theme), maxHeight: 150, overflow: 'auto' }}
          >
            <Typography
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                m: 0,
                color: 'text.primary',
              }}
            >
              {tc.output}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Error */}
      {tc.error && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: branding.errorColor, fontSize: '0.75rem' }}
          >
            Error: {tc.error}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/**
 * Renders the RAG search activity
 */
export function RAGSearchDisplay({
  filesSearched,
  theme,
  branding,
  statusColors,
}: RAGSearchDisplayProps) {
  const hasResults = filesSearched.length > 0;

  return (
    <Box
      sx={getToolCallContainerSx(
        theme,
        hasResults ? TOOL_STATUS.COMPLETED : TOOL_STATUS.IN_PROGRESS,
        statusColors,
      )}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {hasResults ? (
          <CheckCircleIcon
            sx={{ fontSize: 16, color: branding.successColor }}
          />
        ) : (
          <CircularProgress
            size={14}
            thickness={4}
            sx={{ color: branding.infoColor }}
          />
        )}
        <SearchIcon sx={{ fontSize: 14, color: branding.infoColor }} />
        <Typography
          variant="caption"
          sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}
        >
          knowledge_base_search
        </Typography>
        <Chip
          label="Responses API"
          size="small"
          sx={getResultCountChipSx(theme, branding.infoColor)}
        />
        {hasResults && (
          <Chip
            label={`${filesSearched.length} source${
              filesSearched.length > 1 ? 's' : ''
            }`}
            size="small"
            sx={getResultCountChipSx(theme, branding.infoColor)}
          />
        )}
      </Box>
    </Box>
  );
}
