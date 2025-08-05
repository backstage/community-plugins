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
  ActionType,
  createAction,
  createStandardAction,
} from 'typesafe-actions';
import { LoginSession, LoginStatus } from '../store/Store';
import { ActionKeys } from './ActionKeys';

export interface LoginPayload {
  error?: any;
  landingRoute?: string;
  session?: LoginSession;
  status: LoginStatus;
}

// synchronous action creators
export const LoginActions: { [key: string]: any } = {
  loginRequest: createAction(ActionKeys.LOGIN_REQUEST),
  loginExtend: createAction(
    ActionKeys.LOGIN_EXTEND,
    resolve => (session: LoginSession) =>
      resolve({
        status: LoginStatus.loggedIn,
        session: session,
        error: undefined,
      } as LoginPayload),
  ),
  loginSuccess: createAction(
    ActionKeys.LOGIN_SUCCESS,
    resolve => (session: LoginSession) =>
      resolve({
        status: LoginStatus.loggedIn,
        session: session,
        error: undefined,
        uiExpiresOn: session.expiresOn,
      } as LoginPayload),
  ),
  loginFailure: createAction(
    ActionKeys.LOGIN_FAILURE,
    resolve => (error: any) =>
      resolve({
        status: LoginStatus.error,
        session: undefined,
        error: error,
      } as LoginPayload),
  ),
  logoutSuccess: createAction(
    ActionKeys.LOGOUT_SUCCESS,
    resolve => () =>
      resolve({
        status: LoginStatus.loggedOut,
        session: undefined,
        error: undefined,
      } as LoginPayload),
  ),
  sessionExpired: createAction(ActionKeys.SESSION_EXPIRED),
  setLandingRoute: createStandardAction(ActionKeys.SET_LANDING_ROUTE)<
    string | undefined
  >(),
};

export type LoginAction = ActionType<typeof LoginActions>;
