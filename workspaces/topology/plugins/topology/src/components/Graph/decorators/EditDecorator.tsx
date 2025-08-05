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
import type { FC } from 'react';

import { useRef } from 'react';

import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Node } from '@patternfly/react-topology';

import {
  getCheDecoratorData,
  getEditURL,
} from '../../../utils/edit-decorator-utils';
import RouteDecoratorIcon from '../../Icons/RouteDecoratorIcon';
import Decorator from './Decorator';

interface DefaultDecoratorProps {
  element: Node;
  radius: number;
  x: number;
  y: number;
}

const EditDecorator: FC<DefaultDecoratorProps> = ({
  element,
  radius,
  x,
  y,
}) => {
  const workloadData = element.getData().data;
  const { editURL, vcsURI, vcsRef, cheCluster } = workloadData;
  const cheURL = getCheDecoratorData(cheCluster);
  const cheEnabled = !!cheURL;
  const editUrl = editURL || getEditURL(vcsURI, vcsRef, cheURL);
  const decoratorRef = useRef<SVGGElement | null>(null);
  const repoIcon = (
    <RouteDecoratorIcon
      routeURL={editUrl}
      radius={radius}
      cheEnabled={cheEnabled}
    />
  );

  if (!repoIcon) {
    return null;
  }
  const label = 'Edit source code';

  return (
    <Tooltip
      content={label}
      position={TooltipPosition.right}
      triggerRef={decoratorRef}
    >
      <g ref={decoratorRef}>
        <Decorator
          x={x}
          y={y}
          radius={radius}
          href={editUrl}
          external
          ariaLabel={label}
        >
          <g transform={`translate(-${radius / 2}, -${radius / 2})`}>
            {repoIcon}
          </g>
        </Decorator>
      </g>
    </Tooltip>
  );
};

export default EditDecorator;
