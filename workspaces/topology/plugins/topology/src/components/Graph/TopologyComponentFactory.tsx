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
  ModelKind,
  withDragNode,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';

import {
  TYPE_APPLICATION_GROUP,
  TYPE_CONNECTS_TO,
  TYPE_VM,
  TYPE_WORKLOAD,
} from '../../const';
import DefaultGraph from './DefaultGraph';
import EdgeConnect from './EdgeConnect';
import GroupNode from './GroupNode';
import VMNode from './VMNode';
import WorkloadNode from './WorkloadNode';

const TopologyComponentFactory = (kind: ModelKind, type: string) => {
  if (kind === ModelKind.graph) {
    return withPanZoom()(withSelection()(DefaultGraph));
  }
  switch (type) {
    case TYPE_VM:
      return withDragNode()(withSelection()(VMNode));
    case TYPE_WORKLOAD:
      return withDragNode()(withSelection()(WorkloadNode));
    case TYPE_APPLICATION_GROUP:
      return withDragNode()(withSelection()(GroupNode));
    case TYPE_CONNECTS_TO:
      return withSelection()(EdgeConnect);
    default:
      return undefined;
  }
};

export default TopologyComponentFactory;
