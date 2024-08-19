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
