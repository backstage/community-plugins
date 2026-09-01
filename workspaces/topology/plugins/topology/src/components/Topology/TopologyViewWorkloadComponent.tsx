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
import { useContext, useEffect } from 'react';

import { InfoCard, Progress } from '@backstage/core-components';

import {
  BaseNode,
  observer,
  SELECTION_EVENT,
  SelectionEventListener,
  TopologyView,
  useEventListener,
  useVisualizationController,
  VisualizationSurface,
} from '@patternfly/react-topology';

import { TYPE_VM, TYPE_WORKLOAD } from '../../const';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';
import { useSideBar } from '../../hooks/useSideBar';
import { useWorkloadsWatcher } from '../../hooks/useWorkloadWatcher';
import { ClusterErrors } from '../../types/types';
import { TopologyControlBar } from './TopologyControlBar';
import { TopologyEmptyState } from './TopologyEmptyState';
import TopologyErrorPanel from './TopologyErrorPanel';
import TopologyToolbar from './TopologyToolbar';

import './TopologyToolbar.css';

type TopologyViewWorkloadComponentProps = {
  useToolbar?: boolean;
};

const TopologyViewWorkloadComponent = ({
  useToolbar = false,
}: TopologyViewWorkloadComponentProps) => {
  const controller = useVisualizationController();
  const layout = 'ColaNoForce';
  const { loaded, dataModel } = useWorkloadsWatcher();
  const { clusters, selectedClusterErrors, responseError } =
    useContext(K8sResourcesContext);
  const graphDimensions = controller.hasGraph()
    ? controller.getGraph().getDimensions()
    : undefined;
  const [
    sideBar,
    sideBarOpen,
    selectedId,
    setSideBarOpen,
    setSelectedNode,
    removeSelectedIdParam,
  ] = useSideBar();

  const allErrors: ClusterErrors = [
    ...(responseError ? [{ message: responseError }] : []),
    ...(selectedClusterErrors ?? []),
  ];

  useEffect(() => {
    const model = {
      graph: {
        id: 'g1',
        type: 'graph',
        layout,
      },
    };
    controller.fromModel(model);
  }, [controller]);

  useEffect(() => {
    if (graphDimensions && loaded && dataModel) {
      controller.fromModel(dataModel, true);
    }
  }, [graphDimensions, layout, loaded, dataModel, controller]);

  useEffect(() => {
    if (dataModel) {
      const selectedNode: BaseNode | null = selectedId
        ? (controller.getElementById(selectedId) as BaseNode)
        : null;
      setSelectedNode(selectedNode);

      if (
        selectedNode &&
        (selectedNode.getType() === TYPE_WORKLOAD ||
          selectedNode.getType() === TYPE_VM)
      )
        setSideBarOpen(true);
      else {
        setSideBarOpen(false);
      }
    }
  }, [controller, dataModel, selectedId, setSelectedNode, setSideBarOpen]);

  useEventListener<SelectionEventListener>(SELECTION_EVENT, (ids: string[]) => {
    const id = ids[0] ? ids[0] : '';
    const selNode = controller.getElementById(id) as BaseNode;
    setSelectedNode(selNode);
    if (
      !id ||
      (selNode.getType() !== TYPE_WORKLOAD && selNode.getType() !== TYPE_VM)
    ) {
      removeSelectedIdParam();
    }
  });

  if (!loaded)
    return (
      <div data-testid="topology-progress">
        <Progress />
      </div>
    );

  const isDataModelEmpty = loaded && dataModel?.nodes?.length === 0;

  const getTopologyState = () => {
    if (isDataModelEmpty) {
      return <TopologyEmptyState />;
    }
    return <VisualizationSurface state={{ selectedIds: [selectedId] }} />;
  };

  return (
    <>
      {allErrors && allErrors.length > 0 && (
        <TopologyErrorPanel allErrors={allErrors} />
      )}

      <InfoCard className="bs-topology-wrapper" divider={false}>
        {clusters.length < 1 ? (
          <TopologyEmptyState />
        ) : (
          <TopologyView
            controlBar={
              !isDataModelEmpty && (
                <TopologyControlBar controller={controller} />
              )
            }
            viewToolbar={
              useToolbar && <TopologyToolbar showFilters={!isDataModelEmpty} />
            }
            sideBar={sideBar}
            sideBarResizable
            sideBarOpen={sideBarOpen}
            minSideBarSize="400px"
          >
            {getTopologyState()}
          </TopologyView>
        )}
      </InfoCard>
    </>
  );
};

export default observer(TopologyViewWorkloadComponent);
