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

import { render, screen } from '@testing-library/react';
import { RingLegend } from './RingLegend';
import { Quadrant, Ring } from '../../types';

const mockQuadrants: Quadrant[] = [];

const mockRings = [
  { id: 'adopt', name: 'ADOPT', color: '#93c47d' },
  { id: 'assess', name: 'ASSESS', color: '#b7e1cd' },
  { id: 'hold', name: 'HOLD', color: '#fce8b2' },
  { id: 'trial', name: 'TRIAL', color: '#6fa8dc' },
] as Ring[];

describe('RingLegend', () => {
  it('should render all rings', () => {
    render(
      <RingLegend
        highlighted="adopt"
        quadrants={mockQuadrants}
        rings={mockRings}
      />,
    );

    expect(screen.getByText('adopt')).toBeInTheDocument();
    expect(screen.getByText('assess')).toBeInTheDocument();
    expect(screen.getByText('hold')).toBeInTheDocument();
    expect(screen.getByText('trial')).toBeInTheDocument();
  });

  it('should move the highlighted ring to the top', () => {
    render(
      <RingLegend
        highlighted="hold"
        quadrants={mockQuadrants}
        rings={mockRings}
      />,
    );
    const rings = screen.getAllByRole('heading');
    expect(rings[0]).toHaveTextContent('hold');
  });

  it('should apply highlighted styles to the highlighted ring', () => {
    render(
      <RingLegend
        highlighted="adopt"
        quadrants={mockQuadrants}
        rings={mockRings}
      />,
    );
    const highlightedRing = screen
      .getByText('adopt')
      .closest('div[class*="border-primary/40"]');
    expect(highlightedRing).toBeInTheDocument();
  });
});
