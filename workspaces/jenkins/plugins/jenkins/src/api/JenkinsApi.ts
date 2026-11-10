/*
 * Copyright 2020 The Backstage Authors
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
} from '@backstage/core-plugin-api';
import type { CompoundEntityRef } from '@backstage/catalog-model';
import { ResponseError } from '@backstage/errors';

export const jenkinsApiRef = createApiRef<JenkinsApi>({
  id: 'plugin.jenkins.service2',
});

export interface Build {
  // standard Jenkins
  timestamp: number;
  building: boolean;
  duration: number;
  result?: string;
  fullDisplayName: string;
  displayName: string;
  url: string;
  number: number;

  // added by us
  source?: {
    branchName: string;
    displayName: string;
    url: string;
    commit: {
      hash: string;
    };
    author: string;
  };
  tests: {
    passed: number;
    skipped: number;
    failed: number;
    total: number;
    testUrl: string;
  };
  status: string; // == building ? 'running' : result,
}
export interface JobBuild {
  timestamp: number;
  building: boolean;
  duration: number;
  result?: string;
  fullDisplayName: string;
  displayName: string;
  url: string;
  number: number;
  inProgress: boolean;
  queueId: number;
  id: number;
}

export interface Job {
  name: string;
  displayName: string;
  description: string;
  fullDisplayName: string;
  inQueue: boolean;
  fullName: string;
  url: string;
  builds: JobBuild[];
}

/** @public */
export interface Project {
  // standard Jenkins
  lastBuild: Build;
  displayName: string;
  fullDisplayName: string;
  fullName: string;
  inQueue: string;
  // added by us
  instanceName?: string;
  status: string; // == inQueue ? 'queued' : lastBuild.building ? 'running' : lastBuild.result,
  onRestartClick: () => Promise<void>; // TODO rename to handle.* ? also, should this be on lastBuild?
}

export interface BuildConsoleText {
  consoleText: string;
}

/**
 * A Jenkins instance whose projects could not be fetched.
 *
 * @public
 */
export interface JenkinsInstanceError {
  /** The configured name of the Jenkins instance. */
  instanceName: string;
  /** Why the projects of the instance could not be fetched. */
  message: string;
}

/**
 * The projects of an entity, together with the Jenkins instances that failed.
 *
 * @public
 */
export interface JenkinsProjectsResult {
  /** The projects of the instances that could be queried. */
  projects: Project[];
  /**
   * Instances that could not be queried. The projects of the other instances
   * are still returned.
   */
  errors: JenkinsInstanceError[];
}

export interface JenkinsApi {
  /**
   * Get the projects (jobs which have builds, not folders) including info about their lastBuild.
   *
   * Deciding what jobs are for an entity can be configured by the backstage _Integrator_ in the plugin-jenkins-backend setup
   * and by the _Software Engineer_ using annotations agreed with the _Integrator_.
   *
   * Typically, a folder job will be identified and the backend plugin will recursively look for projects (jobs with builds) within that folder.
   */
  getProjects(options: {
    /** the entity whose jobs should be retrieved. */
    entity: CompoundEntityRef;
    /** a filter on jobs. Currently this just takes a branch (and assumes certain structures in jenkins) */
    filter: { branch?: string };
  }): Promise<Project[]>;

  /**
   * Like `getProjects`, but also reports the Jenkins instances that could not
   * be queried, so that one unavailable instance doesn't hide the others.
   *
   * Optional so that existing implementations of this API keep working;
   * callers fall back to `getProjects` when it is missing.
   */
  getProjectsWithErrors?(options: {
    entity: CompoundEntityRef;
    filter: { branch?: string };
  }): Promise<JenkinsProjectsResult>;

  /**
   * Get a single build.
   *
   * This takes an entity and instance name to support selecting between
   * multiple Jenkins instances.
   */
  getBuild(options: {
    entity: CompoundEntityRef;
    jobFullName: string;
    buildNumber: string;
    instanceName?: string;
  }): Promise<Build>;

  getJobBuilds(options: {
    entity: CompoundEntityRef;
    jobFullName: string;
    instanceName?: string;
  }): Promise<Job>;

  retry(options: {
    entity: CompoundEntityRef;
    jobFullName: string;
    buildNumber: string;
    instanceName?: string;
  }): Promise<void>;

  /**
   * Gets the consoleText for a single build
   */
  getBuildConsoleText(options: {
    entity: CompoundEntityRef;
    jobFullName: string;
    buildNumber: string;
    instanceName?: string;
  }): Promise<BuildConsoleText>;
}

export class JenkinsClient implements JenkinsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getProjects(options: {
    entity: CompoundEntityRef;
    filter: { branch?: string };
  }): Promise<Project[]> {
    return (await this.getProjectsWithErrors(options)).projects;
  }

  async getProjectsWithErrors(options: {
    entity: CompoundEntityRef;
    filter: { branch?: string };
  }): Promise<JenkinsProjectsResult> {
    const { entity, filter } = options;
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'jenkins',
      )}/v1/entity/${encodeURIComponent(entity.namespace)}/${encodeURIComponent(
        entity.kind,
      )}/${encodeURIComponent(entity.name)}/projects`,
    );

    if (filter.branch) {
      url.searchParams.append('branch', filter.branch);
    }

    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    const body: { projects?: Project[]; errors?: JenkinsInstanceError[] } =
      await response.json();

    return {
      projects:
        body.projects?.map(p => ({
          ...p,
          onRestartClick: () => {
            return this.retry({
              entity,
              jobFullName: p.fullName,
              buildNumber: String(p.lastBuild.number),
              // Undefined when an older backend doesn't send it, which lets
              // the backend resolve the instance instead of the client.
              instanceName: p.instanceName,
            });
          },
        })) ?? [],
      errors: body.errors ?? [],
    };
  }

  async getBuild(options: {
    entity: CompoundEntityRef;
    jobFullName: string;
    buildNumber: string;
    instanceName?: string;
  }): Promise<Build> {
    const { entity, jobFullName, buildNumber, instanceName } = options;
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'jenkins',
      )}/v1/entity/${encodeURIComponent(entity.namespace)}/${encodeURIComponent(
        entity.kind,
      )}/${encodeURIComponent(entity.name)}/job/${encodeURIComponent(
        jobFullName,
      )}/${encodeURIComponent(buildNumber)}`,
    );
    this.appendInstanceName(url, instanceName);

    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return (await response.json()).build;
  }

  async retry(options: {
    entity: CompoundEntityRef;
    jobFullName: string;
    buildNumber: string;
    instanceName?: string;
  }): Promise<void> {
    const { entity, jobFullName, buildNumber, instanceName } = options;
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'jenkins',
      )}/v1/entity/${encodeURIComponent(entity.namespace)}/${encodeURIComponent(
        entity.kind,
      )}/${encodeURIComponent(entity.name)}/job/${encodeURIComponent(
        jobFullName,
      )}/${encodeURIComponent(buildNumber)}`,
    );
    this.appendInstanceName(url, instanceName);

    const response = await this.fetchApi.fetch(url, { method: 'POST' });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
  }

  async getJobBuilds(options: {
    entity: CompoundEntityRef;
    jobFullName: string;
    instanceName?: string;
  }): Promise<Job> {
    const { entity, jobFullName, instanceName } = options;
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'jenkins',
      )}/v1/entity/${encodeURIComponent(entity.namespace)}/${encodeURIComponent(
        entity.kind,
      )}/${encodeURIComponent(entity.name)}/job/${encodeURIComponent(
        jobFullName,
      )}`,
    );
    this.appendInstanceName(url, instanceName);

    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return (await response.json()).build;
  }

  async getBuildConsoleText(options: {
    entity: CompoundEntityRef;
    jobFullName: string;
    buildNumber: string;
    instanceName?: string;
  }): Promise<BuildConsoleText> {
    const { entity, jobFullName, buildNumber, instanceName } = options;
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'jenkins',
      )}/v1/entity/${encodeURIComponent(entity.namespace)}/${encodeURIComponent(
        entity.kind,
      )}/${encodeURIComponent(entity.name)}/job/${encodeURIComponent(
        jobFullName,
      )}/${encodeURIComponent(buildNumber)}/consoleText`,
    );
    this.appendInstanceName(url, instanceName);

    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return await response.json();
  }

  private appendInstanceName(url: URL, instanceName?: string): void {
    if (instanceName) {
      url.searchParams.set('instanceName', instanceName);
    }
  }
}
