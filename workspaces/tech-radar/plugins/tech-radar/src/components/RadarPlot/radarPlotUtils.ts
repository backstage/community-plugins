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
import { forceCollide, forceSimulation } from 'd3-force';
import type {
  RadarQuadrant,
  RadarRing,
  TechRadarLoaderResponse,
} from '@backstage-community/plugin-tech-radar-common';

import type { Blip, ProcessedEntry, Quadrant, Ring } from '../../types';

import { Segment } from './segment';

export const RADAR_DIAMETER = 800;
export const QUADRANT_GAP = 10;
export const RADAR_PADDING = 40;
export const BLIP_RADIUS = 10;

export const processRadarFileEntries = (
  loaderResponse: TechRadarLoaderResponse,
): ProcessedEntry[] => {
  return loaderResponse.entries.map(entry => ({
    id: entry.key,
    description: entry.description || entry.timeline[0].description,
    links: entry.links,
    moved: entry.timeline[0].moved,
    quadrant: loaderResponse.quadrants.find(q => q.id === entry.quadrant)!,
    ring: loaderResponse.rings.find(r => r.id === entry.timeline[0].ringId)!,
    timeline: entry.timeline.map(e => {
      return {
        date: e.date,
        description: e.description,
        moved: e.moved,
        ring: loaderResponse.rings.find(a => a.id === e.ringId)!,
      };
    }),
    title: entry.title,
    url: entry.url,
  }));
};

export const processRadarFileQuadrants = (
  quadrants: RadarQuadrant[],
): Quadrant[] => {
  return quadrants.map((quadrant, index) => {
    return {
      ...quadrant,
      index,
      offsetX: index % 4 === 0 || index % 4 === 3 ? 1 : -1,
      offsetY: index % 4 === 0 || index % 4 === 1 ? -1 : 1,
      radialMax: -((index + 1) * Math.PI) / 2,
      radialMin: -(index * Math.PI) / 2,
    };
  });
};

export const placeBlipsOnRadar = ({
  entries,
  quadrants,
  radius,
  rings,
}: {
  entries: ProcessedEntry[];
  quadrants: Quadrant[];
  radius: number;
  rings: Ring[];
}): Blip[] => {
  let seed = 42;
  const adjustedEntries = entries.map((entry, index) => {
    const quadrant = quadrants.find(q => {
      const match =
        typeof entry.quadrant === 'object' ? entry.quadrant.id : entry.quadrant;
      return q.id === match;
    });
    const ring = rings.find(r => {
      const match = typeof entry.ring === 'object' ? entry.ring.id : entry.ring;
      return r.id === match;
    });

    if (!quadrant) {
      throw new Error(
        `Unknown quadrant ${entry.quadrant.name} for entry ${entry.id}!`,
      );
    }
    if (!ring) {
      throw new Error(`Unknown ring ${entry.ring.name} for entry ${entry.id}!`);
    }
    const segment = new Segment({
      nextSeed: () => seed++,
      quadrant,
      radius,
      ring,
    });
    const point = segment?.randomPoint();

    return {
      ...entry,
      color: entry.ring.color,
      index: index,
      quadrant: quadrant,
      ring: ring,
      segment,
      x: point.x,
      y: point.y,
    };
  });

  const simulation = forceSimulation()
    .nodes(adjustedEntries)
    .velocityDecay(0.19)
    .force('collision', forceCollide().radius(BLIP_RADIUS).strength(0.85))
    .stop();

  for (
    let i = 0,
      n = Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
      );
    i < n;
    ++i
  ) {
    simulation.tick();

    for (const entry of adjustedEntries) {
      if (entry.segment) {
        entry.x = entry.segment.clipx(entry);
        entry.y = entry.segment.clipy(entry);
      }
    }
  }

  return adjustedEntries.map(e => ({
    ...e,
    x: e.x + e.quadrant.offsetX * QUADRANT_GAP,
    y: e.y + e.quadrant.offsetY * QUADRANT_GAP,
  }));
};

export const adjustRings = (rings: RadarRing[], radius: number): Ring[] =>
  rings.map((ring, index) => ({
    ...ring,
    index,
    innerRadius: ((index === 0 ? 0 : index + 1) / (rings.length + 1)) * radius,
    outerRadius: ((index + 2) / (rings.length + 1)) * radius,
  }));
