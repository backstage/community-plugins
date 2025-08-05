/*
 * Copyright 2024 The Backstage Authors
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
import type { FC } from 'react';

import { useState, Fragment } from 'react';
import { Box, IconButton, makeStyles, Theme } from '@material-ui/core';
import Tooltip from '@mui/material/Tooltip';
import PipelineRunOutput from './PipelineRunOutput';
import { PipelineRunLogs } from '../PipelineRunLogs/PipelineRunLogs';
import { DialogLauncher } from '../DialogLauncher/DialogLauncher';
import { PipelineRunResult } from '../../models/pipelineRunResult';
import { ViewLogsIcon } from '../Icons/LogsIcon';
import { OutputIcon } from '../Icons/OutputIcon';

const useStyles = makeStyles((theme: Theme) => ({
  boxActions: {
    display: 'flex',
    alignItems: 'left',
    gap: '0.5rem',
  },
  icon: {
    padding: 0,
    '&:nth-child(even)': {
      marginLeft: theme.spacing(1),
    },
  },
}));

type PipelineRunTableRowActionsProps = {
  pr: PipelineRunResult;
};

export const PipelineRunTableRowActions: FC<
  PipelineRunTableRowActionsProps
> = ({ pr }) => {
  const [openOutput, setOpenOutput] = useState(false);
  const [openLogs, setOpenLogs] = useState(false);
  const classes = useStyles();

  return (
    <Fragment>
      <DialogLauncher
        key={`${pr.id}-output`}
        title={pr.id}
        open={openOutput}
        onClose={() => setOpenOutput(false)}
        component={PipelineRunOutput}
        componentProps={{ pr: pr }}
        fullWidth
        maxWidth="xl"
      />
      <DialogLauncher
        key={`${pr.id}-logs`}
        title={pr.id}
        open={openLogs}
        onClose={() => setOpenLogs(false)}
        component={PipelineRunLogs}
        componentProps={{ pr: pr }}
        fullWidth
        maxWidth="xl"
      />
      <Box className={classes.boxActions}>
        <Tooltip
          placement="left"
          title={
            pr.hasSteps ? 'View Logs' : 'Logs are not available for this run'
          }
          arrow
        >
          <Box>
            <IconButton
              data-testid="button-logs"
              className={classes.icon}
              disabled={!pr.hasSteps}
              onClick={() => setOpenLogs(true)}
            >
              <ViewLogsIcon disabled={!pr.hasSteps} />
            </IconButton>
          </Box>
        </Tooltip>
        <Tooltip
          placement="left"
          title={
            pr.hasNoScanResults
              ? 'Scan Results are not available for this run'
              : 'View Scan Results'
          }
          arrow
        >
          <Box>
            <IconButton
              className={classes.icon}
              data-testid="button-output"
              disabled={pr.hasNoScanResults}
              onClick={() => setOpenOutput(true)}
            >
              <OutputIcon disabled={pr.hasNoScanResults} />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
    </Fragment>
  );
};
