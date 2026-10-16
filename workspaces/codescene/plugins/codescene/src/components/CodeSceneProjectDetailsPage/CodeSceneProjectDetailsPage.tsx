/*
 * Copyright 2022 The Backstage Authors
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
import {
  Content,
  EmptyState,
  GaugeCard,
  Header,
  InfoCard,
  Page,
  SupportButton,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { configApiRef, useApi, useApp } from '@backstage/core-plugin-api';
import { Alert, Grid, Text } from '@backstage/ui';
import { useParams } from 'react-router-dom';
import { CodeHealthKpisCard } from '../CodeHealthKpisCard/CodeHealthKpisCard';
import { useAnalyses } from '../../hooks/useAnalyses';
import { Analysis } from '../../api/types';

export const CodeSceneFileSummary = (props: Analysis) => {
  const columns: TableColumn[] = [
    {
      title: 'Language',
      field: 'language',
      highlight: true,
    },
    {
      title: 'Files',
      field: 'number_of_files',
      type: 'numeric',
    },
    {
      title: 'Code',
      field: 'code',
      type: 'numeric',
    },
    {
      title: 'Comment',
      field: 'comment',
      type: 'numeric',
    },
  ];

  return (
    <Table
      options={{ paging: false, padding: 'dense' }}
      data={props.file_summary.sort((a, b) => b.code - a.code)}
      columns={columns}
      title="File Summary"
    />
  );
};

export const CodeSceneProjectDetailsPage = () => {
  const params = useParams();
  const projectId = Number(params.projectId);
  const config = useApi(configApiRef);
  const { analysis, loading, error } = useAnalyses(projectId);
  const { Progress } = useApp().getComponents();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert status="danger" title={error.message} />;
  } else if (!analysis) {
    return (
      <EmptyState
        missing="content"
        title="CodeScene analysis"
        description={`No analysis found for project with id ${params.projectId}`}
      />
    );
  }

  const codesceneHost = config.getString('codescene.baseUrl');
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

  return (
    <Page themeId="tool">
      <Header
        title={`CodeScene: ${analysis.name}`}
        subtitle={`Last analysis: ${analysis.readable_analysis_time}`}
      >
        <SupportButton>
          See hidden risks and social patterns in your code. Prioritize and
          reduce technical debt.
        </SupportButton>
      </Header>
      <Content>
        <Grid.Root columns={{ sm: '12' }} gap="4">
          <Grid.Item colSpan={{ sm: '12', md: '5' }}>
            <CodeHealthKpisCard
              codesceneHost={codesceneHost}
              analysis={analysis}
            />
          </Grid.Item>
          <Grid.Item colSpan={{ sm: '6', md: '2' }}>
            <GaugeCard
              title="System Mastery"
              progress={analysis.high_level_metrics.system_mastery / 100}
            />
          </Grid.Item>
          <Grid.Item colSpan={{ sm: '6', md: '2' }}>
            <GaugeCard
              title="Current Score"
              progress={analysis.high_level_metrics.current_score / 10}
            />
          </Grid.Item>
          <Grid.Item colSpan={{ sm: '12', md: '3' }}>
            <InfoCard title="Analysis" deepLink={analysisLink}>
              {analysisBody}
            </InfoCard>
          </Grid.Item>
        </Grid.Root>
        <Grid.Root columns={{ sm: '12' }} gap="4">
          <Grid.Item colSpan={{ sm: '12' }}>
            <CodeSceneFileSummary {...analysis} />
          </Grid.Item>
        </Grid.Root>
      </Content>
    </Page>
  );
};
