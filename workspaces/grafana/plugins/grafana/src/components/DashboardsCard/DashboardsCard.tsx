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

import { Progress, TableColumn, Table, Link } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { grafanaApiRef } from '../../api';
import useAsync from 'react-use/lib/useAsync';
import Alert from '@material-ui/lab/Alert';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { Dashboard, DashboardCardOpts } from '../../types';
import {
  dashboardSelectorFromEntity,
  GRAFANA_ANNOTATION_DASHBOARD_SELECTOR,
  isDashboardSelectorAvailable,
} from '../../constants';

export const DashboardsTable = ({
  entity,
  dashboards,
  opts,
}: {
  entity: Entity;
  dashboards: Dashboard[];
  opts: DashboardCardOpts;
}) => {
  const columns: TableColumn<Dashboard>[] = [
    {
      title: 'Title',
      field: 'title',
      render: (row: Dashboard) => (
        <Link to={row.url} target="_blank" rel="noopener">
          {row.title}
        </Link>
      ),
    },
    {
      title: 'Folder',
      field: 'folderTitle',
      render: (row: Dashboard) => (
        <Link to={row.folderUrl} target="_blank" rel="noopener">
          {row.folderTitle}
        </Link>
      ),
    },
  ];

  const titleElm = (
    <Tooltip
      title={`Note: only dashboard with the "${dashboardSelectorFromEntity(
        entity,
      )}" selector are displayed.`}
    >
      <Typography variant="h5">{opts.title || 'Dashboards'}</Typography>
    </Tooltip>
  );

  return (
    <Table
      title={titleElm}
      options={{
        paging: opts.paged ?? false,
        pageSize: opts.pageSize ?? 5,
        search: opts.searchable ?? false,
        emptyRowsWhenPaging: false,
        sorting: opts.sortable ?? false,
        draggable: false,
        padding: 'dense',
      }}
      data={dashboards}
      columns={columns}
    />
  );
};

const Dashboards = ({
  entity,
  opts,
}: {
  entity: Entity;
  opts: DashboardCardOpts;
}) => {
  const grafanaApi = useApi(grafanaApiRef);
  const { value, loading, error } = useAsync(async () => {
    const dashboards = await grafanaApi.listDashboards(
      dashboardSelectorFromEntity(entity),
    );
    if (opts?.additionalDashboards) {
      dashboards.push(...opts.additionalDashboards(entity));
    }
    return dashboards;
  });

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <DashboardsTable entity={entity} dashboards={value || []} opts={opts} />
  );
};

export const DashboardsCard = (opts?: DashboardCardOpts) => {
  const { entity } = useEntity();

  return !isDashboardSelectorAvailable(entity) ? (
    <MissingAnnotationEmptyState
      annotation={GRAFANA_ANNOTATION_DASHBOARD_SELECTOR}
    />
  ) : (
    <Dashboards entity={entity} opts={opts || {}} />
  );
};
