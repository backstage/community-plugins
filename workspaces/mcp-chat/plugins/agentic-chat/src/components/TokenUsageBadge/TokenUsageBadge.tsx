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
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import { useTheme, alpha } from '@mui/material/styles';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import type { ResponseUsage } from '@backstage-community/plugin-agentic-chat-common';

const numberFormatter = new Intl.NumberFormat();

function formatTokenCount(count: number): string {
  return numberFormatter.format(count);
}

interface TokenUsageBadgeProps {
  usage: ResponseUsage;
}

export const TokenUsageBadge = ({ usage }: TokenUsageBadgeProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isDark = theme.palette.mode === 'dark';

  const cachedTokens = usage.input_tokens_details?.cached_tokens ?? 0;
  const reasoningTokens = usage.output_tokens_details?.reasoning_tokens ?? 0;

  const tooltipContent = useMemo(() => {
    const lines = [
      `Input: ${formatTokenCount(usage.input_tokens)} tokens`,
      `Output: ${formatTokenCount(usage.output_tokens)} tokens`,
      `Total: ${formatTokenCount(usage.total_tokens)} tokens`,
    ];
    if (cachedTokens > 0)
      lines.push(`Cached: ${formatTokenCount(cachedTokens)} tokens`);
    if (reasoningTokens > 0)
      lines.push(`Reasoning: ${formatTokenCount(reasoningTokens)} tokens`);
    lines.push('', 'Reported by inference server');
    return lines.join('\n');
  }, [usage, cachedTokens, reasoningTokens]);

  const inColor = isDark ? theme.palette.info.light : theme.palette.info.dark;
  const outColor = isDark
    ? theme.palette.success.light
    : theme.palette.success.dark;
  const totalColor = isDark
    ? theme.palette.secondary.light
    : theme.palette.secondary.dark;
  const mutedColor = theme.palette.text.secondary;

  const tokenChipSx = (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    px: 0.75,
    py: '1px',
    borderRadius: '4px',
    backgroundColor: alpha(color, isDark ? 0.15 : 0.08),
  });

  const tokenTextSx = (color: string, small = false) => ({
    fontSize: small ? '0.68rem' : '0.72rem',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums' as const,
    whiteSpace: 'nowrap' as const,
    color,
    lineHeight: 1.4,
  });

  const separatorSx = {
    fontSize: '0.6rem',
    color: theme.palette.text.disabled,
    mx: '1px',
    userSelect: 'none' as const,
  };

  return (
    <Tooltip
      title={<span style={{ whiteSpace: 'pre-line' }}>{tooltipContent}</span>}
      arrow
      placement="top"
    >
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Token usage: ${formatTokenCount(
          usage.input_tokens,
        )} input, ${formatTokenCount(
          usage.output_tokens,
        )} output, ${formatTokenCount(usage.total_tokens)} total`}
        aria-expanded={expanded}
        onClick={() => setExpanded(prev => !prev)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(prev => !prev);
          }
        }}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          px: 0.5,
          py: '2px',
          borderRadius: '6px',
          cursor: 'pointer',
          border: `1px solid ${alpha(
            theme.palette.divider,
            isDark ? 0.2 : 0.15,
          )}`,
          backgroundColor: alpha(
            theme.palette.background.paper,
            isDark ? 0.4 : 0.6,
          ),
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: alpha(
              theme.palette.action.hover,
              isDark ? 0.12 : 0.06,
            ),
            borderColor: alpha(theme.palette.divider, 0.4),
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 1,
          },
        }}
      >
        <DataUsageIcon sx={{ fontSize: 12, color: mutedColor, opacity: 0.7 }} />

        <Box sx={tokenChipSx(inColor)}>
          <Typography
            variant="caption"
            component="span"
            sx={tokenTextSx(inColor)}
          >
            {formatTokenCount(usage.input_tokens)} in
          </Typography>
        </Box>

        <Typography component="span" sx={separatorSx}>
          ·
        </Typography>

        <Box sx={tokenChipSx(outColor)}>
          <Typography
            variant="caption"
            component="span"
            sx={tokenTextSx(outColor)}
          >
            {formatTokenCount(usage.output_tokens)} out
          </Typography>
        </Box>

        <Collapse in={expanded} orientation="horizontal" unmountOnExit>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              ml: '2px',
            }}
          >
            <Typography component="span" sx={separatorSx}>
              ·
            </Typography>
            <Box sx={tokenChipSx(totalColor)}>
              <Typography
                variant="caption"
                component="span"
                sx={tokenTextSx(totalColor)}
              >
                {formatTokenCount(usage.total_tokens)} total
              </Typography>
            </Box>
            {cachedTokens > 0 && (
              <>
                <Typography component="span" sx={separatorSx}>
                  ·
                </Typography>
                <Box sx={tokenChipSx(mutedColor)}>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={tokenTextSx(mutedColor, true)}
                  >
                    {formatTokenCount(cachedTokens)} cached
                  </Typography>
                </Box>
              </>
            )}
            {reasoningTokens > 0 && (
              <>
                <Typography component="span" sx={separatorSx}>
                  ·
                </Typography>
                <Box sx={tokenChipSx(mutedColor)}>
                  <Typography
                    variant="caption"
                    component="span"
                    sx={tokenTextSx(mutedColor, true)}
                  >
                    {formatTokenCount(reasoningTokens)} reasoning
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Collapse>
      </Box>
    </Tooltip>
  );
};
