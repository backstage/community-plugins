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

import React from 'react';
import { renderInTestApp } from '@backstage/test-utils';
import GetBBoxPolyfill from '../../utils/polyfills/getBBox';

import RadarPlot, { Props } from './RadarPlot';

const minProps: Props = {
  width: 500,
  height: 200,
  radius: 50,
  columnCount: 2,
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

describe('RadarPlot', () => {
  beforeAll(() => {
    GetBBoxPolyfill.create(0, 0, 1000, 500);
  });

  afterAll(() => {
    GetBBoxPolyfill.remove();
  });

  it('should render', async () => {
    const rendered = await renderInTestApp(
      <svg>
        <RadarPlot {...minProps} />
      </svg>,
    );

    expect(rendered.getByTestId('radar-plot')).toBeInTheDocument();
    expect(rendered.getByTestId('radar-legend')).toBeInTheDocument();
    expect(rendered.getByTestId('radar-footer')).toBeInTheDocument();
    expect(rendered.getByTestId('radar-bubble')).toBeInTheDocument();
    expect(rendered.getAllByTestId('radar-entry')).toHaveLength(1);
  });
});
