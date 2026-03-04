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
import type {
  MovedState,
  RadarQuadrant,
  RadarRing,
} from '@backstage-community/plugin-tech-radar-common';

// Radar entries after they've been placed on the radar itself and filtered
export type Blip = Readonly<
  {
    color: string;
    visible?: boolean;
    x: number;
    y: number;
  } & ProcessedEntry
>;

export type ProcessedEntry = Readonly<{
  // Most recent description to display in the UI
  description?: string;
  id: string;
  links?: { title: string; url: string }[];
  // How this entry has recently moved; -1 for "down", +1 for "up", 0 for not moved
  moved?: MovedState;
  quadrant: RadarQuadrant;
  ring: RadarRing;
  timeline: EntrySnapshot[];
  title: string;
  url?: string;
}>;

export type Quadrant = Readonly<{
  id: string;
  name: string;
  offsetX: number;
  offsetY: number;
  radialMax: number;
  radialMin: number;
}>;

// Parameters for a ring; its index in an array determines how close to the center this ring is.
export type Ring = Readonly<{
  color: string;
  description?: string;
  id: string;
  index?: number;
  innerRadius: number;
  name: string;
  outerRadius: number;
}>;

type EntrySnapshot = Readonly<{
  date: Date;
  description?: string;
  moved?: MovedState;
  ring: RadarRing;
}>;
