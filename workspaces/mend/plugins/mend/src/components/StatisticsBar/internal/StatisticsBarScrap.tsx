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
import { ReactElement } from 'react';
import { numberToShortText } from '../../../utils';
import { StatisticsBarScrapProps } from '../statisticsBar.types';
import { linearGradient } from '../statisticsBar.helpers';

export const StatisticsBarScrap = ({
  color,
  value,
  name,
  onHover,
  isHovered,
  onLeave,
}: StatisticsBarScrapProps): ReactElement => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'between',
        width: 'auto',
        gap: '0.25rem',
        rowGap: '0.5rem',
      }}
    >
      <div
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        style={{
          height: '20px',
          width: '20px',
          borderRadius: '3px',
          backgroundColor: color,
          alignItems: 'center',
          backgroundSize: '6px 6px',
          flexShrink: 0,
          backgroundImage: isHovered ? linearGradient : '',
          cursor: isHovered ? 'pointer' : '',
        }}
      />
      <span
        className="MuiTypography-root MuiTypography-body1"
        style={{
          display: 'flex',
          width: '100%',
          gap: '0.2rem',
          textTransform: 'capitalize',
          alignItems: 'center',
          paddingRight: '4px',
          fontSize: '0.9rem',
        }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}
        >
          {name}
        </span>
        <span style={{ fontWeight: 500 }}>{numberToShortText(value)}</span>
      </span>
    </div>
  );
};
