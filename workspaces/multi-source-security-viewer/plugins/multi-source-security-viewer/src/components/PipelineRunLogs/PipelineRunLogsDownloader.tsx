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

import { Fragment } from 'react';
import { downloadLogFile } from '@janus-idp/shared-react';
import { Box, createStyles, makeStyles, Link, Theme } from '@material-ui/core';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import { PipelineRunResult } from '../../models/pipelineRunResult';

interface PipelineRunLogsDowloaderProps {
  pr: PipelineRunResult;
  activeStep: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    downloadLink: {
      verticalAlign: '-0.180em',
      marginLeft: theme.spacing(2),
    },
  }),
);

export const PipelineRunLogsDownloader: FC<PipelineRunLogsDowloaderProps> = ({
  pr,
  activeStep,
}) => {
  const classes = useStyles();
  const fullLogsFilename = `${pr.id || 'pipelinerun'}-logs.txt`;
  const stepLogsFilename = `${pr.id || 'pipelinerun'}-step-${
    pr?.steps[activeStep]?.name || activeStep
  }-logs.txt`;

  return (
    <Fragment>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Link
          component="button"
          variant="body2"
          disabled={!pr.logs}
          data-testid="download-logfile"
          download
          onClick={() => downloadLogFile(pr.logs, fullLogsFilename)}
        >
          <DownloadIcon className={classes.downloadLink} /> Download
        </Link>
        <Link
          component="button"
          variant="body2"
          download
          data-testid="download-logstep"
          disabled={!pr?.steps[activeStep]?.logs}
          onClick={() =>
            downloadLogFile(pr.steps[activeStep].logs, stepLogsFilename)
          }
        >
          <DownloadIcon className={classes.downloadLink} /> Download all tasks
          logs
        </Link>
      </Box>
    </Fragment>
  );
};
