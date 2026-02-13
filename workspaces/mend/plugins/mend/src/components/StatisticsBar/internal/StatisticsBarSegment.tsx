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
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { StatisticsBarSegmentProps } from '../statisticsBar.types';
import { linearGradient } from '../statisticsBar.helpers';

export const StatisticsBarSegment = ({
  percentage,
  color = '',
  onHover,
  isHovered,
  onLeave,
  tooltipContent = null,
}: StatisticsBarSegmentProps) => {
  const theme = useTheme();

  const defaultBackgroundColor =
    theme.palette.mode === 'light'
      ? '#F5F6F8'
      : theme.palette.background.default;

  const segmentStyle = {
    height: '36px',
    backgroundSize: '10px 10px',
    width: `${percentage}%`,
    backgroundColor: color || defaultBackgroundColor,
    backgroundImage: isHovered ? linearGradient : '',
    cursor: isHovered ? 'pointer' : '',
  };

  return tooltipContent ? (
    <Tooltip title={tooltipContent} arrow placement="top">
      <div onMouseEnter={onHover} onMouseLeave={onLeave} style={segmentStyle} />
    </Tooltip>
  ) : (
    <div onMouseEnter={onHover} onMouseLeave={onLeave} style={segmentStyle} />
  );
};
