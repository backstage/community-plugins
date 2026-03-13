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

import styles from './TechRadarContent.module.css';

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
        className={cn(styles.root, 'group')}
        ref={ref}
      >
        <Flex
          align="center"
          justify="between"
          gap="2"
          py="2"
          className={styles.stickyHeader}
        >
          <SearchField
            className={styles.searchField}
            onChange={value => onSearch(value)}
            value={searchTerm}
            placeholder="Search"
            type="text"
          />
          <Flex gap="2" align="center">
            <TechRadarFilter
              className={styles.filter}
              quadrants={quadrants}
              rings={rings}
            />
            <Button
              className={styles.fullscreenButton}
              variant="tertiary"
              onClick={() => {
                return document.fullscreenElement
                  ? document.exitFullscreen()
                  : ref.current?.requestFullscreen();
              }}
            >
              <Minimize className={styles.minimizeIcon} />
              <Maximize className={styles.maximizeIcon} />
            </Button>
            <QuadrantFilterButtons quadrants={quadrants} />
          </Flex>
        </Flex>

        <Flex
          gap="10"
          px="1"
          direction={{ initial: 'column-reverse', lg: 'row' }}
          className={styles.mainGrid}
        >
          <Box className={cn(styles.accordionContainer, 'lg:block')}>
            {loading ? (
              <div className={styles.loadingPulse} />
            ) : (
              <RadarAccordion quadrants={quadrants} rings={rings} />
            )}
          </Box>
          <Box className={styles.radarContainer}>
            <Flex direction="column" className={styles.stickyRadar}>
              <TrendLegend />
              <Flex justify="center" className={styles.radarPlotWrapper}>
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
