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
import type { Blip } from '../types';

import { filterBlips } from './filterTechRadarBlips';

describe('filterTechRadarBlips', () => {
  const mockData: Blip[] = [
    {
      id: 'react',
      quadrant: { id: 'frameworks' },
      ring: { id: 'adopt' },
      timeline: [
        {
          date: new Date('2023-01-01'),
          description: 'The web framework of choice',
          ring: { id: 'adopt' },
        },
      ],
      title: 'React',
    },
    {
      id: 'vue',
      quadrant: { id: 'frameworks' },
      ring: { id: 'trial' },
      timeline: [
        {
          date: new Date('2023-01-01'),
          description: 'An alternative web framework',
          ring: { id: 'trial' },
        },
      ],
      title: 'Vue',
    },
    {
      id: 'angular',
      quadrant: { id: 'languages' },
      ring: { id: 'hold' },
      timeline: [
        {
          date: new Date('2022-01-01'),
          description: 'Another web framework',
          ring: { id: 'assess' },
        },
        {
          date: new Date('2023-01-01'),
          description: 'Moved to hold',
          ring: { id: 'hold' },
        },
      ],
      title: 'Angular',
    },
  ] as unknown as Blip[];

  it('should return all blips as visible if no search term and no filters are provided', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: '',
      selectedFilters: [],
    });
    expect(result).toHaveLength(3);
    expect(result.every(b => b.visible)).toBe(true);
  });

  it('should mark blips as visible by search term matching the key', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: 'react',
      selectedFilters: [],
    });
    expect(result).toHaveLength(3);
    expect(result.find(b => b.id === 'react')?.visible).toBe(true);
    expect(result.find(b => b.id === 'vue')?.visible).toBe(false);
    expect(result.find(b => b.id === 'angular')?.visible).toBe(false);
  });

  it('should mark blips as visible by search term matching the description of the first timeline entry', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: 'alternative',
      selectedFilters: [],
    });
    expect(result).toHaveLength(3);
    expect(result.find(b => b.id === 'vue')?.visible).toBe(true);
    expect(result.find(b => b.id === 'react')?.visible).toBe(false);
  });

  it('should mark blips as visible by selected ring filter', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: '',
      selectedFilters: ['ring:adopt'],
    });
    expect(result).toHaveLength(3);
    expect(result.find(b => b.id === 'react')?.visible).toBe(true);
    expect(result.find(b => b.id === 'vue')?.visible).toBe(false);
  });

  it('should mark blips as visible by selected quadrant filter', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: '',
      selectedFilters: ['quadrant:languages'],
    });
    expect(result).toHaveLength(3);
    expect(result.find(b => b.id === 'angular')?.visible).toBe(true);
    expect(result.find(b => b.id === 'react')?.visible).toBe(false);
  });

  it('should combine search term and filters (AND logic for search and filters)', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: 'web',
      selectedFilters: ['ring:trial'],
    });
    expect(result.find(b => b.id === 'vue')?.visible).toBe(true);
    expect(result.find(b => b.id === 'react')?.visible).toBe(false); // Matches search but not filter
  });

  it('should apply AND logic between different categories and OR logic within the same category', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: '',
      selectedFilters: ['quadrant:frameworks', 'ring:adopt', 'ring:trial'],
    });
    expect(result.find(b => b.id === 'react')?.visible).toBe(true); // frameworks AND (adopt OR trial)
    expect(result.find(b => b.id === 'vue')?.visible).toBe(true); // frameworks AND (adopt OR trial)
    expect(result.find(b => b.id === 'angular')?.visible).toBe(false); // languages
  });

  it('should apply OR logic within the same category', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: '',
      selectedFilters: ['ring:adopt', 'ring:trial'],
    });
    expect(result.find(b => b.id === 'react')?.visible).toBe(true);
    expect(result.find(b => b.id === 'vue')?.visible).toBe(true);
    expect(result.find(b => b.id === 'angular')?.visible).toBe(false);
  });

  it('should mark blips as invisible for unknown filters', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: '',
      selectedFilters: ['unknown:filter'],
    });
    expect(result.every(b => b.visible)).toBe(false);
  });

  it('should mark all blips as invisible if no search matches', () => {
    const result = filterBlips({
      blips: mockData,
      searchTerm: 'nonexistent',
      selectedFilters: [],
    });
    expect(result.every(b => b.visible)).toBe(false);
  });
});
