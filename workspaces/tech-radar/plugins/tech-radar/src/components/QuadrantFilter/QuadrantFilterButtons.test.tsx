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
import { QuadrantFilterButtons } from './QuadrantFilterButtons';
import { Quadrant } from '../../types';
import {
  RadarFilterContext,
  RadarFilterContextType,
} from '../RadarFilterContext';

const mockQuadrants = [
  { id: 'quadrant-1', name: 'Quadrant 1' },
  { id: 'quadrant-2', name: 'Quadrant 2' },
  { id: 'quadrant-3', name: 'Quadrant 3' },
  { id: 'quadrant-4', name: 'Quadrant 4' },
] as Quadrant[];

describe('QuadrantFilterButtons', () => {
  it('should call setFocusedQuadrant with the correct quadrant when a quadrant is clicked', () => {
    const handleSelectedBlip = jest.fn();
    const setFocusedQuadrant = jest.fn();
    render(
      <RadarFilterContext.Provider
        value={
          {
            handleSelectedBlip,
            setFocusedQuadrant,
          } as unknown as RadarFilterContextType
        }
      >
        <QuadrantFilterButtons quadrants={mockQuadrants} />
      </RadarFilterContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('quadrant-1'));
    expect(setFocusedQuadrant).toHaveBeenCalledWith(mockQuadrants[0]);

    fireEvent.click(screen.getByTestId('quadrant-2'));
    expect(setFocusedQuadrant).toHaveBeenCalledWith(mockQuadrants[1]);

    fireEvent.click(screen.getByTestId('quadrant-3'));
    expect(setFocusedQuadrant).toHaveBeenCalledWith(mockQuadrants[2]);

    fireEvent.click(screen.getByTestId('quadrant-4'));
    expect(setFocusedQuadrant).toHaveBeenCalledWith(mockQuadrants[3]);
  });
});
