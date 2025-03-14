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
  t_global_icon_color_status_warning_default as globalWarning100,
  t_color_white as globalWhite,
  t_color_purple_30 as globalPurple300,
} from '@patternfly/react-tokens';

export enum AllPodStatus {
  Running = 'Running',
  NotReady = 'Not Ready',
  Warning = 'Warning',
  Empty = 'Empty',
  Failed = 'Failed',
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Terminating = 'Terminating',
  Unknown = 'Unknown',
  ScaledTo0 = 'Scaled to 0',
  Idle = 'Idle',
  AutoScaledTo0 = 'Autoscaled to 0',
  ScalingUp = 'Scaling Up',
  CrashLoopBackOff = 'CrashLoopBackOff',
  ErrImagePull = 'ErrImagePull',
}

export const podColor = {
  [AllPodStatus.Running]: '#0066CC',
  [AllPodStatus.NotReady]: '#519DE9',
  [AllPodStatus.Warning]: globalWarning100.value,
  [AllPodStatus.Empty]: globalWhite.value,
  [AllPodStatus.Failed]: '#CC0000',
  [AllPodStatus.Pending]: '#8BC1F7',
  [AllPodStatus.Succeeded]: '#519149',
  [AllPodStatus.Terminating]: '#002F5D',
  [AllPodStatus.Unknown]: globalPurple300.value,
  [AllPodStatus.ScaledTo0]: globalWhite.value,
  [AllPodStatus.Idle]: globalWhite.value,
  [AllPodStatus.AutoScaledTo0]: globalWhite.value,
  [AllPodStatus.ScalingUp]: globalWhite.value,
  [AllPodStatus.CrashLoopBackOff]: '#CC0000',
  [AllPodStatus.ErrImagePull]: '#CC0000',
};

export enum DeploymentStrategy {
  rolling = 'Rolling',
  recreate = 'Recreate',
  rollingUpdate = 'RollingUpdate',
}

export enum DeploymentPhase {
  new = 'New',
  running = 'Running',
  pending = 'Pending',
  complete = 'Complete',
  failed = 'Failed',
  cancelled = 'Cancelled',
}

export type PodPhase = string | null;
