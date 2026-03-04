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
import { RadarBlipDetails } from './RadarBlipDetails';
import { MovedState } from '@backstage-community/plugin-tech-radar-common';
import { Blip } from '../../types';

const mockBlip = {
  id: 'entry-1',
  title: 'Entry 1',
  quadrant: { id: 'quadrant-1', name: 'Quadrant 1' },
  ring: { id: 'ring-1', name: 'Ring 1', color: '#ff0000' },
  timeline: [
    {
      date: new Date('2024-01-01'),
      ring: { id: 'ring-1', name: 'Ring 1', color: '#ff0000' },
      description: 'Description for entry 1',
      moved: MovedState.Up,
    },
    {
      date: new Date('2023-01-01'),
      ring: { id: 'ring-2', name: 'Ring 2', color: '#ff0000' },
      description: 'Older description',
      moved: MovedState.Down,
    },
  ],
  url: 'https://example.com',
} as Blip;

describe('RadarBlipDetails', () => {
  const onOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render the dialog when entry is not provided', () => {
    const { container } = render(
      <RadarBlipDetails onOpenChange={onOpenChange} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render the dialog when entry is provided', () => {
    render(
      <MemoryRouter>
        <RadarBlipDetails onOpenChange={onOpenChange} blip={mockBlip} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Entry 1')).toBeInTheDocument();
  });

  it('should display the correct title, description, and timeline information', () => {
    render(
      <MemoryRouter>
        <RadarBlipDetails onOpenChange={onOpenChange} blip={mockBlip} />
      </MemoryRouter>,
    );

    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('Description for entry 1')).toBeInTheDocument();

    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('Older description')).toBeInTheDocument();
  });

  it('should display the "Learn more" link when the entry has a URL', () => {
    render(
      <MemoryRouter>
        <RadarBlipDetails onOpenChange={onOpenChange} blip={mockBlip} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  it('should not display the "Learn more" link when the entry does not have a URL', () => {
    const entryWithoutUrl = { ...mockBlip, url: undefined };
    render(
      <RadarBlipDetails onOpenChange={onOpenChange} blip={entryWithoutUrl} />,
    );
    expect(screen.queryByText('Learn more')).not.toBeInTheDocument();
  });

  it('should call onOpenChange when the dialog is closed', () => {
    render(
      <MemoryRouter>
        <RadarBlipDetails onOpenChange={onOpenChange} blip={mockBlip} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
