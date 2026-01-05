/*
 * Copyright 2025 The Backstage Authors
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

import { ComponentProps, CSSProperties, useMemo } from 'react';

import { Text } from '@backstage/ui';

export interface CircularProgressProps {
  /** A value between 0 and 1 defining the progress (0% - 100%) */
  progress: number;
  /** A color function for getting a color, given a progress value */
  color: string;
  /**
   * Size in pixels (both width and height). If left undefined, defaults to 100%
   */
  size?: number | string;
  /** Show percentage value inside the circle. Defaults to true. */
  showPercentage?: boolean;
  /** Custom css styles to the root element */
  style?: CSSProperties;
  /** Custom props for the text component */
  textProps?: ComponentProps<typeof Text>;
}

function getCircle(strokeWidth: number, progress: number) {
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const dasharray = circumference;
  const dashoffset = circumference * (1 - progress);

  return {
    radius,
    circumference,
    dasharray,
    dashoffset,
    strokeWidth,
  };
}

export function CircularProgress(props: CircularProgressProps) {
  const {
    progress,
    color,
    size,
    showPercentage = true,
    style = {},
    textProps,
  } = props;

  const isSmall = typeof size === 'number' && size < 60;

  const bgWidth = isSmall ? 6 : 4;
  const fgWidth = isSmall ? 8 : 6;

  const bgCircle = getCircle(bgWidth, 1);
  const fgCircle = getCircle(fgWidth, progress);

  const rootStyle = useMemo(
    (): CSSProperties => ({
      ...style,
      ...(!size
        ? {
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            aspectRatio: '1 / 1',
          }
        : {
            position: 'relative',
            overflow: 'hidden',
            aspectRatio: '1 / 1',
            height: size,
          }),
    }),
    [style, size],
  );

  return (
    <div style={rootStyle}>
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <circle
          cx={50}
          cy={50}
          r={bgCircle.radius}
          stroke={color}
          strokeWidth={bgCircle.strokeWidth}
          fill="none"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50px 50px',
            strokeDasharray: `${bgCircle.dasharray}px, ${bgCircle.dasharray}`,
            strokeDashoffset: 0,
            opacity: 0.3,
          }}
        />
        <circle
          cx={50}
          cy={50}
          r={fgCircle.radius}
          stroke={color}
          strokeWidth={fgCircle.strokeWidth}
          fill="none"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50px 50px',
            strokeDasharray: `${fgCircle.dasharray}px, ${fgCircle.dasharray}`,
            strokeDashoffset: fgCircle.dashoffset,
          }}
        />
      </svg>
      {showPercentage && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            lineHeight: 0,
          }}
        >
          <Text
            variant="title-x-small"
            style={{ cursor: 'default' }}
            {...textProps}
          >
            {Math.round(progress * 100)}%
          </Text>
        </div>
      )}
    </div>
  );
}
