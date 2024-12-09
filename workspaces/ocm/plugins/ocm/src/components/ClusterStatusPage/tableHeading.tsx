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
import { TableColumn } from '@backstage/core-components';

import semver from 'semver';

import { ClusterStatusRowData } from '../../types';

export const columns: TableColumn<ClusterStatusRowData>[] = [
  {
    title: 'Name',
    field: 'name',
    highlight: true,
    customSort: (a, b) => {
      // The children type here is actually a ReactNode, but we know it's a string
      return (a.name.props.children as string).localeCompare(
        b.name.props.children as string,
        'en',
      );
    },
  },
  {
    title: 'Status',
    field: 'status',
    customSort: (a, b) => {
      const availabilityA = a.status.props.status.available;
      const availabilityB = b.status.props.status.available;
      if (availabilityA === availabilityB) return 0;
      return availabilityA ? -1 : 1;
    },
  },
  {
    title: 'Infrastructure',
    field: 'infrastructure',
  },
  {
    title: 'Version',
    field: 'version',
    customSort: (a, b) => {
      return semver.gt(
        a.version.props.data.version,
        b.version.props.data.version,
      )
        ? 1
        : -1;
    },
  },
  {
    title: 'Nodes',
    field: 'nodes',
    customSort: (a, b) => {
      return a.nodes.props.nodes.length - b.nodes.props.nodes.length;
    },
  },
];
