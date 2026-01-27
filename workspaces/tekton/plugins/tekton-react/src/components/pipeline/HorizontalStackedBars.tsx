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

import { CSSProperties } from 'react';

/**
 * The stacked value for the horizontal stacked bars.
 *
 * @public
 */
export type StackedValue = {
  color: string;
  name: string;
  size: number;
};

/**
 * Props for the HorizontalStackedBars component.
 *
 * @public
 */
export type HorizontalStackedBarsProps = {
  id: string;
  barGap?: number;
  height?: number | string;
  inline?: boolean;
  values: StackedValue[];
  width?: number | string;
  onClick?: () => void;
};

/**
 * The HorizontalStackedBars component is used to display a horizontal stacked bar chart.
 *
 * @public
 */
export const HorizontalStackedBars = ({
  id,
  barGap,
  height,
  inline,
  values,
  width,
  onClick,
}: HorizontalStackedBarsProps) => {
  const rootStyle: CSSProperties = {
    display: inline ? 'inline-block' : 'block',
    height,
    width,
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
  };

  const barsStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: `calc(100% + ${barGap}px)`,
    outline: 'none',
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      id={`horizontal-stacked-bars-${id}`}
      data-testid={`horizontal-stacked-bars-${id}`}
      style={rootStyle}
      onClick={onClick}
    >
      <div style={barsStyle}>
        {values.map(({ color, name, size }) => (
          <div
            key={name}
            style={{
              background: color,
              flexGrow: size,
              height: '100%',
              boxShadow: `inset ${barGap}px 0 0 #fff`,
              transition: 'flex-grow 300ms linear',
            }}
          />
        ))}
      </div>
    </div>
  );
};
