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
import type { ReactNode } from 'react';

import { Table, TableColumn } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { IconButton, Link } from '@material-ui/core';
import ExternalLinkIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import moment from 'moment';

import { useApplications } from '../../hooks/useApplications';
import { useArgocdConfig } from '../../hooks/useArgocdConfig';
import { useArgocdViewPermission } from '../../hooks/useArgocdViewPermission';
import {
  Application,
  HealthStatus,
  SyncStatuses,
} from '@backstage-community/plugin-redhat-argocd-common';
import {
  getArgoCdAppConfig,
  getCommitUrl,
  getInstanceName,
  isAppHelmChartType,
} from '../../utils/utils';
import AppSyncStatus from '../AppStatus/AppSyncStatus';
import { AppHealthIcon } from '../AppStatus/StatusIcons';

const DeploymentSummary = () => {
  const { entity } = useEntity();

  const { baseUrl, instances, intervalMs } = useArgocdConfig();
  const instanceName = getInstanceName(entity) || instances?.[0]?.name;

  const { appSelector, appName, projectName, appNamespace } =
    getArgoCdAppConfig({ entity });

  const { apps, loading, error } = useApplications({
    instanceName,
    intervalMs,
    appSelector,
    projectName,
    appName,
    appNamespace,
  });

  const hasArgocdViewAccess = useArgocdViewPermission();

  const supportsMultipleArgoInstances = !!instances.length;
  const getBaseUrl = (row: any): string | undefined => {
    if (supportsMultipleArgoInstances && !baseUrl) {
      return instances?.find(
        value => value?.name === row.metadata?.instance?.name,
      )?.url;
    }
    return baseUrl;
  };

  const columns: TableColumn<Application>[] = [
    {
      title: 'ArgoCD App',
      field: 'name',
      render: (row: Application): ReactNode =>
        getBaseUrl(row) ? (
          <Link
            href={`${getBaseUrl(row)}/applications/${row?.metadata?.name}`}
            target="_blank"
            rel="noopener"
          >
            {row.metadata.name}{' '}
            <IconButton color="primary" size="small">
              <ExternalLinkIcon />
            </IconButton>
          </Link>
        ) : (
          row.metadata.name
        ),
    },
    {
      title: 'Namespace',
      field: 'namespace',
      render: (row: Application): ReactNode => {
        return <>{row.spec.destination.namespace}</>;
      },
    },
    {
      title: 'Instance',
      field: 'instance',
      render: (row: Application): ReactNode => {
        return <>{row.metadata?.instance?.name || instanceName}</>;
      },
    },
    {
      title: 'Server',
      field: 'server',
      render: (row: Application): ReactNode => {
        return <>{row.spec.destination.server}</>;
      },
    },
    {
      title: 'Revision',
      field: 'revision',
      render: (row: Application): ReactNode => {
        const historyList = row.status?.history ?? [];
        const latestRev = historyList[historyList.length - 1];
        const repoUrl =
          row?.spec?.sources?.[0]?.repoURL ?? row?.spec?.source?.repoURL ?? '';

        const commitUrl = isAppHelmChartType(row)
          ? repoUrl
          : getCommitUrl(
              repoUrl,
              latestRev?.revision ?? '',
              entity?.metadata?.annotations || {},
            );
        return (
          <Link href={commitUrl} target="_blank" rel="noopener">
            {latestRev?.revision?.substring(0, 7) ?? '-'}
          </Link>
        );
      },
    },

    {
      id: 'test',
      title: 'Last deployed',
      field: 'lastdeployed',
      customSort: (a: Application, b: Application) => {
        const bHistory = b?.status?.history ?? [];
        const bDeployedAt = bHistory?.[bHistory.length - 1]?.deployedAt;

        const aHistory = a?.status?.history ?? [];
        const aDeployedAt = aHistory?.[aHistory.length - 1]?.deployedAt;

        return moment(aDeployedAt).diff(moment(bDeployedAt));
      },
      render: (row: Application): ReactNode => {
        const history = row?.status?.history ?? [];
        const finishedAt = history[history.length - 1]?.deployedAt;
        return (
          <>
            {finishedAt
              ? moment(finishedAt).local().format('D/MM/YYYY, H:mm:ss')
              : null}
          </>
        );
      },
    },
    {
      title: 'Sync status',
      field: 'syncstatus',
      customSort: (a: Application, b: Application): number => {
        const syncStatusOrder: string[] = Object.values(SyncStatuses);
        return (
          syncStatusOrder.indexOf(a?.status?.sync?.status) -
          syncStatusOrder.indexOf(b?.status?.sync?.status)
        );
      },
      render: (row: Application): ReactNode => <AppSyncStatus app={row} />,
    },
    {
      title: 'Health status',
      field: 'healthstatus',
      customSort: (a: Application, b: Application): number => {
        const healthStatusOrder: string[] = Object.values(HealthStatus);
        return (
          healthStatusOrder.indexOf(a?.status?.health?.status) -
          healthStatusOrder.indexOf(b?.status?.health?.status)
        );
      },
      render: (row: Application): ReactNode => (
        <>
          <AppHealthIcon status={row.status.health.status as HealthStatus} />{' '}
          {row?.status?.health?.status}
        </>
      ),
    },
  ];

  return !error && hasArgocdViewAccess ? (
    <Table
      title="Deployment summary"
      options={{
        paging: true,
        search: false,
        draggable: false,
        padding: 'dense',
      }}
      isLoading={loading}
      data={apps}
      columns={columns}
    />
  ) : null;
};
export default DeploymentSummary;
