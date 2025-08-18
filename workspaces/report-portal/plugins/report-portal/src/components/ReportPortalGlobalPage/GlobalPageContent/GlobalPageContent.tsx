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
import { useEffect, useState } from 'react';

import { Link, Table, TableColumn } from '@backstage/core-components';
import { configApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';

import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';

import { useNavigate } from 'react-router-dom';
import { reportPortalApiRef } from '../../../api';
import { projectsRouteRef } from '../../../routes';

type InstanceData = {
  name: string;
  filterType: string;
  projects: React.ReactNode | number;
};

export const GlobalPageContent = () => {
  const configApi = useApi(configApiRef);
  const reportPortalApi = useApi(reportPortalApiRef);
  const hostsConfig = configApi.getOptionalConfigArray(
    'reportPortal.integrations',
  );
  const [hosts, _] = useState<
    { host: string; filterType: string }[] | undefined
  >(
    hostsConfig?.map(value => ({
      host: value.getString('host'),
      filterType: value.getString('filterType') ?? 'INTERNAL',
    })),
  );

  const projectsPageRoute = useRouteRef(projectsRouteRef)();

  const [instanceData, setInstanceData] = useState<InstanceData[]>(
    hosts
      ? hosts.map(h => ({
          name: h.host,
          filterType: h.filterType,
          projects: <Skeleton height="3rem" />,
        }))
      : [],
  );

  const columns: TableColumn<InstanceData>[] = [
    {
      id: 0,
      field: 'name',
      title: 'Name',
      render: rowData => (
        <Link to={projectsPageRoute.concat(`?host=${rowData.name}`)}>
          {rowData.name}
        </Link>
      ),
      width: '60%',
    },
    {
      id: 1,
      field: 'projects',
      title: 'Projects',
      align: 'center',
      highlight: true,
      render: rowData => rowData.projects,
      width: '10%',
    },
    {
      id: 2,
      field: 'portalLink',
      title: 'Actions',
      align: 'center',
      render: rowData => (
        <IconButton
          href={reportPortalApi.getReportPortalBaseUrl(rowData.name)}
          rel="noreferrer noopener"
          target="_blank"
          size="large"
          onClick={e => e.stopPropagation()}
        >
          <LaunchIcon />
        </IconButton>
      ),
      width: '30%',
    },
  ];

  useEffect(() => {
    if (hosts && hosts.length > 0) {
      const getProjectsCount = async () => {
        for (const h of hosts) {
          const resp = await reportPortalApi.getInstanceDetails(h.host, {
            'filter.eq.type': h.filterType,
          });
          setInstanceData(iData =>
            iData.map(instance =>
              instance.name === h.host
                ? { ...instance, projects: resp.content.length }
                : instance,
            ),
          );
        }
      };
      getProjectsCount();
    }
  }, [hosts, reportPortalApi]);

  const navigate = useNavigate();

  return (
    <Table
      title={`Instances (${instanceData.length})`}
      columns={columns}
      onRowClick={(_e, rowData) =>
        navigate(projectsPageRoute.concat(`?host=${rowData?.name}`))
      }
      options={{
        searchFieldVariant: 'outlined',
        draggable: false,
        padding: 'dense',
      }}
      data={instanceData}
    />
  );
};
