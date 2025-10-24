/*
 * Copyright 2025 The Backstage Authors
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

/** @public */
export interface CrumbData {
  headerName: string;
  headerValue: string;
  cookies?: string[]; // optional: reuse any session cookies
}

/** @public */
export interface CrumbDataHeaderValues {
  crumbRequestField: string;
  crumb: string;
}

/** @public */
export type HeaderValue = string | string[] | undefined;

/** @public */
export type JenkinsParams =
  | Record<string, unknown>
  | URLSearchParams
  | undefined;

/** @public */
export interface JobBuildOptions {
  parameters?: JenkinsParams;
  token?: string;
  delay?: string; // Legacy client support: allow delay option
}

/** @public */
export interface JobGetOptions {
  name: string | string[];
  tree?: string;
  depth?: number;
}
