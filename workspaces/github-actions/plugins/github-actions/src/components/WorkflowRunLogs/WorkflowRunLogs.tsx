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

import { Entity } from '@backstage/catalog-model';
import { LogViewer } from '@backstage/core-components';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Modal from '@material-ui/core/Modal';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Zoom from '@material-ui/core/Zoom';
import { makeStyles } from '@material-ui/core/styles';
import DescriptionIcon from '@material-ui/icons/Description';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { useDownloadWorkflowRunLogs } from './useDownloadWorkflowRunLogs';
import { getHostnameFromEntity } from '../getHostnameFromEntity';

const useStyles = makeStyles(theme => ({
  button: {
    order: -1,
    marginRight: 0,
    marginLeft: '-20px',
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    width: '85%',
    height: '85%',
    justifyContent: 'center',
    margin: 'auto',
  },
  normalLogContainer: {
    height: '75vh',
    width: '100%',
  },
  modalLogContainer: {
    height: '100%',
    width: '100%',
  },
  log: {
    background: theme.palette.background.default,
  },
}));

/**
 * A component for Run Logs visualization.
 */
export const WorkflowRunLogs = ({
  entity,
  runId,
  inProgress,
}: {
  entity: Entity;
  runId: number;
  inProgress: boolean;
}) => {
  const classes = useStyles();
  const projectName = getProjectNameFromEntity(entity);

  const hostname = getHostnameFromEntity(entity);
  const [owner, repo] = (projectName && projectName.split('/')) || [];
  const jobLogs = useDownloadWorkflowRunLogs({
    hostname,
    owner,
    repo,
    id: runId,
  });
  const logText = jobLogs.value ? String(jobLogs.value) : undefined;
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }} disabled={inProgress}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        IconButtonProps={{
          className: classes.button,
        }}
      >
        <Typography variant="button">
          {jobLogs.loading ? <CircularProgress /> : 'Job Log'}
        </Typography>
        <Tooltip title="Open Log" TransitionComponent={Zoom} arrow>
          <DescriptionIcon
            onClick={event => {
              event.stopPropagation();
              handleOpen();
            }}
            style={{ marginLeft: 'auto' }}
          />
        </Tooltip>
        <Modal
          className={classes.modal}
          onClick={event => event.stopPropagation()}
          open={open}
          onClose={handleClose}
        >
          <Fade in={open}>
            <div className={classes.modalLogContainer}>
              <LogViewer
                text={logText ?? 'No Values Found'}
                classes={{ root: classes.log }}
              />
            </div>
          </Fade>
        </Modal>
      </AccordionSummary>
      {logText && (
        <div className={classes.normalLogContainer}>
          <LogViewer text={logText} classes={{ root: classes.log }} />
        </div>
      )}
    </Accordion>
  );
};
