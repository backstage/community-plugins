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
import {
  EdgeModel,
  Model,
  NodeModel,
  NodeShape,
} from '@patternfly/react-topology';

import {
  GROUP_HEIGHT,
  GROUP_PADDING,
  GROUP_WIDTH,
  INSTANCE_LABEL,
  NODE_HEIGHT,
  NODE_PADDING,
  NODE_WIDTH,
  TYPE_APPLICATION_GROUP,
  TYPE_CONNECTS_TO,
} from '../const';
import {
  OdcNodeModel,
  TopologyDataModelDepicted,
  TopologyDataObject,
} from '../types/topology-types';
import { K8sWorkloadResource } from '../types/types';

type ConnectsToData = { apiVersion: string; kind: string; name: string };

export const WorkloadModelProps = {
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
  group: false,
  visible: true,
  style: {
    padding: NODE_PADDING,
  },
};

/**
 * create node data for graphs
 */
export const getTopologyNodeItem = (
  resource: K8sWorkloadResource,
  type: string,
  data: TopologyDataObject,
  nodeProps?: Omit<OdcNodeModel, 'type' | 'data' | 'children' | 'id' | 'label'>,
  children?: string[],
  resourceKind?: string,
  shape?: NodeShape,
): OdcNodeModel => {
  const uid = resource.metadata?.uid;
  const name = resource.metadata?.name;
  const label = resource.metadata?.labels?.[INSTANCE_LABEL];
  const kind = resourceKind || resource?.kind;
  return {
    id: uid as string,
    type,
    label: label || name,
    shape,
    resource,
    resourceKind: kind,
    data,
    ...(children?.length ? { children } : {}),
    ...(nodeProps || {}),
  };
};

/**
 * create groups data for graph
 */
export const getTopologyGroupItems = (
  workload: K8sWorkloadResource,
): NodeModel | null => {
  const groupName = workload.metadata?.labels?.['app.kubernetes.io/part-of'];
  if (!groupName) {
    return null;
  }

  return {
    id: `group:${groupName}`,
    type: TYPE_APPLICATION_GROUP,
    group: true,
    label: groupName,
    ...(workload.metadata?.uid && { children: [workload.metadata?.uid] }),
    width: GROUP_WIDTH,
    height: GROUP_HEIGHT,
    data: {},
    visible: true,
    collapsed: false,
    style: {
      padding: GROUP_PADDING,
    },
  };
};

const mergeGroupData = (
  newGroup: NodeModel,
  existingGroup: NodeModel,
): void => {
  if (!existingGroup.data?.groupResources && !newGroup.data?.groupResources) {
    return;
  }

  if (!existingGroup.data?.groupResources) {
    existingGroup.data.groupResources = [];
  }
  if (newGroup?.data?.groupResources) {
    newGroup.data.groupResources.forEach((obj: any) => {
      if (!existingGroup.data.groupResources.includes(obj)) {
        existingGroup.data.groupResources.push(obj);
      }
    });
  }
};

export const mergeGroup = (
  newGroup: NodeModel,
  existingGroups: NodeModel[],
): void => {
  if (!newGroup) {
    return;
  }

  // Remove any children from the new group that already belong to another group
  newGroup.children = newGroup.children?.filter(
    c => !existingGroups?.find(g => g.children?.includes(c)),
  );

  // find and add the groups
  const existingGroup = existingGroups.find(
    g => g.group && g.id === newGroup.id,
  );
  if (!existingGroup) {
    existingGroups.push(newGroup);
  } else {
    newGroup.children?.forEach(id => {
      if (!existingGroup.children?.includes(id)) {
        existingGroup.children?.push(id);
      }
      mergeGroupData(newGroup, existingGroup);
    });
  }
};

const mergeGroups = (
  newGroups: NodeModel[],
  existingGroups: NodeModel[],
): void => {
  if (!newGroups?.length) {
    return;
  }
  newGroups.forEach(newGroup => {
    mergeGroup(newGroup, existingGroups);
  });
};

export const addToTopologyDataModel = (
  newModel: Model,
  graphModel: Model,
  dataModelDepicters: TopologyDataModelDepicted[] = [],
) => {
  if (newModel?.edges && graphModel.edges) {
    graphModel.edges.push(...newModel.edges);
  }
  if (newModel?.nodes && graphModel.nodes) {
    graphModel.nodes.push(
      ...newModel.nodes.filter(
        n =>
          !n.group &&
          !graphModel.nodes?.find(existing => {
            if (n.id === existing.id) {
              return true;
            }
            const { resource } = n as OdcNodeModel;
            return (
              !resource ||
              !!dataModelDepicters.find(depicter =>
                depicter(resource, graphModel),
              )
            );
          }),
      ),
    );
    mergeGroups(
      newModel.nodes.filter(n => n.group),
      graphModel.nodes,
    );
  }
};

const edgesFromAnnotations = (
  annotations: any,
): (string | ConnectsToData)[] => {
  let edges: (string | ConnectsToData)[] = [];
  const CONNECTS_TO_ANNOTATION = 'app.openshift.io/connects-to';
  if (annotations?.[CONNECTS_TO_ANNOTATION]) {
    try {
      edges = JSON.parse(annotations[CONNECTS_TO_ANNOTATION]);
    } catch (e) {
      // connects-to annotation should hold a JSON string value but failed to parse
      // treat value as a comma separated list of strings
      edges = annotations[CONNECTS_TO_ANNOTATION].split(',').map((v: any) =>
        v.trim(),
      );
    }
  }

  return edges;
};

/**
 * create edge data for graph
 */
export const getTopologyEdgeItems = (
  workload: K8sWorkloadResource,
  resources: K8sWorkloadResource[],
): EdgeModel[] => {
  const annotations = workload.metadata?.annotations;
  const edges: EdgeModel[] = [];

  edgesFromAnnotations(annotations)?.forEach(
    (edge: string | ConnectsToData) => {
      // handles multiple edges
      const resData = resources?.find(deployment => {
        let name;
        if (typeof edge === 'string') {
          name =
            deployment.metadata?.labels?.[INSTANCE_LABEL] ??
            deployment.metadata?.name;
          return name === edge;
        }
        name = deployment.metadata?.name;
        const {
          apiVersion: edgeApiVersion,
          kind: edgeKind,
          name: edgeName,
        } = edge;
        const { kind, apiVersion } = deployment;
        let edgeExists = name === edgeName && kind === edgeKind;
        if (apiVersion) {
          edgeExists = edgeExists && apiVersion === edgeApiVersion;
        }
        return edgeExists;
      });
      const targetNode = resData?.metadata?.uid;
      const uid = workload.metadata?.uid;
      if (targetNode) {
        edges.push({
          id: `${uid}_${targetNode}`,
          type: TYPE_CONNECTS_TO,
          label: 'Visual connector',
          source: uid,
          target: targetNode,
        });
      }
    },
  );

  return edges;
};
