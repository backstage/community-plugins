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
  LaunchDetailsResponse,
  ProjectDetails,
  ProjectListResponse,
} from '@backstage-community/plugin-report-portal-common';
import { ApiRef, createApiRef } from '@backstage/core-plugin-api';

/** @public */
export const reportPortalApiRef: ApiRef<ReportPortalApi> = createApiRef({
  id: 'plugin.report-portal',
});

export type ReportPortalApi = {
  getReportPortalBaseUrl: (host: string) => string;
  getLaunchResults: (
    projectName: string,
    host: string,
    filters: { [key: string]: string | number } | undefined,
  ) => Promise<LaunchDetailsResponse>;
  getProjectDetails: (
    projectId: string,
    host: string,
  ) => Promise<ProjectDetails>;
  getInstanceDetails: (
    host: string,
    filters: { [key: string]: string | number } | undefined,
  ) => Promise<ProjectListResponse>;
};
