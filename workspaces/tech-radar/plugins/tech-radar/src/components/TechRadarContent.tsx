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
import { useCallback, useContext, useRef } from 'react';

import { Maximize, Minimize } from 'lucide-react';

import type { Quadrant, Ring } from '../types';

import { QuadrantFilterButtons } from './QuadrantFilter/QuadrantFilterButtons';
import { RadarAccordion } from './RadarAccordion/RadarAccordion';
import { Radar, RadarBlipsAndLabels } from './RadarPlot/Radar';
import { RadarFilterContext } from './RadarFilterContext';
import { TechRadarFilter } from './RadarFilter/TechRadarFilter';
import { TrendLegend } from './Legend/TrendLegend';
import { cn } from '../util/cn';
import { useComponents } from './hooks/useComponents';

import { UNSAFE_PortalProvider } from 'react-aria';

type Props = Readonly<{
  loading: boolean;
  quadrants: Quadrant[];
  rings: Ring[];
}>;

export const TechRadarContent = ({ loading, quadrants, rings }: Props) => {
  const { Button, SearchField } = useComponents();
  const { handleSelectedBlip, searchTerm, setSearchTerm } =
    useContext(RadarFilterContext);

  const ref = useRef<HTMLDivElement>(null);

  const onSearch = useCallback(
    (term: string) => {
      handleSelectedBlip(undefined);
      setSearchTerm(term);
    },
    [handleSelectedBlip, setSearchTerm],
  );

  return (
    /* https://react-aria.adobe.com/PortalProvider
    UNSAFE_PortalProvider is considered UNSAFE. Some portal locations may not
    work with styling, accessibility,or for a variety of other reasons.

    This wrapper is used to help render tooltips in full screen.
    Otherwise, the tooltips are placed outside this div, and not rendered.
     */
    <UNSAFE_PortalProvider getContainer={() => ref.current}>
      <div
        className={cn(
          'transition-[position,width,height] duration-300',
          'group fullscreen:overflow-y-auto fullscreen:bg-background fullscreen:px-10',
          'flex flex-col gap-2',
        )}
        ref={ref}
      >
        <div className="flex items-center justify-between gap-2 border-0 border-b border-solid border-border py-2 sticky top-0 z-10 bg-background">
          <SearchField
            className="[&_.bui-SearchFieldInputWrapper]:h-10 max-w-80"
            onChange={value => onSearch(value)}
            value={searchTerm}
            placeholder="Search"
            type="text"
          />
          <div className="flex gap-2 items-center">
            <TechRadarFilter
              className="h-10"
              quadrants={quadrants}
              rings={rings}
            />
            <Button
              className="h-10 w-12 p-0.5 [&_svg]:h-[22px] [&_svg]:w-[22px] bg-card border border-border border-solid"
              variant="tertiary"
              onClick={() => {
                return document.fullscreenElement
                  ? document.exitFullscreen()
                  : ref.current?.requestFullscreen();
              }}
            >
              <Minimize className="hidden h-5 w-5 group-fullscreen:block" />
              <Maximize className="block h-5 w-5 group-fullscreen:hidden" />
            </Button>
            <QuadrantFilterButtons quadrants={quadrants} />
          </div>
        </div>

        <div className="flex w-full gap-10 px-1 flex-col-reverse lg:flex-row">
          <div className="lg:basis-1/3">
            {loading ? (
              <div className="animate-pulse rounded-md mt-11 h-full w-full bg-card" />
            ) : (
              <RadarAccordion quadrants={quadrants} rings={rings} />
            )}
          </div>
          <div className="relative lg:basis-2/3">
            <div className="sticky top-[9rem] flex flex-col transition-all duration-500 ease-in-out">
              <TrendLegend />
              <div className="flex mt-4 h-full flex-1 justify-center">
                <Radar
                  loading={loading}
                  onClick={() => handleSelectedBlip(undefined)}
                  quadrants={quadrants}
                  rings={rings}
                >
                  <RadarBlipsAndLabels quadrants={quadrants} rings={rings} />
                </Radar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UNSAFE_PortalProvider>
  );
};
