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
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
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
    return <Alert severity="error">{error.message}</Alert>;
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
      <Typography variant="body1">
        <b>Active authors</b>: {analysis.summary.active_authors_count}
      </Typography>
      <Typography variant="body1">
        <b>Total authors</b>: {analysis.summary.authors_count}
      </Typography>
      <Typography variant="body1">
        <b>Commits</b>: {analysis.summary.commits}
      </Typography>
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
        <Grid container spacing={2}>
          <Grid item xs sm md>
            <CodeHealthKpisCard
              codesceneHost={codesceneHost}
              analysis={analysis}
            />
          </Grid>
          <Grid item>
            <GaugeCard
              title="System Mastery"
              progress={analysis.high_level_metrics.system_mastery / 100}
            />
          </Grid>
          <Grid item>
            <GaugeCard
              title="Current Score"
              progress={analysis.high_level_metrics.current_score / 10}
            />
          </Grid>
          <Grid item style={{ minWidth: '460px' }}>
            <InfoCard title="Analysis" deepLink={analysisLink}>
              {analysisBody}
            </InfoCard>
          </Grid>
        </Grid>
        <Grid container spacing={2} direction="column">
          <Grid item>
            <CodeSceneFileSummary {...analysis} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
