/*
 * Copyright 2026 The Backstage Authors
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

export {
  DAG_INLINE_CONFIG,
  DAG_THEME,
  DAG_VIEW_CONFIG,
  NODE_ICON_SIZE,
  NODE_ICON_X,
  NODE_LABEL_PADDING_RIGHT,
  NODE_LABEL_X,
} from './config';

export {
  buildEdgePath,
  computeLayout,
  nodeOrigin,
  truncateLabel,
} from './layout';

export { useDAGInteraction } from './useDAGInteraction';

export type {
  CanvasHandlers,
  DAGInteraction,
  DAGLayoutConfig,
  LayoutEdge,
  LayoutNode,
  LayoutResult,
  NodeHandlers,
  Point,
  TooltipState,
  TransformState,
} from './types';
