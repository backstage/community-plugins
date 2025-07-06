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
import { TLSStatus } from '@backstage-community/plugin-kiali-common/types';
import { getType } from 'typesafe-actions';
import { KialiAppAction } from '../actions/KialiAppAction';
import { MeshTlsActions } from '../actions/MeshTlsActions';

export const INITIAL_MESH_TLS_STATE: TLSStatus = {
  status: '',
  autoMTLSEnabled: false,
  minTLS: '',
};

// This Reducer allows changes to the 'graphDataState' portion of Redux Store
export const MeshTlsStateReducer = (
  state: TLSStatus = INITIAL_MESH_TLS_STATE,
  action: KialiAppAction,
): TLSStatus => {
  switch (action.type) {
    case getType(MeshTlsActions.setinfo):
      return {
        ...INITIAL_MESH_TLS_STATE,
        status: action.payload.status,
        autoMTLSEnabled: action.payload.autoMTLSEnabled,
        minTLS: action.payload.minTLS,
      };
    default:
      return state;
  }
};
