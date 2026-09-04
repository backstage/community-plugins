/*
 * Copyright 2022 The Backstage Authors
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
import { JSX } from 'react';
import { apacheAirflowApiRef } from '../../api';
import useAsync from 'react-use/esm/useAsync';
import { DagRun } from '../../api/types/Dags';
import { useApi } from '@backstage/core-plugin-api';
import { Box, Text, Tooltip } from '@backstage/ui';
import {
  Progress,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
} from '@backstage/core-components';
import qs from 'qs';
import { TooltipTrigger } from 'react-aria-components';
import styles from './LatestDagRunsStatus.module.css';
import { DagRunTooltipContent } from './DagRunTooltipContent';

interface LatestDagRunsStatusProps {
  dagId: string;
  limit?: number;
}

export const LatestDagRunsStatus = ({
  dagId,
  limit = 5,
}: LatestDagRunsStatusProps) => {
  const apiClient = useApi(apacheAirflowApiRef);
  const { value, loading, error } = useAsync(
    async (): Promise<DagRun[]> => await apiClient.getDagRuns(dagId, { limit }),
    [dagId, limit],
  );

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <Text>Can't get dag runs</Text>;
  }

  const statusDots: JSX.Element[] | undefined = value?.map(dagRun => {
    function status() {
      switch (dagRun.state) {
        case 'success':
          return <StatusOK />;
        case 'failed':
          return <StatusError />;
        case 'running':
          return <StatusRunning />;
        case 'queued':
          return <StatusPending />;
        default:
          return <Text>Unrecognized state</Text>;
      }
    }

    const key = dagRun.dag_id + dagRun.dag_run_id;
    const dagRunParams = {
      dag_id: dagRun.dag_id,
      execution_date: dagRun.logical_date,
    };
    const graphUrl = `${apiClient.baseUrl}graph?${qs.stringify(dagRunParams)}`;
    return (
      <TooltipTrigger key={key}>
        <Box className={styles.statusDot}>{status()}</Box>
        <Tooltip className={styles.tooltipContent}>
          <DagRunTooltipContent dagRun={dagRun} graphUrl={graphUrl} />
        </Tooltip>
      </TooltipTrigger>
    );
  });

  return <Box className={styles.runsContainer}>{statusDots}</Box>;
};
