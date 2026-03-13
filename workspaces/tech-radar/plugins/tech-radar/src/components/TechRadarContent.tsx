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
import { Box, Button, Flex } from '@backstage/ui';
import { useComponents } from './hooks/useComponents';

import { UNSAFE_PortalProvider } from 'react-aria';

type Props = Readonly<{
  loading: boolean;
  quadrants: Quadrant[];
  rings: Ring[];
}>;

export const TechRadarContent = ({ loading, quadrants, rings }: Props) => {
  const { SearchField } = useComponents();
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
      <Flex
        direction="column"
        gap="2"
        className={cn(
          'transition-[position,width,height] duration-300',
          'group fullscreen:overflow-y-auto fullscreen:bg-background fullscreen:px-10',
        )}
        ref={ref}
      >
        <Flex
          align="center"
          justify="between"
          gap="2"
          py="2"
          className="border-0 border-b border-solid border-border sticky top-0 z-10 bg-background"
        >
          <SearchField
            className="[&_.bui-SearchFieldInputWrapper]:h-10 max-w-80"
            onChange={value => onSearch(value)}
            value={searchTerm}
            placeholder="Search"
            type="text"
          />
          <Flex gap="2" align="center">
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
          </Flex>
        </Flex>

        <Flex
          gap="10"
          px="1"
          direction={{ initial: 'column-reverse', lg: 'row' }}
          style={{ width: '100%' }}
        >
          <Box style={{ flexBasis: '33.333333%' }} className="lg:block">
            {loading ? (
              <div className="animate-pulse rounded-md mt-11 h-full w-full bg-card" />
            ) : (
              <RadarAccordion quadrants={quadrants} rings={rings} />
            )}
          </Box>
          <Box style={{ flexBasis: '66.666667%', position: 'relative' }}>
            <Flex
              direction="column"
              className="sticky top-[9rem] transition-all duration-500 ease-in-out"
            >
              <TrendLegend />
              <Flex mt="4" justify="center" style={{ height: '100%', flex: 1 }}>
                <Radar
                  loading={loading}
                  onClick={() => handleSelectedBlip(undefined)}
                  quadrants={quadrants}
                  rings={rings}
                >
                  <RadarBlipsAndLabels quadrants={quadrants} rings={rings} />
                </Radar>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </UNSAFE_PortalProvider>
  );
};
