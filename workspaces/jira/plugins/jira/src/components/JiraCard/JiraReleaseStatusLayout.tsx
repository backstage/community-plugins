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
import Grid from '@mui/material/Grid';
import { Box, Typography } from '@material-ui/core';
import { JiraUpdatesContent } from '../LatestUpateCard';
import { Issue } from '../../types';
import { JiraChartContent } from '../JiraChartCard';
import { JiraStatusBreakDownCard } from '../JiraIssueBreakDownCard';

type JiraLayoutProps = {
  jiraEpic: string;
  jiraEpicSummary: string;
  issues: string[];
  projectKey: string;
  loading: boolean;
  issuesBreakdowns?: Map<string, Issue[]>;
  errorMessage?: string;
  jiraBreakdownTodoStatus?: string;
  jiraBreakdownInProgressStatus?: string;
  jiraBreakdownBlockStatus?: string;
  jiraBreakdownDoneStatus?: string;
};

/**
 * @public
 */
/**
 * JiraReleaseStatusLayout component displays the release status of a Jira epic.
 * It shows a breakdown of issues and their statuses, review tasks, and the latest updates.
 *
 * @param {JiraLayoutProps} props - The properties for the component.
 * @param {object} props.jiraEpic - The Jira epic data.
 * @param {string} props.jiraEpicSummary - The summary of the Jira epic.
 * @param {Array} props.issues - The list of issues related to the Jira epic.
 * @param {string} props.projectKey - The key of the Jira project.
 * @param {boolean} props.loading - Indicates if the data is currently loading.
 * @param {object} props.issuesBreakdowns - The breakdown of issues by status.
 * @param {string} props.jiraBreakdownTodoStatus - The status for "To Do" issues.
 * @param {string} props.jiraBreakdownInProgressStatus - The status for "In Progress" issues.
 * @param {string} props.jiraBreakdownBlockStatus - The status for "Blocked" issues.
 * @param {string} props.jiraBreakdownDoneStatus - The status for "Done" issues.
 * @param {string} props.errorMessage - The error message to display if there are no issues and loading is false.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const JiraReleaseStatusLayout = ({
  jiraEpic,
  jiraEpicSummary,
  issues,
  projectKey,
  loading,
  issuesBreakdowns,
  jiraBreakdownTodoStatus,
  jiraBreakdownInProgressStatus,
  jiraBreakdownBlockStatus,
  jiraBreakdownDoneStatus,
  errorMessage,
}: JiraLayoutProps) => {
  if (issues.length === 0 && !loading) {
    return (
      <Box display="flex" justifyContent="center">
        <Typography variant="body1">{errorMessage}</Typography>
      </Box>
    );
  }
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Box display="flex" flexDirection="column" height="100%">
          <JiraStatusBreakDownCard
            jiraEpic={jiraEpic}
            jiraEpicSummary={jiraEpicSummary}
            issuesMap={issuesBreakdowns}
            jiraBreakdownTodoStatus={jiraBreakdownTodoStatus}
            jiraBreakdownInProgressStatus={jiraBreakdownInProgressStatus}
            jiraBreakdownBlockStatus={jiraBreakdownBlockStatus}
            jiraBreakdownDoneStatus={jiraBreakdownDoneStatus}
            loading={loading}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box display="flex" flexDirection="column" height="100%">
          <Box mb={2} flex={1}>
            <Typography variant="h6">Review Tasks</Typography>
            <JiraChartContent
              issuesBreakdowns={issuesBreakdowns}
              jiraBreakdownTodoStatus={jiraBreakdownTodoStatus}
              jiraBreakdownInProgressStatus={jiraBreakdownInProgressStatus}
              jiraBreakdownBlockStatus={jiraBreakdownBlockStatus}
              jiraBreakdownDoneStatus={jiraBreakdownDoneStatus}
              loading={loading}
            />
          </Box>
          <Box flex={1}>
            <Typography variant="h6">Latest Updates</Typography>
            <JiraUpdatesContent
              issues={issues}
              projectKey={projectKey}
              loading={loading}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
