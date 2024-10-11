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
export enum VMIPhase {
  Pending = 'Pending',
  Scheduling = 'Scheduling',
  Scheduled = 'Scheduled',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown',
}
export enum VMStatusSimpleLabel {
  Starting = 'Starting',
  Paused = 'Paused',
  Migrating = 'Migrating',
  Stopping = 'Stopping',
  Running = 'Running',
  Stopped = 'Stopped',
  Deleting = 'Deleting',
}
export enum VMStatusEnum {
  PAUSED = 'Paused',
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  ERROR = 'Error',
  PENDING = 'Pending', // VMI_WAITING,CDI_IMPORT_PENDING,V2V_CONVERSION_PENDING
  IN_PROGRESS = 'Progress', // STARTING, STOPPING, DELETING
  UNKNOWN = 'Unknown',
}
export enum RunStrategy {
  Always = 'Always',
  RerunOnFailure = 'RerunOnFailure',
  Halted = 'Halted',
  Manual = 'Manual',
}
export enum StateChangeRequest {
  Start = 'Start',
  Stop = 'Stop',
}
export const POD_PHASE_PENDING = 'Pending';
