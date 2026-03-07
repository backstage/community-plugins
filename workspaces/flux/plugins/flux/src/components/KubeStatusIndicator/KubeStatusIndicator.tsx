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
import { Text, Flex, Tooltip, TooltipTrigger } from '@backstage/ui';
import {
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiIndeterminateCircleLine,
  RiRefreshLine,
} from '@remixicon/react';

import { Condition } from '../../objects';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from '../utils.module.css';

export function StatusAborted(props: PropsWithChildren<{}>) {
  const { children, ...otherProps } = props;
  return (
    <Text
      className={classNames(styles.status)}
      aria-label="Status aborted"
      aria-hidden="true"
      {...otherProps}
    >
      <RiCloseCircleLine
        className={classNames(
          styles.ok,
          styles.statusIcon,
          styles.statusIconSizeForImg,
        )}
      />
      {children}
    </Text>
  );
}

export function StatusError(props: PropsWithChildren<{}>) {
  const { children, ...otherProps } = props;
  return (
    <Text
      className={classNames(styles.status)}
      aria-label="Status error"
      aria-hidden="true"
      {...otherProps}
    >
      <RiErrorWarningLine
        className={classNames(
          styles.error,
          styles.statusIcon,
          styles.statusIconSizeForImg,
        )}
      />
      {children}
    </Text>
  );
}

export function StatusOK(props: PropsWithChildren<{}>) {
  const { children, ...otherProps } = props;
  return (
    <Text
      className={classNames(styles.status)}
      aria-label="Status running"
      aria-hidden="true"
      {...otherProps}
    >
      <RiCheckboxCircleLine
        className={classNames(
          styles.ok,
          styles.statusIcon,
          styles.statusIconSizeForImg,
        )}
      />
      {children}
    </Text>
  );
}

export function StatusPending(props: PropsWithChildren<{}>) {
  const { children, ...otherProps } = props;
  return (
    <Text
      className={classNames(styles.status)}
      aria-label="Status pending"
      aria-hidden="true"
      {...otherProps}
    >
      <RiIndeterminateCircleLine
        className={classNames(
          styles.pending,
          styles.statusIcon,
          styles.statusIconSizeForImg,
        )}
      />
      {children}
    </Text>
  );
}

export function StatusReconciling(props: PropsWithChildren<{}>) {
  const { children, ...otherProps } = props;
  return (
    <Text
      className={classNames(styles.status)}
      aria-label="Status running"
      aria-hidden="true"
      {...otherProps}
    >
      <RiRefreshLine
        className={classNames(
          styles.reconciling,
          styles.statusIcon,
          styles.statusIconSizeForImg,
        )}
      />
      {children}
    </Text>
  );
}

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
  type: ReadyType;
};

export const getIndicatorInfo = (
  suspended: boolean,
  conditions: Condition[],
): IndicatorInfo => {
  if (suspended)
    return {
      icon: IconType.Suspended,
      type: ReadyType.Suspended,
    };
  const ready = computeReady(conditions);
  if (ready === ReadyType.Reconciling)
    return {
      type: ReadyType.Reconciling,
      icon: IconType.Reconcile,
    };
  if (ready === ReadyType.PendingAction)
    return {
      type: ReadyType.PendingAction,
      icon: IconType.Pending,
    };

  if (ready === ReadyType.Ready)
    return {
      type: ReadyType.Ready,
      icon: IconType.Check,
    };
  if (ready === ReadyType.None)
    return {
      type: ReadyType.None,
      icon: IconType.Remove,
    };
  return {
    type: ReadyType.NotReady,
    icon: IconType.Failed,
  };
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

export interface KubeStatusIndicatorProps {
  suspended: boolean;
  short?: boolean;
  conditions: Condition[];
}

export function KubeStatusIndicator(props: KubeStatusIndicatorProps) {
  const ready = _.find(props.conditions, c => c.type === ReadyType.Ready);

  return (
    <TooltipTrigger>
      <div>
        <Flex align="center" justify="start">
          <BackstageStatusIcon {...props} />
        </Flex>
      </div>
      <Tooltip>{ready?.message || ''}</Tooltip>
    </TooltipTrigger>
  );
}

export function BackstageStatusIcon({
  suspended,
  conditions,
}: {
  suspended: boolean;
  conditions: Condition[];
}) {
  if (suspended) {
    return <StatusPending>Suspended</StatusPending>;
  }
  const ready = computeReady(conditions);
  switch (ready) {
    case ReadyType.Reconciling:
      return <StatusReconciling>Reconciling</StatusReconciling>;
    case ReadyType.PendingAction:
      return <StatusPending>Pending</StatusPending>;
    case ReadyType.Ready:
      return <StatusOK>Ready</StatusOK>;
    case ReadyType.None:
      return <StatusAborted>Aborted</StatusAborted>;
    case ReadyType.Suspended:
      return <StatusPending>Suspended</StatusPending>;
    case ReadyType.NotReady:
      return <StatusError>Not ready</StatusError>;
    default:
      return <StatusError>Failed</StatusError>;
  }
}
