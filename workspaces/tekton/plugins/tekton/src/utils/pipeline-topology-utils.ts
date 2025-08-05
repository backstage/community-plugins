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
  getEdgesFromNodes,
  getSpacerNodes,
  GraphModel,
  ModelKind,
  RunStatus,
  WhenStatus,
} from '@patternfly/react-topology';
import * as dagre from 'dagre';
import { minBy, uniq } from 'lodash';

import {
  ComputedStatus,
  PipelineRunKind,
  PipelineTask,
  PipelineTaskParam,
  PipelineTaskWithStatus,
  TaskRunKind,
} from '@janus-idp/shared-react';

import { DAG, Vertex } from '../components/pipeline-topology/dag';
import {
  DAGRE_BUILDER_PROPS,
  DAGRE_BUILDER_SPACED_PROPS,
  DAGRE_VIEWER_PROPS,
  DAGRE_VIEWER_SPACED_PROPS,
  DEFAULT_BADGE_WIDTH,
  DEFAULT_FINALLLY_GROUP_PADDING,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_ICON_WIDTH,
  FINALLY_NODE_PADDING,
  NODE_HEIGHT,
  NODE_PADDING,
  NODE_WIDTH,
  NodeType,
  PipelineLayout,
  REGEX_EXTRACT_DEPS,
  WHEN_EXPRESSION_SPACING,
} from '../consts/pipeline-topology-const';
import {
  FinallyNodeModel,
  LoadingNodeModel,
  NodeCreator,
  NodeCreatorSetup,
  PipelineEdgeModel,
  PipelineMixedNodeModel,
  PipelineRunAfterNodeModelData,
} from '../types/pipeline-topology-types';
import { appendPipelineRunStatus, getPLRTaskRuns } from './pipelineRun-utils';

const createGenericNode: NodeCreatorSetup =
  (type, width?, height?) => (name, data) => ({
    id: name,
    label: data?.label || name,
    runAfterTasks: data?.runAfterTasks || [],
    ...(data && { data }),
    height: height ?? NODE_HEIGHT,
    width: width ?? NODE_WIDTH,
    type,
  });

const getMaxFinallyNode = (finallyTaskList: PipelineTaskWithStatus[]) => {
  const sortedFinallyTaskList = [...finallyTaskList].sort(
    (a, b) => b.name.length - a.name.length,
  );
  return sortedFinallyTaskList[0]?.name || '';
};

export const createFinallyNode = (
  height: number,
): NodeCreator<FinallyNodeModel> =>
  createGenericNode(
    NodeType.FINALLY_NODE,
    NODE_WIDTH + WHEN_EXPRESSION_SPACING + FINALLY_NODE_PADDING * 2,
    height,
  );

export const createLoadingNode: NodeCreator<LoadingNodeModel> =
  createGenericNode(NodeType.LOADING_NODE);

const createPipelineTaskNode = (
  type: NodeType,
  data: PipelineRunAfterNodeModelData,
) => createGenericNode(type, data.width, data.height)(data.id ?? '', data);

export const getTextWidth = (
  text: string,
  font: string = '0.8rem RedHatText',
): number => {
  if (!text || text.length === 0) {
    return 0;
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return text.length;
  }
  context.font = font;
  const { width } = context.measureText(text);
  return width;
};

export const extractDepsFromContextVariables = (
  contextVariable: string | null | undefined,
) => {
  let matches;
  const deps: string[] = [];
  if (!contextVariable) {
    return deps;
  }
  // eslint-disable-next-line no-cond-assign
  while ((matches = REGEX_EXTRACT_DEPS.exec(contextVariable)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (matches.index === REGEX_EXTRACT_DEPS.lastIndex) {
      REGEX_EXTRACT_DEPS.lastIndex++;
    }
    if (matches) {
      if (!deps.includes(matches[1])) {
        deps.push(matches[1]);
      }
    }
  }
  return deps;
};

export const getSpacerNode = (
  node: PipelineMixedNodeModel,
): PipelineMixedNodeModel => ({
  ...node,
  height: 1,
  width: 1,
});

export const getWhenStatus = (
  status: ComputedStatus,
): WhenStatus | undefined => {
  switch (status) {
    case ComputedStatus.Succeeded:
    case ComputedStatus.Failed:
      return WhenStatus.Met;
    case ComputedStatus.Skipped:
    case ComputedStatus['In Progress']:
    case ComputedStatus.Idle:
      return WhenStatus.Unmet;
    default:
      return undefined;
  }
};

export const getTaskWhenStatus = (
  task: PipelineTaskWithStatus,
): WhenStatus | undefined => {
  if (!task.when) {
    return undefined;
  }
  return getWhenStatus(task.status?.reason as ComputedStatus);
};

const getDepsFromContextVariables = (task: PipelineTask) => {
  const depsFromContextVariables: string[] = [];
  if (task.params) {
    task.params.forEach((p: PipelineTaskParam) => {
      if (Array.isArray(p.value)) {
        p.value.forEach(paramValue => {
          depsFromContextVariables.push(
            ...extractDepsFromContextVariables(paramValue),
          );
        });
      } else {
        depsFromContextVariables.push(
          ...extractDepsFromContextVariables(p.value),
        );
      }
    });
  }
  if (task?.when) {
    task.when.forEach(({ input, values }) => {
      depsFromContextVariables.push(...extractDepsFromContextVariables(input));
      values.forEach((whenValue: string) => {
        depsFromContextVariables.push(
          ...extractDepsFromContextVariables(whenValue),
        );
      });
    });
  }
  return depsFromContextVariables;
};

const getRunAfterTasks = (task: PipelineTask, dag: DAG, vertex: Vertex) => {
  const runAfterTasks: string[] = [];
  const depsFromContextVariables = getDepsFromContextVariables(task);

  const dependancies = uniq([...vertex.dependancyNames]);
  if (dependancies) {
    dependancies.forEach(dep => {
      const depObj = dag.vertices.get(dep) as Vertex;
      if (
        depObj.level - vertex.level <= 1 ||
        vertex.data.runAfter?.includes(depObj.name)
      ) {
        runAfterTasks.push(dep);
      }
    });
  }
  if (depsFromContextVariables.length > 0) {
    const v = depsFromContextVariables.map(d => {
      return dag.vertices.get(d) as Vertex;
    });
    const minLevelDep = minBy(v, (d: Vertex) => d.level) as Vertex;
    const nearestDeps = v.filter(v1 => v1.level === minLevelDep.level);
    nearestDeps.forEach(nd => {
      if (nd.level - vertex.level <= 1 || vertex.dependancyNames.length === 0) {
        runAfterTasks.push(nd.name);
      }
    });
  }
  return runAfterTasks;
};

export const getGraphDataModel = (
  pipelineRun: PipelineRunKind | undefined,
  taskRuns: TaskRunKind[],
): {
  graph: GraphModel;
  nodes: PipelineMixedNodeModel[];
  edges: EdgeModel[];
} | null => {
  if (!pipelineRun) {
    return null;
  }

  const plrTaskRuns = getPLRTaskRuns(taskRuns, pipelineRun?.metadata?.name);

  const taskList = appendPipelineRunStatus(pipelineRun, plrTaskRuns);

  const dag = new DAG();
  taskList?.forEach((task: PipelineTask) => {
    dag.addEdges(task.name, task, '', task.runAfter || []);
  });

  const nodes: PipelineMixedNodeModel[] = [];
  const maxWidthForLevel: { [key: string]: number } = {};
  dag.topologicalSort((v: Vertex) => {
    if (!maxWidthForLevel[v.level]) {
      maxWidthForLevel[v.level] = getTextWidth(v.name);
    } else {
      maxWidthForLevel[v.level] = Math.max(
        maxWidthForLevel[v.level],
        getTextWidth(v.name),
      );
    }
  });
  dag.topologicalSort((vertex: Vertex) => {
    const task = vertex.data as PipelineTask;
    const runAfterTasks = getRunAfterTasks(task, dag, vertex);
    const badgePadding =
      Object.keys(pipelineRun.spec)?.length > 0 ? DEFAULT_BADGE_WIDTH : 0;
    const isTaskSkipped = pipelineRun?.status?.skippedTasks?.some(
      t => t.name === task.name,
    );
    nodes.push(
      createPipelineTaskNode(NodeType.TASK_NODE, {
        id: vertex.name,
        label: vertex.name,
        width:
          maxWidthForLevel[vertex.level] +
          NODE_PADDING * 2 +
          DEFAULT_NODE_ICON_WIDTH +
          badgePadding,
        runAfterTasks,
        status: isTaskSkipped ? RunStatus.Skipped : vertex.data.status?.reason,
        whenStatus: getTaskWhenStatus(vertex.data),
        task: vertex.data,
        pipelineRun,
      }),
    );
  });

  const finallyTaskList = appendPipelineRunStatus(
    pipelineRun,
    plrTaskRuns,
    true,
  );

  const finallyNodes = finallyTaskList.map(fTask => {
    const isTaskSkipped = pipelineRun?.status?.skippedTasks?.some(
      t => t.name === fTask.name,
    );

    return createPipelineTaskNode(NodeType.FINALLY_NODE, {
      id: fTask.name,
      label: fTask.name,
      width:
        getTextWidth(getMaxFinallyNode(finallyTaskList)) +
        NODE_PADDING * 2 +
        DEFAULT_FINALLLY_GROUP_PADDING * 2,
      height: DEFAULT_NODE_HEIGHT,
      runAfterTasks: [],
      status: isTaskSkipped
        ? RunStatus.Skipped
        : (fTask.status?.reason as RunStatus),
      whenStatus: getTaskWhenStatus(fTask),
      task: fTask,
      pipelineRun,
    });
  });

  const finallyGroup = finallyNodes.length
    ? [
        {
          id: 'finally-group-id',
          type: NodeType.FINALLY_GROUP,
          children: finallyNodes.map(n => n.id),
          group: true,
          style: { padding: DEFAULT_FINALLLY_GROUP_PADDING },
        },
      ]
    : [];
  const spacerNodes: PipelineMixedNodeModel[] = (
    getSpacerNodes([...nodes, ...finallyNodes], NodeType.SPACER_NODE, [
      NodeType.FINALLY_NODE,
    ]) as PipelineMixedNodeModel[]
  ).map(getSpacerNode);

  const edges: PipelineEdgeModel[] = getEdgesFromNodes(
    [...nodes, ...spacerNodes, ...finallyNodes],
    NodeType.SPACER_NODE,
    NodeType.EDGE,
    NodeType.EDGE,
    [NodeType.FINALLY_NODE],
    NodeType.EDGE,
  );

  return {
    graph: {
      id: `${pipelineRun?.metadata?.name}-graph`,
      type: ModelKind.graph,
      layout: PipelineLayout.DAGRE_VIEWER,
      scaleExtent: [0.5, 1],
    },
    nodes: [
      ...nodes,
      ...spacerNodes,
      ...finallyNodes,
      ...finallyGroup,
    ] as PipelineMixedNodeModel[],
    edges,
  };
};

export const getLayoutData = (
  layout: PipelineLayout,
): dagre.GraphLabel | null => {
  switch (layout) {
    case PipelineLayout.DAGRE_BUILDER:
      return DAGRE_BUILDER_PROPS;
    case PipelineLayout.DAGRE_VIEWER:
      return DAGRE_VIEWER_PROPS;
    case PipelineLayout.DAGRE_VIEWER_SPACED:
      return DAGRE_VIEWER_SPACED_PROPS;
    case PipelineLayout.DAGRE_BUILDER_SPACED:
      return DAGRE_BUILDER_SPACED_PROPS;
    default:
      return null;
  }
};
