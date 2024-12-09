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
import { V1Pod } from '@kubernetes/client-node';
import { Model, NodeModel } from '@patternfly/react-topology';
import {
  Node,
  TopologyQuadrant,
} from '@patternfly/react-topology/dist/esm/types';

import { K8sWorkloadResource } from './types';

export type OverviewItem<T = K8sWorkloadResource> = {
  obj: T;
};

export type TopologyDataModelDepicted = (
  resource: K8sWorkloadResource,
  model: Model,
) => boolean;

export interface OdcNodeModel extends NodeModel {
  resource?: K8sWorkloadResource;
  resourceKind?: string;
}

export interface TopologyDataObject<D = {}> {
  id: string;
  name: string;
  type: string;
  resources: OverviewItem;
  pods?: V1Pod[];
  data: D;
  resource: K8sWorkloadResource;
  groupResources?: OdcNodeModel[];
}

export type ResKindAbbrColor = {
  kindStr: string;
  kindAbbr?: string;
  kindColor?: string;
};

export type TopologyDecoratorGetter = (
  element: Node,
  radius: number,
  centerX: number,
  centerY: number,
) => React.ReactElement | null;

export type TopologyDecorator = {
  quadrant: TopologyQuadrant;
  decorator: TopologyDecoratorGetter;
};
