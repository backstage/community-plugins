/*
 * Copyright 2024 The Backstage Authors
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
import { useRef } from 'react';

import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import UrlDecoratorIcon from '../../Icons/UrlDecoratorIcon';
import Decorator from './Decorator';

interface DefaultDecoratorProps {
  url?: string;
  radius: number;
  x: number;
  y: number;
}

export const UrlDecorator = ({ url, radius, x, y }: DefaultDecoratorProps) => {
  const decoratorRef = useRef<SVGGElement | null>(null);

  if (!url) {
    return null;
  }
  const label = 'Open URL';
  return (
    <Tooltip
      key="route"
      content={label}
      position={TooltipPosition.right}
      triggerRef={decoratorRef}
    >
      <g ref={decoratorRef}>
        <Decorator
          x={x}
          y={y}
          radius={radius}
          href={url}
          external
          ariaLabel={label}
        >
          <g transform={`translate(-${radius / 2}, -${radius / 2})`}>
            <UrlDecoratorIcon style={{ fontSize: radius }} />
          </g>
        </Decorator>
      </g>
    </Tooltip>
  );
};
