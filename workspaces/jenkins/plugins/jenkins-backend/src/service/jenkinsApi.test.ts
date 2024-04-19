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

import { JenkinsApiImpl } from './jenkinsApi';
import jenkins from 'jenkins';
import { JenkinsInfo } from './jenkinsInfoProvider';
import { JenkinsBuild, JenkinsProject } from '../types';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import fetch, { Response } from 'node-fetch';
import { mockServices } from '@backstage/backend-test-utils';

jest.mock('jenkins');
jest.mock('node-fetch');
const mockedJenkinsClient = {
  job: {
    get: jest.fn(),
    build: jest.fn(),
  },
  build: {
    get: jest.fn(),
  },
};
const mockedJenkins = jenkins as jest.Mocked<any>;
mockedJenkins.mockReturnValue(mockedJenkinsClient);

const resourceRef = 'component:default/example-component';
const jobFullName = 'example-jobName/foo';
const buildNumber = 19;
const jenkinsInfo: JenkinsInfo = {
  baseUrl: 'https://jenkins.example.com',
  headers: { headerName: 'headerValue' },
  jobFullName: 'example-jobName',
};

const fakePermissionApi = {
  authorize: jest.fn().mockResolvedValue([
    {
      result: AuthorizeResult.ALLOW,
    },
  ]),
  authorizeConditional: jest.fn(),
};

describe('JenkinsApi', () => {
  const jenkinsApi = new JenkinsApiImpl(fakePermissionApi);
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    const project: JenkinsProject = {
      actions: [],
      displayName: 'Example Build',
      fullDisplayName: 'Example jobName » Example Build',
      fullName: 'example-jobName/exampleBuild',
      inQueue: false,
      lastBuild: {
        actions: [],
        timestamp: 1,
        building: false,
        duration: 10,
        result: 'success',
        displayName: '#7',
        fullDisplayName: 'Example jobName » Example Build #7',
        url: 'https://jenkins.example.com/job/example-jobName/job/exampleBuild',
        number: 7,
      },
    };

    describe('standalone project', () => {
      it('should return the only build', async () => {
        mockedJenkinsClient.job.get
          .mockResolvedValueOnce(project)
          .mockResolvedValueOnce(project);
        const result = await jenkinsApi.getProjects(jenkinsInfo);
        expect(mockedJenkinsClient.job.get).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          actions: [],
          displayName: 'Example Build',
          fullDisplayName: 'Example jobName » Example Build',
          fullName: 'example-jobName/exampleBuild',
          inQueue: false,
          lastBuild: {
            actions: [],
            timestamp: 1,
            building: false,
            duration: 10,
            result: 'success',
            displayName: '#7',
            fullDisplayName: 'Example jobName » Example Build #7',
            url: 'https://jenkins.example.com/job/example-jobName/job/exampleBuild',
            number: 7,
            status: 'success',
            source: {},
          },
          status: 'success',
        });
      });
    });

    describe('unfiltered', () => {
      it('standard github layout', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce({ jobs: [project] });

        const result = await jenkinsApi.getProjects(jenkinsInfo);

        expect(mockedJenkins).toHaveBeenCalledWith({
          baseUrl: jenkinsInfo.baseUrl,
          headers: jenkinsInfo.headers,
          promisify: true,
        });
        expect(mockedJenkinsClient.job.get).toHaveBeenCalledWith({
          name: jenkinsInfo.jobFullName,
          tree: expect.anything(),
        });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          actions: [],
          displayName: 'Example Build',
          fullDisplayName: 'Example jobName » Example Build',
          fullName: 'example-jobName/exampleBuild',
          inQueue: false,
          lastBuild: {
            actions: [],
            timestamp: 1,
            building: false,
            duration: 10,
            result: 'success',
            displayName: '#7',
            fullDisplayName: 'Example jobName » Example Build #7',
            url: 'https://jenkins.example.com/job/example-jobName/job/exampleBuild',
            number: 7,
            status: 'success',
            source: {},
          },
          status: 'success',
        });
      });
    });
    describe('filtered by branch', () => {
      it('standard github layout', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce(project);

        const result = await jenkinsApi.getProjects(jenkinsInfo, [
          'testBranchName',
        ]);

        expect(mockedJenkins).toHaveBeenCalledWith({
          baseUrl: jenkinsInfo.baseUrl,
          headers: jenkinsInfo.headers,
          promisify: true,
        });
        expect(mockedJenkinsClient.job.get).toHaveBeenCalledWith({
          name: `${jenkinsInfo.jobFullName}/testBranchName`,
          tree: expect.anything(),
        });
        expect(result).toHaveLength(1);
      });

      it('supports multiple branches', async () => {
        mockedJenkinsClient.job.get.mockResolvedValue(project);

        const result = await jenkinsApi.getProjects(jenkinsInfo, [
          'foo',
          'bar',
          'catpants',
          'with-a/slash',
        ]);

        expect(mockedJenkins).toHaveBeenCalledWith({
          baseUrl: jenkinsInfo.baseUrl,
          headers: jenkinsInfo.headers,
          promisify: true,
        });
        expect(mockedJenkinsClient.job.get).toHaveBeenCalledWith({
          name: `${jenkinsInfo.jobFullName}/foo`,
          tree: expect.anything(),
        });
        expect(mockedJenkinsClient.job.get).toHaveBeenCalledWith({
          name: `${jenkinsInfo.jobFullName}/bar`,
          tree: expect.anything(),
        });
        expect(mockedJenkinsClient.job.get).toHaveBeenCalledWith({
          name: `${jenkinsInfo.jobFullName}/catpants`,
          tree: expect.anything(),
        });
        expect(mockedJenkinsClient.job.get).toHaveBeenCalledWith({
          name: `${jenkinsInfo.jobFullName}/with-a%2Fslash`,
          tree: expect.anything(),
        });
        expect(result).toHaveLength(1);
      });
    });
    describe('augmented', () => {
      const projectWithScmActions: JenkinsProject = {
        actions: [
          {},
          {},
          {},
          {},
          {
            _class: 'jenkins.scm.api.metadata.ContributorMetadataAction',
            contributor: 'testuser',
            contributorDisplayName: 'Mr. T User',
            contributorEmail: null,
          },
          {},
          {
            _class: 'jenkins.scm.api.metadata.ObjectMetadataAction',
            objectDescription: '',
            objectDisplayName: 'Add LICENSE, CoC etc',
            objectUrl: 'https://github.com/backstage/backstage/pull/1',
          },
          {},
          {},
          {
            _class: 'com.cloudbees.plugins.credentials.ViewCredentialsAction',
            stores: {},
          },
        ],
        displayName: 'Example Build',
        fullDisplayName: 'Example jobName » Example Build',
        fullName: 'example-jobName/exampleBuild',
        inQueue: false,
        lastBuild: {
          actions: [
            {
              _class: 'hudson.model.CauseAction',
              causes: [
                {
                  _class: 'jenkins.branch.BranchIndexingCause',
                  shortDescription: 'Branch indexing',
                },
              ],
            },
            {},
            {},
            {},
            {
              _class: 'org.jenkinsci.plugins.workflow.cps.EnvActionImpl',
              environment: {},
            },
            {},
            {},
            {},
            {},
            {},
            {
              _class: 'hudson.plugins.git.util.BuildData',
              buildsByBranchName: {
                'PR-1': {
                  _class: 'hudson.plugins.git.util.Build',
                  buildNumber: 5,
                  buildResult: null,
                  marked: {
                    SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                    branch: [
                      {
                        SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                        name: 'PR-1',
                      },
                    ],
                  },
                  revision: {
                    SHA1: '6c6b34c0fb91cf077a01fe62d3e8e996b4ea5861',
                    branch: [
                      {
                        SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                        name: 'PR-1',
                      },
                    ],
                  },
                },
              },
              lastBuiltRevision: {
                SHA1: '6c6b34c0fb91cf077a01fe62d3e8e996b4ea5861',
                branch: [
                  {
                    SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                    name: 'PR-1',
                  },
                ],
              },
              remoteUrls: ['https://github.com/backstage/backstage.git'],
              scmName: '',
            },
            {
              _class: 'hudson.plugins.git.util.BuildData',
              buildsByBranchName: {
                master: {
                  _class: 'hudson.plugins.git.util.Build',
                  buildNumber: 5,
                  buildResult: null,
                  marked: {
                    SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                    branch: [
                      {
                        SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                        name: 'master',
                      },
                    ],
                  },
                  revision: {
                    SHA1: '6c6b34c0fb91cf077a01fe62d3e8e996b4ea5861',
                    branch: [
                      {
                        SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                        name: 'master',
                      },
                    ],
                  },
                },
              },
              lastBuiltRevision: {
                SHA1: '6c6b34c0fb91cf077a01fe62d3e8e996b4ea5861',
                branch: [
                  {
                    SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                    name: 'master',
                  },
                ],
              },
              remoteUrls: ['https://github.com/backstage/backstage.git'],
              scmName: '',
            },
            {},
            {},
            {
              _class: 'hudson.tasks.junit.TestResultAction',
              failCount: 2,
              skipCount: 1,
              totalCount: 635,
              urlName: 'testReport',
            },
            {},
            {},
            {
              _class:
                'org.jenkinsci.plugins.pipeline.modeldefinition.actions.RestartDeclarativePipelineAction',
              restartEnabled: false,
              restartableStages: [],
            },
            {},
          ],
          timestamp: 1,
          building: false,
          duration: 10,
          result: 'success',
          displayName: '#7',
          fullDisplayName: 'Example jobName » Example Build #7',
          url: 'https://jenkins.example.com/job/example-jobName/job/exampleBuild/7/',
          number: 7,
        },
      };

      const projectWithoutBuild: JenkinsProject = {
        actions: [],
        displayName: 'Example Build',
        fullDisplayName: 'Example jobName » Example Build',
        fullName: 'example-jobName/exampleBuild',
        inQueue: false,
        lastBuild: null,
      };

      it('augments project', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce({
          jobs: [projectWithScmActions],
        });

        const result = await jenkinsApi.getProjects(jenkinsInfo);

        expect(result).toHaveLength(1);
        expect(result[0].status).toEqual('success');
      });
      it('augments project without build', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce({
          jobs: [projectWithoutBuild],
        });

        const result = await jenkinsApi.getProjects(jenkinsInfo);

        expect(result).toHaveLength(1);
        expect(result[0].status).toEqual('build not found');
      });
      it('augments  build', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce({
          jobs: [projectWithScmActions],
        });

        const result = await jenkinsApi.getProjects(jenkinsInfo);

        expect(result).toHaveLength(1);
        // TODO: I am really just asserting the previous behaviour with no understanding here.
        // In my 2 Jenkins instances, 1 returns a lot of different and confusing BuildData sections and 1 returns none ☹️
        expect(result[0].lastBuild!.source).toEqual({
          branchName: 'master',
          commit: {
            hash: '14d31bde',
          },
          url: 'https://github.com/backstage/backstage/pull/1',
          displayName: 'Add LICENSE, CoC etc',
          author: 'Mr. T User',
        });
      });
      it('finds test report', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce({
          jobs: [projectWithScmActions],
        });

        const result = await jenkinsApi.getProjects(jenkinsInfo);

        expect(result).toHaveLength(1);
        expect(result[0].lastBuild!.tests).toEqual({
          total: 635,
          passed: 632,
          skipped: 1,
          failed: 2,
          testUrl:
            'https://jenkins.example.com/job/example-jobName/job/exampleBuild/7/testReport/',
        });
      });
    });
    describe('augmented with null values', () => {
      const projectWithScmActionsAndNulls: JenkinsProject = {
        actions: [
          {},
          {},
          {},
          {},
          {
            _class: 'jenkins.scm.api.metadata.ContributorMetadataAction',
            contributor: 'testuser',
            contributorDisplayName: 'Mr. T User',
            contributorEmail: null,
          },
          {},
          {
            _class: 'jenkins.scm.api.metadata.ObjectMetadataAction',
            objectDescription: '',
            objectDisplayName: 'Add LICENSE, CoC etc',
            objectUrl: 'https://github.com/backstage/backstage/pull/1',
          },
          {},
          {},
          {
            _class: 'com.cloudbees.plugins.credentials.ViewCredentialsAction',
            stores: {},
          },
        ],
        displayName: 'Example Build',
        fullDisplayName: 'Example jobName » Example Build',
        fullName: 'example-jobName/exampleBuild',
        inQueue: false,
        lastBuild: {
          actions: [
            {
              _class: 'hudson.model.CauseAction',
              causes: [
                {
                  _class: 'jenkins.branch.BranchIndexingCause',
                  shortDescription: 'Branch indexing',
                },
              ],
            },
            null,
            {},
            {},
            {
              _class: 'org.jenkinsci.plugins.workflow.cps.EnvActionImpl',
              environment: {},
            },
            {},
            {},
            {},
            {},
            {},
            {
              _class: 'hudson.plugins.git.util.BuildData',
              buildsByBranchName: {
                'PR-1': {
                  _class: 'hudson.plugins.git.util.Build',
                  buildNumber: 5,
                  buildResult: null,
                  marked: {
                    SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                    branch: [
                      {
                        SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                        name: 'PR-1',
                      },
                    ],
                  },
                  revision: {
                    SHA1: '6c6b34c0fb91cf077a01fe62d3e8e996b4ea5861',
                    branch: [
                      {
                        SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                        name: 'PR-1',
                      },
                    ],
                  },
                },
              },
              lastBuiltRevision: {
                SHA1: '6c6b34c0fb91cf077a01fe62d3e8e996b4ea5861',
                branch: [
                  {
                    SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                    name: 'PR-1',
                  },
                ],
              },
              remoteUrls: ['https://github.com/backstage/backstage.git'],
              scmName: '',
            },
            {
              _class: 'hudson.plugins.git.util.BuildData',
              buildsByBranchName: {
                master: {
                  _class: 'hudson.plugins.git.util.Build',
                  buildNumber: 5,
                  buildResult: null,
                  marked: {
                    SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                    branch: [
                      {
                        SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                        name: 'master',
                      },
                    ],
                  },
                  revision: {
                    SHA1: '6c6b34c0fb91cf077a01fe62d3e8e996b4ea5861',
                    branch: [
                      {
                        SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                        name: 'master',
                      },
                    ],
                  },
                },
              },
              lastBuiltRevision: {
                SHA1: '6c6b34c0fb91cf077a01fe62d3e8e996b4ea5861',
                branch: [
                  {
                    SHA1: '14d31bde346fcad64ab939f82d195db36701cfcb',
                    name: 'master',
                  },
                ],
              },
              remoteUrls: ['https://github.com/backstage/backstage.git'],
              scmName: '',
            },
            {},
            {},
            {
              _class: 'hudson.tasks.junit.TestResultAction',
              failCount: 2,
              skipCount: 1,
              totalCount: 635,
              urlName: 'testReport',
            },
            {},
            {},
            {
              _class:
                'org.jenkinsci.plugins.pipeline.modeldefinition.actions.RestartDeclarativePipelineAction',
              restartEnabled: false,
              restartableStages: [],
            },
            {},
          ],
          timestamp: 1,
          building: false,
          duration: 10,
          result: 'success',
          displayName: '#7',
          fullDisplayName: 'Example jobName » Example Build #7',
          url: 'https://jenkins.example.com/job/example-jobName/job/exampleBuild/7/',
          number: 7,
        },
      };

      it('augments project', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce({
          jobs: [projectWithScmActionsAndNulls],
        });

        const result = await jenkinsApi.getProjects(jenkinsInfo);

        expect(result).toHaveLength(1);
        expect(result[0].status).toEqual('success');
      });
      it('augments  build', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce({
          jobs: [projectWithScmActionsAndNulls],
        });

        const result = await jenkinsApi.getProjects(jenkinsInfo);

        expect(result).toHaveLength(1);
        // TODO: I am really just asserting the previous behaviour with no understanding here.
        // In my 2 Jenkins instances, 1 returns a lot of different and confusing BuildData sections and 1 returns none ☹️
        expect(result[0].lastBuild!.source).toEqual({
          branchName: 'master',
          commit: {
            hash: '14d31bde',
          },
          url: 'https://github.com/backstage/backstage/pull/1',
          displayName: 'Add LICENSE, CoC etc',
          author: 'Mr. T User',
        });
      });
      it('finds test report', async () => {
        mockedJenkinsClient.job.get.mockResolvedValueOnce({
          jobs: [projectWithScmActionsAndNulls],
        });

        const result = await jenkinsApi.getProjects(jenkinsInfo);

        expect(result).toHaveLength(1);
        expect(result[0].lastBuild!.tests).toEqual({
          total: 635,
          passed: 632,
          skipped: 1,
          failed: 2,
          testUrl:
            'https://jenkins.example.com/job/example-jobName/job/exampleBuild/7/testReport/',
        });
      });
    });
  });
  it('getBuild', async () => {
    const project: JenkinsProject = {
      actions: [],
      displayName: 'Example Build',
      fullDisplayName: 'Example jobName » Example Build',
      fullName: 'example-jobName/exampleBuild',
      inQueue: false,
      lastBuild: {
        actions: [],
        timestamp: 1,
        building: false,
        duration: 10,
        result: 'success',
        displayName: '#7',
        fullDisplayName: 'Example jobName » Example Build #7',
        url: 'https://jenkins.example.com/job/example-jobName/job/exampleBuild',
        number: 7,
      },
    };
    const build: JenkinsBuild = {
      actions: [],
      timestamp: 1,
      building: false,
      duration: 10,
      result: 'success',
      fullDisplayName: 'example-jobName/exampleBuild',
      displayName: 'exampleBuild',
      url: `https://jenkins.example.com/job/example-jobName/job/exampleBuild/build/${buildNumber}`,
      number: buildNumber,
    };
    mockedJenkinsClient.job.get.mockResolvedValueOnce(project);
    mockedJenkinsClient.build.get.mockResolvedValueOnce(build);

    await jenkinsApi.getBuild(jenkinsInfo, jobFullName, buildNumber);

    expect(mockedJenkins).toHaveBeenCalledWith({
      baseUrl: jenkinsInfo.baseUrl,
      headers: jenkinsInfo.headers,
      promisify: true,
    });
    expect(mockedJenkinsClient.job.get).toHaveBeenCalledWith({
      name: jobFullName,
      depth: 1,
    });
    expect(mockedJenkinsClient.build.get).toHaveBeenCalledWith(
      jobFullName,
      buildNumber,
    );
  });
  it('getBuildUrl', async () => {
    const jenkinsApiProto = Object.getPrototypeOf(jenkinsApi);
    const buildUrl = jenkinsApiProto.getBuildUrl(
      jenkinsInfo,
      jobFullName,
      buildNumber,
    );
    expect(buildUrl).toEqual(
      'https://jenkins.example.com/job/example-jobName/job/foo/19',
    );

    const buildUrlTriple = jenkinsApiProto.getBuildUrl(
      jenkinsInfo,
      'example-jobName/foo/bar',
      buildNumber,
    );
    expect(buildUrlTriple).toEqual(
      'https://jenkins.example.com/job/example-jobName/job/foo/job/bar/19',
    );
  });
  describe('rebuildProject', () => {
    const auth = mockServices.auth();

    it('successfully rebuilds', async () => {
      mockFetch.mockResolvedValueOnce({ status: 200 } as Response);
      const status = await jenkinsApi.rebuildProject(
        jenkinsInfo,
        jobFullName,
        buildNumber,
        resourceRef,
        { credentials: await auth.getOwnServiceCredentials() },
      );
      expect(status).toEqual(200);
    });
    it('fails to rebuild', async () => {
      mockFetch.mockResolvedValueOnce({ status: 401 } as Response);
      const status = await jenkinsApi.rebuildProject(
        jenkinsInfo,
        jobFullName,
        buildNumber,
        resourceRef,
        { credentials: await auth.getOwnServiceCredentials() },
      );
      expect(status).toEqual(401);
    });

    it('should fail if it does not have required permissions', async () => {
      fakePermissionApi.authorize.mockResolvedValueOnce([
        {
          result: AuthorizeResult.DENY,
        },
      ]);

      mockFetch.mockResolvedValueOnce({ status: 200 } as Response);
      const status = await jenkinsApi.rebuildProject(
        jenkinsInfo,
        jobFullName,
        buildNumber,
        resourceRef,
        { credentials: await auth.getOwnServiceCredentials() },
      );
      expect(status).toEqual(401);
    });
  });
});
