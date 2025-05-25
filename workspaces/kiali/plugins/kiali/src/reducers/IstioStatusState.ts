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
import { ComponentStatus } from '@backstage-community/plugin-kiali-common/types';
import { getType } from 'typesafe-actions';
import { IstioStatusActions } from '../actions/IstioStatusActions';
import { KialiAppAction } from '../actions/KialiAppAction';

export const INITIAL_ISTIO_STATUS_STATE: ComponentStatus[] = [];

// This Reducer allows changes to the 'graphDataState' portion of Redux Store
export const IstioStatusStateReducer = (
  state: ComponentStatus[] = INITIAL_ISTIO_STATUS_STATE,
  action: KialiAppAction,
): ComponentStatus[] => {
  switch (action.type) {
    case getType(IstioStatusActions.setinfo):
      return action.payload;
    default:
      return state;
  }
};
