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
import {
  ObjectValidation,
  Pod,
} from '@backstage-community/plugin-kiali-common/types';
import { EmptyState } from '@backstage/core-components';
import {
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { default as React } from 'react';
import { Labels } from '../../components/Label/Labels';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { SimpleTable, tRow } from '../../components/SimpleTable';
import { LocalTime } from '../../components/Time/LocalTime';
import { KialiIcon } from '../../config/KialiIcon';
import { cardsHeight, kialiStyle } from '../../styles/StyleUtils';
import { PodStatus } from './PodStatus';

type WorkloadPodsProps = {
  namespace: string;
  pods: Pod[];
  validations: { [key: string]: ObjectValidation };
  workload: string;
};

const resourceListStyle = kialiStyle({
  margin: '0 0 0.5rem 0',
  $nest: {
    '& > ul > li > span': {
      float: 'left',
      width: '125px',
      fontWeight: 700,
    },
  },
});

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
});

const iconStyle = kialiStyle({
  display: 'inline-block',
});

export const WorkloadPods: React.FC<WorkloadPodsProps> = (
  props: WorkloadPodsProps,
) => {
  const columns: any[] = [{ title: 'Name' }, { title: 'Status', width: 10 }];

  const noPods: React.ReactNode = (
    <EmptyState
      missing="content"
      title="No Pods"
      description={<div>{`No Pods in workload ${props.workload}`}</div>}
    />
  );

  const rows: tRow = props.pods
    .sort((p1: Pod, p2: Pod) => (p1.name < p2.name ? -1 : 1))
    .map((pod, _podIdx) => {
      let validation: ObjectValidation = {} as ObjectValidation;

      if (props.validations[pod.name]) {
        validation = props.validations[pod.name];
      }

      const podProperties = (
        <div key="properties-list" className={resourceListStyle}>
          <ul style={{ listStyleType: 'none' }}>
            <li>
              <span>Created</span>
              <div style={{ display: 'inline-block' }}>
                <LocalTime time={pod.createdAt} />
              </div>
            </li>

            <li>
              <span>Created By</span>
              <div style={{ display: 'inline-block' }}>
                {pod.createdBy && pod.createdBy.length > 0
                  ? pod.createdBy
                      .map(ref => `${ref.name} (${ref.kind})`)
                      .join(', ')
                  : 'Not found'}
              </div>
            </li>

            <li>
              <span>Service Account</span>
              <div style={{ display: 'inline-block' }}>
                {pod.serviceAccountName ?? 'Not found'}
              </div>
            </li>

            <li>
              <span>Istio Init Container</span>
              <div style={{ display: 'inline-block' }}>
                {pod.istioInitContainers
                  ? pod.istioInitContainers.map(c => `${c.image}`).join(', ')
                  : 'Not found'}
              </div>
            </li>

            <li>
              <span>Istio Container</span>
              <div style={{ display: 'inline-block' }}>
                {pod.istioContainers
                  ? pod.istioContainers.map(c => `${c.image}`).join(', ')
                  : 'Not found'}
              </div>
            </li>

            <li>
              <span>Labels</span>
              <div style={{ display: 'inline-block' }}>
                <Labels labels={pod.labels} expanded />
              </div>
            </li>
          </ul>
        </div>
      );

      return {
        cells: [
          <span>
            <div
              key="service-icon"
              className={iconStyle}
              style={{ display: 'inline-block' }}
            >
              <PFBadge badge={PFBadges.Pod} size="sm" position="top" />
            </div>
            {pod.name}
            <Tooltip
              title={<div style={{ textAlign: 'left' }}>{podProperties}</div>}
            >
              <div style={{ display: 'inline-block' }}>
                <KialiIcon.Info className={infoStyle} />
              </div>
            </Tooltip>
          </span>,
          <PodStatus
            proxyStatus={pod.proxyStatus}
            checks={validation.checks}
          />,
        ],
      };
    });

  return (
    <Card id="WorkloadPodsCard" style={{ height: cardsHeight }}>
      <CardHeader
        title={
          <Typography variant="h6" style={{ margin: '10px' }}>
            Pods
          </Typography>
        }
      />

      <CardContent>
        <SimpleTable
          label="Workload Pod List"
          columns={columns}
          rows={rows}
          emptyState={noPods}
        />
      </CardContent>
    </Card>
  );
};
