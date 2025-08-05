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

import {
  CodeSnippet,
  Content,
  Header,
  Page,
  StatusAborted,
  StatusError,
  StatusOK,
  Table,
  WarningPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef, EntityRefLink } from '@backstage/plugin-catalog-react';
import { HomePageCompanyLogo } from '@backstage/plugin-home';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { SearchContextProvider } from '@backstage/plugin-search-react';

import { Chip, CircularProgress, Grid, makeStyles } from '@material-ui/core';

import {
  ClusterNodesStatus,
  ClusterOverview,
  ocmClusterReadPermission,
} from '@backstage-community/plugin-ocm-common';

import { OcmApiRef } from '../../api';
import { ClusterStatusRowData } from '../../types';
import { Status, Update } from '../common';
import { columns } from './tableHeading';

const useStylesTwo = makeStyles({
  container: {
    width: '100%',
  },
});

const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(5, 0),
    '& > svg': {
      width: 'auto',
      height: 150,
    },
  },
}));

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
  const classes = useStylesTwo();

  const [{ value: clusterEntities, loading, error }, refresh] = useAsyncFn(
    async () => {
      const clusterResourceEntities = await catalogApi.getEntities({
        filter: { kind: 'Resource', 'spec.type': 'kubernetes-cluster' },
      });

      const clusters = await ocmApi.getClusters();

      if ('error' in clusters) {
        throw new Error(clusters.error.message);
      }

      const clusterEntityMappings = clusterResourceEntities.items.map(
        entity => {
          const cluster = (clusters as ClusterOverview[]).find(
            cd => cd.name === entity.metadata.name,
          );
          return {
            cluster: cluster!,
            entity: entity,
          };
        },
      );
      return clusterEntityMappings;
    },
    [catalogApi],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (error) {
    return (
      <WarningPanel severity="error" title="Could not fetch clusters from Hub.">
        <CodeSnippet language="text" text={error.toString()} />
      </WarningPanel>
    );
  }

  if (loading) {
    return <CircularProgress />;
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
    <div className={classes.container}>
      <Table
        options={{ paging: false }}
        data={data}
        columns={columns}
        title="All"
      />
    </div>
  );
};

export const ClusterStatusPage = ({ logo }: { logo?: ReactNode }) => {
  const { container } = useStyles();

  return (
    <SearchContextProvider>
      <RequirePermission permission={ocmClusterReadPermission}>
        <Page themeId="clusters">
          <Header title="Your Managed Clusters" />
          <Content>
            <Grid container justifyContent="center" spacing={6}>
              {logo && (
                <HomePageCompanyLogo className={container} logo={logo} />
              )}
              <Grid container item xs={12} justifyContent="center">
                <CatalogClusters />
              </Grid>
            </Grid>
          </Content>
        </Page>
      </RequirePermission>
    </SearchContextProvider>
  );
};

export default ClusterStatusPage;
