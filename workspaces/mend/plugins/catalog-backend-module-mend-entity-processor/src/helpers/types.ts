/*
 * Copyright 2026 The Backstage Authors
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

export interface ProjectStatisticsItem {
  uuid: string;
  name: string;
  path: string;
  applicationUuid: string;
  tags?: Array<{ key: string; value: string }>;
  statistics: Record<string, any>;
  [key: string]: any;
}

export interface ProjectStatisticsResponse {
  response: ProjectStatisticsItem[];
  additionalData?: {
    paging?: {
      next?: string;
    };
  };
}

export interface CachedProjectData {
  urlToProjectIdsMap: Record<string, string[]>;
  lastFetched: number;
  fetchCompleted: boolean;
  [key: string]: unknown;
}

export interface MendAuthResponse {
  response: {
    jwtToken: string;
    jwtTTL?: number;
    orgUuid: string;
    userUuid?: string;
    userName?: string;
    email?: string;
    orgName?: string;
    clientUrl?: string;
  };
}

export interface CachedUrlToProjectIds {
  urlToProjectIdsMap: Record<string, string[]>;
  lastFetched: number;
  fetchCompleted: boolean;
}

export interface JwtLicenceKeyPayload {
  wsEnvUrl: string;
  integratorEmail: string;
  userKey: string;
}
