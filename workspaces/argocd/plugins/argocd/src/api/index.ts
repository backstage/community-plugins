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
import { createApiRef } from '@backstage/core-plugin-api';

import {
  Application,
  RevisionInfo,
  InstanceApplications,
} from '@backstage-community/plugin-argocd-common';

export { ArgoCDApiClient } from './ArgoCDApiClient';
export { ArgoCDInstanceApiClient } from './ArgoCDInstanceApiClient';

export type ArgoCDAppDeployRevisionDetails = RevisionInfo;

export type ListAppsOptions = {
  url: string;
  appSelector?: string;
  appNamespace?: string;
  projectName?: string;
};

export type RevisionDetailsOptions = {
  app: string;
  appNamespace?: string;
  revisionID: string;
  instanceName?: string;
  sourceIndex?: number;
};
export type RevisionDetailsListOptions = {
  appNamespace?: string;
  revisionIDs: string[];
  apps: Application[];
};

export type GetApplicationOptions = {
  url: string;
  appName: string;
  appNamespace?: string;
  project?: string;
  instance?: string;
};

export type FindApplicationsOptions = {
  appName: string;
  appNamespace?: string;
  project?: string;
  expand?: string;
};

export interface ArgoCDApi {
  listApps(options: ListAppsOptions): Promise<{ items: Application[] }>;
  getRevisionDetails(
    options: RevisionDetailsOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails>;
  getRevisionDetailsList(
    options: RevisionDetailsListOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails[]>;
  getApplication(options: GetApplicationOptions): Promise<Application>;
  findApplications(
    options: FindApplicationsOptions,
  ): Promise<InstanceApplications[]>;
}

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: 'plugin.argo.cd.service',
});

export interface SearchApplicationsOptions {
  appSelector?: string;
  appName?: string;
  appNamespace?: string;
  project?: string;
}

/**
 * API for fetching ArgoCD applications across instances.
 */
export interface ArgoCDInstanceApi {
  /**
   * Lists applications from ArgoCD instances.
   *
   * @param {string[]} instanceNames - An array of ArgoCD instance names to search. If empty, searches all instances.
   * @param {SearchApplicationsOptions} options - Options for filtering applications.
   * @returns {Promise<Application[]>} A promise that resolves to an array of Applications. Empty if no applications are found.
   */
  searchApplications(
    instanceNames: string[],
    options: SearchApplicationsOptions,
  ): Promise<Application[]>;
}

export const argoCDInstanceApiRef = createApiRef<ArgoCDInstanceApi>({
  id: 'plugin.argo.cd.instance',
});
