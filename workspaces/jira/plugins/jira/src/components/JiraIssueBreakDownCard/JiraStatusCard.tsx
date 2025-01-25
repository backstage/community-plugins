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
import { ErrorPanel, LinearGauge } from '@backstage/core-components';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { Issue } from '../../types';
import { countStatuses, getStatusAndProgress } from '../../utils';
import { JiraStatusTable } from './JiraStatusTable';

const useStyles = makeStyles(() => ({
  HeaderAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  linearGaugeContainer: {
    height: '25px',
    width: '150px',
  },
  title: {
    fontWeight: 'bold',
    marginLeft: '16px',
  },
}));

/**
 * @public
 * Props for the JiraStatusCard component.
 */
export interface JiraStatusCardProps {
  /**
   * An optional array of issues to be displayed in the card.
   */
  issues?: Issue[];

  /**
   * The title of the status card.
   */
  title: string;

  /**
   * The status string for "To Do" items in the Jira breakdown.
   */
  jiraBreakdownTodoStatus?: string;

  /**
   * The status string for "In Progress" items in the Jira breakdown.
   */
  jiraBreakdownInProgressStatus?: string;

  /**
   * The status string for "Blocked" items in the Jira breakdown.
   */
  jiraBreakdownBlockStatus?: string;

  /**
   * The status string for "Done" items in the Jira breakdown.
   */
  jiraBreakdownDoneStatus?: string;

  /**
   * A boolean indicating whether the data is currently loading.
   */
  loading?: boolean;
}

/**
 * @public
 *
 * JiraStatusCard component displays a card with a breakdown of Jira issues by status.
 *
 * @param {JiraStatusCardProps} props - The properties for the JiraStatusCard component.
 * @param {Array} props.issues - The list of Jira issues to be displayed.
 * @param {string} props.title - The title of the card.
 * @param {string} props.jiraBreakdownTodoStatus - The status representing "To Do" in Jira.
 * @param {string} props.jiraBreakdownInProgressStatus - The status representing "In Progress" in Jira.
 * @param {string} props.jiraBreakdownBlockStatus - The status representing "Blocked" in Jira.
 * @param {string} props.jiraBreakdownDoneStatus - The status representing "Done" in Jira.
 * @param {boolean} props.loading - Indicates if the data is currently loading.
 *
 * @returns {JSX.Element} The rendered JiraStatusCard component.
 */
export const JiraStatusCard: React.FC<JiraStatusCardProps> = ({
  issues,
  title,
  jiraBreakdownTodoStatus,
  jiraBreakdownInProgressStatus,
  jiraBreakdownBlockStatus,
  jiraBreakdownDoneStatus,
  loading,
}) => {
  const classes = useStyles();

  if (
    issues &&
    jiraBreakdownTodoStatus &&
    jiraBreakdownInProgressStatus &&
    jiraBreakdownBlockStatus &&
    jiraBreakdownDoneStatus
  ) {
    const statuses = issues.map(issue => issue.status.name);
    const counts = countStatuses(
      statuses,
      jiraBreakdownTodoStatus,
      jiraBreakdownInProgressStatus,
      jiraBreakdownBlockStatus,
      jiraBreakdownDoneStatus,
    );

    const { color, progress } = getStatusAndProgress(counts, statuses.length);

    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" className={classes.title}>
            {title}
          </Typography>
          <Box className={classes.HeaderAction}>
            <Typography>{`${Math.round(progress * 100)}%`}</Typography>
            <Box className={classes.linearGaugeContainer}>
              <LinearGauge value={progress} getColor={() => color} />
            </Box>
          </Box>
        </Box>
        <Box>
          <JiraStatusTable issues={issues} loading={loading} />
        </Box>
      </Box>
    );
  }
  return (
    <ErrorPanel
      error={
        new Error(
          'JiraStatusCard could not be rendered due to missing data or configuration',
        )
      }
    />
  );
};
