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
  INITIAL_ISTIO_CERTS_INFO_STATE,
  INITIAL_ISTIO_STATUS_STATE,
  INITIAL_LOGIN_STATE,
  INITIAL_MESH_TLS_STATE,
  INITIAL_MESSAGE_CENTER_STATE,
  INITIAL_NAMESPACE_STATE,
  INITIAL_STATUS_STATE,
  INITIAL_USER_SETTINGS_STATE,
} from '../reducers';
import { INITIAL_PROVIDER_STATE } from '../reducers/Provider';
import { INITIAL_SERVER_CONFIG_STATE } from '../reducers/ServerConfigState';
import { INITIAL_TRACING_STATE } from '../reducers/Tracing';
import { KialiAppState } from './Store';

// Setup the initial state of the Redux store with defaults
// (instead of having things be undefined until they are populated by query)
// Redux 4.0 actually required this
export const initialStore: KialiAppState = {
  authentication: INITIAL_LOGIN_STATE,
  istioStatus: INITIAL_ISTIO_STATUS_STATE,
  istioCertsInfo: INITIAL_ISTIO_CERTS_INFO_STATE,
  meshTLSStatus: INITIAL_MESH_TLS_STATE,
  messageCenter: INITIAL_MESSAGE_CENTER_STATE,
  namespaces: INITIAL_NAMESPACE_STATE,
  providers: INITIAL_PROVIDER_STATE,
  tracingState: INITIAL_TRACING_STATE,
  serverConfig: INITIAL_SERVER_CONFIG_STATE,
  statusState: INITIAL_STATUS_STATE,
  userSettings: INITIAL_USER_SETTINGS_STATE,
  dispatch: {},
};
