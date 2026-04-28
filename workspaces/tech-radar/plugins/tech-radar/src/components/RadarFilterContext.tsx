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
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useMemo, useState } from 'react';

import { useAnalytics } from '@backstage/core-plugin-api';

import type { Blip, Quadrant } from '../types';

import { filterBlips } from '../util/filterTechRadarBlips';

export type RadarFilterContextType = {
  blips: Blip[];
  focusedQuadrant: Quadrant | undefined;
  handleSelectedBlip: (blip: Blip | undefined) => void;
  searchTerm: string;
  selectedBlip: Blip | undefined;
  selectedFilters: string[];
  setFocusedQuadrant: (quadrant: Quadrant | undefined) => void;
  setSearchTerm: (term: string) => void;
  setSelectedFilters: (filters: string[]) => void;
};

export const RadarFilterContext = createContext<RadarFilterContextType>({
  blips: [],
  focusedQuadrant: undefined,
  handleSelectedBlip: () => {},
  searchTerm: '',
  selectedBlip: undefined,
  selectedFilters: [],
  setFocusedQuadrant: () => {},
  setSearchTerm: () => {},
  setSelectedFilters: () => {},
});

export const RadarFilterContextWrapper = ({
  allBlips,
  children,
  quadrants,
}: PropsWithChildren<{ allBlips: Blip[]; quadrants: Quadrant[] }>) => {
  const [selectedBlip, setSelectedBlip] = useState<Blip | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const analytics = useAnalytics();

  const focusedQuadrant = useMemo(() => {
    const selectedQuadrants = selectedFilters.filter(f =>
      f.startsWith('quadrant:'),
    );
    if (selectedQuadrants.length === 1) {
      const quadrantId = selectedQuadrants[0].split(':')[1];
      return quadrants.find(q => q.id === quadrantId);
    }
    return undefined;
  }, [selectedFilters, quadrants]);

  const handleSelectedBlip = useCallback(
    (blip: Blip | undefined) => {
      if (blip && blip.id !== selectedBlip?.id) {
        analytics.captureEvent('click', blip.title, {
          attributes: {
            category: 'tech-radar',
          },
        });
      }
      if (!blip?.visible) {
        setSearchTerm('');
      }
      setSelectedBlip(blip);
    },
    [analytics, selectedBlip?.id],
  );

  const setFocusedQuadrant = useCallback((quadrant: Quadrant | undefined) => {
    setSelectedFilters(prev => {
      const otherFilters = prev.filter(f => !f.startsWith('quadrant:'));
      if (quadrant) {
        return [...otherFilters, `quadrant:${quadrant.id}`];
      }
      return otherFilters;
    });
  }, []);

  const blips = useMemo(
    () => filterBlips({ blips: allBlips, searchTerm, selectedFilters }),
    [allBlips, searchTerm, selectedFilters],
  );

  return (
    <RadarFilterContext.Provider
      value={{
        blips,
        focusedQuadrant,
        handleSelectedBlip,
        searchTerm,
        selectedBlip,
        selectedFilters,
        setFocusedQuadrant,
        setSearchTerm,
        setSelectedFilters,
      }}
    >
      {children}
    </RadarFilterContext.Provider>
  );
};
