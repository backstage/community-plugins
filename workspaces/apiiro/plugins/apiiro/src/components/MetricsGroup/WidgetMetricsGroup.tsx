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
import Grid from '@mui/material/Unstable_Grid2';
import { TopLanguagesTile } from '../tiles/TopLanguagesTile';
import { TopRiskTile } from '../tiles/TopRiskTile';
import StatusTile from '../tiles/StatusTile';
import { ApplicationType, RepositoryType } from '../../queries';
import { useApi } from '@backstage/core-plugin-api';
import { isApiiroMetricViewAvailable } from '../../utils';
import type { Entity } from '@backstage/catalog-model';
import { apiiroApiRef } from '../../api';

export const WidgetMetricsGroup = ({
  repositoryData,
  applicationData,
  repoId,
  entityRef,
  entity,
  applicationId,
}: {
  repositoryData?: RepositoryType;
  applicationData?: ApplicationType;
  repoId?: string;
  entityRef: string;
  entity: Entity;
  applicationId?: string;
}) => {
  const apiiroApi = useApi(apiiroApiRef);
  const defaultViewChart = apiiroApi.getDefaultAllowMetricsView();
  const allowViewChart =
    isApiiroMetricViewAvailable(entity) ?? defaultViewChart;
  const detailViewUrl = repoId
    ? repositoryData?.entityUrl
    : applicationData?.entityUrl;

  const transformApplicationLanguages = (
    languages?: { language?: string; percentage?: number }[],
  ): Record<string, number> => {
    if (!languages) return {};

    const totalPercentage = languages.reduce((sum, item) => {
      return sum + (item.percentage || 0);
    }, 0);

    if (totalPercentage === 0) return {};

    return languages.reduce((acc, item) => {
      if (item.language && item.percentage !== undefined) {
        acc[item.language] = (item.percentage / totalPercentage) * 100;
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const languagePercentages =
    repositoryData?.languagePercentages ||
    transformApplicationLanguages(applicationData?.languagePercentages) ||
    {};

  return (
    <Grid container spacing={3} direction="column">
      <Grid container spacing={3}>
        <Grid xs={12} sm={12}>
          <StatusTile
            repository={repositoryData}
            application={applicationData}
            detailViewLink={`${detailViewUrl}/apiiro`}
            allowViewChart={allowViewChart}
          />
        </Grid>
        {allowViewChart && (
          <>
            <Grid xs={12} sm={6} lg={6}>
              <TopLanguagesTile data={languagePercentages} />
            </Grid>
            <Grid xs={12} sm={6} lg={6}>
              <TopRiskTile
                repoId={repoId}
                applicationId={applicationId}
                entityRef={entityRef}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};
