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
import { Button } from '@backstage/ui';

import styles from './QuadrantFilterButtons.module.css';

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
      className={styles.root}
      role="group"
    >
      <svg aria-hidden="true" className={styles.svg} viewBox="0 0 400 240">
        {/* Cross */}
        <line
          className={styles.svgLine}
          strokeWidth="6"
          x1="200"
          x2="200"
          y1="0"
          y2="240"
        />
        <line
          className={styles.svgLine}
          strokeWidth="6"
          x1="0"
          x2="400"
          y1="120"
          y2="120"
        />

        {/* Concentric circles */}
        {[30, 50, 70, 90].map(r => (
          <circle
            className={styles.svgCircle}
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
          <Button
            data-testid={q.id}
            className={cn(
              styles.quadrantButton,
              isFocused && styles.isFocused,
              q.offsetX === 1 ? styles.right : styles.left,
              q.offsetY === 1 ? styles.bottom : styles.top,
              q.offsetX === -1 && q.offsetY === -1 && styles.roundedTl,
              q.offsetX === 1 && q.offsetY === -1 && styles.roundedTr,
              q.offsetX === -1 && q.offsetY === 1 && styles.roundedBl,
              q.offsetX === 1 && q.offsetY === 1 && styles.roundedBr,
            )}
            key={q.id}
            onClick={() => onSelect(q)}
          />
        );
      })}
    </div>
  );
};
