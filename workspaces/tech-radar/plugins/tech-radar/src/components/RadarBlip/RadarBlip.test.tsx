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

import { render } from '@testing-library/react';
import { RadarBlip } from './RadarBlip';
import { Blip } from '../../types';
import GetBBoxPolyfill from '../../util/polyfills/getBBox';

describe('RadarBlip', () => {
  beforeAll(() => {
    GetBBoxPolyfill.create(0, 0, 1000, 500);
  });

  afterAll(() => {
    GetBBoxPolyfill.remove();
  });

  const mockBlip: Blip = {
    timeline: [],
    visible: true,
    id: 'test-blip',
    title: 'Test Blip',
    quadrant: { id: 'languages', name: 'Languages' },
    ring: { id: 'use', name: 'USE', color: '#fff' },
    x: 0,
    y: 0,
    color: '#000',
    moved: 0,
  };

  it('should render a circle when moved is 0', () => {
    const { container } = render(
      <RadarBlip blip={{ ...mockBlip, moved: 0 }} />,
    );
    expect(container.querySelector('circle')).toBeInTheDocument();
    expect(container.querySelector('path')).not.toBeInTheDocument();
  });

  it('should render a triangle pointing up when moved is positive', () => {
    const { container } = render(
      <RadarBlip blip={{ ...mockBlip, moved: 1 }} />,
    );
    expect(
      container.querySelector('path[d="M -11,5 11,5 0,-13 z"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('circle')).not.toBeInTheDocument();
  });

  it('should render a triangle pointing down when moved is negative', () => {
    const { container } = render(
      <RadarBlip blip={{ ...mockBlip, moved: -1 }} />,
    );
    expect(
      container.querySelector('path[d="M -11,-5 11,-5 0,13 z"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('circle')).not.toBeInTheDocument();
  });
});
