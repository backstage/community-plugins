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
import { LoginActions } from '../actions/LoginActions';
import { LoginState as LoginStateInterface, LoginStatus } from '../store/Store';
import { updateState } from '../utils/Reducer';

export const INITIAL_LOGIN_STATE: LoginStateInterface = {
  landingRoute: undefined,
  message: '',
  session: undefined,
  status: LoginStatus.loggedOut,
};

// This Reducer allows changes to the 'loginState' portion of Redux Store
export const LoginReducer = (
  state: LoginStateInterface = INITIAL_LOGIN_STATE,
  action: { type: string; payload: any },
): LoginStateInterface => {
  switch (action.type) {
    case getType(LoginActions.loginRequest):
      return {
        ...INITIAL_LOGIN_STATE,
        landingRoute: state.landingRoute,
        status: LoginStatus.logging,
      };
    case getType(LoginActions.loginSuccess):
      return {
        ...INITIAL_LOGIN_STATE,
        ...action.payload,
        landingRoute: state.landingRoute,
      };
    case getType(LoginActions.loginExtend):
      return {
        ...INITIAL_LOGIN_STATE,
        landingRoute: state.landingRoute,
        status: LoginStatus.loggedIn,
        session: action.payload.session,
      };
    case getType(LoginActions.loginFailure): {
      let message = 'Error connecting to Kiali';

      const response_data = action.payload.error.response.data;
      if (
        response_data &&
        typeof response_data.error === 'string' &&
        response_data.error.length > 0
      ) {
        message = `Login unsuccessful: ${response_data.error}`;
      } else if (action.payload.error.response.status === 401) {
        message =
          'Unauthorized. The provided credentials are not valid to access Kiali. Please check your credentials and try again.';
      }

      return {
        ...INITIAL_LOGIN_STATE,
        landingRoute: state.landingRoute,
        message: message,
        status: LoginStatus.error,
      };
    }
    case getType(LoginActions.logoutSuccess):
      return INITIAL_LOGIN_STATE;
    case getType(LoginActions.sessionExpired):
      return {
        ...INITIAL_LOGIN_STATE,
        status: LoginStatus.expired,
        message:
          'Your session has expired or was terminated in another window.',
      };
    case getType(LoginActions.setLandingRoute):
      return updateState(state, {
        landingRoute: action.payload,
      });
    default:
      return state;
  }
};
