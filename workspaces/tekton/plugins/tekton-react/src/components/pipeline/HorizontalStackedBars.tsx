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

import classNames from 'classnames';

import './HorizontalStackedBars.css';

type StackedValue = {
  color: string;
  name: string;
  size: number;
};

type HorizontalStackedBarsProps = {
  id: string;
  barGap?: number;
  height?: number | string;
  inline?: boolean;
  values: StackedValue[];
  width?: number | string;
  onClick?: () => void;
};

export const HorizontalStackedBars = ({
  id,
  barGap,
  height,
  inline,
  values,
  width,
  onClick,
}: HorizontalStackedBarsProps) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      id={`horizontal-stacked-bars-${id}`}
      data-testid={`horizontal-stacked-bars-${id}`}
      className={classNames('bs-shared-horizontal-stacked-bars', {
        'is-inline': inline,
      })}
      style={{ height, width, ['--bar-gap' as any]: barGap && `${barGap}px` }}
      onClick={onClick}
    >
      <div className="bs-shared-horizontal-stacked-bars__bars">
        {values.map(({ color, name, size }) => (
          <div
            key={name}
            className="bs-shared-horizontal-stacked-bars__data-bar"
            style={{
              background: color,
              flexGrow: size,
            }}
          />
        ))}
      </div>
    </div>
  );
};
