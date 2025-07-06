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
import { ProviderActions } from '../actions/ProviderAction';
import { ProviderState } from '../store/Store';
import { updateState } from '../utils/Reducer';

export const INITIAL_PROVIDER_STATE: ProviderState = {
  activeProvider: '',
  items: [],
};

export const ProviderStateReducer = (
  state: ProviderState = INITIAL_PROVIDER_STATE,
  action: KialiAppAction,
): ProviderState => {
  switch (action.type) {
    case getType(ProviderActions.setActiveProvider):
      return updateState(state, {
        activeProvider: action.payload,
      });

    case getType(ProviderActions.setProviders):
      return updateState(state, {
        items: action.payload,
      });
    default:
      return state;
  }
};
