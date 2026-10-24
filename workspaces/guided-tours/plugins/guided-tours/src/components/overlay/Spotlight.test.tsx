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
import { Spotlight } from './Spotlight';

describe('Spotlight', () => {
  it('dims everything while the target is unknown', () => {
    render(<Spotlight rect={null} />);
    const svg = screen.getByTestId('guided-tour-spotlight');
    expect(svg.querySelector('path')).toHaveAttribute(
      'd',
      'M0 0H100000V100000H0Z',
    );
    expect(svg.querySelectorAll('rect')).toHaveLength(0);
  });

  it('cuts a padded hole, shields it and lets clicks through on request', () => {
    const rect = { top: 100, left: 50, width: 200, height: 40 };
    const { rerender } = render(<Spotlight rect={rect} />);
    const svg = screen.getByTestId('guided-tour-spotlight');
    const path = svg.querySelector('path')!.getAttribute('d')!;
    expect(path).toContain('M0 0H100000V100000H0Z');
    expect(path).toContain('M52 94'); // left + radius - padding, top - padding
    const rects = svg.querySelectorAll('rect');
    expect(rects).toHaveLength(2);
    expect(rects[0]).toHaveAttribute('x', '44');
    expect(rects[0]).toHaveAttribute('width', '212');
    expect(rects[0]).toHaveStyle({ pointerEvents: 'auto' });

    rerender(<Spotlight rect={rect} passThrough />);
    expect(svg.querySelectorAll('rect')).toHaveLength(1);
    expect(svg.querySelector('rect')).toHaveAttribute('stroke-width', '2');
  });
});
