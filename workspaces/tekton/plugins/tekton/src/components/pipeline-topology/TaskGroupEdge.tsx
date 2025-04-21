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
import { Edge, TaskEdge } from '@patternfly/react-topology';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { observer } from 'mobx-react';

import { GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL } from '../../consts/pipeline-topology-const';

interface TaskEdgeProps {
  element: Edge;
}

const TaskGroupEdge = (props: TaskEdgeProps) => (
  <TaskEdge
    nodeSeparation={GROUPED_PIPELINE_NODE_SEPARATION_HORIZONTAL}
    {...props}
  />
);

export default observer(TaskGroupEdge);
