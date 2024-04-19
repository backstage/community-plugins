/*
 * Copyright 2020 The Backstage Authors
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
import { SentryIssue } from '../../api';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from '@backstage/core-components';

function stripText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 260,
    position: 'relative',
    '&::before': {
      left: -16,
      position: 'absolute',
      width: '4px',
      height: '100%',
      content: '""',
      backgroundColor: theme.palette.status.error,
      borderRadius: 2,
    },
  },
  text: {
    marginBottom: 0,
  },
}));

export const ErrorCell = ({ sentryIssue }: { sentryIssue: SentryIssue }) => {
  const classes = useStyles();
  let issueType = '[No Type]';
  if (sentryIssue.metadata.type) {
    issueType = sentryIssue.metadata.type;
  } else if (sentryIssue.title) {
    issueType = sentryIssue.title;
  }

  return (
    <div className={classes.root}>
      <Link to={sentryIssue.permalink}>
        <Typography variant="body1" gutterBottom className={classes.text}>
          {stripText(issueType, 28)}
        </Typography>
      </Link>
      <Typography
        variant="caption"
        display="block"
        gutterBottom
        className={classes.text}
      >
        {sentryIssue.metadata.value &&
          stripText(sentryIssue.metadata.value, 48)}
      </Typography>
    </div>
  );
};
