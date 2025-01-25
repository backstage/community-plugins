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
import { Link } from '@backstage/core-components';
import Grid from '@mui/material/Grid';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Issue } from '../../types';
import { useBuildJiraUrl } from '../../hooks/useAppConfig';
import { JiraStatusCard } from './JiraStatusCard';

const useStyles = makeStyles(theme => ({
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  noActivitiesContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  noActivitiesText: {
    display: 'flex',
    justifyContent: 'center',
  },
  epicDetails: {
    marginBottom: theme.spacing(1),
    marginLeft: '15px',
  },
  gridContainer: {
    maxHeight: '870px',
    overflow: 'auto',
    paddingLeft: '15px',
    paddingRight: '4px',
    paddingBottom: '4px',
  },
}));

interface JiraStatusesCardProps {
  issuesMap?: Map<string, Issue[]>;
  jiraEpic: string;
  jiraEpicSummary: string;
  jiraBreakdownTodoStatus?: string;
  jiraBreakdownInProgressStatus?: string;
  jiraBreakdownBlockStatus?: string;
  jiraBreakdownDoneStatus?: string;
  loading?: boolean;
}

/**
 * @public
 *
 * JiraStatusBreakDownCard component displays a breakdown of Jira issues by status for a given Jira Epic.
 *
 * @param {JiraStatusesCardProps} props - The properties for the component.
 * @param {string} props.jiraEpic - The Jira Epic identifier.
 * @param {string} props.jiraEpicSummary - A summary of the Jira Epic.
 * @param {Map<string, Issue[]>} props.issuesMap - A map of issues categorized by their status.
 * @param {string} props.jiraBreakdownTodoStatus - The status representing "To Do" in the breakdown.
 * @param {string} props.jiraBreakdownInProgressStatus - The status representing "In Progress" in the breakdown.
 * @param {string} props.jiraBreakdownBlockStatus - The status representing "Blocked" in the breakdown.
 * @param {string} props.jiraBreakdownDoneStatus - The status representing "Done" in the breakdown.
 * @param {boolean} props.loading - A flag indicating whether the data is currently loading.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const JiraStatusBreakDownCard: React.FC<JiraStatusesCardProps> = ({
  jiraEpic,
  jiraEpicSummary,
  issuesMap,
  jiraBreakdownTodoStatus,
  jiraBreakdownInProgressStatus,
  jiraBreakdownBlockStatus,
  jiraBreakdownDoneStatus,
  loading,
}) => {
  const classes = useStyles();
  const url = useBuildJiraUrl(jiraEpic);

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (!issuesMap || issuesMap.size === 0) {
    return (
      <Box className={classes.noActivitiesContainer}>
        <Typography variant="h6">
          Jira Epic - <Link to={url}>{jiraEpic}</Link> - {jiraEpicSummary}
        </Typography>
        <Box className={classes.noActivitiesText}>No activities found.</Box>
      </Box>
    );
  }

  return (
    <>
      <Box>
        <Typography variant="body1" className={classes.epicDetails}>
          <strong>Jira Epic</strong> - <Link to={url}>{jiraEpic}</Link> -{' '}
          {jiraEpicSummary}
        </Typography>
      </Box>
      <Box className={classes.gridContainer}>
        <Grid container spacing={1}>
          {Array.from(issuesMap.entries()).map(([status, issues]) => (
            <Grid item xs={12} key={status}>
              <JiraStatusCard
                title={status}
                issues={issues}
                jiraBreakdownTodoStatus={jiraBreakdownTodoStatus}
                jiraBreakdownInProgressStatus={jiraBreakdownInProgressStatus}
                jiraBreakdownBlockStatus={jiraBreakdownBlockStatus}
                jiraBreakdownDoneStatus={jiraBreakdownDoneStatus}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};
