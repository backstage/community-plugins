/*
 * Copyright 2026 The Backstage Authors
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
import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { apiiroApiRef } from '../../api';
import { fetchApiRef } from '@backstage/core-plugin-api';
import { useRepositoriesData } from '../../queries';
import { useEntity } from '@backstage/plugin-catalog-react';
import { WidgetMetricsGroup } from '../../components/MetricsGroup/WidgetMetricsGroup';
import { StatusContainer } from '../../components/common';
import { APIIRO_PROJECT_ANNOTATION } from '@backstage-community/plugin-apiiro-common';
import { stringifyEntityRef } from '@backstage/catalog-model';

export const ComponentWidget = () => {
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
      enabled: !!repoId,
      repositoryId: repoId,
      entityRef,
    });

  if (!repoId) {
    return (
      <StatusContainer
        isLoading={false}
        isEmpty
        wrapper={Content}
        notFoundMessage="The Apiiro annotation hasn't been configured, or the result for this repository is not available in Apiiro."
      >
        {null}
      </StatusContainer>
    );
  }

  const repositories = repositoriesData?.repositories;
  const repositoryData = repositories?.[0];

  return (
    <StatusContainer
      isLoading={repositoriesDataLoading}
      error={repositoriesDataError}
      isEmpty={!repositories || repositories.length === 0}
      notFoundMessage="Results for this repository are either unavailable on Apiiro or can not be accessed."
    >
      <WidgetMetricsGroup
        repositoryData={repositoryData!}
        repoId={repoId!}
        entityRef={entityRef}
        entity={entity}
      />
    </StatusContainer>
  );
};
