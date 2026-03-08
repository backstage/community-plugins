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
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { CopyButton } from './CopyButton';
import { getCodeBlockSx } from './styles';

const COLLAPSED_MAX_LENGTH = 500;

function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export interface ExpandableOutputProps {
  raw: string;
}

export function ExpandableOutput({ raw }: ExpandableOutputProps) {
  const theme = useTheme();
  const formatted = formatJson(raw);
  const isLong = formatted.length > COLLAPSED_MAX_LENGTH;
  const [showFull, setShowFull] = useState(false);

  const displayText =
    isLong && !showFull
      ? `${formatted.substring(0, COLLAPSED_MAX_LENGTH)}...`
      : formatted;

  return (
    <Box
      sx={{
        ...getCodeBlockSx(theme),
        maxHeight: showFull ? 'none' : 200,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 0.5,
          mb: 0.5,
          position: 'sticky',
          top: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <CopyButton text={formatted} />
        {isLong && (
          <Tooltip
            title={showFull ? 'Collapse' : 'Expand'}
            arrow
            placement="top"
          >
            <IconButton
              size="small"
              onClick={() => setShowFull(prev => !prev)}
              aria-label={showFull ? 'Collapse output' : 'Expand output'}
              sx={{
                p: 0.25,
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.text.primary },
              }}
            >
              {showFull ? (
                <UnfoldLessIcon sx={{ fontSize: 14 }} />
              ) : (
                <UnfoldMoreIcon sx={{ fontSize: 14 }} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>
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
        {displayText}
      </Typography>
    </Box>
  );
}
