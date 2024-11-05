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

import {
  PipelineKind,
  PipelineRunKind,
  pipelineRunStatus,
  Status,
} from '@janus-idp/shared-react';

import ResourceName from '../../../common/components/ResourceName';
import ResourceStatus from '../../../common/components/ResourceStatus';
import { MAXSHOWRESCOUNT } from '../../../const';
import { PipelineRunModel } from '../../../pipeline-models';
import PLRlastUpdated from './PLRlastUpdated';
import TopologyResourcesTabPanelItem from './TopologyResourcesTabPaneltem';

import './PLRlist.css';

type PLRlistProps = {
  pipelines: PipelineKind[];
  pipelineRuns: PipelineRunKind[];
};

const PLRlist = ({ pipelines, pipelineRuns }: PLRlistProps) => {
  return (
    <TopologyResourcesTabPanelItem
      resourceLabel={PipelineRunModel.labelPlural}
      showResCount={
        pipelineRuns.length > MAXSHOWRESCOUNT ? MAXSHOWRESCOUNT : undefined
      }
      dataTest="plr-list"
    >
      {pipelines.map((pl: PipelineKind) => (
        <li className="item" key={pl.metadata?.uid}>
          <span style={{ flex: '1' }}>
            <ResourceName name={pl.metadata?.name ?? ''} kind={pl.kind ?? ''} />
          </span>
        </li>
      ))}
      {pipelineRuns.length > 0 ? (
        pipelineRuns.slice(0, MAXSHOWRESCOUNT).map((plr: PipelineRunKind) => {
          const status = pipelineRunStatus(plr);
          return (
            <li
              className="item"
              style={{ alignItems: 'baseline' }}
              key={plr.metadata?.uid}
            >
              <span style={{ flex: '1' }}>
                <ResourceName
                  name={
                    <span className="bs-topology-pipelinerun">
                      {plr.metadata?.name ?? ''}
                      <PLRlastUpdated plr={plr} />
                    </span>
                  }
                  kind={plr.kind ?? ''}
                />
              </span>
              <span style={{ flex: '1' }}>
                <ResourceStatus
                  additionalClassNames="hidden-xs"
                  noStatusBackground
                >
                  {status ? <Status status={status} /> : '-'}
                </ResourceStatus>
              </span>
            </li>
          );
        })
      ) : (
        <li className="item bs-topology-text-muted">{`No ${PipelineRunModel.labelPlural} found`}</li>
      )}
    </TopologyResourcesTabPanelItem>
  );
};

export default PLRlist;
