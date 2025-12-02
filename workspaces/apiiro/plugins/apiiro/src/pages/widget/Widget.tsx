/*
 * Copyright 2025 The Backstage Authors
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
import { useApi } from '@backstage/core-plugin-api';
import { apiiroApiRef } from '../../api';
import { fetchApiRef } from '@backstage/core-plugin-api';
import { useRepositoriesData } from '../../queries';
import { useEntity } from '@backstage/plugin-catalog-react';
import { WidgetMetricsGroup } from '../../components/MetricsGroup/WidgetMetricsGroup';
import { NotFound, SomethingWentWrong } from '../../components/common';
import { LogoSpinner } from '../../components/common/logoSpinner';
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import { ApiiroLogo } from '../../assets/apiiroLogo';
import { APIIRO_PROJECT_ANNOTATION } from '@backstage-community/plugin-apiiro-common';
import { stringifyEntityRef } from '@backstage/catalog-model';

const LogoContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '12px 15px',
  gap: '10px',
  width: '109px',
  height: '40px',
  background: '#E6E6E6',
  borderRadius: '10px',
  '& svg': {
    width: '79px',
    height: '22px',
    '& path': {
      fill: '#21263F',
    },
  },
}));

export const Widget = () => {
  const theme = useTheme();
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);
  const { entity } = useEntity();
  const repoId =
    entity?.metadata?.annotations?.[APIIRO_PROJECT_ANNOTATION] || undefined;
  const entityRef = stringifyEntityRef(entity);

  const { repositoriesData, repositoriesDataLoading, repositoriesDataError } =
    useRepositoriesData({
      fetchApi: fetch,
      connectApi: connectBackendApi,
      enabled: true,
      repositoryKey: repoId,
      entityRef,
    });

  if (repositoriesDataLoading) {
    return (
      <>
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          flexDirection="column"
          minHeight="300px"
          sx={{
            border: '1px solid #ccc',
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          <LogoContainer sx={{ alignSelf: 'flex-end' }}>
            <ApiiroLogo />
          </LogoContainer>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="250px"
          >
            <LogoSpinner />
          </Box>
        </Box>
      </>
    );
  }

  if (repositoriesDataError) {
    return (
      <>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          minHeight="300px"
          sx={{
            border: '1px solid #ccc',
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          <LogoContainer sx={{ alignSelf: 'flex-end' }}>
            <ApiiroLogo />
          </LogoContainer>
          <SomethingWentWrong
            statusCode={repositoriesDataError?.details?.status}
          />
        </Box>
      </>
    );
  }

  const repositories = repositoriesData?.repositories;

  if (!repositories || repositories.length === 0) {
    return (
      <>
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          flexDirection="column"
          minHeight="300px"
          sx={{
            border: '1px solid #ccc',
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
          }}
        >
          <LogoContainer sx={{ alignSelf: 'flex-end' }}>
            <ApiiroLogo />
          </LogoContainer>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="250px"
          >
            <NotFound message="Results for this repository are either unavailable on Apiiro or cannot be accessed." />
          </Box>
        </Box>
      </>
    );
  }
  const repositoryData = repositories[0];

  return (
    <>
      <WidgetMetricsGroup
        repositoryData={repositoryData}
        repoId={repoId!}
        entityRef={entityRef}
        entity={entity}
      />
    </>
  );
};
