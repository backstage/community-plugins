import { ApiRef, createApiRef } from '@backstage/core-plugin-api';

import {
  LaunchDetailsResponse,
  ProjectDetails,
  ProjectListResponse,
} from './types';

/** @public */
export const reportPortalApiRef: ApiRef<ReportPortalApi> = createApiRef({
  id: 'plugin.report-portal',
});

export type ReportPortalApi = {
  getReportPortalBaseUrl: (host: string) => string;
  getLaunchResults: (
    projectId: string,
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
