/*
 * Copyright 2021 The Backstage Authors
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

import type { JenkinsInfo } from './jenkinsInfoProvider';
import Jenkins from 'jenkins';
import type {
  BackstageBuild,
  BackstageProject,
  JenkinsBuild,
  JenkinsProject,
  ScmDetails,
} from '../types';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { jenkinsExecutePermission } from '@backstage-community/plugin-jenkins-common';
import fetch, { HeaderInit } from 'node-fetch';
import {
  BackstageCredentials,
  PermissionsService,
} from '@backstage/backend-plugin-api';

export class JenkinsApiImpl {
  private static readonly lastBuildTreeSpec = `lastBuild[
                    number,
                    url,
                    fullDisplayName,
                    displayName,
                    building,
                    result,
                    timestamp,
                    duration,
                    actions[
                      *[
                        *[
                          *[
                            *
                          ]
                        ]
                      ]
                    ]
                  ],`;

  private static readonly jobTreeSpec = `actions[*],
                   ${JenkinsApiImpl.lastBuildTreeSpec}
                   jobs{0,1},
                   url,
                   name,
                   fullName,
                   displayName,
                   fullDisplayName,
                   inQueue`;

  private static readonly jobsTreeSpec = `jobs[
                   ${JenkinsApiImpl.jobTreeSpec}
                 ]{0,50}`;

  private static readonly jobBuildsTreeSpec = `
                   name,
                   description,
                   url,
                   fullName,
                   displayName,
                   fullDisplayName,
                   inQueue,
                   builds[*]`;

  constructor(private readonly permissionApi?: PermissionsService) {}

  /**
   * Get a list of projects for the given JenkinsInfo.
   * @see ../../../jenkins/src/api/JenkinsApi.ts#getProjects
   */
  async getProjects(jenkinsInfo: JenkinsInfo, branches?: string[]) {
    const client = await JenkinsApiImpl.getClient(jenkinsInfo);
    const projects: BackstageProject[] = [];

    if (branches) {
      // Assume jenkinsInfo.jobFullName is a MultiBranch Pipeline project which contains one job per branch.
      // TODO: extract a strategy interface for this
      const job = await Promise.any(
        branches.map(branch =>
          client.job.get({
            name: `${jenkinsInfo.jobFullName}/${encodeURIComponent(branch)}`,
            tree: JenkinsApiImpl.jobTreeSpec.replace(/\s/g, ''),
          }),
        ),
      );
      projects.push(this.augmentProject(job));
    } else {
      // We aren't filtering
      // Assume jenkinsInfo.jobFullName is either
      // a MultiBranch Pipeline (folder with one job per branch) project
      // a Pipeline (standalone) project
      const project = await client.job.get({
        name: jenkinsInfo.jobFullName,
        // Filter only be the information we need, instead of loading all fields.
        // Limit to only show the latest build for each job and only load 50 jobs
        // at all.
        // Whitespaces are only included for readability here and stripped out
        // before sending to Jenkins
        tree: JenkinsApiImpl.jobsTreeSpec.replace(/\s/g, ''),
      });

      const isStandaloneProject = !project.jobs;
      if (isStandaloneProject) {
        const standaloneProject = await client.job.get({
          name: jenkinsInfo.jobFullName,
          tree: JenkinsApiImpl.jobTreeSpec.replace(/\s/g, ''),
        });
        projects.push(this.augmentProject(standaloneProject));
        return projects;
      }
      for (const jobDetails of project.jobs) {
        // for each branch (we assume)
        projects.push(this.augmentProject(jobDetails));
      }
    }
    return projects;
  }

  /**
   * Get a single build.
   * @see ../../../jenkins/src/api/JenkinsApi.ts#getBuild
   */
  async getBuild(
    jenkinsInfo: JenkinsInfo,
    jobFullName: string,
    buildNumber: number,
  ) {
    const client = await JenkinsApiImpl.getClient(jenkinsInfo);

    const project = await client.job.get({
      name: jobFullName,
      depth: 1,
    });

    const build = await client.build.get(jobFullName, buildNumber);
    const jobScmInfo = JenkinsApiImpl.extractScmDetailsFromJob(project);

    return this.augmentBuild(build, jobScmInfo);
  }

  /**
   * Trigger a build of a project
   * @see ../../../jenkins/src/api/JenkinsApi.ts#retry
   */
  async rebuildProject(
    jenkinsInfo: JenkinsInfo,
    jobFullName: string,
    buildNumber: number,
    resourceRef: string,
    options: { credentials: BackstageCredentials },
  ): Promise<number> {
    if (this.permissionApi) {
      const response = await this.permissionApi.authorize(
        [{ permission: jenkinsExecutePermission, resourceRef }],
        { credentials: options.credentials },
      );
      // permission api returns always at least one item, we need to check only one result since we do not expect any additional results
      const { result } = response[0];
      if (result === AuthorizeResult.DENY) {
        return 401;
      }
    }

    const buildUrl = this.getBuildUrl(jenkinsInfo, jobFullName, buildNumber);

    // the current SDK only supports triggering a new build
    // replay the job by triggering request directly from Jenkins api
    const response = await fetch(`${buildUrl}/replay/rebuild`, {
      method: 'post',
      headers: jenkinsInfo.headers as HeaderInit,
    });
    return response.status;
  }

  // private helper methods

  private static async getClient(jenkinsInfo: JenkinsInfo) {
    // The typings for the jenkins library are out of date so just cast to any
    return new (Jenkins as any)({
      baseUrl: jenkinsInfo.baseUrl,
      headers: jenkinsInfo.headers,
      promisify: true,
      crumbIssuer: jenkinsInfo.crumbIssuer,
    });
  }

  private augmentProject(project: JenkinsProject): BackstageProject {
    let status: string;

    if (project.inQueue) {
      status = 'queued';
    } else if (!project.lastBuild) {
      status = 'build not found';
    } else if (project.lastBuild.building) {
      status = 'running';
    } else if (!project.lastBuild.result) {
      status = 'unknown';
    } else {
      status = project.lastBuild.result;
    }

    const jobScmInfo = JenkinsApiImpl.extractScmDetailsFromJob(project);

    return {
      ...project,
      lastBuild: project.lastBuild
        ? this.augmentBuild(project.lastBuild, jobScmInfo)
        : null,
      status,
      // actions: undefined,
    };
  }

  private augmentBuild(
    build: JenkinsBuild,
    jobScmInfo: ScmDetails | undefined,
  ): BackstageBuild {
    const source =
      build.actions
        .filter(
          (action: any) =>
            action?._class === 'hudson.plugins.git.util.BuildData',
        )
        .map((action: any) => {
          const [first]: any = Object.values(action.buildsByBranchName);
          const branch = first.revision.branch[0];
          return {
            branchName: branch.name,
            commit: {
              hash: branch.SHA1.substring(0, 8),
            },
          };
        })
        .pop() || {};

    if (jobScmInfo) {
      source.url = jobScmInfo.url;
      source.displayName = jobScmInfo.displayName;
      source.author = jobScmInfo.author;
    }

    let status: string;
    if (build.building) {
      status = 'running';
    } else if (!build.result) {
      status = 'unknown';
    } else {
      status = build.result;
    }
    return {
      ...build,
      status,
      source: source,
      tests: this.getTestReport(build),
    };
  }

  private static extractScmDetailsFromJob(
    project: JenkinsProject,
  ): ScmDetails | undefined {
    const scmInfo: ScmDetails | undefined = project.actions
      .filter(
        (action: any) =>
          action?._class === 'jenkins.scm.api.metadata.ObjectMetadataAction',
      )
      .map((action: any) => {
        return {
          url: action?.objectUrl,
          // https://javadoc.jenkins.io/plugin/scm-api/jenkins/scm/api/metadata/ObjectMetadataAction.html
          // branch name for regular builds, pull request title on pull requests
          displayName: action?.objectDisplayName,
        };
      })
      .pop();

    if (!scmInfo) {
      return undefined;
    }

    const author = project.actions
      .filter(
        (action: any) =>
          action?._class ===
          'jenkins.scm.api.metadata.ContributorMetadataAction',
      )
      .map((action: any) => {
        return action.contributorDisplayName;
      })
      .pop();

    if (author) {
      scmInfo.author = author;
    }

    return scmInfo;
  }

  private getTestReport(build: JenkinsBuild): {
    total: number;
    passed: number;
    skipped: number;
    failed: number;
    testUrl: string;
  } {
    return build.actions
      .filter(
        (action: any) =>
          action?._class === 'hudson.tasks.junit.TestResultAction',
      )
      .map((action: any) => {
        return {
          total: action.totalCount,
          passed: action.totalCount - action.failCount - action.skipCount,
          skipped: action.skipCount,
          failed: action.failCount,
          testUrl: `${build.url}${action.urlName}/`,
        };
      })
      .pop();
  }

  private getBuildUrl(
    jenkinsInfo: JenkinsInfo,
    jobFullName: string,
    buildId: number,
  ): string {
    const jobs = jobFullName.split('/');
    return `${jenkinsInfo.baseUrl}/job/${jobs.join('/job/')}/${buildId}`;
  }

  async getJobBuilds(jenkinsInfo: JenkinsInfo, jobFullName: string) {
    let jobName = jobFullName;

    if (jobFullName.includes('/')) {
      const arr = jobFullName.split('/');
      const multibranchJobName = arr.shift();
      jobName = [
        multibranchJobName,
        'job',
        encodeURIComponent(arr.join('/')),
      ].join('/');
    }

    const response = await fetch(
      `${
        jenkinsInfo.baseUrl
      }/job/${jobName}/api/json?tree=${JenkinsApiImpl.jobBuildsTreeSpec.replace(
        /\s/g,
        '',
      )}`,
      {
        method: 'get',
        headers: jenkinsInfo.headers as HeaderInit,
      },
    );

    const jobBuilds = await response.json();

    return jobBuilds;
  }
}
