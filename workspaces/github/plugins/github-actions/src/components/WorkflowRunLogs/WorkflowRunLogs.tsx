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
import {
  TooltipTrigger,
  Accordion,
  AccordionTrigger,
  AccordionPanel,
  Flex,
} from '@backstage/ui';
import { Tooltip, ButtonIcon } from '@backstage/ui';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Modal from '@material-ui/core/Modal';
import { RiFileTextLine } from '@remixicon/react';
import { useState } from 'react';
import { getProjectNameFromEntity } from '../getProjectNameFromEntity';
import { useDownloadWorkflowRunLogs } from './useDownloadWorkflowRunLogs';
import { getHostnameFromEntity } from '../getHostnameFromEntity';
import styles from './WorkflowRunLogs.module.css';

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
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Accordion isDisabled={inProgress}>
      <Flex align="center">
        <AccordionTrigger title="Job Log">
          {jobLogs.loading && <CircularProgress />}
        </AccordionTrigger>
        <TooltipTrigger>
          <ButtonIcon
            aria-label="Open Log"
            icon={<RiFileTextLine size={20} />}
            variant="secondary"
            onPress={handleOpen}
            style={{ marginLeft: 'auto' }}
          />
          <Tooltip>Open Log</Tooltip>
        </TooltipTrigger>
      </Flex>
      <Modal
        className={styles.modal}
        onClick={event => event.stopPropagation()}
        open={open}
        onClose={handleClose}
      >
        <Fade in={open}>
          <div className={styles.modalLogContainer}>
            <LogViewer
              text={logText ?? 'No Values Found'}
              classes={{ root: styles.log }}
            />
          </div>
        </Fade>
      </Modal>
      <AccordionPanel>
        {logText && (
          <div className={styles.normalLogContainer}>
            <LogViewer text={logText} classes={{ root: styles.log }} />
          </div>
        )}
      </AccordionPanel>
    </Accordion>
  );
};
