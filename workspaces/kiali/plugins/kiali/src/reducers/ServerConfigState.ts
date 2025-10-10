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

import { ServerConfigAction } from '../actions/ServerConfigActions';
import { defaultServerConfig } from '../config/ServerConfig';
import { ServerConfigState } from '../store/Store';

export const INITIAL_SERVER_CONFIG_STATE: ServerConfigState = {
  config: defaultServerConfig,
  isLoaded: false,
};

export const ServerConfigStateReducer = (
  state: ServerConfigState = INITIAL_SERVER_CONFIG_STATE,
  action: ServerConfigAction,
): ServerConfigState => {
  switch (action.type) {
    case 'SERVER_CONFIG_SET':
      return {
        ...state,
        config: action.payload,
        isLoaded: true,
      };
    case 'SERVER_CONFIG_SET_LOADED':
      return {
        ...state,
        isLoaded: action.payload,
      };
    default:
      return state;
  }
};
