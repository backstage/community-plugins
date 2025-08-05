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

import { useContext } from 'react';

import {
  GraphElement,
  isNode,
  Node,
  NodeStatus,
  observer,
  ScaleDetailsLevel,
  TopologyQuadrant,
  useHover,
  useVisualizationController,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

import { SHOW_POD_COUNT_FILTER_ID } from '../../const';
import { FilterContext } from '../../hooks/FilterContext';
import { PipelinesData } from '../../types/pipeline';
import { TopologyDecorator } from '../../types/topology-types';
import { calculateRadius, getPodStatus } from '../../utils/workload-node-utils';
import { AllPodStatus } from '../Pods/pod';
import PodSet, { podSetInnerRadius } from '../Pods/PodSet';
import BaseNode from './BaseNode';
import EditDecorator from './decorators/EditDecorator';
import { getNodeDecorators } from './decorators/getNodeDecorators';
import { PipelineRunDecorator } from './decorators/PipelineRunDecorator';
import { UrlDecorator } from './decorators/UrlDecorator';

import './WorkloadNode.css';

const POD_STATUS_NORMAL = 1;
const POD_STATUS_WARNING = 2;
const POD_STATUS_DANGER = 3;

const getNodePodStatus = (podStatus: AllPodStatus): number => {
  switch (podStatus) {
    case AllPodStatus.Failed:
    case AllPodStatus.CrashLoopBackOff:
    case AllPodStatus.ErrImagePull:
      return POD_STATUS_DANGER;
    case AllPodStatus.Warning:
      return POD_STATUS_WARNING;
    default:
      return POD_STATUS_NORMAL;
  }
};

const getAggregateStatus = (donutStatus: any): NodeStatus => {
  const worstPodStatus =
    donutStatus?.pods?.reduce((acc: any, pod: any) => {
      return Math.max(acc, getNodePodStatus(getPodStatus(pod)));
    }, POD_STATUS_NORMAL) ?? NodeStatus.default;

  if (worstPodStatus === POD_STATUS_DANGER) {
    return NodeStatus.danger;
  }
  if (worstPodStatus === POD_STATUS_WARNING) {
    return NodeStatus.warning;
  }
  return NodeStatus.default;
};

type InnerWorkloadNodeProps = {
  element: Node;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const InnerWorkloadNode = observer(
  ({ element, onSelect, ...rest }: InnerWorkloadNodeProps) => {
    const data = element.getData();
    const { width, height } = element.getDimensions();
    const workloadData = data.data;
    const donutStatus = workloadData.podsData;
    const [hover, hoverRef] = useHover();
    const { filters } = useContext(FilterContext);
    const size = Math.min(width, height);
    const { radius, decoratorRadius } = calculateRadius(size);
    const cx = width / 2;
    const cy = height / 2;
    const controller = useVisualizationController();
    const detailsLevel = controller.getGraph().getDetailsLevel();
    const showDetails = hover || detailsLevel !== ScaleDetailsLevel.low;
    const onNodeSelect = (e: MouseEvent) => {
      const params = new URLSearchParams(window.location.search);
      params.set('selectedId', element.getId());
      history.replaceState(null, '', `?${params.toString()}`);
      if (onSelect) onSelect(e);
    };

    const urlDecorator = (
      nodeElement: Node,
      urlDecoratorRadius: number,
      x: number,
      y: number,
    ) => {
      const url = nodeElement.getData().data?.url;

      if (!url) {
        return null;
      }

      return (
        <UrlDecorator
          key={`url-${nodeElement.getId()}`}
          url={workloadData.url}
          radius={urlDecoratorRadius}
          x={x}
          y={y}
        />
      );
    };

    const editDecorator = (
      nodeElement: Node,
      editDecoratorRadius: number,
      x: number,
      y: number,
    ) => {
      const { editURL, vcsURI } = nodeElement.getData().data;
      if (!editURL && !vcsURI) {
        return null;
      }
      return (
        <EditDecorator
          key={`edit-${nodeElement.getId()}`}
          element={nodeElement}
          radius={editDecoratorRadius}
          x={x}
          y={y}
        />
      );
    };

    const pipelineRunStatusDecorator = (
      nodeElement: Node,
      pipelineDecoratorRadius: number,
      x: number,
      y: number,
    ) => {
      const pipelinesData: PipelinesData =
        nodeElement.getData().data?.pipelinesData;
      if (
        !pipelinesData?.pipelineRuns ||
        pipelinesData.pipelineRuns.length === 0
      ) {
        return null;
      }
      return (
        <PipelineRunDecorator
          key={`plr-${nodeElement.getId()}`}
          pipelinesData={pipelinesData}
          radius={pipelineDecoratorRadius}
          x={x}
          y={y}
        />
      );
    };

    const decorators: TopologyDecorator[] = [
      {
        quadrant: TopologyQuadrant.lowerLeft,
        decorator: pipelineRunStatusDecorator,
      },
      {
        quadrant: TopologyQuadrant.upperRight,
        decorator: urlDecorator,
      },
      {
        quadrant: TopologyQuadrant.lowerRight,
        decorator: editDecorator,
      },
    ];

    const nodeDecorators = showDetails
      ? getNodeDecorators(element, decorators, cx, cy, radius, decoratorRadius)
      : null;

    const iconImageUrl = workloadData.builderImage;

    const showPodCount = filters?.find(
      f => f.value === SHOW_POD_COUNT_FILTER_ID,
    )?.isSelected;

    return (
      <g className="bs-topology-workload-node">
        <BaseNode
          className="bs-topology-workload-node"
          hoverRef={hoverRef as (node: Element) => () => void}
          innerRadius={podSetInnerRadius(size, donutStatus)}
          kind={workloadData?.kind}
          element={element}
          nodeStatus={
            !showDetails ? getAggregateStatus(donutStatus) : undefined
          }
          icon={!showPodCount && iconImageUrl}
          attachments={nodeDecorators}
          onSelect={onNodeSelect}
          {...rest}
        >
          {donutStatus && showDetails ? (
            <PodSet
              size={size}
              x={cx}
              y={cy}
              data={donutStatus}
              showPodCount={showPodCount}
            />
          ) : null}
        </BaseNode>
      </g>
    );
  },
);

type WorkloadNodeProps = {
  element?: GraphElement;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const WorkloadNode = ({ element, ...rest }: WorkloadNodeProps) =>
  !element || !isNode(element) ? null : (
    <InnerWorkloadNode element={element} {...rest} />
  );

export default WorkloadNode;
