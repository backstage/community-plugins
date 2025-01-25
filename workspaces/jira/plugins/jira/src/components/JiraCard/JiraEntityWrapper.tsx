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

import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useAPIEntity, useJiraDetails, useAppConfig } from '../../hooks';
import { useJiraInfo } from '../../hooks/useJiraInfo';
import { Issue } from '../../types';
import { extractBreakDownData, extractEpicSummary } from '../../utils';
import { JiraReleaseStatusLayout } from './JiraReleaseStatusLayout';

/**
 * @public
 * JiraEntityWrapper component fetches and displays Jira details for a specific entity.
 *
 * This component uses several hooks to retrieve data:
 * - `useEntity` to get the current entity.
 * - `useAPIEntity` to fetch project-related information.
 * - `useAppConfig` to get filtered views configuration.
 * - `useJiraDetails` to fetch issues details from Jira.
 * - `useJiraInfo` to get additional Jira information.
 *
 * The component processes the fetched data to extract breakdown data and epic summary.
 * It then renders the `JiraReleaseStatusLayout` component with the processed data.
 *
 * @returns `{JSX.Element}` - The rendered JiraReleaseStatusLayout component with Jira details.
 *
 */
export const JiraEntityWrapper = () => {
  const { entity } = useEntity();
  const project_res = useAPIEntity(entity);
  const filteredViews = useAppConfig();
  let issuesBreakdowns = new Map<string, Issue[]>();
  let jiraEpicSummary = '';
  const { issues, loading, error } = useJiraDetails(
    project_res.projectKey,
    project_res.component,
    project_res.label,
    project_res.epicKey,
  );
  const jiraDetails = useJiraInfo(
    project_res.projectKey,
    project_res.component,
    project_res.label,
    project_res.epicKey,
  );
  if (jiraDetails?.issues) {
    issuesBreakdowns = extractBreakDownData(
      project_res.epicKey,
      jiraDetails?.issues,
      filteredViews,
    );
    jiraEpicSummary =
      extractEpicSummary(jiraDetails.issues, project_res.epicKey) || '';
  }
  return (
    <JiraReleaseStatusLayout
      jiraEpic={project_res.epicKey}
      jiraEpicSummary={jiraEpicSummary}
      issues={issues}
      projectKey={project_res.projectKey}
      loading={loading}
      issuesBreakdowns={issuesBreakdowns}
      jiraBreakdownTodoStatus={project_res.jiraBreakdownTodoStatus}
      jiraBreakdownInProgressStatus={project_res.jiraBreakdownInProgressStatus}
      jiraBreakdownBlockStatus={project_res.jiraBreakdownBlockStatus}
      jiraBreakdownDoneStatus={project_res.jiraBreakdownDoneStatus}
      errorMessage={error}
    />
  );
};
