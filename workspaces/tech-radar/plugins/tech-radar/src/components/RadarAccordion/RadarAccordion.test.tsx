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

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RadarAccordion } from './RadarAccordion';
import {
  RadarFilterContext,
  RadarFilterContextType,
} from '../RadarFilterContext';
import { Blip, Quadrant, Ring } from '../../types';

const handleSelectedBlip = jest.fn();

const mockBlips = [
  {
    id: 'entry-1',
    title: 'Entry 1',
    quadrant: { id: 'quadrant-1', name: 'Quadrant 1' },
    visible: true,
    ring: { id: 'ring-1', name: 'Ring 1', color: '#ff0000' },
    timeline: [
      {
        date: new Date('2024-01-01'),
        ring: { id: 'ring-1', name: 'Ring 1', color: '#ff0000' },
        description: 'Description for entry 1',
      },
    ],
  },
  {
    id: 'entry-2',
    title: 'Entry 2',
    visible: true,
    quadrant: { id: 'quadrant-1', name: 'Quadrant 1' },
    ring: { id: 'ring-2', name: 'Ring 2', color: '#00ff00' },
    timeline: [
      {
        date: new Date('2024-01-01'),
        ring: { id: 'ring-2', name: 'Ring 2', color: '#00ff00' },
        description: 'Description for entry 2',
        moved: 1,
      },
    ],
  },
  {
    id: 'entry-3',
    title: 'Entry 3',
    visible: true,
    quadrant: { id: 'quadrant-2', name: 'Quadrant 2' },
    ring: { id: 'ring-1', name: 'Ring 1', color: '#ff0000' },
    timeline: [
      {
        date: new Date('2024-01-01'),
        ring: { id: 'ring-1', name: 'Ring 1', color: '#ff0000' },
        description: 'Description for entry 3',
        moved: -1,
      },
    ],
  },
] as Blip[];

const mockRadarContext = {
  blips: mockBlips,
  handleSelectedBlip,
  selectedFilters: [],
} as unknown as RadarFilterContextType;

const mockQuadrants = [
  { id: 'quadrant-1', name: 'Quadrant 1' },
  { id: 'quadrant-2', name: 'Quadrant 2' },
] as Quadrant[];

const mockRings = [
  { id: 'ring-1', name: 'Ring 1', color: '#ff0000' },
  { id: 'ring-2', name: 'Ring 2', color: '#00ff00' },
] as Ring[];

describe('RadarAccordion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the accordion with the correct number of rings and entries', () => {
    render(
      <MemoryRouter>
        <RadarFilterContext.Provider value={mockRadarContext}>
          <RadarAccordion quadrants={mockQuadrants} rings={mockRings} />
        </RadarFilterContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText('ring 1')).toBeInTheDocument();
    expect(screen.getByText('ring 2')).toBeInTheDocument();
    expect(screen.getByText('Entry 1')).toBeInTheDocument();
    expect(screen.getByText('Entry 2')).toBeInTheDocument();
    expect(screen.getByText('Entry 3')).toBeInTheDocument();
  });

  it('should call onValueChange when an accordion is expanded', () => {
    render(
      <MemoryRouter>
        <RadarFilterContext.Provider value={mockRadarContext}>
          <RadarAccordion quadrants={mockQuadrants} rings={mockRings} />
        </RadarFilterContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Entry 1'));
    expect(handleSelectedBlip).toHaveBeenCalledWith(mockBlips[0]);
  });

  it('should scroll to the active item when selectedBlipId changes', () => {
    const scrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    const { rerender } = render(
      <MemoryRouter>
        <RadarFilterContext.Provider value={mockRadarContext}>
          <RadarAccordion quadrants={mockQuadrants} rings={mockRings} />
        </RadarFilterContext.Provider>
      </MemoryRouter>,
    );

    rerender(
      <MemoryRouter>
        <RadarFilterContext.Provider
          value={{ ...mockRadarContext, selectedBlip: mockBlips[1] }}
        >
          <RadarAccordion quadrants={mockQuadrants} rings={mockRings} />
        </RadarFilterContext.Provider>
      </MemoryRouter>,
    );

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });
});
