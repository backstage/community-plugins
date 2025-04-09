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
import React from 'react';

import { ErrorBoundary } from '@backstage/core-components';

import { V1Pod } from '@kubernetes/client-node';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Theme,
} from '@material-ui/core';
import CloseIcon from '@mui/icons-material/Close';

import { PipelineRunKind, TaskRunKind } from '@janus-idp/shared-react';

import { tektonGroupColor } from '../../types/types';
import ResourceBadge from '../PipelineRunList/ResourceBadge';
import PipelineRunLogDownloader from './PipelineRunLogDownloader';
import PipelineRunLogs from './PipelineRunLogs';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }),
);

type PipelineRunLogDialogProps = {
  open: boolean;
  closeDialog: () => void;
  pipelineRun: PipelineRunKind;
  taskRuns: TaskRunKind[];
  pods: V1Pod[];
  activeTask?: string;
  forSBOM?: boolean;
};
const PipelineRunLogDialog = ({
  open,
  closeDialog,
  pipelineRun,
  pods,
  taskRuns,
  activeTask,
  forSBOM,
}: PipelineRunLogDialogProps) => {
  const classes = useStyles();

  const [task, changeTask] = React.useState(activeTask);
  React.useEffect(() => {
    // If we trigger this dialog for SBOM task, update the current active task.
    changeTask(forSBOM ? activeTask : undefined);
  }, [forSBOM, activeTask]);

  return (
    <Dialog
      data-testid="pipelinerun-logs-dialog"
      maxWidth="xl"
      fullWidth
      open={open}
      onClose={closeDialog}
    >
      <DialogTitle id="pipelinerun-logs" title="PipelineRun Logs">
        <Box className={classes.titleContainer}>
          <ResourceBadge
            color={tektonGroupColor}
            abbr="PLR"
            name={pipelineRun?.metadata?.name ?? ''}
          />
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={closeDialog}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <ErrorBoundary>
          <PipelineRunLogDownloader
            pods={pods}
            activeTask={activeTask}
            pipelineRun={pipelineRun}
          />
          <PipelineRunLogs
            pipelineRun={pipelineRun}
            taskRuns={taskRuns}
            pods={pods}
            activeTask={task}
            setActiveTask={changeTask}
          />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(PipelineRunLogDialog);
