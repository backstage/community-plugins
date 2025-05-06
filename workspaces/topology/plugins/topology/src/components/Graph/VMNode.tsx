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
import type { MouseEvent } from 'react';

import { makeStyles } from '@mui/styles';
import {
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

import { RESOURCE_NAME_TRUNCATE_LENGTH } from '../../const';
import VirtualMachineIcon from '../Icons/VirtualMachineIcon';
import BaseNode from './BaseNode';

const VM_STATUS_GAP = 7;
const VM_STATUS_WIDTH = 7;
const VM_STATUS_RADIUS = 7;
type VmNodeProps = {
  element: any;
  hover?: boolean;
  dragging?: boolean;
  edgeDragging?: boolean;
  highlight?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  children: any;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const VmNode = ({
  element,
  onSelect,
  canDrop,
  dropTarget,
  children,
  ...rest
}: VmNodeProps) => {
  const { width, height } = element.getBounds();
  const vmData = element.getData().data;
  const { kind, osImage } = vmData;
  const iconRadius = Math.min(width, height) * 0.25;

  const onNodeSelect = (e: MouseEvent) => {
    const params = new URLSearchParams(window.location.search);
    params.set('selectedId', element.getId());
    history.replaceState(null, '', `?${params.toString()}`);
    if (onSelect) onSelect(e);
  };
  const imageProps = {
    x: width / 2 - iconRadius,
    y: height / 2 - iconRadius,
    width: iconRadius * 2,
    height: iconRadius * 2,
  };
  const imageComponent = osImage ? (
    <image {...imageProps} xlinkHref={osImage} />
  ) : (
    <VirtualMachineIcon style={imageProps} x={imageProps.x} y={imageProps.y} />
  );

  const useStyles = makeStyles({
    kubevirtbg: {
      fill: 'var(--pf-t--color--white)',
    },
  });
  const classes = useStyles();
  return (
    <g>
      <BaseNode
        kind={kind}
        element={element}
        truncateLength={RESOURCE_NAME_TRUNCATE_LENGTH}
        onSelect={onNodeSelect}
        {...rest}
      >
        <rect
          className={classes.kubevirtbg}
          x={VM_STATUS_GAP + VM_STATUS_WIDTH}
          y={VM_STATUS_GAP + VM_STATUS_WIDTH}
          rx={VM_STATUS_RADIUS}
          ry={VM_STATUS_RADIUS}
          width={width - (VM_STATUS_GAP + VM_STATUS_WIDTH) * 2}
          height={height - (VM_STATUS_GAP + VM_STATUS_WIDTH) * 2}
        />
        {imageComponent}
      </BaseNode>
    </g>
  );
};

export default VmNode;
