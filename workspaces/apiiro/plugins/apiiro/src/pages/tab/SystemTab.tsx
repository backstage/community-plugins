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
import { TabMetricsGroup } from '../../components/MetricsGroup';
import { useApi } from '@backstage/core-plugin-api';
import { apiiroApiRef } from '../../api';
import { fetchApiRef } from '@backstage/core-plugin-api';
import { useApplicationsData } from '../../queries';
import { useEntity } from '@backstage/plugin-catalog-react';
import { StatusContainer } from '../../components/common';
import { Risks } from '../Risks';
import { APIIRO_APPLICATION_ANNOTATION } from '@backstage-community/plugin-apiiro-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { RepositoriesContent } from '../Repositories';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useState } from 'react';
import { isApiiroMetricViewAvailable } from '../../utils';

export const SystemTab = () => {
  const [activeTab, setActiveTab] = useState(0);
  const connectBackendApi = useApi(apiiroApiRef);
  const { fetch } = useApi(fetchApiRef);
  const { entity } = useEntity();
  const enableApplicationsView = connectBackendApi.getEnableApplicationsView();
  const defaultViewChart = connectBackendApi.getDefaultAllowMetricsView();
  const displayRepositories =
    isApiiroMetricViewAvailable(entity) ?? defaultViewChart;
  const applicationId =
    entity?.metadata?.annotations?.[APIIRO_APPLICATION_ANNOTATION] || undefined;
  const entityRef = stringifyEntityRef(entity);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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

  return (
    <StatusContainer
      isLoading={applicationsDataLoading}
      error={applicationsDataError}
      isEmpty={!applications || applications.length === 0}
      wrapper={Content}
      notFoundMessage="Results for this application are either unavailable on Apiiro or can not be accessed."
    >
      <Content>
        <TabMetricsGroup
          applicationData={applications?.[0]}
          entity={entity}
          entityRef={entityRef}
          applicationId={applicationId}
        />
        {displayRepositories ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="Application content tabs"
                textColor="inherit"
                TabIndicatorProps={{
                  style: { backgroundColor: 'currentColor' },
                }}
              >
                <Tab
                  label={
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.primary',
                        opacity: activeTab === 0 ? 1 : 0.6,
                      }}
                    >
                      Repositories
                    </Typography>
                  }
                  sx={{
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
                <Tab
                  label={
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.primary',
                        opacity: activeTab === 1 ? 1 : 0.6,
                      }}
                    >
                      Risks
                    </Typography>
                  }
                  sx={{
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <RepositoriesContent applicationId={applicationId} />
            )}
            {activeTab === 1 && (
              <Risks entityRef={entityRef} applicationId={applicationId} />
            )}
          </>
        ) : (
          <Risks entityRef={entityRef} applicationId={applicationId} />
        )}
      </Content>
    </StatusContainer>
  );
};
