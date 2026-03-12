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
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import type { Theme } from '@mui/material/styles';
import type { BrandingConfig } from '../../types';

export interface ReasoningDisplayProps {
  reasoning: string;
  reasoningDuration?: number;
  isStreaming: boolean;
  theme: Theme;
  branding: BrandingConfig;
}

/**
 * Renders the model's reasoning/thinking content (collapsible)
 */
export function ReasoningDisplay({
  reasoning,
  reasoningDuration,
  isStreaming,
  theme,
  branding,
}: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const durationText =
    reasoningDuration !== undefined
      ? `Thought for ${reasoningDuration} second${
          reasoningDuration !== 1 ? 's' : ''
        }`
      : 'Thinking...';

  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.02)',
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} reasoning`}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(prev => !prev);
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
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.03)',
          },
        }}
      >
        <PsychologyIcon
          sx={{
            fontSize: 18,
            color: branding.secondaryColor,
            animation: isStreaming ? 'pulse 1.5s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            flex: 1,
          }}
        >
          {durationText}
        </Typography>
        <IconButton size="small" sx={{ p: 0.25 }}>
          {isExpanded ? (
            <ExpandLessIcon sx={{ fontSize: 18 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Box>

      {/* Collapsible content */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
              whiteSpace: 'pre-wrap',
              fontSize: '0.8rem',
              lineHeight: 1.5,
            }}
          >
            {reasoning}
            {isStreaming && (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  width: 6,
                  height: 14,
                  ml: 0.5,
                  backgroundColor: branding.secondaryColor,
                  animation: 'blink 1s step-end infinite',
                  '@keyframes blink': {
                    '50%': { opacity: 0 },
                  },
                }}
              />
            )}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
