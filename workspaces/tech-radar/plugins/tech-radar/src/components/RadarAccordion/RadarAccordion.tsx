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
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Info, Triangle } from 'lucide-react';
import { DateTime } from 'luxon';

import { Box, Button, Flex, Link, Text } from '@backstage/ui';
import { useComponents } from '../hooks/useComponents';
import { RingLegend } from '../Legend/RingLegend';
import { RadarFilterContext } from '../RadarFilterContext';
import { Blip, Quadrant, Ring } from '../../types';
import { RadarBlipDetails } from '../RadarBlipDetails/RadarBlipDetails';
import color from 'color';
import { appThemeApiRef } from '@backstage/frontend-plugin-api';
import { useApi } from '@backstage/core-plugin-api';
import { useObservable } from 'react-use';

type Props = Readonly<{
  quadrants: Quadrant[];
  rings: Ring[];
}>;

const Moved = (props: {
  moved?: number | undefined;
  showLabel?: boolean;
  size: number;
}) => {
  const { moved, showLabel = false, size } = props;
  if (!moved) {
    return <Text as="span" />;
  }

  return (
    <Flex align="center" gap="1.5" as="span">
      {showLabel && 'Moved: '}
      {moved === 1 ? (
        <Triangle
          className="text-muted-foreground fill-muted-foreground"
          size={size}
        />
      ) : (
        <Triangle
          className="rotate-180 text-muted-foreground fill-muted-foreground"
          size={size}
        />
      )}
    </Flex>
  );
};

export const RadarAccordion = ({ quadrants, rings }: Props) => {
  const {
    blips,
    focusedQuadrant,
    handleSelectedBlip,
    selectedBlip,
    selectedFilters,
  } = useContext(RadarFilterContext);

  const appThemeApi = useApi(appThemeApiRef);
  const themeId = useObservable(
    appThemeApi.activeThemeId$(),
    appThemeApi.getActiveThemeId(),
  );
  const themeIds = appThemeApi.getInstalledThemes();
  const activeTheme = themeIds.find(t => t.id === themeId);
  const isDarkMode = activeTheme?.variant === 'dark';

  const {
    Accordion,
    AccordionPanel,
    AccordionTrigger,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
  } = useComponents();

  const visibleBlips = useMemo(() => {
    return blips
      .filter(blip => blip.visible)
      .filter(blip =>
        focusedQuadrant ? blip.quadrant.id === focusedQuadrant.id : true,
      );
  }, [blips, focusedQuadrant]);

  const [openBlip, setOpenBlip] = useState<Blip>();

  const activeItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedBlip && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedBlip]);

  const onAccordionValueChange = (value?: string) => {
    if (!value) {
      handleSelectedBlip(undefined);
    } else if (value !== selectedBlip?.id) {
      handleSelectedBlip(blips.find(b => b.id === value));
    }
  };

  return (
    <>
      <Box className="rounded bg-background p-0">
        {rings.map(ring => {
          const ringEntries = visibleBlips.filter(e => e.ring.id === ring.id);

          const ringFilters = selectedFilters.filter(f =>
            f.startsWith('ring:'),
          );
          if (
            ringEntries.length === 0 &&
            ringFilters.length > 0 &&
            !ringFilters.includes(`ring:${ring.id}`)
          ) {
            return null;
          }

          return (
            <div key={ring.id}>
              <Flex as="h3" align="center" gap="1" mt="4" mb="2">
                <Text as="span" className="capitalize">
                  {ring.name.toLowerCase()}
                </Text>
                <DialogTrigger>
                  <Button variant="tertiary">
                    <Info data-testid="info-icon" />
                  </Button>

                  <Dialog className="with-custom-css" width={1000}>
                    <DialogHeader>Legend</DialogHeader>
                    <DialogBody>
                      <RingLegend
                        highlighted={ring.id}
                        quadrants={quadrants}
                        rings={rings}
                      />
                    </DialogBody>
                    <DialogFooter>
                      <Button variant="secondary" slot="close">
                        Close
                      </Button>
                    </DialogFooter>
                  </Dialog>
                </DialogTrigger>
              </Flex>

              {ringEntries.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No entries found
                </div>
              )}

              <Flex direction="column" gap="1" style={{ minWidth: '15rem' }}>
                {visibleBlips
                  .filter(blip => blip.timeline?.[0].ring.id === ring.id)
                  .map(blip => {
                    const timeline = blip.timeline?.sort(
                      (a, b) => b.date.getTime() - a.date.getTime(),
                    )[0];
                    const timelineDate = DateTime.fromJSDate(timeline.date);

                    const isSelected = selectedBlip?.id === blip.id;

                    const ringColor = color(ring.color).hsv();
                    const backgroundColor = isSelected
                      ? color({
                          h: ringColor.hue(),
                          s: isDarkMode ? 80 : 40,
                          v: isDarkMode ? 40 : 100,
                        }).string()
                      : undefined;

                    return (
                      <Accordion
                        className="relative border-b border-muted transition-all first:rounded-t-lg last:rounded-b-lg"
                        isExpanded={isSelected}
                        onExpandedChange={isExpanded =>
                          onAccordionValueChange(
                            isExpanded ? blip.id : undefined,
                          )
                        }
                        style={{ backgroundColor }}
                        key={blip.id}
                        ref={isSelected ? activeItemRef : null}
                      >
                        <AccordionTrigger level={5}>
                          <Flex align="center" gap="2">
                            {blip.title}
                            {!isSelected && (
                              <Moved moved={timeline.moved} size={12} />
                            )}
                          </Flex>
                        </AccordionTrigger>
                        <AccordionPanel>
                          <Flex direction="column" gap="2">
                            <Flex gap="2" mt="4">
                              {timelineDate.isValid && (
                                <Flex
                                  align="center"
                                  gap={{ initial: '2', sm: '3' }}
                                  display={timeline.moved ? 'flex' : 'block'}
                                >
                                  <Moved
                                    moved={timeline.moved}
                                    showLabel
                                    size={12}
                                  />
                                  <Text as="span" className="text-xs">
                                    {'SINCE: '}
                                    <Text as="span" weight="bold">
                                      {timelineDate.toISODate()}
                                    </Text>
                                  </Text>
                                </Flex>
                              )}
                            </Flex>
                            <div>{blip.timeline[0].description}</div>
                            <Link
                              className="uppercase text-primary"
                              onClick={() => setOpenBlip(blip)}
                            >
                              Details
                            </Link>
                          </Flex>
                        </AccordionPanel>
                      </Accordion>
                    );
                  })}
              </Flex>
            </div>
          );
        })}
      </Box>

      <RadarBlipDetails
        blip={openBlip}
        onOpenChange={() => setOpenBlip(undefined)}
      />
    </>
  );
};
