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
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress } from '@material-ui/core';
import * as React from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import { WorkloadInfo } from '../../pages/WorkloadDetails/WorkloadInfo';
import { kialiApiRef } from '../../services/Api';
import { WorkloadHealth } from '../../types/Health';
import { DRAWER } from '../../types/types';
import { Workload, WorkloadQuery } from '../../types/Workload';

type Props = {
  namespace: string;
  workload: string;
};
export const WorkloadDetailsDrawer = (props: Props) => {
  const kialiClient = useApi(kialiApiRef);
  const [workloadItem, setWorkloadItem] = React.useState<Workload>();
  const [health, setHealth] = React.useState<WorkloadHealth>();

  const fetchWorkload = async () => {
    const query: WorkloadQuery = {
      health: 'true',
      rateInterval: `60s`,
      validate: 'false',
    };

    kialiClient
      .getWorkload(
        props.namespace ? props.namespace : '',
        props.workload ? props.workload : '',
        query,
      )
      .then((workloadResponse: Workload) => {
        setWorkloadItem(workloadResponse);

        const wkHealth = WorkloadHealth.fromJson(
          props.namespace ? props.namespace : '',
          workloadResponse.name,
          workloadResponse.health,
          {
            rateInterval: 60,
            hasSidecar: workloadResponse.istioSidecar,
            hasAmbient: workloadResponse.istioAmbient,
          },
        );
        setHealth(wkHealth);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchWorkload();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      {workloadItem && (
        <WorkloadInfo
          workload={workloadItem}
          duration={60}
          namespace={props.namespace}
          health={health}
          view={DRAWER}
        />
      )}
    </>
  );
};
