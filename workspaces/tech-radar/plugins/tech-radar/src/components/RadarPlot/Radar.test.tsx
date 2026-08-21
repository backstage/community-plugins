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

import { renderInTestApp } from '@backstage/test-utils';
import GetBBoxPolyfill from '../../util/polyfills/getBBox';

import { Radar, RadarBlipsAndLabels } from './Radar';
import { Blip, Quadrant, Ring } from '../../types';
import {
  RadarFilterContext,
  RadarFilterContextType,
} from '../RadarFilterContext.tsx';

const mockQuadrants = [
  { id: 'infrastructure', name: 'Infrastructure' },
  { id: 'frameworks', name: 'Frameworks' },
  { id: 'languages', name: 'Languages' },
  { id: 'process', name: 'Process' },
] as Quadrant[];

const mockRings = [{ id: 'use', name: 'USE', color: '#93c47d' }] as Ring[];

const mockBlips: Blip[] = [
  {
    color: '#ffffff',
    x: 0,
    y: 0,
    id: 'typescript',
    title: 'TypeScript',
    quadrant: { id: 'languages', name: 'Languages' },
    ring: mockRings[0],
    visible: true,
    timeline: [
      {
        moved: 0,
        ring: mockRings[0],
        date: new Date('2020-08-06'),
      },
    ],
  },
];

const mockContext = {
  blips: mockBlips,
} as unknown as RadarFilterContextType;

describe('Radar', () => {
  beforeAll(() => {
    GetBBoxPolyfill.create(0, 0, 1000, 500);
  });

  afterAll(() => {
    GetBBoxPolyfill.remove();
  });

  it('should render', async () => {
    const rendered = await renderInTestApp(
      <Radar rings={mockRings} quadrants={mockQuadrants} />,
    );

    const svg = rendered.container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('should render blips and labels', async () => {
    const rendered = await renderInTestApp(
      <RadarFilterContext.Provider value={mockContext}>
        <Radar rings={mockRings} quadrants={mockQuadrants}>
          <RadarBlipsAndLabels rings={mockRings} quadrants={mockQuadrants} />
        </Radar>
      </RadarFilterContext.Provider>,
    );

    expect(rendered.container.querySelector('svg')).not.toBeNull();
    expect(await rendered.findByTestId('typescript')).toBeInTheDocument();
    expect(await rendered.findByText('Infrastructure')).toBeInTheDocument();
    expect(await rendered.findByText('Frameworks')).toBeInTheDocument();
    expect(await rendered.findByText('Languages')).toBeInTheDocument();
    expect(await rendered.findByText('Process')).toBeInTheDocument();
    expect(await rendered.findAllByText('USE')).toHaveLength(1);
  });
});
