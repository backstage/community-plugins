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
import type { ReactNode, PropsWithChildren, Ref, LegacyRef } from 'react';

import {
  BadgeLocation,
  DEFAULT_LAYER,
  DefaultNode,
  Layer,
  Node,
  NodeStatus,
  observer,
  ScaleDetailsLevel,
  TOP_LAYER,
  useCombineRefs,
  useHover,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';
import classNames from 'classnames';

import { getKindAbbrColor } from '../../utils/workload-node-utils';

import './BaseNode.css';

type BaseNodeProps = {
  className?: string;
  innerRadius?: number;
  icon?: string;
  kind?: string;
  labelIcon?: ReactNode;
  labelIconPadding?: number;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  badgeBorderColor?: string;
  badgeClassName?: string;
  badgeLocation?: BadgeLocation;
  attachments?: ReactNode;
  element: Node;
  hoverRef?: (node: Element) => () => void;
  dragging?: boolean;
  nodeStatus?: NodeStatus;
  showStatusBackground?: boolean;
  alertVariant?: NodeStatus;
  truncateLength?: number;
} & Partial<WithSelectionProps> &
  Partial<WithDragNodeProps>;

const BaseNode = ({
  className,
  innerRadius = 10,
  icon,
  kind,
  element,
  hoverRef,
  children,
  alertVariant,
  ...rest
}: PropsWithChildren<BaseNodeProps>) => {
  const [hover, internalHoverRef] = useHover();
  const nodeHoverRefs = useCombineRefs(
    internalHoverRef,
    hoverRef as Ref<Element>,
  );
  const { width, height } = element.getDimensions();
  const cx = width / 2;
  const cy = height / 2;
  const iconRadius = innerRadius * 0.9;

  const detailsLevel = element.getController().getGraph().getDetailsLevel();
  const showDetails = hover || detailsLevel !== ScaleDetailsLevel.low;
  const kindData = kind && getKindAbbrColor(kind);
  const badgeClassName = kindData
    ? classNames(
        'bs-topology-base-node-resource-icon',
        `bs-topology-base-node-resource-icon-${kindData.kindStr.toLocaleLowerCase(
          'en-US',
        )}`,
      )
    : '';

  return (
    <Layer id={hover ? TOP_LAYER : DEFAULT_LAYER}>
      <g
        ref={nodeHoverRefs as LegacyRef<SVGGElement>}
        data-test-id={element.getLabel()}
      >
        <DefaultNode
          className={classNames('bs-topology-base-node', className)}
          element={element}
          showLabel={showDetails}
          scaleNode={hover && detailsLevel !== ScaleDetailsLevel.high}
          badge={kindData && kindData.kindAbbr}
          badgeColor={kindData && kindData.kindColor}
          badgeTextColor="var(--pf-t--color--white)"
          showStatusBackground={!showDetails}
          badgeClassName={badgeClassName}
          {...rest}
        >
          <g data-test-id="base-node-handler">
            {icon && showDetails && (
              <>
                <circle
                  fill="var(--pf-t--color--white)"
                  cx={cx}
                  cy={cy}
                  r={innerRadius + 6}
                />
                <image
                  x={cx - iconRadius}
                  y={cy - iconRadius}
                  width={iconRadius * 2}
                  height={iconRadius * 2}
                  xlinkHref={icon}
                />
              </>
            )}
            <g data-id="detail-children">{showDetails && children}</g>
          </g>
        </DefaultNode>
      </g>
    </Layer>
  );
};

export default observer(BaseNode);
