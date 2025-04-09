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
import * as React from 'react';

import { kubernetesProxyPermission } from '@backstage/plugin-kubernetes-common';
import { usePermission } from '@backstage/plugin-permission-react';

import { IconButton } from '@material-ui/core';
import { Flex, FlexItem } from '@patternfly/react-core';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';

import {
  ComputedStatus,
  pipelineRunFilterReducer,
  PipelineRunKind,
  TaskRunKind,
} from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import {
  getTaskrunsOutputGroup,
  hasExternalLink,
  isSbomTaskRun,
} from '../../utils/taskRun-utils';
import OutputIcon from '../Icons/OutputIcon';
import ViewLogsIcon from '../Icons/ViewLogsIcon';
import PipelineRunLogDialog from '../PipelineRunLogs/PipelineRunLogDialog';
import PipelineRunOutputDialog from '../PipelineRunOutput/PipelineRunOutputDialog';
import PipelineRunSBOMLink from './PipelineRunSBOMLink';

const PipelineRunRowActions: React.FC<{ pipelineRun: PipelineRunKind }> = ({
  pipelineRun,
}) => {
  const { watchResourcesData } = React.useContext(TektonResourcesContext);
  const [open, setOpen] = React.useState<boolean>(false);

  const [openOutput, setOpenOutput] = React.useState<boolean>(false);
  const pods = watchResourcesData?.pods?.data || [];
  const taskRuns = watchResourcesData?.taskruns?.data || [];
  const { sbomTaskRun } = getTaskrunsOutputGroup(
    pipelineRun?.metadata?.name,
    taskRuns,
  );
  const activeTaskName = sbomTaskRun?.metadata?.name;
  const [forSBOM, toggleForSBOM] = React.useState(activeTaskName !== undefined);

  const hasKubernetesProxyAccess = usePermission({
    permission: kubernetesProxyPermission,
  });

  const openDialog = (opts: { forSBOM: boolean }) => {
    toggleForSBOM(opts.forSBOM);
    setOpen(true);
  };

  const openOutputDialog = () => {
    setOpenOutput(true);
  };

  const closeDialog = () => {
    setOpen(false);
    toggleForSBOM(false);
  };

  const {
    acsImageScanTaskRun,
    acsImageCheckTaskRun,
    acsDeploymentCheckTaskRun,
    ecTaskRun,
  } = getTaskrunsOutputGroup(pipelineRun?.metadata?.name, taskRuns);

  const finishedTaskruns = [
    ...(acsImageScanTaskRun ? [acsImageScanTaskRun] : []),
    ...(acsImageCheckTaskRun ? [acsImageCheckTaskRun] : []),
    ...(acsDeploymentCheckTaskRun ? [acsDeploymentCheckTaskRun] : []),
    ...(ecTaskRun ? [ecTaskRun] : []),
  ].filter((taskRun: TaskRunKind) =>
    [
      ComputedStatus.Succeeded,
      ComputedStatus.Failed,
      ComputedStatus.Skipped,
    ].includes(pipelineRunFilterReducer(taskRun)),
  );

  const results =
    pipelineRun?.status?.pipelineResults || pipelineRun?.status?.results || [];

  const disabled =
    results.length === 0 ? finishedTaskruns.length === 0 : results.length === 0;

  return (
    <>
      <PipelineRunLogDialog
        pipelineRun={pipelineRun}
        open={open}
        closeDialog={closeDialog}
        pods={pods}
        taskRuns={taskRuns}
        activeTask={activeTaskName}
        forSBOM={forSBOM}
      />

      <PipelineRunOutputDialog
        pipelineRun={pipelineRun}
        taskRuns={taskRuns}
        open={openOutput}
        closeDialog={() => {
          setOpenOutput(false);
        }}
      />
      <Flex gap={{ default: 'gapXs' }}>
        <FlexItem>
          <Tooltip
            content={
              hasKubernetesProxyAccess.allowed
                ? 'View logs'
                : 'Unauthorized to view logs'
            }
          >
            <IconButton
              size="small"
              data-testid="view-logs-icon"
              onClick={() => openDialog({ forSBOM: false })}
              disabled={!hasKubernetesProxyAccess.allowed}
              style={{ pointerEvents: 'auto', padding: 0 }}
            >
              <ViewLogsIcon disabled={!hasKubernetesProxyAccess.allowed} />
            </IconButton>
          </Tooltip>
        </FlexItem>

        <FlexItem align={{ default: 'alignLeft' }}>
          <Tooltip
            content={
              !sbomTaskRun
                ? 'View SBOM is not applicable for this PipelineRun'
                : 'View SBOM'
            }
          >
            <IconButton
              data-testid="view-sbom-icon"
              disabled={!sbomTaskRun || !isSbomTaskRun(sbomTaskRun)}
              size="small"
              onClick={
                !hasExternalLink(sbomTaskRun)
                  ? () => {
                      openDialog({ forSBOM: true });
                    }
                  : undefined
              }
              style={{ pointerEvents: 'auto', padding: 0 }}
            >
              <PipelineRunSBOMLink sbomTaskRun={sbomTaskRun} />
            </IconButton>
          </Tooltip>
        </FlexItem>
        <FlexItem align={{ default: 'alignLeft' }}>
          <Tooltip
            content={
              disabled
                ? 'View Output is not applicable for this PipelineRun'
                : 'View Output'
            }
          >
            <IconButton
              data-testid="view-output-icon"
              disabled={disabled}
              size="small"
              onClick={() => openOutputDialog()}
              style={{ pointerEvents: 'auto', padding: 0 }}
            >
              <OutputIcon disabled={disabled} />
            </IconButton>
          </Tooltip>
        </FlexItem>
      </Flex>
    </>
  );
};
export default React.memo(PipelineRunRowActions);
