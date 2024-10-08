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
export interface Config {
  techRadar?: {
    /**
     * Optional uri which will be hit to fetch the definition file for the tech radar entries. The file should be in JSON format.
     * If both `proxyUri` & `entries` are specified, the `proxyUri` will be used.
     * @visibility frontend
     */
    proxyUri?: string;
    /**
     * Optional representation of the tech radar entries. Will only be used if `url` is not provided.
     * @visibility frontend
     */
    graphData?: {
      /**
       * Quadrants of Tech Radar. Should be 4
       * @visibility frontend
       */
      quadrants: Array<{
        /**
         * @visibility frontend
         */
        id: string;
        /**
         * @visibility frontend
         */
        name: string;
      }>;
      /**
       * Rings of Tech Radar
       * @visibility frontend
       */
      rings: Array<{
        /**
         * ID of the Ring
         * @visibility frontend
         */
        id: string;
        /**
         * Display name of the Ring
         * @visibility frontend
         */
        name: string;
        /**
         * Color used for entries in particular Ring
         * @visibility frontend
         *
         * @remarks
         *
         * Supports any value parseable by {@link https://www.npmjs.com/package/color-string | color-string}
         * @visibility frontend
         */
        color: string;
        /**
         * Description of the Ring
         * @visibility frontend
         */
        description?: string;
      }>;
      /**
       * Entries visualised in Tech Radar
       * @visibility frontend
       */
      entries: Array<{
        /**
         * React key to use for this Entry
         * @visibility frontend
         */
        key: string;
        /**
         * ID of this Radar Entry
         * @visibility frontend
         */
        id: string;
        /**
         * ID of {@link RadarQuadrant} this Entry belongs to
         * @visibility frontend
         */
        quadrant: string;
        /**
         * Display name of the Entry
         * @visibility frontend
         */
        title: string;
        /**
         * History of the Entry moving through {@link RadarRing}
         * @visibility frontend
         */
        timeline: Array<{
          /**
           * Point in time when change happened; should be formmatted YYYY-MM-DD
           * @visibility frontend
           */
          date: string;
          /**
           * ID of {@link RadarRing}
           * @visibility frontend
           */
          ringId: string;
          /**
           * Description of change
           * @visibility frontend
           */
          description?: string;
          /**
           * Indicates trend compared to previous snapshot (-1 = moved down, 0 = didn't move, 1 = moved up)
           * @visibility frontend
           */
          moved?: number;
        }>;
        /**
         * Description of the Entry
         * @visibility frontend
         */
        description?: string;
        /**
         * User-clickable links to provide more information about the Entry
         * @visibility frontend
         */
        links?: Array<{
          /**
           * URL of the link
           * @visibility frontend
           */
          url: string;
          /**
           * Display name of the link
           * @visibility frontend
           */
          title: string;
        }>;
      }>;
    };
  };
}
