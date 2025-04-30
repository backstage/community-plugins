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
import type { ReactElement, ReactNode } from 'react';

import {
  Node,
  TopologyQuadrant,
} from '@patternfly/react-topology/dist/esm/types';

import { TopologyDecorator } from '../../../types/topology-types';

const getDecoratorForQuadrant = (
  location: TopologyQuadrant,
  element: Node,
  decorator: TopologyDecorator,
  centerX: number,
  centerY: number,
  nodeRadius: number,
  decoratorRadius: number,
): ReactElement | null => {
  let x: number;
  let y: number;
  const deltaX = nodeRadius > 0 ? nodeRadius : 0;
  const deltaY = nodeRadius > 0 ? nodeRadius : 0;
  const offset = nodeRadius > 0 ? decoratorRadius * 0.7 : 0;
  switch (location) {
    case TopologyQuadrant.upperRight:
      x = centerX + deltaX - offset;
      y = centerY - deltaY + offset;
      break;
    case TopologyQuadrant.lowerRight:
      x = centerX + deltaX - offset;
      y = centerY + deltaY - offset;
      break;
    case TopologyQuadrant.upperLeft:
      x = centerX - deltaX + offset;
      y = centerY - deltaY + offset;
      break;
    case TopologyQuadrant.lowerLeft:
      x = centerX - deltaX + offset;
      y = centerY + deltaY - offset;
      break;
    default:
      x = centerX;
      y = centerY;
  }

  let retDecorator = null;

  retDecorator = decorator.decorator(element, decoratorRadius, x, y);
  return retDecorator;
};

export const getNodeDecorators = (
  element: Node,
  decorators: TopologyDecorator[],
  centerX: number,
  centerY: number,
  nodeRadius: number, // -1 to use width/height
  decoratorRadius: number,
): ReactNode => {
  return (
    <>
      {decorators.map(decorator =>
        getDecoratorForQuadrant(
          decorator.quadrant,
          element,
          decorator,
          centerX,
          centerY,
          nodeRadius,
          decoratorRadius,
        ),
      )}
    </>
  );
};
