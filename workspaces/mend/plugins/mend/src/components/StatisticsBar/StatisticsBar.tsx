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
import { ReactElement, useState } from 'react';
import { StatisticsBarScrap } from './internal/StatisticsBarScrap';
import { StatisticsBarSegment } from './internal/StatisticsBarSegment';
import { StatisticsBarProps } from './statisticsBar.types';
import {
  getTotalFindings,
  getTotalFindingsByEngine,
} from './statisticsBar.helpers';

export const StatisticsBar = ({
  statistics,
  type,
}: StatisticsBarProps): ReactElement => {
  const getStatistics = {
    default: getTotalFindings,
    engine: getTotalFindingsByEngine,
  };

  const data = getStatistics[type](statistics);

  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const total = data.reduce((acc, current) => acc + current.value, 0);

  const extendedData = data.map(item => ({
    ...item,
    percentage: (100 * item.value) / total,
  }));

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {!!total ? (
            extendedData.map(item => (
              <StatisticsBarSegment
                key={item.key}
                color={item.color}
                percentage={item.percentage}
                onHover={() => setHoveredElementId(item.key)}
                isHovered={item.key === hoveredElementId}
                onLeave={() => setHoveredElementId(null)}
              />
            ))
          ) : (
            <StatisticsBarSegment percentage={100} isHovered={false} />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.25rem',
          }}
        >
          {extendedData.map(item => (
            <StatisticsBarScrap
              key={item.key}
              color={item.color}
              value={total ? item.value : 0}
              name={item.key}
              onHover={() =>
                total ? setHoveredElementId(item.key) : undefined
              }
              onLeave={() => (total ? setHoveredElementId(null) : undefined)}
              isHovered={total ? item.key === hoveredElementId : false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
