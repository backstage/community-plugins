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
import { defaultServerConfig } from '@backstage-community/plugin-kiali-common/config';
import { ComputedServerConfig } from '@backstage-community/plugin-kiali-common/types';
import { getType } from 'typesafe-actions';
import { KialiAppAction } from '../actions/KialiAppAction';
import { ServerConfigActions } from '../actions/ServerConfigActions';
import { ServerConfigState } from '../store/Store';

// Create a copy with computed durations
const initialConfig = { ...defaultServerConfig };
// Ensure durations are computed
if (Object.keys(initialConfig.durations).length === 0) {
  // Set some default durations if none exist
  initialConfig.durations = {
    60: '1m',
    120: '2m',
    300: '5m',
    600: '10m',
    1800: '30m',
    3600: '1h',
  };
}

export const INITIAL_SERVER_CONFIG_STATE: ServerConfigState = {
  config: initialConfig,
  isLoaded: false,
};

// This Reducer allows changes to the 'serverConfig' portion of Redux Store
export const ServerConfigReducer = (
  state: ServerConfigState = INITIAL_SERVER_CONFIG_STATE,
  action: KialiAppAction,
): ServerConfigState => {
  switch (action.type) {
    case getType(ServerConfigActions.setServerConfig):
      return {
        ...state,
        config: action.payload,
        isLoaded: true,
      };
    case getType(ServerConfigActions.setServerConfigLoaded):
      return {
        ...state,
        isLoaded: action.payload,
      };
    default:
      return state;
  }
};
