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

import type { ReactElement, ReactNode } from 'react';
import {
  Progress,
  TableColumn,
  Table,
  StatusOK,
  StatusPending,
  StatusWarning,
  StatusError,
  StatusAborted,
  Link,
} from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { grafanaApiRef } from '../../api';
import useAsync from 'react-use/lib/useAsync';
import { Alert } from '@material-ui/lab';
import { AlertsCardOpts, Alert as GrafanaAlert } from '../../types';
import {
  GRAFANA_ANNOTATION_TAG_SELECTOR,
  GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR,
  isAlertSelectorAvailable,
  isDashboardSelectorAvailable,
  tagSelectorFromEntity,
  alertSelectorFromEntity,
} from '../../constants';

const AlertStatusBadge = ({ alert }: { alert: GrafanaAlert }) => {
  let statusElmt: ReactElement;

  switch (alert.state) {
    case 'ok':
    case 'Normal':
      statusElmt = <StatusOK />;
      break;
    case 'paused':
    case 'Pending':
      statusElmt = <StatusPending />;
      break;
    case 'no_data':
    case 'pending':
    case 'NoData':
      statusElmt = <StatusWarning />;
      break;
    case 'alerting':
    case 'Alerting':
    case 'Error':
      statusElmt = <StatusError />;
      break;
    default:
      statusElmt = <StatusAborted />;
  }

  return <div>{statusElmt}</div>;
};

export const AlertsTable = ({
  alerts,
  opts,
}: {
  alerts: GrafanaAlert[];
  opts: AlertsCardOpts;
}) => {
  const columns: TableColumn<GrafanaAlert>[] = [
    {
      title: 'Name',
      field: 'name',
      cellStyle: { width: '90%' },
      render: (row: GrafanaAlert): ReactNode => (
        <Link to={row.url} target="_blank" rel="noopener">
          {row.name}
        </Link>
      ),
    },
  ];

  if (opts.showState) {
    columns.push({
      title: 'State',
      render: (row: GrafanaAlert): ReactNode => (
        <AlertStatusBadge alert={row} />
      ),
    });
  }

  return (
    <Table
      title={opts.title || 'Alerts'}
      options={{
        paging: opts.paged ?? false,
        pageSize: opts.pageSize ?? 5,
        search: opts.searchable ?? false,
        emptyRowsWhenPaging: false,
        sorting: opts.sortable ?? false,
        draggable: false,
        padding: 'dense',
      }}
      data={alerts}
      columns={columns}
    />
  );
};

const Alerts = ({ entity, opts }: { entity: Entity; opts: AlertsCardOpts }) => {
  const grafanaApi = useApi(grafanaApiRef);
  const configApi = useApi(configApiRef);
  const unifiedAlertingEnabled =
    configApi.getOptionalBoolean('grafana.unifiedAlerting') || false;
  const alertSelector = unifiedAlertingEnabled
    ? alertSelectorFromEntity(entity)
    : tagSelectorFromEntity(entity);

  const { value, loading, error } = useAsync(
    async () => await grafanaApi.alertsForSelector(alertSelector),
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <AlertsTable alerts={value || []} opts={opts} />;
};

export const AlertsCard = (opts?: AlertsCardOpts) => {
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);
  const unifiedAlertingEnabled =
    configApi.getOptionalBoolean('grafana.unifiedAlerting') || false;

  if (!unifiedAlertingEnabled && !isDashboardSelectorAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState
        annotation={GRAFANA_ANNOTATION_TAG_SELECTOR}
      />
    );
  }

  if (unifiedAlertingEnabled && !isAlertSelectorAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState
        annotation={GRAFANA_ANNOTATION_ALERT_LABEL_SELECTOR}
      />
    );
  }

  const finalOpts = { ...opts, ...{ showState: opts?.showState } };

  return <Alerts entity={entity} opts={finalOpts} />;
};
