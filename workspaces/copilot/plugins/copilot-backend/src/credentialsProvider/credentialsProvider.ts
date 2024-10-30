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

import { GithubCredentials } from '@backstage/integration';

/**
 * Information required to access the GitHub API
 *
 * @public
 */
export type GithubInfo = {
  credentials: GithubCredentials;
  apiBaseUrl: string;
  enterprise: string;
};

/**
 * Interface for providing credentials for accessing the copilot API
 *
 * @public
 */
export interface CopilotCredentialsProvider {
  /**
   * Retrieve the credentials required to access the copilot API
   *
   * @public
   */
  getCredentials(): Promise<GithubInfo>;
}
