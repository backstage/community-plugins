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
import type {
  DurationInSeconds,
  IntervalInMilliseconds,
  TimeInMilliseconds,
  TimeRange,
} from '@backstage-community/plugin-kiali-common/types';
import {
  ActionType,
  createAction,
  createStandardAction,
} from 'typesafe-actions';
import { ActionKeys } from './ActionKeys';

export const UserSettingsActions = {
  navCollapse: createAction(
    ActionKeys.NAV_COLLAPSE,
    resolve => (collapsed: boolean) => resolve({ collapse: collapsed }),
  ),
  setDuration: createStandardAction(
    ActionKeys.SET_DURATION,
  )<DurationInSeconds>(),
  setTimeRange: createStandardAction(ActionKeys.SET_TIME_RANGE)<TimeRange>(),
  setRefreshInterval: createStandardAction(
    ActionKeys.SET_REFRESH_INTERVAL,
  )<IntervalInMilliseconds>(),
  setReplayQueryTime: createStandardAction(
    ActionKeys.SET_REPLAY_QUERY_TIME,
  )<TimeInMilliseconds>(),
  toggleReplayActive: createAction(ActionKeys.TOGGLE_REPLAY_ACTIVE),
};

export type UserSettingsAction = ActionType<typeof UserSettingsActions>;
