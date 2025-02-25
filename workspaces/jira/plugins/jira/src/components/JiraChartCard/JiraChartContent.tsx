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
import { GaugeCard } from '@backstage/core-components';
import { Box, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Issue } from '../../types';
import { extractLabelProgress } from '../../utils';

/**
 * @public
 *
 * Props for the JiraChartCard component.
 *
 * @interface JiraChartCardProps
 */
interface JiraChartCardProps {
  issuesBreakdowns?: Map<string, Issue[]>;
  jiraBreakdownTodoStatus?: string;
  jiraBreakdownInProgressStatus?: string;
  jiraBreakdownBlockStatus?: string;
  jiraBreakdownDoneStatus?: string;
  loading?: boolean;
}

const useStyles = makeStyles({
  margin: {
    marginTop: '5px',
  },
});

/**
 * @public
 *
 * JiraChartContent component displays a loading spinner, a message indicating no activities found,
 * or a set of GaugeCards based on the provided Jira breakdown statuses and issue breakdowns.
 *
 * @param {JiraChartCardProps} props - The properties passed to the component.
 * @param {Map<string, any>} props.issuesBreakdowns - A map containing the breakdown of issues.
 * @param {string} props.jiraBreakdownTodoStatus - The status for Jira TODO breakdown.
 * @param {string} props.jiraBreakdownInProgressStatus - The status for Jira In Progress breakdown.
 * @param {string} props.jiraBreakdownBlockStatus - The status for Jira Block breakdown.
 * @param {string} props.jiraBreakdownDoneStatus - The status for Jira Done breakdown.
 * @param {boolean} props.loading - A boolean indicating if the data is still loading.
 *
 * @returns JSX.Element The rendered component.
 */
export const JiraChartContent: React.FC<JiraChartCardProps> = ({
  issuesBreakdowns,
  jiraBreakdownTodoStatus,
  jiraBreakdownInProgressStatus,
  jiraBreakdownBlockStatus,
  jiraBreakdownDoneStatus,
  loading,
}) => {
  const classes = useStyles();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!issuesBreakdowns || (issuesBreakdowns.size === 0 && !loading)) {
    return (
      <Box display="flex" justifyContent="center">
        No activities found.
      </Box>
    );
  }

  if (
    !jiraBreakdownTodoStatus ||
    !jiraBreakdownInProgressStatus ||
    !jiraBreakdownBlockStatus ||
    !jiraBreakdownDoneStatus
  ) {
    return (
      <Box display="flex" justifyContent="left" className={classes.margin}>
        <Typography variant="body1">No activities found</Typography>
      </Box>
    );
  }

  const labelProgressPairs = extractLabelProgress(
    issuesBreakdowns,
    jiraBreakdownTodoStatus,
    jiraBreakdownInProgressStatus,
    jiraBreakdownBlockStatus,
    jiraBreakdownDoneStatus,
  );

  return (
    <Grid container spacing={1}>
      {labelProgressPairs.map(({ label, progress, status, color }, index) => (
        <Grid item key={`${label}-${index}`}>
          <GaugeCard
            variant="flex"
            alignGauge="normal"
            size="small"
            subheader={status}
            title={label}
            progress={progress}
            getColor={() => color}
          />
        </Grid>
      ))}
    </Grid>
  );
};
