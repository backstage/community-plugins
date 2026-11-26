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
import { ProgressBar } from 'react-aria-components';

const SIZE = 40;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface CircularProgressProps {
  /** Progress between 0 and 1; omit for an indeterminate spinner. */
  value?: number;
  'aria-label': string;
}

/** A small progress ring; determinate when a value is given. */
export function CircularProgress(props: CircularProgressProps) {
  const { value, 'aria-label': ariaLabel } = props;
  const determinate = value !== undefined;
  const fraction = determinate ? Math.min(Math.max(value, 0), 1) : 0.25;
  const center = SIZE / 2;

  return (
    <ProgressBar
      aria-label={ariaLabel}
      value={determinate ? Math.round(fraction * 100) : undefined}
      isIndeterminate={!determinate}
      style={{ display: 'inline-flex', lineHeight: 0 }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          stroke="var(--bui-border, rgba(0, 0, 0, 0.12))"
          strokeWidth={STROKE}
        />
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          stroke="var(--bui-fg-link, #1f5eff)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: determinate
              ? 'stroke-dashoffset 100ms linear'
              : undefined,
          }}
        >
          {!determinate && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`-90 ${center} ${center}`}
              to={`270 ${center} ${center}`}
              dur="1s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </svg>
    </ProgressBar>
  );
}
