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
import { useApplicationsData } from '../../queries';
import { useEntity } from '@backstage/plugin-catalog-react';
import { WidgetMetricsGroup } from '../../components/MetricsGroup/WidgetMetricsGroup';
import { StatusContainer } from '../../components/common';
import { APIIRO_APPLICATION_ANNOTATION } from '@backstage-community/plugin-apiiro-common';
import { stringifyEntityRef } from '@backstage/catalog-model';

export const SystemWidget = () => {
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);
  const { entity } = useEntity();
  const enableApplicationsView = connectBackendApi.getEnableApplicationsView();
  const applicationId =
    entity?.metadata?.annotations?.[APIIRO_APPLICATION_ANNOTATION] || undefined;
  const entityRef = stringifyEntityRef(entity);

  const { applicationsData, applicationsDataLoading, applicationsDataError } =
    useApplicationsData({
      connectApi: connectBackendApi,
      fetchApi: fetch,
      enabled: enableApplicationsView && !!applicationId,
      applicationId,
      entityRef,
    });

  if (!enableApplicationsView) {
    return (
      <StatusContainer
        isLoading={false}
        isEmpty
        wrapper={Content}
        notFoundMessage="Please enable the applications view in the Apiiro plugin configuration."
      >
        {null}
      </StatusContainer>
    );
  }

  if (!applicationId) {
    return (
      <StatusContainer
        isLoading={false}
        isEmpty
        wrapper={Content}
        notFoundMessage="The Apiiro annotation hasn't been configured, or the result for this application is not available in Apiiro."
      >
        {null}
      </StatusContainer>
    );
  }

  const applications = applicationsData?.applications;
  const applicationData = applications?.[0];

  return (
    <StatusContainer
      isLoading={applicationsDataLoading}
      error={applicationsDataError}
      isEmpty={!applications || applications.length === 0}
      wrapper={Content}
      notFoundMessage="Results for this application are either unavailable on Apiiro or can not be accessed."
    >
      <WidgetMetricsGroup
        applicationData={applicationData!}
        applicationId={applicationId!}
        entityRef={entityRef}
        entity={entity}
      />
    </StatusContainer>
  );
};
