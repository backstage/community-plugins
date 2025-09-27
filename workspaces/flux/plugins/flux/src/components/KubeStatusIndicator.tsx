/*
 * Copyright 2025 The Backstage Authors
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
import _ from 'lodash';
import styled from 'styled-components';
import {
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
} from '@backstage/core-components';
import { colors } from '../typedefs/styled';
import Flex from './Flex';
import { Condition } from '../objects';
import reconcile from '../images/reconcile.svg';
import { Tooltip } from '@material-ui/core';

type Props = {
  className?: string;
  conditions: Condition[];
  short?: boolean;
  suspended?: boolean;
};

export enum IconType {
  Error,
  Check,
  Remove,
  Failed,
  Suspended,
  Reconcile,
  Pending,
}

export enum ReadyType {
  Ready = 'Ready',
  NotReady = 'Not Ready',
  Reconciling = 'Reconciling',
  PendingAction = 'PendingAction',
  Suspended = 'Suspended',
  None = 'None',
}

export enum ReadyStatusValue {
  True = 'True',
  False = 'False',
  Unknown = 'Unknown',
  None = 'None',
}

export function computeReady(conditions: Condition[]): ReadyType | undefined {
  if (!conditions?.length) return undefined;
  const readyCondition = _.find(
    conditions,
    c => c.type === 'Ready' || c.type === 'Available',
  );

  if (readyCondition) {
    if (readyCondition.status === ReadyStatusValue.True) {
      return ReadyType.Ready;
    }

    if (readyCondition.status === ReadyStatusValue.Unknown) {
      if (readyCondition.reason === 'Progressing') return ReadyType.Reconciling;
      if (readyCondition.reason === 'TerraformPlannedWithChanges')
        return ReadyType.PendingAction;
    }

    if (readyCondition.status === ReadyStatusValue.None) return ReadyType.None;

    return ReadyType.NotReady;
  }

  if (_.find(conditions, c => c.status === ReadyStatusValue.False)) {
    return ReadyType.NotReady;
  }

  return ReadyType.Ready;
}

export function computeMessage(conditions: Condition[]) {
  if (!conditions?.length) {
    return undefined;
  }

  const readyCondition = _.find(
    conditions,
    c => c.type === 'Ready' || c.type === 'Available',
  );

  if (readyCondition) {
    return readyCondition.message;
  }

  const falseCondition = _.find(
    conditions,
    c => c.status === ReadyStatusValue.False,
  );

  if (falseCondition) {
    return falseCondition.message;
  }

  return conditions[0].message;
}

type IndicatorInfo = {
  icon: IconType;
  color: keyof typeof colors;
  type: ReadyType;
};

export const getIndicatorInfo = (
  suspended: boolean,
  conditions: Condition[],
): IndicatorInfo => {
  if (suspended)
    return {
      icon: IconType.Suspended,
      color: 'feedbackOriginal',
      type: ReadyType.Suspended,
    };
  const ready = computeReady(conditions);
  if (ready === ReadyType.Reconciling)
    return {
      type: ReadyType.Reconciling,
      icon: IconType.Reconcile,
      color: 'primary',
    };
  if (ready === ReadyType.PendingAction)
    return {
      type: ReadyType.PendingAction,
      icon: IconType.Pending,
      color: 'feedbackOriginal',
    };

  if (ready === ReadyType.Ready)
    return {
      type: ReadyType.Ready,
      icon: IconType.Check,
      color: 'successOriginal',
    };
  if (ready === ReadyType.None)
    return {
      type: ReadyType.None,
      icon: IconType.Remove,
      color: 'neutral20',
    };
  return {
    type: ReadyType.NotReady,
    icon: IconType.Failed,
    color: 'alertOriginal',
  };
};

const getBackstageIcon = (color: string) => {
  switch (color) {
    case 'successOriginal':
      return <StatusOK />;

    case 'alertOriginal':
      return <StatusError />;

    case 'feedbackOriginal':
      return <StatusPending />;

    case 'neutral20':
      return <StatusAborted />;

    case 'primary':
      return (
        <img
          alt="reconcile"
          width="13px"
          style={{ marginLeft: '-2px', marginRight: '6px' }}
          src={reconcile}
        />
      );

    default:
      return undefined;
  }
};

export type SpecialObject = 'DaemonSet';

interface DaemonSetStatus {
  currentNumberScheduled: number;
  desiredNumberScheduled: number;
  numberMisscheduled: number;
  numberReady: number;
  numberUnavailable: number;
  observedGeneration: number;
  updatedNumberScheduled: number;
}

const NotReady: Condition = {
  type: ReadyType.Ready,
  status: ReadyStatusValue.False,
  message: 'Not Ready',
};

const Ready: Condition = {
  type: ReadyType.Ready,
  status: ReadyStatusValue.True,
  message: 'Ready',
};

const Unknown: Condition = {
  type: ReadyType.Ready,
  status: ReadyStatusValue.Unknown,
  message: 'Unknown',
};

// Certain objects to not have a status.conditions key, so we generate those conditions
// and feed it into the `KubeStatusIndicator` to keep the public API consistent.
export function createSyntheticCondition(
  kind: SpecialObject,
  // This will eventually be a union type when we add another special object.
  // Example: DaemonSetStatus | CoolObjectStatus | ...
  status: DaemonSetStatus,
): Condition {
  switch (kind) {
    case 'DaemonSet':
      if (status.numberReady === status.desiredNumberScheduled) {
        return Ready;
      }

      return NotReady;

    default:
      return Unknown;
  }
}

function KubeStatusIndicator({
  className,
  conditions,
  short,
  suspended,
}: Props) {
  const { type, color } = getIndicatorInfo(suspended as boolean, conditions);

  let text = computeMessage(conditions);
  if (short || suspended) text = type;

  const ready = _.find(conditions, c => c.type === ReadyType.Ready);

  return (
    <Tooltip title={ready?.message || ''}>
      <div>
        <Flex start className={className} align>
          {getBackstageIcon(color)} {text}
        </Flex>
      </div>
    </Tooltip>
  );
}

export default styled(KubeStatusIndicator).attrs({
  className: KubeStatusIndicator.name,
})``;
