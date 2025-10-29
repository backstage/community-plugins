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

import { useMemo } from 'react';

import { V1Pod } from '@kubernetes/client-node';
import { Flex, FlexItem } from '@patternfly/react-core';

import { PipelineRunKind } from '@janus-idp/shared-react';

import {
  TEKTON_PIPELINE_RUN,
  TEKTON_PIPELINE_TASK,
  TEKTON_PIPELINE_TASKRUN,
} from '../../consts/tekton-const';
import PodLogsDownloadLink from './PodLogsDownloadLink';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

const PipelineRunLogDownloader: FC<{
  pods: V1Pod[];
  pipelineRun: PipelineRunKind;
  activeTask: string | undefined;
}> = ({ pods, pipelineRun, activeTask }) => {
  const filteredPods: V1Pod[] = pods?.filter(
    (p: V1Pod) =>
      p?.metadata?.labels?.[TEKTON_PIPELINE_RUN] ===
      pipelineRun?.metadata?.name,
  );

  const sortedPods: V1Pod[] = useMemo(
    () =>
      Array.from(filteredPods)?.sort(
        (a: V1Pod, b: V1Pod) =>
          new Date(a?.status?.startTime as Date).getTime() -
          new Date(b?.status?.startTime as Date).getTime(),
      ),
    [filteredPods],
  );
  const { t } = useTranslationRef(tektonTranslationRef);

  const activeTaskPod: V1Pod =
    sortedPods.find(
      (sp: V1Pod) =>
        sp.metadata?.labels?.[TEKTON_PIPELINE_TASKRUN] === activeTask,
    ) ?? sortedPods[sortedPods.length - 1];

  return sortedPods.length > 0 ? (
    <Flex
      data-testid="pipelinerun-logs-downloader"
      justifyContent={{ default: 'justifyContentFlexEnd' }}
    >
      <FlexItem>
        <PodLogsDownloadLink
          data-testid="download-task-logs"
          pods={activeTaskPod ? [activeTaskPod] : []}
          fileName={`${
            activeTaskPod?.metadata?.labels?.[TEKTON_PIPELINE_TASK] ?? 'task'
          }.log`}
          downloadTitle={t('pipelineRunLogs.downloader.downloadTaskLogs')}
        />
      </FlexItem>
      <FlexItem>
        <PodLogsDownloadLink
          data-testid="download-pipelinerun-logs"
          pods={sortedPods}
          fileName={`${pipelineRun?.metadata?.name ?? 'pipelinerun'}.log`}
          downloadTitle={t(
            'pipelineRunLogs.downloader.downloadPipelineRunLogs',
          )}
        />
      </FlexItem>
    </Flex>
  ) : null;
};
export default PipelineRunLogDownloader;
