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
  ColaLayout,
  Graph,
  Layout,
  LayoutFactory,
} from '@patternfly/react-topology';
import { KialiDagreLayout } from './layouts/KialiDagreLayout';

export const KialiLayoutFactory: LayoutFactory = (
  type: string,
  graph: Graph,
): Layout => {
  switch (type) {
    case 'Dagre':
      return new KialiDagreLayout(graph, {
        linkDistance: 40,
        nodeDistance: 25,
        marginx: undefined,
        marginy: undefined,
        ranker: 'network-simplex',
        rankdir: 'LR',
      });
    default:
      return new ColaLayout(graph, { layoutOnDrag: false });
  }
};
