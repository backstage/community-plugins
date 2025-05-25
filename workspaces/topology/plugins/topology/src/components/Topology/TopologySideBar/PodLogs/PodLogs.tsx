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
import type { SetStateAction, Dispatch } from 'react';

import { useEffect } from 'react';

import { DismissableBanner, LogViewer } from '@backstage/core-components';

import Paper from '@mui/material/Paper';
import { Skeleton } from '@mui/lab';

import { usePodLogs } from '../../../../hooks/usePodLogs';
import { ContainerScope } from './types';

type PodLogsProps = {
  podScope: ContainerScope;
  setLogText: Dispatch<SetStateAction<string>>;
  stopPolling: boolean;
};

export const PodLogs = ({
  podScope,
  setLogText,
  stopPolling,
}: PodLogsProps) => {
  const { value, error, loading } = usePodLogs({
    podScope: podScope,
    stopPolling,
  });

  useEffect(() => {
    if (!loading && value !== undefined) setLogText(value.text);
  }, [loading, setLogText, value]);

  return (
    <>
      {error && (
        <DismissableBanner
          {...{
            message: error.message,
            variant: 'error',
            fixed: false,
          }}
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
            variant="rectangular"
            width="100%"
            height="100%"
          />
        )}
        {!loading && value !== undefined && <LogViewer text={value.text} />}
      </Paper>
    </>
  );
};
