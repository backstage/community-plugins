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
import type { FC, PropsWithChildren, ReactNode } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';

import { Entity } from '@backstage/catalog-model';
import {
  Content,
  ErrorPanel,
  Header,
  Page,
  StatusAborted,
  StatusError,
  StatusOK,
  Table,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef, EntityRefLink } from '@backstage/plugin-catalog-react';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { SearchContextProvider } from '@backstage/plugin-search-react';

import { Box, Chip, CircularProgress } from '@material-ui/core';

import {
  ClusterNodesStatus,
  ClusterOverview,
  ocmClusterReadPermission,
} from '@backstage-community/plugin-ocm-common';

import { OcmApiRef } from '../../api';
import { ClusterStatusRowData } from '../../types';
import { Status, Update } from '../common';
import { columns } from './tableHeading';

const NodeChip = ({
  count,
  indicatorComponent: IndicatorComponent,
}: {
  count: number;
  indicatorComponent: FC<PropsWithChildren<{}>>;
}) => {
  if (!count) {
    return null;
  }
  return (
    <Chip
      label={<IndicatorComponent>{count}</IndicatorComponent>}
      variant="outlined"
    />
  );
};

const NodeChips = ({ nodes }: { nodes: ClusterNodesStatus[] }) => {
  const readyChipsNodes = nodes.filter(node => node.status === 'True').length;
  // TODO: Check if not ready correctly
  const notReadyNodesCount = nodes.filter(
    node => node.status === 'False',
  ).length;

  if (nodes.length === 0) {
    return <>-</>;
  }

  return (
    <>
      <NodeChip count={readyChipsNodes} indicatorComponent={StatusOK} />
      <NodeChip count={notReadyNodesCount} indicatorComponent={StatusError} />
      <NodeChip
        count={nodes.length - readyChipsNodes - notReadyNodesCount}
        indicatorComponent={StatusAborted}
      />
    </>
  );
};

const CatalogClusters = () => {
  const catalogApi = useApi(catalogApiRef);
  const ocmApi = useApi(OcmApiRef);

  const [{ value: clusterEntities, loading, error }, refresh] = useAsyncFn(
    async () => {
      const clusterResourceEntities = await catalogApi.getEntities({
        filter: { kind: 'Resource', 'spec.type': 'kubernetes-cluster' },
      });

      const clusters = await ocmApi.getClusters();

      if ('error' in clusters) {
        throw new Error(clusters.error.message);
      }

      const clusterEntityMappings: Array<{
        cluster: ClusterOverview;
        entity: Entity;
      }> = [];
      clusterResourceEntities.items.forEach(entity => {
        const cluster = (clusters as ClusterOverview[]).find(
          cd => cd.name === entity.metadata.name,
        );
        if (cluster) {
          clusterEntityMappings.push({
            cluster,
            entity,
          });
        }
      });
      return clusterEntityMappings;
    },
    [catalogApi],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (error) {
    return (
      <ErrorPanel
        title="Could not fetch clusters from Hub."
        error={error}
        defaultExpanded
      />
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <CircularProgress />
      </div>
    );
  }

  const data: ClusterStatusRowData[] = clusterEntities
    ? clusterEntities.map(ce => {
        return {
          name: (
            <EntityRefLink entityRef={ce.entity}>
              {ce.cluster.name}
            </EntityRefLink>
          ),
          status: <Status status={ce.cluster.status} />,
          infrastructure: ce.cluster.platform,
          version: (
            <Update
              data={{
                version: ce.cluster.openshiftVersion,
                update: ce.cluster.update,
              }}
            />
          ),
          nodes: <NodeChips nodes={ce.cluster.nodes} />,
        };
      })
    : [];

  return (
    <Table
      options={{ paging: false }}
      data={data}
      columns={columns}
      title="All"
    />
  );
};

export const ClusterStatusPage = ({ logo }: { logo?: ReactNode }) => {
  return (
    <SearchContextProvider>
      <RequirePermission permission={ocmClusterReadPermission}>
        <Page themeId="clusters">
          <Header title="Your Managed Clusters" />
          <Content>
            {logo && (
              <Box sx={{ textAlign: 'center', maxHeight: 150, mt: 5, mb: 5 }}>
                {logo}
              </Box>
            )}
            <CatalogClusters />
          </Content>
        </Page>
      </RequirePermission>
    </SearchContextProvider>
  );
};

export default ClusterStatusPage;
