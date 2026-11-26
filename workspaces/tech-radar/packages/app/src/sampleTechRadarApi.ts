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
import { TechRadarApi } from '@backstage-community/plugin-tech-radar';
import {
  MovedState,
  RadarEntry,
  TechRadarLoaderResponse,
} from '@backstage-community/plugin-tech-radar-common';

// Local mock data for visually checking the Tech Radar in the dev app. It
// covers every quadrant and ring (except Languages / Hold, which is left empty
// on purpose), trends up, down and none, entries with and without links, URLs
// and descriptions, a long timeline history and an invalid date.
const quadrants = [
  { id: 'infrastructure', name: 'Infrastructure' },
  { id: 'frameworks', name: 'Frameworks' },
  { id: 'languages', name: 'Languages' },
  { id: 'process', name: 'Process' },
];

const rings = [
  {
    id: 'adopt',
    name: 'ADOPT',
    color: '#5BA300',
    description: 'Proven and recommended for wide use.',
  },
  {
    id: 'trial',
    name: 'TRIAL',
    color: '#009EB0',
    description: 'Worth pursuing on projects that can handle the risk.',
  },
  {
    id: 'assess',
    name: 'ASSESS',
    color: '#C7BA00',
    description: 'Worth exploring to understand how it affects us.',
  },
  {
    id: 'hold',
    name: 'HOLD',
    color: '#E09B96',
    description: 'Proceed with caution; avoid for new work.',
  },
];

const markdown =
  'Supports **bold**, *italic*, [links](https://backstage.io) and code:\n\n```ts\nconst radar = true;\n```\n';

type Variant = 'up' | 'down' | 'none';

const movedStates: Record<Variant, MovedState> = {
  up: MovedState.Up,
  down: MovedState.Down,
  none: MovedState.NoChange,
};

const variants: Variant[] = ['up', 'down', 'none'];

const entry = (
  id: string,
  title: string,
  quadrant: string,
  ringId: string,
  variant: Variant,
  extras: Partial<RadarEntry> = {},
): RadarEntry => ({
  id,
  key: id,
  title,
  quadrant,
  description: `${title} sample entry. ${markdown}`,
  timeline: [
    {
      ringId,
      date: new Date('2026-10-01T00:00:00.000Z'),
      moved: movedStates[variant],
      description: `Placed in ${ringId}.`,
    },
  ],
  ...extras,
});

const sampleEntries: RadarEntry[] = [
  // Infrastructure: one entry per ring
  entry('kubernetes', 'Kubernetes', 'infrastructure', 'adopt', 'none', {
    // Both a URL ("Learn more") and extra links
    url: 'https://kubernetes.io',
    links: [
      { title: 'Docs', url: 'https://kubernetes.io/docs/' },
      { title: 'GitHub', url: 'https://github.com/kubernetes/kubernetes' },
    ],
  }),
  entry('terraform', 'Terraform', 'infrastructure', 'trial', 'up', {
    url: 'https://www.terraform.io', // URL only
  }),
  entry('service-mesh', 'Service Mesh', 'infrastructure', 'assess', 'none'),
  entry('bare-metal', 'Bare Metal', 'infrastructure', 'hold', 'down'),

  // Frameworks: one entry per ring, plus a long timeline history
  entry('react', 'React', 'frameworks', 'adopt', 'up', {
    links: [{ title: 'react.dev', url: 'https://react.dev' }], // links only
    timeline: [
      {
        ringId: 'adopt',
        date: new Date('2026-09-15T00:00:00.000Z'),
        moved: MovedState.Up,
        description: 'Promoted to **adopt** after wide success.',
      },
      {
        ringId: 'trial',
        date: new Date('2025-03-01T00:00:00.000Z'),
        moved: MovedState.Up,
        description: 'Moved to trial.',
      },
      {
        ringId: 'assess',
        date: new Date('2024-01-10T00:00:00.000Z'),
        moved: MovedState.NoChange,
        description: 'First added for assessment.',
      },
    ],
  }),
  entry('backstage-ui', 'Backstage UI', 'frameworks', 'trial', 'none'),
  entry('htmx', 'htmx', 'frameworks', 'assess', 'up'),
  entry('angularjs', 'AngularJS', 'frameworks', 'hold', 'down', {
    timeline: [
      {
        ringId: 'hold',
        date: new Date('2026-06-01T00:00:00.000Z'),
        moved: MovedState.Down,
        description: 'End of life; moved to hold.',
      },
      {
        ringId: 'adopt',
        date: new Date('2018-05-01T00:00:00.000Z'),
        moved: MovedState.NoChange,
      },
    ],
  }),

  // Languages: adopt, trial and assess only (hold is left empty on purpose)
  entry('typescript', 'TypeScript', 'languages', 'adopt', 'none'),
  entry('rust', 'Rust', 'languages', 'trial', 'up'),
  entry('gleam', 'Gleam', 'languages', 'assess', 'none', {
    description: undefined, // no description
  }),

  // Process: one entry per ring, plus an invalid date
  entry('code-review', 'Code Review', 'process', 'adopt', 'none'),
  entry('trunk-based', 'Trunk-Based Development', 'process', 'trial', 'up'),
  entry('mob-programming', 'Mob Programming', 'process', 'assess', 'down', {
    timeline: [
      {
        ringId: 'assess',
        date: new Date('not a date'),
        moved: MovedState.Down,
        description:
          'This snapshot has an invalid date, so no date should show.',
      },
    ],
  }),
  entry('waterfall', 'Waterfall', 'process', 'hold', 'none'),

  // Extra entries to crowd one segment
  ...Array.from({ length: 6 }, (_, i) =>
    entry(
      `tool-${i + 1}`,
      `Crowded Tool ${i + 1}`,
      'infrastructure',
      'adopt',
      variants[i % 3],
    ),
  ),
];

export class SampleTechRadarApi implements TechRadarApi {
  async load(): Promise<TechRadarLoaderResponse> {
    return { entries: sampleEntries, quadrants, rings };
  }
}
