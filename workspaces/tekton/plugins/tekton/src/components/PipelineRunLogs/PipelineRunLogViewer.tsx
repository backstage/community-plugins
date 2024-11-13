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

import { DismissableBanner, LogViewer } from '@backstage/core-components';

import { V1Container, V1Pod } from '@kubernetes/client-node';
import { Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { usePodLogsOfPipelineRun } from '../../hooks/usePodLogsOfPipelineRun';

type PipelineRunLogViewerProps = { pod: V1Pod };

export const PipelineRunLogViewer = ({ pod }: PipelineRunLogViewerProps) => {
  const { value, error, loading } = usePodLogsOfPipelineRun({
    pod,
  });

  const containersList = pod?.spec?.containers || [];
  let text = '';

  text = containersList.reduce(
    (acc: string, container: V1Container, idx: number) => {
      if (container?.name && value?.[idx]?.text) {
        return acc
          .concat(
            `${container.name.toLocaleUpperCase('en-US')}\n${value[idx].text}`,
          )
          .concat(idx === containersList.length - 1 ? '' : '\n');
      }
      return acc;
    },
    '',
  );

  return (
    <>
      {error && (
        <DismissableBanner
          message={error?.message}
          variant="error"
          fixed={false}
          id="pod-logs"
        />
      )}
      <Paper
        elevation={1}
        style={{ height: '100%', width: '100%', minHeight: '30rem' }}
      >
        {loading && (
          <Skeleton
            data-testid="logs-skeleton"
            variant="rect"
            width="100%"
            height="100%"
          />
        )}
        {pod && !loading && <LogViewer text={text || 'No Logs found'} />}
      </Paper>
    </>
  );
};
