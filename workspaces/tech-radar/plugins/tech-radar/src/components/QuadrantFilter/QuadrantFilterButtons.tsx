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
import { useContext } from 'react';

import type { Quadrant } from '../../types';

import { RadarFilterContext } from '../RadarFilterContext';
import { cn } from '../../util/cn';

type Props = Readonly<{
  quadrants: Quadrant[];
}>;

export const QuadrantFilterButtons = ({ quadrants }: Props) => {
  const { focusedQuadrant, handleSelectedBlip, setFocusedQuadrant } =
    useContext(RadarFilterContext);

  const onSelect = (q: Quadrant) => {
    handleSelectedBlip(undefined);
    setFocusedQuadrant(focusedQuadrant?.id === q.id ? undefined : q);
  };

  return (
    <div
      aria-label="Radar quadrant filter"
      className="relative aspect-[5/3] h-10 rounded-md border border-solid border-border bg-card"
      role="group"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 240"
      >
        {/* Cross */}
        <line
          className="stroke-muted-foreground"
          strokeWidth="6"
          x1="200"
          x2="200"
          y1="0"
          y2="240"
        />
        <line
          className="stroke-muted-foreground"
          strokeWidth="6"
          x1="0"
          x2="400"
          y1="120"
          y2="120"
        />

        {/* Concentric circles */}
        {[30, 50, 70, 90].map(r => (
          <circle
            className="stroke-muted-foreground"
            cx="200"
            cy="120"
            fill="none"
            key={r}
            r={r}
            strokeWidth="6"
          />
        ))}
      </svg>

      {/* Quadrant Buttons */}
      {quadrants.map(q => {
        const isFocused = focusedQuadrant?.id === q.id;
        return (
          <button
            data-testid={q.id}
            className={cn(
              'absolute h-[calc(50%+1px)] w-[calc(50%+1px)] bg-transparent transition-all border-none cursor-pointer',
              isFocused ? 'bg-active-quadrant-filter/60' : '',
              q.offsetX === 1 ? 'right-[-1px]' : 'left-[-1px]',
              q.offsetY === 1 ? 'bottom-[-1px]' : 'top-[-1px]',
              q.offsetX === -1 && q.offsetY === -1 && 'rounded-tl-sm',
              q.offsetX === 1 && q.offsetY === -1 && 'rounded-tr-sm',
              q.offsetX === -1 && q.offsetY === 1 && 'rounded-bl-sm',
              q.offsetX === 1 && q.offsetY === 1 && 'rounded-br-sm',
            )}
            key={q.id}
            onClick={() => onSelect(q)}
          />
        );
      })}
    </div>
  );
};
