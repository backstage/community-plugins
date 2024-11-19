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
import {
  MovedState,
  RadarEntry,
  RadarEntryLink,
  RadarEntrySnapshot,
  RadarQuadrant,
  RadarRing,
  TechRadarLoaderResponse,
} from './model';

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
 * Parser for {@link RadarQuadrant}
 */
const RadarQuadrantParser: z.ZodSchema<RadarQuadrant> = z.object({
  // ID of the Quadrant
  id: z.string(),
  // Display name of the Quadrant
  name: z.string(),
});

const RadarEntryLinkParser: z.ZodSchema<RadarEntryLink> = z.object({
  // URL of the link
  url: z.string(),
  // Display name of the link
  title: z.string(),
});

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
