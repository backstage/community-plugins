/*
 * Copyright 2020 The Backstage Authors
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

import { useMemo, useRef, useState } from 'react';
import type { Entry, Quadrant, Ring } from '../../utils/types';
import RadarPlot from '../RadarPlot';
import {
  adjustEntries,
  adjustQuadrants,
  adjustRings,
  determineColumnCount,
  determineColumnWidth,
  determineLegendWidth,
  margin,
} from './utils';

export type Props = {
  width: number;
  height: number;
  quadrants: Quadrant[];
  rings: Ring[];
  entries: Entry[];
  svgProps?: object;
};

const Radar = ({
  width,
  height,
  quadrants,
  rings,
  entries,
  ...props
}: Props): JSX.Element => {
  const columnWidth = determineColumnWidth(width);
  const legendWidth = determineLegendWidth(width, columnWidth);
  const columnCount = determineColumnCount(legendWidth, columnWidth);

  // State
  const [activeEntry, setActiveEntry] = useState<Entry>();
  const node = useRef<SVGSVGElement>(null);

  // Adjusted props
  const adjustedQuadrants = useMemo(
    () => adjustQuadrants(quadrants, width, legendWidth, height),
    [quadrants, width, legendWidth, height],
  );

  const rightMostPoint = adjustedQuadrants[3].legendX + legendWidth;
  const leftMostPoint = adjustedQuadrants[2].legendX;

  const midpoint = (rightMostPoint + leftMostPoint) / 2;
  const widthBetween =
    rightMostPoint - legendWidth - (leftMostPoint + legendWidth);
  const radius = Math.min(widthBetween, height) / 2 - margin;

  const adjustedRings = useMemo(
    () => adjustRings(rings, radius),
    [radius, rings],
  );
  const adjustedEntries = useMemo(
    () =>
      adjustEntries(
        entries,
        adjustedQuadrants,
        adjustedRings,
        radius,
        activeEntry,
      ),
    [entries, adjustedQuadrants, adjustedRings, radius, activeEntry],
  );

  return (
    <svg ref={node} width={width} height={height} {...props.svgProps}>
      <RadarPlot
        width={midpoint * 2}
        height={height}
        radius={radius}
        columnCount={columnCount}
        entries={adjustedEntries}
        quadrants={adjustedQuadrants}
        rings={adjustedRings}
        activeEntry={activeEntry}
        onEntryMouseEnter={entry => setActiveEntry(entry)}
        onEntryMouseLeave={() => setActiveEntry(undefined)}
      />
    </svg>
  );
};

export default Radar;
