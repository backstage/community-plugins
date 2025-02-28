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
import { Content, Link } from '@backstage/core-components';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import parse, { domToReact } from 'html-react-parser';
import { Box, Paper, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useActivityStream } from '../../hooks';

interface LatestUpdatesCardProps {
  issues: string[];
  projectKey: string;
  loading: boolean;
}
const DEFAULT_ACTIVITY_STREAM_FETCH_LIMIT = 10;

const useStyles = makeStyles({
  list: {
    width: '100%',
  },
  paper: {
    marginBottom: 8,
    borderRadius: '10px',
  },
  bold: {
    fontWeight: 'bold',
  },
});

/**
 * @public
 *
 * Component that renders the content for the latest Jira updates.
 *
 * @component
 * @param {LatestUpdatesCardProps} props - The properties for the component.
 * @param {Array} props.issues - The list of issues to fetch activities for.
 * @param {string} props.projectKey - The key of the project to fetch activities for.
 * @param {boolean} props.loading - Indicates if the data is currently loading.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const JiraUpdatesContent: React.FC<LatestUpdatesCardProps> = ({
  issues,
  projectKey,
  loading,
}) => {
  const classes = useStyles();
  const { activities, activitiesLoading, activitiesError } = useActivityStream(
    DEFAULT_ACTIVITY_STREAM_FETCH_LIMIT,
    issues,
    projectKey,
    loading,
  );

  if (loading || activitiesLoading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (activitiesError) {
    return (
      <Typography>
        Error loading activities: {activitiesError.message}
      </Typography>
    );
  }

  if (!activities || activities.length === 0) {
    return <Typography>No activities found.</Typography>;
  }

  const formatTitleOptions = () => {
    let firstLinkRemoved = false;

    return {
      replace: (domNode: any) => {
        if (domNode.name === 'a') {
          if (!firstLinkRemoved) {
            firstLinkRemoved = true;
            return <Typography>{domToReact(domNode.children)}</Typography>;
          }
          return (
            <Link to={domNode.attribs.href || ''} className={classes.bold}>
              {domToReact(domNode.children)}
            </Link>
          );
        }
        if (firstLinkRemoved && domNode.type === 'text') {
          return (
            <Typography className={classes.bold}>{domNode.data}</Typography>
          );
        }
        return domNode;
      },
    };
  };

  const renderActivityTitle = (title: string) => {
    return parse(title, formatTitleOptions());
  };

  return (
    <List
      className={classes.list}
      style={{ maxHeight: '400px', overflowY: 'auto' }}
    >
      {activities.map(activity => (
        <React.Fragment>
          <Paper variant="outlined" className={classes.paper}>
            <Content>
              <Typography variant="subtitle2">{activity.time.value}</Typography>
              <Typography variant="body1">
                {renderActivityTitle(activity.title)}
              </Typography>
            </Content>
          </Paper>
        </React.Fragment>
      ))}
    </List>
  );
};
