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
import { getType } from 'typesafe-actions';
import { KialiAppAction } from '../actions/KialiAppAction';
import { UserSettingsActions } from '../actions/UserSettingsActions';
import { config } from '../config';
import { UserSettings } from '../store/Store';
import { updateState } from '../utils/Reducer';

export const INITIAL_USER_SETTINGS_STATE: UserSettings = {
  duration: config.toolbar.defaultDuration,
  timeRange: config.toolbar.defaultTimeRange,
  interface: { navCollapse: false },
  refreshInterval: config.toolbar.defaultRefreshInterval,
  replayActive: false,
  replayQueryTime: 0,
};

export const UserSettingsStateReducer = (
  state: UserSettings = INITIAL_USER_SETTINGS_STATE,
  action: KialiAppAction,
): UserSettings => {
  switch (action.type) {
    case getType(UserSettingsActions.navCollapse):
      return updateState(state, {
        interface: { navCollapse: action.payload.collapse },
      });
    case getType(UserSettingsActions.setDuration):
      return updateState(state, {
        duration: action.payload,
      });
    case getType(UserSettingsActions.setRefreshInterval): {
      return updateState(state, {
        refreshInterval: action.payload,
      });
    }
    case getType(UserSettingsActions.setReplayQueryTime): {
      return updateState(state, {
        replayQueryTime: action.payload,
      });
    }
    case getType(UserSettingsActions.setTimeRange): {
      return updateState(state, {
        timeRange: action.payload,
      });
    }
    case getType(UserSettingsActions.toggleReplayActive): {
      return updateState(state, {
        replayActive: !state.replayActive,
        replayQueryTime: 0,
      });
    }
    default:
      return state;
  }
};
