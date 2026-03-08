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
import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import type { SwimLaneCard as SwimLaneCardType } from '../../types';
import { getCardSx, getCardIconSx } from './styles';
import { getIconForName } from './iconUtils';

interface SwimLaneCardProps {
  readonly card: SwimLaneCardType;
  readonly laneColor: string;
  readonly isDark: boolean;
  readonly onClick: (card: SwimLaneCardType) => void;
}

const ACTION_AREA_SX = {
  height: '100%',
  borderRadius: 2,
  display: 'block',
  textAlign: 'left',
  width: '100%',
  '&.MuiButtonBase-root': {
    display: 'block',
    justifyContent: 'flex-start',
  },
} as const;

const CONTENT_SX = {
  height: '100%',
  width: '100%',
  px: 2,
  py: 1.5,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 1.5,
  boxSizing: 'border-box',
} as const;

const TITLE_SX = {
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'text.primary',
  lineHeight: 1.3,
} as const;

const DESCRIPTION_SX = {
  color: 'text.secondary',
  fontSize: '0.75rem',
  lineHeight: 1.3,
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  mt: 0.25,
} as const;

export const SwimLaneCard: React.FC<SwimLaneCardProps> = ({
  card,
  laneColor,
  isDark,
  onClick,
}) => {
  const theme = useTheme();

  return (
    <Card sx={getCardSx(isDark, laneColor, false)}>
      <CardActionArea onClick={() => onClick(card)} sx={ACTION_AREA_SX}>
        <Box sx={CONTENT_SX}>
          <Box sx={getCardIconSx(theme, isDark, laneColor, false)}>
            {getIconForName(card.icon)}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={TITLE_SX}>
              {card.title}
            </Typography>
            {card.description && (
              <Typography variant="caption" sx={DESCRIPTION_SX}>
                {card.description}
              </Typography>
            )}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};
