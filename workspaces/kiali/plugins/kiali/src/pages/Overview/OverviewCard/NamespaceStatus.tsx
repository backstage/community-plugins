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
  DEGRADED,
  DurationInSeconds,
  FAILURE,
  HEALTHY,
  IntervalInMilliseconds,
  NOT_READY,
} from '@backstage-community/plugin-kiali-common/types';
import { Paths } from '../../../config';
import { NamespaceInfo } from '../NamespaceInfo';
import { switchType } from '../OverviewHelper';
import { OverviewStatus } from '../OverviewStatus';
import { OverviewType } from '../OverviewToolbar';

type NamespaceStatusProps = {
  namespace: NamespaceInfo;
  type: OverviewType;
  duration: DurationInSeconds;
  refreshInterval: IntervalInMilliseconds;
};

export const NamespaceStatus = (props: NamespaceStatusProps) => {
  const ns = props.namespace;
  const health = props.namespace.status;
  const targetPage = switchType(
    props.type,
    Paths.APPLICATIONS,
    Paths.SERVICES,
    Paths.WORKLOADS,
  );
  const name = ns.name;
  let nbItems = 0;
  if (health) {
    nbItems =
      health.inError.length +
      health.inWarning.length +
      health.inSuccess.length +
      health.notAvailable.length +
      health.inNotReady.length;
  }
  let text: string;
  if (nbItems === 1) {
    text = switchType(props.type, '1 application', '1 service', '1 workload');
  } else {
    text = `${nbItems}${switchType(
      props.type,
      ' applications',
      ' services',
      ' workloads',
    )}`;
  }
  const mainLink = (
    <div
      style={{ display: 'inline-block', width: '125px', whiteSpace: 'nowrap' }}
      data-test={`overview-type-${props.type}`}
    >
      {text}
    </div>
  );
  if (nbItems === ns.status?.notAvailable.length) {
    return (
      <div style={{ textAlign: 'left' }}>
        <span>
          {mainLink}
          <div style={{ display: 'inline-block', marginLeft: '5px' }}>N/A</div>
        </span>
      </div>
    );
  }
  return (
    <div style={{ textAlign: 'left' }}>
      <span>
        {mainLink}
        <div
          style={{ display: 'inline-block' }}
          data-test="overview-app-health"
        >
          {ns.status && ns.status.inNotReady.length > 0 && (
            <OverviewStatus
              id={`${name}-not-ready`}
              namespace={name}
              status={NOT_READY}
              items={ns.status.inNotReady}
              targetPage={targetPage}
              duration={props.duration}
              refreshInterval={props.refreshInterval}
            />
          )}
          {ns.status && ns.status.inError.length > 0 && (
            <OverviewStatus
              id={`${name}-failure`}
              namespace={name}
              status={FAILURE}
              items={ns.status.inError}
              targetPage={targetPage}
              duration={props.duration}
              refreshInterval={props.refreshInterval}
            />
          )}
          {ns.status && ns.status.inWarning.length > 0 && (
            <OverviewStatus
              id={`${name}-degraded`}
              namespace={name}
              status={DEGRADED}
              items={ns.status.inWarning}
              targetPage={targetPage}
              duration={props.duration}
              refreshInterval={props.refreshInterval}
            />
          )}
          {ns.status && ns.status.inSuccess.length > 0 && (
            <OverviewStatus
              id={`${name}-healthy`}
              namespace={name}
              status={HEALTHY}
              items={ns.status.inSuccess}
              targetPage={targetPage}
              duration={props.duration}
              refreshInterval={props.refreshInterval}
            />
          )}
        </div>
      </span>
    </div>
  );
};
