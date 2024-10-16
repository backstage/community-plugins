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
import { createApiRef, IdentityApi } from '@backstage/core-plugin-api';

import { Application, RevisionInfo } from '../types/application';

export type ArgoCDAppDeployRevisionDetails = RevisionInfo;

export type listAppsOptions = {
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
};
export type RevisionDetailsListOptions = {
  appNamespace?: string;
  revisionIDs: string[];
  instanceName?: string;
  apps: Application[];
};

export type GetApplicationOptions = {
  url: string;
  appName: string;
  appNamespace?: string;
  instance?: string;
};
export interface ArgoCDApi {
  listApps(options: listAppsOptions): Promise<{ items: Application[] }>;
  getRevisionDetails(
    options: RevisionDetailsOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails>;
  getRevisionDetailsList(
    options: RevisionDetailsListOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails[]>;
  getApplication(options: GetApplicationOptions): Promise<Application>;
}

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: 'plugin.argo.cd.service',
});

export type Options = {
  backendBaseUrl: string;
  identityApi: IdentityApi;
  proxyPath?: string;
  useNamespacedApps: boolean;
};

const APP_NAMESPACE_QUERY_PARAM = 'appNamespace';

export class ArgoCDApiClient implements ArgoCDApi {
  private readonly backendBaseUrl: string;
  private readonly identityApi: IdentityApi;
  private readonly useNamespacedApps: boolean;

  constructor(options: Options) {
    this.backendBaseUrl = options.backendBaseUrl;
    this.identityApi = options.identityApi;
    this.useNamespacedApps = options.useNamespacedApps;
  }

  async getBaseUrl() {
    return `${this.backendBaseUrl}/api/argocd`;
  }

  getQueryParams(params: { [p: string]: string | undefined }) {
    const result = Object.keys(params)
      .filter(key => params[key] !== undefined)
      .filter(
        key => key !== APP_NAMESPACE_QUERY_PARAM || this.useNamespacedApps,
      )
      .map(
        k =>
          `${encodeURIComponent(k)}=${encodeURIComponent(params[k] as string)}`,
      )
      .join('&');
    return result ? `?${result}` : '';
  }

  async fetcher(url: string) {
    const { token } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      headers: token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    const json = await response.json();
    return json;
  }

  async listApps(options: {
    url: string;
    appSelector?: string;
    appNamespace?: string;
    projectName?: string;
  }) {
    const proxyUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      selector: options.appSelector,
      project: options.projectName,
      appNamespace: options.appNamespace,
    });
    return this.fetcher(
      `${proxyUrl}${options.url}/applications/selector/${options.appSelector}${query}`,
    );
  }

  async getApplication(options: GetApplicationOptions) {
    const proxyUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
    });
    return this.fetcher(
      `${proxyUrl}${options.url}/applications/${encodeURIComponent(
        options.appName,
      )}${query}`,
    );
  }

  async getRevisionDetails(options: {
    app: string;
    appNamespace?: string;
    revisionID: string;
    instanceName: string;
  }) {
    const proxyUrl = await this.getBaseUrl();

    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
    });
    return this.fetcher(
      `${proxyUrl}/argoInstance/${
        options.instanceName
      }/applications/name/${encodeURIComponent(
        options.app,
      )}/revisions/${encodeURIComponent(options.revisionID)}/metadata${query}`,
    );
  }

  async getRevisionDetailsList(options: {
    appNamespace: string;
    revisionIDs: string[];
    instanceName: string;
    apps: Application[];
  }): Promise<RevisionInfo[]> {
    if (!options.revisionIDs || options.revisionIDs.length < 1) {
      return Promise.resolve([]);
    }
    const promises: any = [];
    options.revisionIDs.forEach((revisionID: string) => {
      const application = options.apps.find(app =>
        app?.status?.history?.find(h => h.revision === revisionID),
      );
      if (application) {
        promises.push(
          this.getRevisionDetails({
            app: application.metadata.name as string,
            appNamespace: options.appNamespace,
            instanceName: options.instanceName,
            revisionID,
          }),
        );
      }
    });

    return Promise.all(promises);
  }
}
