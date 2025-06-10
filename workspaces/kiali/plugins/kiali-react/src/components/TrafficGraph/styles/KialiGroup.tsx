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
import { CubesIcon } from '@patternfly/react-icons';
import {
  DefaultGroup,
  Node,
  ScaleDetailsLevel,
  ShapeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';
import useDetailsLevel from '@patternfly/react-topology/dist/esm/hooks/useDetailsLevel';
import { default as React } from 'react';
import { PFColors } from '../../../components/Pf/PfColors';

const ICON_PADDING = 20;

export enum DataTypes {
  Default,
}

type StyleGroupProps = {
  element: Node;
  collapsible: boolean;
  collapsedWidth?: number;
  collapsedHeight?: number;
  onCollapseChange?: (group: Node, collapsed: boolean) => void;
  getCollapsedShape?: (node: Node) => React.FC<ShapeProps>;
  collapsedShadowOffset?: number; // defaults to 10
} & WithSelectionProps;

export function KialiGroup({
  element,
  collapsedWidth = 75,
  collapsedHeight = 75,
  ...rest
}: StyleGroupProps) {
  const data = element.getData();
  const detailsLevel = useDetailsLevel();

  const passedData = React.useMemo(() => {
    const newData = { ...data };
    Object.keys(newData).forEach(key => {
      if (newData[key] === undefined) {
        delete newData[key];
      }
    });
    return newData;
  }, [data]);

  if (data.isFocused) {
    element.setData({ ...data, isFocused: false });
  }

  const renderIcon = (): React.ReactNode => {
    const iconSize =
      Math.min(collapsedWidth, collapsedHeight) - ICON_PADDING * 2;
    const Component = CubesIcon;

    return (
      <g
        transform={`translate(${(collapsedWidth - iconSize) / 2}, ${
          (collapsedHeight - iconSize) / 2
        })`}
      >
        <Component
          style={{ color: PFColors.Color200 }}
          width={iconSize}
          height={iconSize}
        />
      </g>
    );
  };

  return (
    <g>
      <DefaultGroup
        element={element}
        collapsedWidth={collapsedWidth}
        collapsedHeight={collapsedHeight}
        showLabel={detailsLevel === ScaleDetailsLevel.high}
        {...rest}
        {...passedData}
      >
        {element.isCollapsed() ? renderIcon() : null}
      </DefaultGroup>
    </g>
  );
}
