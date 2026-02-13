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

import {
  StatusPending,
  StatusRunning,
  StatusOK,
  StatusWarning,
  StatusAborted,
  StatusError,
} from '@backstage/core-components';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  statusIcon: {
    '& svg': {
      position: 'static',
    },
  },
}));

export const WorkflowRunStatus = (props: {
  status?: string;
  conclusion?: string;
}) => {
  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center">
      <Box className={classes.statusIcon}>
        <WorkflowIcon {...props} />
      </Box>
      <Typography variant="body2">{getStatusDescription(props)}</Typography>
    </Box>
  );
};

export function WorkflowIcon({
  status,
  conclusion,
}: {
  status?: string;
  conclusion?: string;
}) {
  if (status === undefined) return null;
  switch (status.toLocaleLowerCase('en-US')) {
    case 'queued':
      return <StatusPending />;

    case 'in_progress':
      return <StatusRunning />;
    case 'completed':
      switch (conclusion?.toLocaleLowerCase('en-US')) {
        case 'skipped':
        case 'cancelled':
          return <StatusAborted />;

        case 'timed_out':
          return <StatusWarning />;
        case 'failure':
          return <StatusError />;
        default:
          return <StatusOK />;
      }
    default:
      return <StatusPending />;
  }
}

export function getStatusDescription({
  status,
  conclusion,
}: {
  status?: string;
  conclusion?: string;
}) {
  if (status === undefined) return '';
  switch (status.toLocaleLowerCase('en-US')) {
    case 'queued':
      return 'Queued';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      switch (conclusion?.toLocaleLowerCase('en-US')) {
        case 'skipped':
        case 'cancelled':
          return 'Aborted';
        case 'timed_out':
          return 'Timed out';
        case 'failure':
          return 'Error';
        default:
          return 'Completed';
      }
    default:
      return 'Pending';
  }
}
