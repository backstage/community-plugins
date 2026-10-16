/*
 * Copyright 2023 The Backstage Authors
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
import { EmptyState, GaugeCard, InfoCard } from '@backstage/core-components';
import { configApiRef, useApi, useApp } from '@backstage/core-plugin-api';
import { Alert, Grid, Text } from '@backstage/ui';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/esm/useAsync';
import { codesceneApiRef } from '../../api/api';
import { Analysis } from '../../api/types';
import { CodeHealthKpisCard } from '../CodeHealthKpisCard/CodeHealthKpisCard';
import {
  getProjectAnnotation,
  CODESCENE_PROJECT_ANNOTATION,
  isCodeSceneAvailable,
} from '../../utils/commonUtil';
import { DateTime } from 'luxon';
import { MissingAnnotationEmptyState } from '@backstage/plugin-catalog-react';

export const CodeSceneEntityKPICard = () => {
  const { entity } = useEntity();
  const { projectId } = getProjectAnnotation(entity);
  const codesceneApi = useApi(codesceneApiRef);
  const config = useApi(configApiRef);
  const codesceneHost = config.getString('codescene.baseUrl');
  const { Progress } = useApp().getComponents();

  const {
    value: analysis,
    loading,
    error,
  } = useAsync(async (): Promise<Analysis> => {
    return await codesceneApi.fetchLatestAnalysis(projectId);
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert status="danger" title={error.message} />;
  } else if (!analysis) {
    return (
      <EmptyState
        missing="content"
        title="CodeScene analysis"
        description={`No analysis found for project with id ${projectId}`}
      />
    );
  }

  const analysisPath = `${codesceneHost}/${projectId}/analyses/${analysis.id}`;
  const analysisLink = { title: 'Check the analysis', link: analysisPath };

  const analysisBody = (
    <>
      <Text variant="body-medium">
        <b>Active authors</b>: {analysis.summary.active_authors_count}
      </Text>
      <Text variant="body-medium">
        <b>Total authors</b>: {analysis.summary.authors_count}
      </Text>
      <Text variant="body-medium">
        <b>Commits</b>: {analysis.summary.commits}
      </Text>
    </>
  );

  return isCodeSceneAvailable(entity) ? (
    <>
      <Grid.Root columns={{ sm: '12' }} gap="2">
        <Grid.Item colSpan={{ sm: '12', md: '8' }}>
          <CodeHealthKpisCard
            codesceneHost={codesceneHost}
            analysis={analysis}
          />
        </Grid.Item>
        <Grid.Item colSpan={{ sm: '12', md: '4' }}>
          <Grid.Root columns={{ sm: '12' }} gap="2">
            <Grid.Item colSpan={{ sm: '12' }}>
              <GaugeCard
                title="System Mastery"
                progress={analysis.high_level_metrics.system_mastery / 100}
              />
            </Grid.Item>
            <Grid.Item colSpan={{ sm: '12' }}>
              <GaugeCard
                title="Current Score"
                progress={analysis.high_level_metrics.current_score / 10}
              />
            </Grid.Item>
          </Grid.Root>
        </Grid.Item>
        <Grid.Item colSpan={{ sm: '12' }}>
          <InfoCard title="Analysis" deepLink={analysisLink}>
            {analysisBody}
          </InfoCard>
        </Grid.Item>
      </Grid.Root>
      <div style={{ textAlign: 'center' }}>
        <Text variant="body-x-small">{`Last analyzed on ${DateTime.fromISO(
          analysis.readable_analysis_time,
        ).toLocaleString(DateTime.DATETIME_MED)}`}</Text>
      </div>
    </>
  ) : (
    <MissingAnnotationEmptyState annotation={CODESCENE_PROJECT_ANNOTATION} />
  );
};
