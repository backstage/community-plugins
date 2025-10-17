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
import { useState, useEffect, useMemo } from 'react';

import { LogViewer, Progress } from '@backstage/core-components';

import { V1Pod } from '@kubernetes/client-node';
import { Paper } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import {
  getTaskRunsForPipelineRun,
  pipelineRunFilterReducer,
  PipelineRunKind,
  TaskRunKind,
} from '@janus-idp/shared-react';

import { getActiveTaskRun, getSortedTaskRuns } from '../../utils/taskRun-utils';
import { PipelineRunLogViewer } from './PipelineRunLogViewer';
import { TaskStatusStepper } from './TaskStatusStepper';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

type PipelineRunLogsProps = {
  pipelineRun: PipelineRunKind;
  taskRuns: TaskRunKind[];
  pods: V1Pod[];
  activeTask?: string;
  setActiveTask: (t: string) => void;
};
export const PipelineRunLogs = ({
  pipelineRun,
  taskRuns,
  pods,
  activeTask,
  setActiveTask,
}: PipelineRunLogsProps) => {
  const PLRTaskRuns = getTaskRunsForPipelineRun(pipelineRun, taskRuns);
  const sortedTaskRuns = getSortedTaskRuns(PLRTaskRuns);
  const taskRunFromYaml = PLRTaskRuns?.reduce(
    (acc: { [value: string]: TaskRunKind }, value) => {
      if (value?.metadata?.name) {
        acc[value.metadata.name] = value;
      }
      return acc;
    },
    {},
  );

  const completed = pipelineRunFilterReducer(pipelineRun);
  const [lastActiveStepId, setLastActiveStepId] = useState<string>('');
  const { t } = useTranslationRef(tektonTranslationRef);

  useEffect(() => {
    const mostRecentFailedOrActiveStep = sortedTaskRuns.find(tr =>
      ['Failed', 'Running'].includes(tr.status),
    );

    if (completed && !mostRecentFailedOrActiveStep && !activeTask) {
      setLastActiveStepId(sortedTaskRuns[sortedTaskRuns.length - 1]?.id);
      return;
    }

    setLastActiveStepId(
      !activeTask ? (mostRecentFailedOrActiveStep?.id as string) : '',
    );
  }, [sortedTaskRuns, completed, activeTask]);

  const currentStepId = activeTask || lastActiveStepId;
  const activeItem = getActiveTaskRun(sortedTaskRuns, currentStepId);
  const podName =
    activeItem && taskRunFromYaml?.[currentStepId]?.status?.podName;
  const podData = useMemo(
    () =>
      pods.find(pod => {
        return pod?.metadata?.name === podName;
      }),
    [pods, podName],
  );

  return (
    <Grid container>
      <Grid item xs={3}>
        <Paper>
          <TaskStatusStepper
            steps={sortedTaskRuns}
            currentStepId={currentStepId}
            onUserStepChange={setActiveTask}
          />
        </Paper>
      </Grid>
      <Grid item xs={9}>
        {!currentStepId && <Progress />}
        <div style={{ height: '80vh' }}>
          {!podData ? (
            <Paper
              elevation={1}
              style={{ height: '100%', width: '100%', minHeight: '30rem' }}
            >
              <LogViewer text={t('pipelineRunLogs.noLogs')} />
            </Paper>
          ) : (
            <PipelineRunLogViewer pod={podData} />
          )}
        </div>
      </Grid>
    </Grid>
  );
};

export default PipelineRunLogs;
