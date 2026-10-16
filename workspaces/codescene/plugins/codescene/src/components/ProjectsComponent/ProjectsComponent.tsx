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
import { useState } from 'react';
import {
  Content,
  ContentHeader,
  Progress,
  ItemCardHeader,
} from '@backstage/core-components';
import { useRouteRef, useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { rootRouteRef } from '../../routes';
import { codesceneApiRef } from '../../api/api';
import { Project, Analysis } from '../../api/types';
import {
  Alert,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Grid,
  SearchField,
  Tag,
  TagGroup,
} from '@backstage/ui';
import styles from './ProjectsComponent.module.css';

function matchFilter(filter?: string): (entry: Project) => boolean {
  const terms = filter
    ?.toLocaleLowerCase('en-US')
    .split(/\s/)
    .map(e => e.trim())
    .filter(Boolean);

  if (!terms?.length) {
    return () => true;
  }

  return entry => {
    const text = `${entry.name} ${entry.description || ''}`.toLocaleLowerCase(
      'en-US',
    );
    return terms.every(term => text.includes(term));
  };
}

function topLanguages(analysis: Analysis, coerceAtMost: number): string[] {
  return analysis.file_summary
    .sort((a, b) => b.code - a.code)
    .map(fileSummary => fileSummary.language)
    .slice(0, coerceAtMost);
}

type ProjectAndAnalysis = {
  project: Project;
  analysis?: Analysis;
};

export const ProjectsComponent = () => {
  const routeRef = useRouteRef(rootRouteRef);
  const codesceneApi = useApi(codesceneApiRef);

  const [searchText, setSearchText] = useState('');
  const {
    value: projectsWithAnalyses,
    loading,
    error,
  } = useAsync(async (): Promise<Record<number, ProjectAndAnalysis>> => {
    const projects = (await codesceneApi.fetchProjects()).projects;

    const promises = projects.map(project =>
      codesceneApi.fetchLatestAnalysis(project.id),
    );
    // analyses associates project IDs with their latests analysis
    const analyses: Record<number, Analysis> = await Promise.allSettled(
      promises,
    ).then(results => {
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => result as PromiseFulfilledResult<Analysis>)
        .map(result => result.value)
        .reduce(
          (acc, analysis) => ({ ...acc, [analysis.project_id]: analysis }),
          {},
        );
    });
    return projects.reduce(
      (acc, project) => ({
        ...acc,
        [project.id]: {
          project: project,
          analysis: analyses[project.id],
        },
      }),
      {},
    );
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert status="danger" title={error.message} />;
  } else if (
    !projectsWithAnalyses ||
    Object.keys(projectsWithAnalyses).length === 0
  ) {
    return <Alert status="danger" title="No projects found!" />;
  }

  const projects = Object.values(projectsWithAnalyses)
    .map(p => p.project)
    .sort((a, b) => a.name.localeCompare(b.name));

  const cards = projects.filter(matchFilter(searchText)).map(project => {
    const analysis = projectsWithAnalyses[project.id].analysis;
    const subtitle = analysis
      ? `Last analysis: ${analysis.readable_analysis_time} · Score: ${analysis.high_level_metrics.current_score} · Active authors: ${analysis.high_level_metrics.active_developers}`
      : undefined;
    const languages = analysis ? topLanguages(analysis, 3) : [];
    return (
      <Grid.Item key={project.id} colSpan={{ sm: '6', md: '3' }}>
        <Card
          className={styles.projectCard}
          href={`${routeRef()}/${project.id}`}
          label={project.name}
        >
          <CardHeader>
            <ItemCardHeader title={project.name} />
          </CardHeader>
          <CardBody>{subtitle}</CardBody>
          {languages.length > 0 && (
            <CardFooter>
              <TagGroup aria-label={`Top languages for ${project.name}`}>
                {languages.map(lang => (
                  <Tag key={lang} size="small">
                    {lang}
                  </Tag>
                ))}
              </TagGroup>
            </CardFooter>
          )}
        </Card>
      </Grid.Item>
    );
  });

  return (
    <Content className={styles.overflowXScroll}>
      <ContentHeader title="Projects">
        <SearchField
          aria-label="Filter projects"
          placeholder="Filter"
          value={searchText}
          onChange={value => setSearchText(value)}
        />
      </ContentHeader>
      <Grid.Root columns={{ sm: '12' }} gap="4">
        {cards}
      </Grid.Root>
    </Content>
  );
};
