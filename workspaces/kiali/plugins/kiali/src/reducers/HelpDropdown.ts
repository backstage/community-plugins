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
import { StatusState } from '@backstage-community/plugin-kiali-common/types';
import { getType } from 'typesafe-actions';
import { HelpDropdownActions } from '../actions/HelpDropdownActions';
import { KialiAppAction } from '../actions/KialiAppAction';

export const INITIAL_STATUS_STATE: StatusState = {
  status: {},
  externalServices: [],
  warningMessages: [],
  istioEnvironment: {
    isMaistra: false,
    istioAPIEnabled: true,
  },
  providers: [],
};

export const HelpDropdownStateReducer = (
  state: StatusState = INITIAL_STATUS_STATE,
  action: KialiAppAction,
): StatusState => {
  switch (action.type) {
    case getType(HelpDropdownActions.statusRefresh):
      return {
        ...INITIAL_STATUS_STATE,
        status: action.payload.status,
        externalServices: action.payload.externalServices,
        warningMessages: action.payload.warningMessages,
        istioEnvironment: action.payload.istioEnvironment,
      };
    default:
      return state;
  }
};
