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
import { InfoCard } from '@backstage/core-components';
import { extractBreakDownData, extractEpicSummary } from '../../utils';
import { useJiraInfo } from '../../hooks/useJiraInfo';
import { Issue } from '../../types';
import { useJiraDetails, useAppConfig } from '../../hooks';
import { JiraStatusLayout } from './JiraStatusLayout';

/**
 * @public
 *
 * Props for the JiraWrapper component.
 */
export type JiraWrapperProps = {
  jiraEpic: string;
  jiraBreakdownTodoStatus?: string;
  jiraBreakdownInProgressStatus?: string;
  jiraBreakdownBlockStatus?: string;
  jiraBreakdownDoneStatus?: string;
  title?: string;
  subheader?: any;
};

/**
 * @public
 *
 * JiraWrapper component is responsible for fetching and displaying Jira details
 * for a given Jira epic. It uses custom hooks to fetch Jira details and
 * processes the data to extract breakdown information and epic summary.
 *
 * @param props - The properties passed to the JiraWrapper component.
 *
 * @returns JSX.Element The rendered JiraStatusLayout component with the fetched and processed Jira details.
 */
export const JiraWrapper = (props: JiraWrapperProps) => {
  const projectKey = props.jiraEpic.split('-')[0];
  const filteredViews = useAppConfig();
  let issuesBreakdowns = new Map<string, Issue[]>();
  let jiraEpicSummary = '';
  const { issues, loading, error } = useJiraDetails(
    projectKey,
    '',
    '',
    props.jiraEpic,
  );
  const jiraDetails = useJiraInfo(projectKey, '', '', props.jiraEpic);

  if (jiraDetails?.issues) {
    issuesBreakdowns = extractBreakDownData(
      props.jiraEpic,
      jiraDetails?.issues,
      filteredViews,
    );
    jiraEpicSummary =
      extractEpicSummary(jiraDetails.issues, props.jiraEpic) || '';
  }

  return (
    <InfoCard title={props.title} subheader={props.subheader}>
      <JiraStatusLayout
        jiraEpic={props.jiraEpic}
        jiraEpicSummary={jiraEpicSummary}
        issues={issues}
        projectKey={projectKey}
        loading={loading || jiraDetails.loading}
        issuesBreakdowns={issuesBreakdowns}
        jiraBreakdownTodoStatus={props.jiraBreakdownTodoStatus}
        jiraBreakdownInProgressStatus={props.jiraBreakdownInProgressStatus}
        jiraBreakdownDoneStatus={props.jiraBreakdownDoneStatus}
        jiraBreakdownBlockStatus={props.jiraBreakdownBlockStatus}
        errorMessage={error}
      />
    </InfoCard>
  );
};
