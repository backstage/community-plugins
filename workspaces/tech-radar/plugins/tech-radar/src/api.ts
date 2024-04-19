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

import { ApiRef, createApiRef } from '@backstage/core-plugin-api';

/**
 * {@link @backstage/core-plugin-api#ApiRef} for the {@link TechRadarApi}
 *
 * @public
 */
export const techRadarApiRef: ApiRef<TechRadarApi> = createApiRef<TechRadarApi>(
  {
    id: 'plugin.techradar.service',
  },
);

/**
 * Tech Radar API responsible for loading data for the plugin
 *
 * @remarks
 *
 * This should be implemented by user, as {@link https://github.com/backstage/backstage/blob/master/plugins/tech-radar/src/sample.ts | default}
 * serves only some static data for example purposes
 *
 * @public
 */
export interface TechRadarApi {
  /**
   * Loads the TechRadar response data to pass through to the TechRadar component.
   * Takes the id prop of the TechRadarComponent or TechRadarPage to distinguish between multiple radars if needed
   */
  load: (id: string | undefined) => Promise<TechRadarLoaderResponse>;
}

/*
 * Types related to the Radar's visualization.
 */

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
 * Indicates how {@link RadarEntry} moved though {@link RadarRing} on {@link RadarEntry.timeline}
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

/*
 * Types related to data collection for the Radar.
 */

/**
 * Response from {@link TechRadarApi}
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

/*
 * Set up the Radar as a Backstage component.
 */
