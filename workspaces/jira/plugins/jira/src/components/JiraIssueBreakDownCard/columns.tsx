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
import { Link, TableColumn } from '@backstage/core-components';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Issue } from '../../types';
import { useBuildJiraUrl } from '../../hooks/useAppConfig';

const useStyles = makeStyles(theme => ({
  headerStyle: {
    paddingLeft: '16px',
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
  disabledText: {
    color: theme.palette.text.disabled,
  },
}));

const DisabledText: React.FC = () => {
  const classes = useStyles();
  return (
    <Typography className={classes.disabledText} variant="body2">
      N/A
    </Typography>
  );
};

const IssueLink: React.FC<{ issue: Partial<Issue> }> = ({ issue }) => {
  const url = useBuildJiraUrl(issue.key || '');
  return (
    <Typography variant="body2">
      <Link to={url}>{issue.key}</Link> : {issue.summary}
    </Typography>
  );
};

/**
 * @public
 */
export const columnKey: TableColumn<Issue> = {
  title: 'Tasks',
  field: 'issue.key',
  highlight: true,
  type: 'string',
  width: '45%',
  headerStyle: {
    paddingLeft: '16px',
  },
  render: (issue: Partial<Issue>) => {
    if (issue.key) {
      return <IssueLink issue={issue} />;
    }
    return <DisabledText />;
  },
};

/**
 * @public
 */
export const columnStatus: TableColumn<Issue> = {
  title: 'Status',
  field: 'issue.status.key',
  highlight: true,
  type: 'string',
  width: '15%',
  headerStyle: {
    paddingLeft: '16px',
  },
  render: (issue: Partial<Issue>) => {
    return issue.status ? (
      <Typography variant="body2">{issue.status.name}</Typography>
    ) : (
      <DisabledText />
    );
  },
};

/**
 * @public
 */
export const columnAssignee: TableColumn<Issue> = {
  title: 'Assignee',
  field: 'issue.assignee',
  highlight: true,
  type: 'string',
  width: '20%',
  headerStyle: {
    paddingLeft: '16px',
  },
  render: (issue: Partial<Issue>) => {
    return issue.assignee ? (
      <Typography variant="body2">{issue.assignee}</Typography>
    ) : (
      <DisabledText />
    );
  },
};

/**
 * @public
 */
export const columns: TableColumn<Issue>[] = [
  columnKey,
  columnAssignee,
  columnStatus,
];
