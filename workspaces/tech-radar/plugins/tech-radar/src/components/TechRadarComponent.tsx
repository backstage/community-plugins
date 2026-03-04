/*
 * Copyright 2026 The Backstage Authors
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
import { HTMLAttributes, useMemo } from 'react';

import '../css/bui-styles.css';
import '../css/tech-radar.css';
import { TechRadarContent } from './TechRadarContent';
import {
  ComponentContext,
  ComponentContextProps,
  defaultComponents,
} from './hooks/useComponents';
import { RadarFilterContextWrapper } from './RadarFilterContext';
import { useTechRadarLoader } from './hooks/useTechRadarLoader';
import {
  adjustRings,
  placeBlipsOnRadar,
  processRadarFileEntries,
  processRadarFileQuadrants,
  RADAR_DIAMETER,
} from './RadarPlot/radarPlotUtils';

export type TechRadarComponentProps = {
  customComponents?: Partial<ComponentContextProps>;
} & HTMLAttributes<HTMLDivElement>;

export const TechRadarComponent = ({
  customComponents = {},
  ...props
}: TechRadarComponentProps) => {
  const { loading, value: radarFileData } = useTechRadarLoader();

  const rings = useMemo(
    () =>
      adjustRings(
        radarFileData ? radarFileData.rings : [{ id: '', color: '', name: '' }],
        RADAR_DIAMETER / 2,
      ),
    [radarFileData],
  );
  const quadrants = useMemo(
    () =>
      processRadarFileQuadrants(
        radarFileData
          ? radarFileData.quadrants
          : Array.from({ length: 4 }).map((_, i) => ({
              id: i.toString(),
              name: '',
            })),
      ),
    [radarFileData],
  );

  const allBlips = useMemo(() => {
    if (!radarFileData) {
      return [];
    }
    const entries = processRadarFileEntries(radarFileData);
    return placeBlipsOnRadar({
      entries,
      quadrants,
      radius: RADAR_DIAMETER / 2,
      rings,
    });
  }, [radarFileData, quadrants, rings]);

  return (
    <ComponentContext.Provider
      value={{ ...defaultComponents, ...customComponents }}
    >
      <RadarFilterContextWrapper allBlips={allBlips} quadrants={quadrants}>
        <div className="with-custom-css" {...props}>
          <TechRadarContent
            loading={loading}
            rings={rings}
            quadrants={quadrants}
          />
        </div>
      </RadarFilterContextWrapper>
    </ComponentContext.Provider>
  );
};
