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
import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import {
  codescenePlugin,
  CodeScenePage,
  CodeSceneProjectDetailsPage,
} from '../src/plugin';
import { CodeSceneIcon } from '../src';
import { codesceneApiRef, CodeSceneApi } from '../src/api/api';
import { Analysis, Project } from '../src/api/types';
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

const projects: Project[] = [
  { id: 1, name: 'payment-service', description: 'Handles payments' },
  { id: 2, name: 'checkout-web', description: 'Storefront checkout' },
];

const analysisFor = (project: Project): Analysis => ({
  id: project.id * 10,
  name: project.name,
  project_id: project.id,
  readable_analysis_time: '2026-10-16 09:00',
  summary: {
    unique_issue_ids: 12,
    issues_filtered_as_outliers: 1,
    entities: 340,
    commits_with_issue_ids: 88,
    authors_count: 17,
    active_authors_count: 6,
    issues_with_cycle_time: 9,
    commits: 1245,
    issue_ids_matched_to_issues: 10,
    issues_classed_as_defects: 4,
    issues_with_cost: 3,
  },
  file_summary: [
    {
      language: 'TypeScript',
      number_of_files: 120,
      blank: 900,
      comment: 450,
      code: 8200,
    },
    {
      language: 'CSS',
      number_of_files: 30,
      blank: 120,
      comment: 40,
      code: 1400,
    },
    { language: 'JSON', number_of_files: 15, blank: 10, comment: 0, code: 600 },
  ],
  high_level_metrics: {
    current_score: 8.4,
    month_score: 8.1,
    year_score: 7.6,
    active_developers: 6,
    lines_of_code: 10200,
    system_mastery: 72,
    hotspots_code_health_now_weighted_average: 7.8,
    hotspots_code_health_month_weighted_average: 7.2,
    code_health_weighted_average_current: 8.6,
    code_health_weighted_average_last_month: 8.4,
    code_health_now_worst_performer: 3.1,
    code_health_month_worst_performer: 2.9,
  },
});

const findProject = (projectId: number) =>
  projects.find(p => p.id === projectId) ?? projects[0];

const mockCodeSceneApi: CodeSceneApi = {
  async fetchProjects() {
    return { page: 1, max_pages: 1, projects };
  },
  async fetchProject(projectId) {
    return findProject(projectId);
  },
  async fetchAnalyses(projectId) {
    return {
      page: 1,
      max_pages: 1,
      analyses: [analysisFor(findProject(projectId))],
    };
  },
  async fetchLatestAnalysis(projectId) {
    return analysisFor(findProject(projectId));
  },
};

createDevApp()
  .registerPlugin(codescenePlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[codesceneApiRef, mockCodeSceneApi]]}>
        <CodeScenePage />
      </TestApiProvider>
    ),
    icon: CodeSceneIcon,
    title: 'Root Page',
    path: '/codescene',
  })
  .addPage({
    element: (
      <TestApiProvider apis={[[codesceneApiRef, mockCodeSceneApi]]}>
        <CodeSceneProjectDetailsPage />
      </TestApiProvider>
    ),
    title: 'Details Page',
    path: '/codescene/:projectId',
  })
  .render();
