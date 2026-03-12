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
import { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useBranding } from '../../hooks';
import type {
  SwimLane,
  SwimLaneCard,
  Workflow,
  QuickAction,
} from '../../types';
import { SwimLaneRow } from './SwimLaneRow';
import { buildEffectiveSwimLanes } from './buildEffectiveSwimLanes';
import {
  getContainerSx,
  getHeroSx,
  getTitleSx,
  getSwimLanesContainerSx,
} from './styles';

interface WelcomeScreenProps {
  readonly workflows: readonly Workflow[];
  readonly quickActions: readonly QuickAction[];
  readonly onQuickActionSelect: (action: QuickAction) => void;
  readonly swimLanes?: readonly SwimLane[];
}

const EMPTY_STATE_SX = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'text.secondary',
} as const;

const TAGLINE_SX = {
  color: 'text.secondary',
  fontSize: '0.8rem',
} as const;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  workflows,
  quickActions,
  onQuickActionSelect,
  swimLanes: configSwimLanes,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { branding } = useBranding();

  const effectiveSwimLanes = useMemo(
    () =>
      buildEffectiveSwimLanes({
        configSwimLanes,
        workflows,
        quickActions,
        fallbackColor: branding.primaryColor,
      }),
    [configSwimLanes, workflows, quickActions, branding.primaryColor],
  );

  const handleCardClick = useCallback(
    (card: SwimLaneCard) => {
      onQuickActionSelect({
        title: card.title,
        description: card.description,
        prompt: card.prompt,
        icon: card.icon,
      });
    },
    [onQuickActionSelect],
  );

  const titleSx = useMemo(
    () => getTitleSx(branding.primaryColor),
    [branding.primaryColor],
  );

  return (
    <Box sx={getContainerSx(theme)}>
      <Box sx={getHeroSx()}>
        <Typography variant="h5" sx={titleSx}>
          {branding.appName}
        </Typography>
        <Typography variant="body2" sx={TAGLINE_SX}>
          {branding.tagline}
        </Typography>
      </Box>

      <Box sx={getSwimLanesContainerSx(isDark)}>
        {effectiveSwimLanes.length > 0 ? (
          effectiveSwimLanes.map(lane => (
            <SwimLaneRow
              key={lane.id}
              swimLane={lane}
              onCardClick={handleCardClick}
              isDark={isDark}
            />
          ))
        ) : (
          <Box sx={EMPTY_STATE_SX}>
            <Typography variant="body2">
              Type a question below to get started
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
