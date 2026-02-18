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
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ArgoCDApi, FindApplicationsOptions, GetApplicationOptions } from '.';
import {
  Application,
  InstanceApplications,
  RevisionInfo,
} from '@backstage-community/plugin-argocd-common';

export type Options = {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  proxyPath?: string;
  useNamespacedApps: boolean;
};

const APP_NAMESPACE_QUERY_PARAM = 'appNamespace';

interface QueryParams {
  [key: string]: string | number | undefined;
}

export class ArgoCDApiClient implements ArgoCDApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly useNamespacedApps: boolean;

  /**
   * This `pluginId` is used to determine which backend plugin is used.
   * It is evaluated at runtime by checking if the 'backstage-community-argocd' plugin is available in the discovery API
   * and fallbacks to 'argocd' if not. This allows users to have both plugins installed and migrate at their own pace.
   */
  private pluginId: 'backstage-community-argocd' | 'argocd' | null = null;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.useNamespacedApps = options.useNamespacedApps;
  }

  async getBaseUrl() {
    if (!this.pluginId) {
      const baseUrl = await this.discoveryApi.getBaseUrl(
        'backstage-community-argocd',
      );
      const response = await this.fetchApi.fetch(`${baseUrl}/check`);
      if (response.ok && (await response.text()) === 'OK') {
        this.pluginId = 'backstage-community-argocd';
      } else {
        this.pluginId = 'argocd';
      }
    }
    return this.discoveryApi.getBaseUrl(this.pluginId);
  }

  getQueryParams(params: QueryParams) {
    const result = Object.entries(params)
      // Remove undefined values
      .filter(([_, value]) => value !== undefined)
      // Handle namespace param based on config
      .filter(
        ([key]) => this.useNamespacedApps || key !== APP_NAMESPACE_QUERY_PARAM,
      )
      // Create encoded key-value pairs
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`,
      )
      .join('&');

    return result ? `?${result}` : '';
  }

  async fetcher(url: string) {
    const response = await this.fetchApi.fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data, status ${response.status}: ${response.statusText}`,
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
      project: options.project,
    });
    return this.fetcher(
      `${proxyUrl}${options.url}/applications/${encodeURIComponent(
        options.appName,
      )}${query}`,
    );
  }

  async findApplications(
    options: FindApplicationsOptions,
  ): Promise<InstanceApplications[]> {
    const proxyUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
      project: options.project,
      expand: options.expand,
    });
    return this.fetcher(
      `${proxyUrl}/find/name/${encodeURIComponent(options.appName)}${query}`,
    );
  }

  async getRevisionDetails(options: {
    app: string;
    appNamespace?: string;
    revisionID: string;
    instanceName: string;
    sourceIndex?: number;
  }) {
    const proxyUrl = await this.getBaseUrl();

    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
      sourceIndex: options.sourceIndex,
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
            instanceName: application.metadata.instance.name,
            revisionID,
          }),
        );
      }

      const multiSourceApp = options.apps.find(app => {
        return app?.status?.history?.find(h => {
          return h?.revisions?.includes(revisionID);
        });
      });

      if (multiSourceApp) {
        const history = multiSourceApp.status?.history ?? [];
        const relevantHistories = history.filter(h =>
          h?.revisions?.includes(revisionID),
        );

        relevantHistories.forEach(h => {
          const revisionSourceIndex = h.revisions?.indexOf(revisionID);
          promises.push(
            this.getRevisionDetails({
              app: multiSourceApp.metadata.name as string,
              appNamespace: options.appNamespace,
              instanceName: multiSourceApp.metadata.instance.name,
              revisionID: revisionID,
              sourceIndex: revisionSourceIndex,
            }),
          );
        });
      }
    });

    return Promise.all(promises);
  }
}
