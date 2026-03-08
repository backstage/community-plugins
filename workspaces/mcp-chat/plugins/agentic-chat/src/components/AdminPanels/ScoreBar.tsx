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
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import type { Theme } from '@mui/material/styles';
import { getScoreColor, getScoreLabel } from './ragResultsUtils';

export interface ScoreBarProps {
  score: number;
  theme: Theme;
}

export const ScoreBar = ({ score, theme }: ScoreBarProps) => {
  const pct = score * 100;
  const color = getScoreColor(score, theme);
  const label = getScoreLabel(score);
  return (
    <Tooltip title={`${label} relevance`} placement="left">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 130,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            height: 6,
            borderRadius: 3,
            bgcolor: 'grey.200',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${pct}%`,
              height: '100%',
              borderRadius: 3,
              bgcolor: color,
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color,
            minWidth: 44,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {pct.toFixed(1)}%
        </Typography>
      </Box>
    </Tooltip>
  );
};
