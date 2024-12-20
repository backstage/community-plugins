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
import * as dagre from 'dagre';

export const NODE_SEPARATION_HORIZONTAL = 25;
export const NODE_SEPARATION_VERTICAL = 20;
export const DROP_SHADOW_SPACING = 5;
export const BUILDER_NODE_ADD_RADIUS = 9;
export const BUILDER_NODE_DECORATOR_RADIUS = 9;
export const BUILDER_NODE_ADD_PADDING = 4;

export const NODE_WIDTH = 120;
export const NODE_HEIGHT = 30;
export const FINALLY_NODE_PADDING = 30;
export const FINALLY_NODE_VERTICAL_SPACING = 20;

export const FINALLY_ADD_LINK_TEXT_HEIGHT = 10;
export const FINALLY_ADD_LINK_SIZE = 15;
export const WHEN_EXPRESSSION_DIAMOND_SIZE = 10;
export const WHEN_EXPRESSION_SPACING = 25;

export const DEFAULT_NODE_HEIGHT = 32;
export const NODE_PADDING = 12;
export const DEFAULT_NODE_ICON_WIDTH = 30;
export const DEFAULT_BADGE_WIDTH = 40;
export const DEFAULT_FINALLLY_GROUP_PADDING = 35;
export const TOOLBAR_HEIGHT = 40;
export const GRAPH_MIN_WIDTH = 300;
export const GRAPH_MAX_HEIGHT_PERCENT = 45;

export enum NodeType {
  TASK_NODE = 'task',
  SPACER_NODE = 'spacer',
  LOADING_NODE = 'loading',
  TASK_LIST_NODE = 'task-list',
  BUILDER_NODE = 'builder',
  INVALID_TASK_LIST_NODE = 'invalid-task-list',
  FINALLY_NODE = 'finally-node',
  BUILDER_FINALLY_NODE = 'builder-finally-node',
  FINALLY_GROUP = 'finally-group',
  EDGE = 'edge',
}
export enum DrawDesign {
  INTEGRAL_SHAPE = 'integral-shape',
  STRAIGHT = 'line',
}
export enum PipelineLayout {
  DAGRE_BUILDER = 'dagre-builder',
  DAGRE_BUILDER_SPACED = 'dagre-builder-spaced',
  DAGRE_VIEWER = 'dagre-viewer',
  DAGRE_VIEWER_SPACED = 'dagre-viewer-spaced',
}

export enum AddNodeDirection {
  /**
   * Rules today:
   *  - the `relatedTask` is pointing at ONLY us
   *  - we inherit all that `relatedTask` is pointing at
   */
  BEFORE = 'in-run-after',

  /**
   * Rules today:
   *  - the `relatedTask` must be our ONLY runAfter
   *  - we are added to all that is pointing at `relatedTask`
   */
  AFTER = 'has-run-after',

  /**
   * Rules today:
   *  - we inherit all that `relatedTask` is pointing at
   *  - we are added to all that is pointing at `relatedTask`
   */
  PARALLEL = 'shared-parallel',
}

const DAGRE_SHARED_PROPS: dagre.GraphLabel = {
  nodesep: NODE_SEPARATION_VERTICAL,
  ranksep: NODE_SEPARATION_HORIZONTAL,
  edgesep: 50,
  ranker: 'longest-path',
  rankdir: 'LR',
  marginx: 20,
  marginy: 20,
};
export const DAGRE_VIEWER_PROPS: dagre.GraphLabel = {
  ...DAGRE_SHARED_PROPS,
};
export const DAGRE_VIEWER_SPACED_PROPS: dagre.GraphLabel = {
  ...DAGRE_VIEWER_PROPS,
  ranksep: NODE_SEPARATION_HORIZONTAL + WHEN_EXPRESSION_SPACING,
};
export const DAGRE_BUILDER_PROPS: dagre.GraphLabel = {
  ...DAGRE_SHARED_PROPS,
  ranksep: NODE_SEPARATION_HORIZONTAL + BUILDER_NODE_ADD_RADIUS * 2,
  nodesep: NODE_SEPARATION_VERTICAL + BUILDER_NODE_ADD_RADIUS,
  marginx: DAGRE_SHARED_PROPS.marginx ?? 0 + BUILDER_NODE_ADD_RADIUS * 2,
  marginy: DAGRE_SHARED_PROPS.marginy ?? 0 + BUILDER_NODE_ADD_RADIUS * 2,
};

export const DAGRE_BUILDER_SPACED_PROPS: dagre.GraphLabel = {
  ...DAGRE_BUILDER_PROPS,
  ranksep:
    NODE_SEPARATION_HORIZONTAL +
    WHEN_EXPRESSION_SPACING +
    BUILDER_NODE_ADD_RADIUS * 2,
};

export const GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL = 200;

export const REGEX_EXTRACT_DEPS =
  /(?:\$\(tasks\.)([a-z0-9_-]+)(?:.results)(?:[.^\w]+\))/g;
