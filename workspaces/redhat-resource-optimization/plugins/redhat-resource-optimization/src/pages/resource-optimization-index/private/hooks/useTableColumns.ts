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
import React, { useMemo } from 'react';
import { Recommendations } from '@backstage-community/plugin-redhat-resource-optimization-common';
import { Link, TableColumn } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { optimizationsBreakdownRouteRef } from '../../../../routes';
import { getTimeFromNow } from '../../../../utils/dates';

export function useTableColumns(): TableColumn<Recommendations>[] {
  const columns = useMemo<TableColumn<Recommendations>[]>(
    () => [
      {
        title: 'Container',
        field: 'container',
        render: data => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const link = useRouteRef(optimizationsBreakdownRouteRef);
          return React.createElement(Link, {
            to: link({ id: data.id! }),
            children: data.container,
          });
        },
      },
      {
        title: 'Project',
        field: 'project',
      },
      {
        title: 'Workload',
        field: 'workload',
      },
      {
        title: 'Type',
        field: 'workloadType',
      },
      {
        title: 'Cluster',
        field: 'clusterAlias',
      },
      {
        title: 'Last reported',
        field: 'lastReported',
        render(data, _type) {
          return getTimeFromNow(data.lastReported?.toString());
        },
      },
    ],
    [],
  );

  return columns;
}
