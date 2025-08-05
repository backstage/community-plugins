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
export interface AuthConfig {
  authorizationEndpoint?: string;
  logoutEndpoint?: string;
  logoutRedirect?: string;
  strategy: AuthStrategy;
}

export type AuthInfo = {
  sessionInfo: SessionInfo;
} & AuthConfig;

export enum AuthStrategy {
  anonymous = 'anonymous',
  openshift = 'openshift',
  token = 'token',
  openid = 'openid',
  header = 'header',
}

// Stores the result of a computation:
// hold = stop all computation and wait for a side-effect, such as a redirect
// continue = continue...
// success = authentication was a success, session is available
// failure = authentication failed, session is undefined but error is available
export enum AuthResult {
  HOLD = 'hold',
  CONTINUE = 'continue',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export interface SessionInfo {
  username?: string;
  expiresOn?: string;
}
