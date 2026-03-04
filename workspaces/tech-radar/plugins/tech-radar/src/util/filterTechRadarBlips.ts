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
import type { Blip } from './types';

type Options = Readonly<{
  blips: Blip[];
  searchTerm: string;
  selectedFilters: string[];
}>;

export const filterBlips = (options: Options): Blip[] => {
  const { blips, searchTerm, selectedFilters } = options;

  return blips.map(blip => {
    const matchesSearch =
      !searchTerm ||
      blip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blip.timeline[0].description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!matchesSearch) {
      return { ...blip, visible: false };
    }

    if (!selectedFilters.length) {
      return { ...blip, visible: true };
    }

    const ringFilters = selectedFilters.filter(f => f.startsWith('ring:'));
    const quadrantFilters = selectedFilters.filter(f =>
      f.startsWith('quadrant:'),
    );

    const matchesRing =
      ringFilters.length === 0 || ringFilters.includes(`ring:${blip.ring.id}`);

    const matchesQuadrant =
      quadrantFilters.length === 0 ||
      quadrantFilters.includes(`quadrant:${blip.quadrant.id}`);

    const unknownFilters = selectedFilters.filter(
      f => !f.startsWith('ring:') && !f.startsWith('quadrant:'),
    );

    return {
      ...blip,
      visible: matchesRing && matchesQuadrant && unknownFilters.length === 0,
    };
  });
};
