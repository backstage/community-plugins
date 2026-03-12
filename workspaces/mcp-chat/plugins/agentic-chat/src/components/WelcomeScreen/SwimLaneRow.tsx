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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { SwimLane, SwimLaneCard as SwimLaneCardType } from '../../types';
import { SwimLaneCard } from './SwimLaneCard';
import { getIconForName } from './iconUtils';
import { CARD_GAP, getLaneIconSx } from './styles';

interface SwimLaneRowProps {
  readonly swimLane: SwimLane;
  readonly onCardClick: (card: SwimLaneCardType) => void;
  readonly isDark: boolean;
}

const ROW_SX = { mb: 2.5 } as const;

const HEADER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 1,
  minWidth: 0,
} as const;

const TITLE_SX = {
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'text.primary',
  lineHeight: 1.3,
  flexShrink: 0,
} as const;

const DESCRIPTION_SX = {
  color: 'text.disabled',
  fontSize: '0.75rem',
  fontWeight: 400,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: { xs: 'none', sm: 'block' },
} as const;

const GRID_SX = {
  display: 'grid',
  boxSizing: 'border-box',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(auto-fill, minmax(200px, 1fr))',
  },
  gap: `${CARD_GAP}px`,
} as const;

export const SwimLaneRow: React.FC<SwimLaneRowProps> = ({
  swimLane,
  onCardClick,
  isDark,
}) => {
  const theme = useTheme();
  const laneColor = swimLane.color || theme.palette.primary.main;
  const visibleCards = swimLane.cards.filter(card => !card.comingSoon);

  if (visibleCards.length === 0) return null;

  return (
    <Box sx={ROW_SX}>
      <Box sx={HEADER_SX}>
        <Box sx={getLaneIconSx(theme, laneColor)}>
          {getIconForName(swimLane.icon)}
        </Box>
        <Typography variant="subtitle2" noWrap sx={TITLE_SX}>
          {swimLane.title}
        </Typography>
        {swimLane.description && (
          <Typography variant="caption" noWrap sx={DESCRIPTION_SX}>
            — {swimLane.description}
          </Typography>
        )}
      </Box>

      <Box sx={GRID_SX}>
        {visibleCards.map(card => (
          <SwimLaneCard
            key={`${swimLane.id}-${card.title}`}
            card={card}
            laneColor={laneColor}
            isDark={isDark}
            onClick={onCardClick}
          />
        ))}
      </Box>
    </Box>
  );
};
