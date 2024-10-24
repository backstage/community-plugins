/*
 * Copyright 2024 The Backstage Authors
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
import { z } from 'zod';

/**
 * Parser for {@link RadarRing}
 *
 * @public
 */
const RadarRingParser: z.ZodSchema<RadarRing> = z.object({
  // ID of the Ring
  id: z.string(),
  // Display name of the Ring
  name: z.string(),
  // Color used for entries in particular Ring, Supports any value parseable by {@link https://www.npmjs.com/package/color-string | color-string}
  color: z.string(),
  // Description of the Ring
  description: z.string().optional(),
});

/**
 * Tech Radar Ring which indicates stage of {@link RadarEntry}
 *
 * @public
 */
export interface RadarRing {
  /**
   * ID of the Ring
   */
  id: string;
  /**
   * Display name of the Ring
   */
  name: string;
  /**
   * Color used for entries in particular Ring
   *
   * @remarks
   *
   * Supports any value parseable by {@link https://www.npmjs.com/package/color-string | color-string}
   */
  color: string;
  /**
   * Description of the Ring
   */
  description?: string;
}
/**
 * Parser for {@link RadarQuadrant}
 *
 * @public
 */
const RadarQuadrantParser: z.ZodSchema<RadarQuadrant> = z.object({
  // ID of the Quadrant
  id: z.string(),
  // Display name of the Quadrant
  name: z.string(),
});

/**
 * Tech Radar Quadrant which represent area/topic of {@link RadarEntry}
 *
 * @public
 */
/**
 * Tech Radar Quadrant which represent area/topic of {@link RadarEntry}
 *
 * @public
 */
export interface RadarQuadrant {
  /**
   * ID of the Quadrant
   */
  id: string;
  /**
   * Display name of the Quadrant
   */
  name: string;
}

const RadarEntryLinkParser: z.ZodSchema<RadarEntryLink> = z.object({
  // URL of the link
  url: z.string(),
  // Display name of the link
  title: z.string(),
});

/**
 * Single link in {@link RadarEntry}
 *
 * @public
 */
export interface RadarEntryLink {
  /**
   * URL of the link
   */
  url: string;
  /**
   * Display name of the link
   */
  title: string;
}

/**
 * Indicates how {@link RadarEntry} moved though {@link RadarRing} on the {@link RadarEntry} timeline
 *
 * @public
 */
export enum MovedState {
  /**
   * Moved down
   */
  Down = -1,
  /**
   * Didn't move
   */
  NoChange = 0,
  /**
   * Move up
   */
  Up = 1,
}

const RadarEntrySnapshotParser: z.ZodSchema<RadarEntrySnapshot> = z.object({
  // Point in time when change happened
  date: z.coerce.date(),
  // ID of {@link RadarRing}
  ringId: z.string(),
  // Description of change
  description: z.string().optional(),
  // Indicates trend compared to previous snapshot
  moved: z.nativeEnum(MovedState).optional(),
});

/**
 * State of {@link RadarEntry} at given point in time
 *
 * @public
 */
export interface RadarEntrySnapshot {
  /**
   * Point in time when change happened
   */
  date: Date;
  /**
   * ID of {@link RadarRing}
   */
  ringId: string;
  /**
   * Description of change
   */
  description?: string;
  /**
   * Indicates trend compared to previous snapshot
   */
  moved?: MovedState;
}

/**
 * Parser for {@link RadarEntry}
 */
const RadarEntryParser: z.ZodSchema<RadarEntry> = z.object({
  // React key to use for this Entry
  key: z.string(),
  // ID of this Radar Entry
  id: z.string(),
  // ID of {@link RadarQuadrant} this Entry belongs to
  quadrant: z.string(),
  // Display name of the Entry
  title: z.string(),
  // User-clickable URL when rendered in Radar
  url: z.string().optional(),
  // History of the Entry moving through {@link RadarRing}
  timeline: z.array(RadarEntrySnapshotParser),
  // Description of the Entry
  description: z.string().optional(),
  // User-clickable links to provide more information about the Entry
  links: z.array(RadarEntryLinkParser).optional(),
});

/**
 * Single Entry in Tech Radar
 *
 * @public
 */
export interface RadarEntry {
  /**
   * React key to use for this Entry
   */
  key: string;
  /**
   * ID of this Radar Entry
   */
  id: string;
  /**
   * ID of {@link RadarQuadrant} this Entry belongs to
   */
  quadrant: string;
  /**
   * Display name of the Entry
   */
  title: string;
  /**
   * User-clickable URL when rendered in Radar
   *
   * @remarks
   *
   * You can use `#` if you don't want to provide any other url
   *
   * @deprecated Use {@link RadarEntry.links} instead
   */
  url?: string;
  /**
   * History of the Entry moving through {@link RadarRing}
   */
  timeline: Array<RadarEntrySnapshot>;
  /**
   * Description of the Entry
   */
  description?: string;
  /**
   * User-clickable links to provide more information about the Entry
   */
  links?: Array<RadarEntryLink>;
}

/**
 * Parser for the response from Tech Radar loader.
 *
 * @public
 */
export const TechRadarLoaderResponseParser: z.ZodSchema<TechRadarLoaderResponse> =
  z.object({
    quadrants: z.array(RadarQuadrantParser),
    rings: z.array(RadarRingParser),
    entries: z.array(RadarEntryParser),
  });

/**
 * Response from that contains all the data for a Tech Radar graph;
 *  {@link RadarQuadrant}, {@link RadarRing}, and {@link RadarEntry}.
 *
 * @public
 */
export interface TechRadarLoaderResponse {
  /**
   * Quadrant of Tech Radar. Should be 4
   */
  quadrants: RadarQuadrant[];
  /**
   * Rings of Tech Radar
   */
  rings: RadarRing[];
  /**
   * Entries visualised in Tech Radar
   */
  entries: RadarEntry[];
}
