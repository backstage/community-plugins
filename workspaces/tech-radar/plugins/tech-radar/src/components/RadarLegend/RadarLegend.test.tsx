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

import { renderInTestApp } from '@backstage/test-utils';
import React from 'react';
import GetBBoxPolyfill from '../../utils/polyfills/getBBox';

import RadarLegend from './RadarLegend';
import { RadarLegendProps } from './types';

const minProps: RadarLegendProps = {
  quadrants: [{ id: 'languages', name: 'Languages' }],
  rings: [{ id: 'use', name: 'USE', color: '#93c47d' }],
  entries: [
    {
      id: 'typescript',
      title: 'TypeScript',
      quadrant: { id: 'languages', name: 'Languages' },
      moved: 0,
      ring: { id: 'use', name: 'USE', color: '#93c47d' },
      url: '#',
    },
  ],
};

describe('RadarLegend', () => {
  beforeAll(() => {
    GetBBoxPolyfill.create(0, 0, 1000, 500);
  });

  afterAll(() => {
    GetBBoxPolyfill.remove();
  });

  it('should render', async () => {
    const rendered = await renderInTestApp(
      <svg>
        <RadarLegend {...minProps} />
      </svg>,
    );

    expect(rendered.getByTestId('radar-legend')).toBeInTheDocument();
    expect(rendered.getAllByTestId('radar-quadrant')).toHaveLength(1);
    expect(rendered.getAllByTestId('radar-ring')).toHaveLength(1);
  });

  it('should have the correct ring text color', async () => {
    const rendered = await renderInTestApp(
      <svg>
        <RadarLegend {...minProps} />
      </svg>,
    );

    expect(rendered.getByTestId('radar-legend')).toBeInTheDocument();

    const legend = rendered.getByTestId('radar-legend-heading');
    expect(legend).toHaveStyle({
      color: '#93c47d',
    });
  });
});
