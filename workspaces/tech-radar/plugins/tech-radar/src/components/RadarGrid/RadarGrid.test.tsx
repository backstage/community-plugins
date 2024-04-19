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

import RadarGrid, { Props } from './RadarGrid';

const minProps: Props = {
  radius: 5,
  rings: [{ id: 'use', name: 'USE', color: '#93c47d' }],
};

describe('RadarGrid', () => {
  beforeAll(() => {
    GetBBoxPolyfill.create(0, 0, 1000, 500);
  });

  afterAll(() => {
    GetBBoxPolyfill.remove();
  });

  it('should render', async () => {
    const rendered = await renderInTestApp(
      <svg>
        <RadarGrid {...minProps} />
      </svg>,
    );

    expect(rendered.getByTestId('radar-grid-x-line')).toBeInTheDocument();
    expect(rendered.getByTestId('radar-grid-y-line')).toBeInTheDocument();
  });

  it('should have the correct text color', async () => {
    const rendered = await renderInTestApp(
      <svg>
        <RadarGrid {...minProps} />
      </svg>,
    );

    expect(rendered.getByTestId('radar-ring-heading')).toHaveStyle({
      fill: '#93c47d',
    });
  });
});
