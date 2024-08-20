import React from 'react';
import { Typography } from '@material-ui/core';
import { Link, TableColumn } from '@backstage/core-components';
import { Recommendations } from '@backstage-community/plugin-redhat-resource-optimization-common';
import { getTimeFromNow } from '../../utils/dates';

export const columns: TableColumn<Recommendations>[] = [
  {
    title: 'Container names',
    field: 'container',
    render: row => {
      const rosDetailPagePath = `/redhat-resource-optimization/${row.id}`;
      return <Link to={rosDetailPagePath}>{row.container}</Link>;
    },
  },
  {
    title: 'Project names',
    field: 'project',
    render: row => <Typography variant="body2">{row.project}</Typography>,
  },
  {
    title: 'Workload names',
    field: 'workload',
    render: row => <Typography variant="body2">{row.workload}</Typography>,
  },
  {
    title: 'Workload types',
    field: 'workload_type',
    render: row => <Typography variant="body2">{row.workloadType}</Typography>,
  },
  {
    title: 'Cluster name',
    field: 'cluster',
    render: row => <Typography variant="body2">{row.clusterAlias}</Typography>,
  },
  {
    title: 'Last reported',
    field: 'last_reported',
    render: row => (
      <Typography variant="body2">
        {getTimeFromNow(row.lastReported?.toString())}
      </Typography>
    ),
  },
];
