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
import { LogViewer, Progress } from '@backstage/core-components';
import {
  TooltipTrigger,
  Accordion,
  AccordionTrigger,
  AccordionPanel,
  Flex,
  Tooltip,
  ButtonIcon,
  Dialog,
  DialogTrigger,
  DialogBody,
} from '@backstage/ui';
import { RiFileTextLine } from '@remixicon/react';
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

  return (
    <div className={styles.accordion}>
      <Accordion isDisabled={inProgress}>
        <Flex align="center">
          <AccordionTrigger title="Job Log">
            {jobLogs.loading && <Progress />}
          </AccordionTrigger>
          <DialogTrigger>
            <TooltipTrigger>
              <ButtonIcon
                aria-label="Open Log"
                icon={<RiFileTextLine size={20} />}
                variant="secondary"
                style={{ marginLeft: 'auto' }}
              />
              <Tooltip>Open Log</Tooltip>
            </TooltipTrigger>
            <Dialog width="85vw" height="85vh">
              <DialogBody>
                <div className={styles.modalLogContainer}>
                  <LogViewer
                    text={logText ?? 'No Values Found'}
                    classes={{ root: styles.log }}
                  />
                </div>
              </DialogBody>
            </Dialog>
          </DialogTrigger>
        </Flex>
        <AccordionPanel>
          {logText && (
            <div className={styles.normalLogContainer}>
              <LogViewer text={logText} classes={{ root: styles.log }} />
            </div>
          )}
        </AccordionPanel>
      </Accordion>
    </div>
  );
};
