/*
 * Copyright 2023 The Backstage Authors
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
  createApiRef,
  DiscoveryApi,
  FetchApi,
  ConfigApi,
} from '@backstage/core-plugin-api';
import {
  ProjectReference,
  ProjectReferenceWithSlug,
} from '../utils/getAnnotationFromEntity';

export type {
  ProjectReference,
  ProjectReferenceWithSlug,
  ProjectSlugReference,
} from '../utils/getAnnotationFromEntity';

/** @public */
export type OctopusProgression = {
  Environments: OctopusEnvironment[];
  Releases: OctopusReleaseProgression[];
};

/** @public */
export type OctopusEnvironment = {
  Id: string;
  Name: string;
};

/** @public */
export type OctopusReleaseProgression = {
  Release: OctopusRelease;
  Deployments: { [key: string]: OctopusDeployment[] };
};

/** @public */
export type OctopusRelease = {
  Id: string;
  Version: string;
  Links: OctopusLinks;
};

/** @public */
export type OctopusDeployment = {
  State: string;
};
/** @public */
export type OctopusLinks = {
  Self: string;
  Web: string;
};

/** @public */
export type OctopusProject = {
  // Optional to remain backwards compatible with existing implementers of
  // OctopusDeployApi/OctopusProject. Populated by the real API response and
  // required internally to resolve a project slug to its numeric ID.
  Id?: string;
  Name: string;
  Slug: string;
  Links: OctopusLinks;
};

/** @public */
export type OctopusProjectGroup = {
  Id: string;
  Name: string;
  Description: string;
};

/** @public */
export type OctopusPluginConfig = {
  WebUiBaseUrl: string;
};

/** @public */
export const octopusDeployApiRef = createApiRef<OctopusDeployApi>({
  id: 'plugin.octopusdeploy.service',
});

const DEFAULT_PROXY_PATH_BASE = '/octopus-deploy';
const WEB_UI_BASE_URL_CONFIG_KEY = 'octopusdeploy.webBaseUrl';

/** @public */
export interface OctopusDeployApi {
  getReleaseProgression(opts: {
    projectReference: ProjectReferenceWithSlug;
    releaseHistoryCount: number;
  }): Promise<OctopusProgression>;
  getProjectInfo(
    projectReference: ProjectReferenceWithSlug,
  ): Promise<OctopusProject>;
  getProjectGroups(): Promise<OctopusProjectGroup[]>;
  getConfig(): Promise<OctopusPluginConfig>;
}

/** @public */
export class OctopusDeployClient implements OctopusDeployApi {
  private readonly configApi: ConfigApi;
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly proxyPathBase: string;
  private readonly projectInfoCache = new Map<
    string,
    Promise<OctopusProject>
  >();

  constructor(options: {
    configApi: ConfigApi;
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    proxyPathBase?: string;
  }) {
    this.configApi = options.configApi;
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.proxyPathBase = options.proxyPathBase ?? DEFAULT_PROXY_PATH_BASE;
  }

  async getReleaseProgression(opts: {
    projectReference: ProjectReferenceWithSlug;
    releaseHistoryCount: number;
  }): Promise<OctopusProgression> {
    // Octopus's /progression sub-resource only accepts the numeric project
    // ID, not the project slug, so slug references must be resolved first.
    const projectReference = await this.resolveProjectIdReference(
      opts.projectReference,
    );
    const url = await this.getProgressionApiUrl({
      projectReference,
      releaseHistoryCount: opts.releaseHistoryCount,
    });
    return this.fetchAndHandleErrors(url);
  }

  async getProjectInfo(
    projectReference: ProjectReferenceWithSlug,
  ): Promise<OctopusProject> {
    // Cache/dedupe by reference so that callers resolving the same project
    // (e.g. useProject and getReleaseProgression's slug resolution) share a
    // single in-flight/completed request instead of each firing their own.
    const key = this.getProjectReferenceCacheKey(projectReference);
    let promise = this.projectInfoCache.get(key);
    if (!promise) {
      promise = (async () => {
        const url = await this.getProjectApiUrl(projectReference);
        return this.fetchAndHandleErrors<OctopusProject>(url);
      })();
      this.projectInfoCache.set(key, promise);
      // Don't cache failures, so a later retry can succeed.
      promise.catch(() => this.projectInfoCache.delete(key));
    }
    return promise;
  }

  private getProjectReferenceCacheKey(
    projectReference: ProjectReferenceWithSlug,
  ): string {
    const spaceId = projectReference.spaceId ?? '';
    return 'projectId' in projectReference
      ? `id:${spaceId}:${projectReference.projectId}`
      : `slug:${spaceId}:${projectReference.projectSlug}`;
  }

  private async resolveProjectIdReference(
    projectReference: ProjectReferenceWithSlug,
  ): Promise<ProjectReference> {
    if ('projectId' in projectReference) {
      return projectReference;
    }

    const project = await this.getProjectInfo(projectReference);
    if (!project.Id) {
      throw new Error(
        `Could not resolve numeric project ID for slug "${projectReference.projectSlug}"`,
      );
    }
    return { projectId: project.Id, spaceId: projectReference.spaceId };
  }

  async getProjectGroups(): Promise<OctopusProjectGroup[]> {
    const url = await this.getProjectGroupApiUrl();
    return this.fetchAndHandleErrors(url);
  }

  async getConfig(): Promise<OctopusPluginConfig> {
    return {
      WebUiBaseUrl: this.configApi.getString(WEB_UI_BASE_URL_CONFIG_KEY),
    };
  }

  private async fetchAndHandleErrors<T>(url: string): Promise<T> {
    const response = await this.fetchApi.fetch(url);

    let responseJson: T;

    try {
      responseJson = await response.json();
    } catch (e) {
      throw new Error(`Failed to parse JSON response: ${e}`);
    }

    if (!response.ok) {
      throw new Error(
        `Error communicating with Octopus Deploy: ${response.status}`,
      );
    }

    return responseJson;
  }

  private async getProgressionApiUrl(opts: {
    projectReference: ProjectReferenceWithSlug;
    releaseHistoryCount: number;
  }) {
    const queryParameters = new URLSearchParams({
      releaseHistoryCount: opts.releaseHistoryCount.toString(),
    });

    const projectUrl = await this.getProjectApiUrl(opts.projectReference);

    return `${projectUrl}/progression?${queryParameters}`;
  }

  private async getProjectApiUrl(projectReference: ProjectReferenceWithSlug) {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    const projectIdentifier =
      'projectId' in projectReference
        ? projectReference.projectId
        : projectReference.projectSlug;
    if (!projectIdentifier) {
      throw new Error('A project ID or slug is required');
    }

    if (projectReference.spaceId !== undefined)
      return `${proxyUrl}${this.proxyPathBase}/${encodeURIComponent(
        projectReference.spaceId,
      )}/projects/${encodeURIComponent(projectIdentifier)}`;
    return `${proxyUrl}${this.proxyPathBase}/projects/${encodeURIComponent(
      projectIdentifier,
    )}`;
  }

  private async getProjectGroupApiUrl(): Promise<string> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}${this.proxyPathBase}/projectgroups/all`;
  }
}
