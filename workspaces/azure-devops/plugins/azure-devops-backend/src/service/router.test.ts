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

import {
  Build,
  BuildDefinitionReference,
} from 'azure-devops-node-api/interfaces/BuildInterfaces';
import {
  BuildResult,
  BuildRun,
  BuildStatus,
  GitTag,
  PullRequest,
  PullRequestStatus,
  RepoBuild,
} from '@backstage-community/plugin-azure-devops-common';

import { AzureDevOpsApi } from '../api';
import { ConfigReader } from '@backstage/config';
import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { createRouter } from './router';
import express from 'express';
import { getVoidLogger, UrlReaders } from '@backstage/backend-common';
import request from 'supertest';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

describe('createRouter', () => {
  let azureDevOpsApi: jest.Mocked<AzureDevOpsApi>;
  let app: express.Express;
  const mockedAuthorize = jest
    .fn()
    .mockImplementation(async () => [{ result: AuthorizeResult.ALLOW }]);
  const mockedAuthorizeConditional = jest
    .fn()
    .mockImplementation(async () => [{ result: AuthorizeResult.ALLOW }]);

  const mockPermissionEvaluator = {
    authorize: mockedAuthorize,
    authorizeConditional: mockedAuthorizeConditional,
  };

  jest.mock('@backstage/plugin-auth-node', () => ({
    getBearerTokenFromAuthorizationHeader: () => 'token',
  }));

  beforeAll(async () => {
    azureDevOpsApi = {
      getGitRepository: jest.fn(),
      getBuildList: jest.fn(),
      getBuildDefinitions: jest.fn(),
      getRepoBuilds: jest.fn(),
      getDefinitionBuilds: jest.fn(),
      getGitTags: jest.fn(),
      getPullRequests: jest.fn(),
      getBuilds: jest.fn(),
      getBuildRuns: jest.fn(),
      getAllTeams: jest.fn(),
      getTeamMembers: jest.fn(),
      getReadme: jest.fn(),
    } as any;

    const config = new ConfigReader({
      azureDevOps: {
        token: 'foo',
        host: 'host.com',
        organization: 'myOrg',
        top: 5,
      },
    });

    const logger = getVoidLogger();

    const router = await createRouter({
      config,
      logger,
      azureDevOpsApi,
      reader: UrlReaders.default({
        config,
        logger,
      }),
      permissions: mockPermissionEvaluator,
    });

    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /repository/:projectName/:repoName', () => {
    it('fetches a single repository', async () => {
      const gitRepository: GitRepository = {
        id: 'af4ae3af-e747-4129-9bbc-d1329f6b0998',
        name: 'myRepo',
        url: 'https://host.com/repo',
        defaultBranch: 'refs/heads/develop',
        sshUrl: 'ssh://host.com/repo',
        webUrl: 'https://host.com/webRepo',
      };

      azureDevOpsApi.getGitRepository.mockResolvedValueOnce(gitRepository);

      const response = await request(app).get('/repository/myProject/myRepo');

      expect(azureDevOpsApi.getGitRepository).toHaveBeenCalledWith(
        'myProject',
        'myRepo',
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(gitRepository);
    });
  });

  describe('GET /builds/:projectName/:repoId', () => {
    it('fetches a list of builds', async () => {
      const firstBuild: Build = {
        id: 1,
        buildNumber: 'Build-1',
        status: BuildStatus.Completed,
        result: BuildResult.Succeeded,
        queueTime: undefined,
        sourceBranch: 'refs/heads/develop',
        sourceVersion: '9bedf67800b2923982bdf60c89c57ce6fd2d9a1c',
      };

      const secondBuild: Build = {
        id: 2,
        buildNumber: 'Build-2',
        status: BuildStatus.InProgress,
        result: BuildResult.None,
        queueTime: undefined,
        sourceBranch: 'refs/heads/develop',
        sourceVersion: '13c988d4f15e06bcdd0b0af290086a3079cdadb0',
      };

      const thirdBuild: Build = {
        id: 3,
        buildNumber: 'Build-3',
        status: BuildStatus.Completed,
        result: BuildResult.PartiallySucceeded,
        queueTime: undefined,
        sourceBranch: 'refs/heads/develop',
        sourceVersion: 'f4f78b319c308600eab015a5d6529add21660dc1',
      };

      const builds: Build[] = [firstBuild, secondBuild, thirdBuild];

      azureDevOpsApi.getBuildList.mockResolvedValueOnce(builds);

      const response = await request(app)
        .get('/builds/myProject/af4ae3af-e747-4129-9bbc-d1329f6b0998')
        .query({ top: '40' });

      expect(azureDevOpsApi.getBuildList).toHaveBeenCalledWith(
        'myProject',
        'af4ae3af-e747-4129-9bbc-d1329f6b0998',
        40,
        undefined,
        undefined,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(builds);
    });
  });

  describe('GET /repo-builds/:projectName/:repoName', () => {
    it('fetches a list of repo builds', async () => {
      const firstRepoBuild: RepoBuild = {
        id: 1,
        title: 'My Build Definition - Build 1',
        link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
        status: BuildStatus.Completed,
        result: BuildResult.PartiallySucceeded,
        queueTime: '2020-09-12T06:10:23.932Z',
        source: 'refs/heads/develop (f4f78b31)',
      };

      const secondRepoBuild: RepoBuild = {
        id: 2,
        title: 'My Build Definition - Build 2',
        link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=2',
        status: BuildStatus.InProgress,
        result: BuildResult.None,
        queueTime: '2020-09-12T06:10:23.932Z',
        source: 'refs/heads/develop (13c988d4)',
      };

      const thirdRepoBuild: RepoBuild = {
        id: 3,
        title: 'My Build Definition - Build 3',
        link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=3',
        status: BuildStatus.Completed,
        result: BuildResult.Succeeded,
        queueTime: '2020-09-12T06:10:23.932Z',
        source: 'refs/heads/develop (9bedf678)',
      };

      const repoBuilds: RepoBuild[] = [
        firstRepoBuild,
        secondRepoBuild,
        thirdRepoBuild,
      ];

      azureDevOpsApi.getRepoBuilds.mockResolvedValueOnce(repoBuilds);

      const response = await request(app)
        .get('/repo-builds/myProject/myRepo')
        .query({ top: '50' });

      expect(azureDevOpsApi.getRepoBuilds).toHaveBeenCalledWith(
        'myProject',
        'myRepo',
        50,
        undefined,
        undefined,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(repoBuilds);
    });
  });

  describe('GET /git-tags/:projectName/:repoName', () => {
    it('fetches a list of git tags', async () => {
      const firstGitTag: GitTag = {
        name: 'v1.1.2',
        createdBy: 'Jane Doe',
        commitLink:
          'https://host.com/myOrg/_git/super-feature-repo/commit/1234567890abcdef1234567890abcdef12345678',
        objectId: '1111aaaa2222bbbb3333cccc4444dddd5555eeee',
        peeledObjectId: '1234567890abcdef1234567890abcdef12345678',
        link: 'https://host.com/myOrg/_git/super-feature-repo?version=GTv1.1.2',
      };

      const secondGitTag: GitTag = {
        name: 'v1.2.0',
        createdBy: 'Jane Doe',
        commitLink:
          'https://host.com/myOrg/_git/super-feature-repo/commit/2222222222222222222222222222222222222222',
        objectId: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        peeledObjectId: '2222222222222222222222222222222222222222',
        link: 'https://host.com/myOrg/_git/super-feature-repo?version=GTv1.2.0',
      };

      const gitTags: GitTag[] = [firstGitTag, secondGitTag];

      azureDevOpsApi.getGitTags.mockResolvedValueOnce(gitTags);

      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);

      const response = await request(app)
        .get('/git-tags/myProject/myRepo')
        .query({ entityRef: 'component:default/mycomponent' });

      expect(azureDevOpsApi.getGitTags).toHaveBeenCalledWith(
        'myProject',
        'myRepo',
        undefined,
        undefined,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(gitTags);
    });
  });

  describe('GET /pull-requests/:projectName/:repoName', () => {
    it('fetches a list of pull requests', async () => {
      const firstPullRequest: PullRequest = {
        pullRequestId: 7181,
        repoName: 'super-feature-repo',
        title: 'My Awesome New Feature',
        createdBy: 'Jane Doe',
        creationDate: '2020-09-12T06:10:23.932Z',
        sourceRefName: 'refs/heads/topic/super-awesome-feature',
        targetRefName: 'refs/heads/main',
        status: PullRequestStatus.Active,
        isDraft: false,
        link: 'https://host.com/myOrg/_git/super-feature-repo/pullrequest/7181',
      };

      const secondPullRequest: PullRequest = {
        pullRequestId: 7182,
        repoName: 'super-feature-repo',
        title: 'Refactoring My Awesome New Feature',
        createdBy: 'Jane Doe',
        creationDate: '2020-09-12T06:10:23.932Z',
        sourceRefName: 'refs/heads/topic/refactor-super-awesome-feature',
        targetRefName: 'refs/heads/main',
        status: PullRequestStatus.Active,
        isDraft: false,
        link: 'https://host.com/myOrg/_git/super-feature-repo/pullrequest/7182',
      };

      const thirdPullRequest: PullRequest = {
        pullRequestId: 7183,
        repoName: 'super-feature-repo',
        title: 'Bug Fix for My Awesome New Feature',
        createdBy: 'Jane Doe',
        creationDate: '2020-09-12T06:10:23.932Z',
        sourceRefName: 'refs/heads/topic/fix-super-awesome-feature',
        targetRefName: 'refs/heads/main',
        status: PullRequestStatus.Active,
        isDraft: false,
        link: 'https://host.com/myOrg/_git/super-feature-repo/pullrequest/7183',
      };

      const pullRequests: PullRequest[] = [
        firstPullRequest,
        secondPullRequest,
        thirdPullRequest,
      ];

      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);

      azureDevOpsApi.getPullRequests.mockResolvedValueOnce(pullRequests);

      const response = await request(app)
        .get('/pull-requests/myProject/myRepo')
        .query({ entityRef: 'component:default/mycomponent' })
        .query({ top: '50', status: 1 });

      expect(azureDevOpsApi.getPullRequests).toHaveBeenCalledWith(
        'myProject',
        'myRepo',
        { status: 1, top: 50, teamsLimit: 100 },
        undefined,
        undefined,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(pullRequests);
    });
    it('fetches a list of pull requests when using teamsLimit', async () => {
      const firstPullRequest: PullRequest = {
        pullRequestId: 7181,
        repoName: 'super-feature-repo',
        title: 'My Awesome New Feature',
        createdBy: 'Jane Doe',
        creationDate: '2020-09-12T06:10:23.932Z',
        sourceRefName: 'refs/heads/topic/super-awesome-feature',
        targetRefName: 'refs/heads/main',
        status: PullRequestStatus.Active,
        isDraft: false,
        link: 'https://host.com/myOrg/_git/super-feature-repo/pullrequest/7181',
      };

      const secondPullRequest: PullRequest = {
        pullRequestId: 7182,
        repoName: 'super-feature-repo',
        title: 'Refactoring My Awesome New Feature',
        createdBy: 'Jane Doe',
        creationDate: '2020-09-12T06:10:23.932Z',
        sourceRefName: 'refs/heads/topic/refactor-super-awesome-feature',
        targetRefName: 'refs/heads/main',
        status: PullRequestStatus.Active,
        isDraft: false,
        link: 'https://host.com/myOrg/_git/super-feature-repo/pullrequest/7182',
      };

      const thirdPullRequest: PullRequest = {
        pullRequestId: 7183,
        repoName: 'super-feature-repo',
        title: 'Bug Fix for My Awesome New Feature',
        createdBy: 'Jane Doe',
        creationDate: '2020-09-12T06:10:23.932Z',
        sourceRefName: 'refs/heads/topic/fix-super-awesome-feature',
        targetRefName: 'refs/heads/main',
        status: PullRequestStatus.Active,
        isDraft: false,
        link: 'https://host.com/myOrg/_git/super-feature-repo/pullrequest/7183',
      };

      const pullRequests: PullRequest[] = [
        firstPullRequest,
        secondPullRequest,
        thirdPullRequest,
      ];

      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);

      azureDevOpsApi.getPullRequests.mockResolvedValueOnce(pullRequests);

      const response = await request(app)
        .get('/pull-requests/myProject/myRepo')
        .query({ entityRef: 'component:default/mycomponent' })
        .query({ top: '50', status: 1, teamsLimit: 50 });

      expect(azureDevOpsApi.getPullRequests).toHaveBeenCalledWith(
        'myProject',
        'myRepo',
        { status: 1, top: 50, teamsLimit: 50 },
        undefined,
        undefined,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(pullRequests);
    });
  });

  describe('GET /build-definitions/:projectName/:definitionName', () => {
    it('fetches a list of build definitions', async () => {
      const inputDefinition: BuildDefinitionReference = {
        id: 1,
        name: 'myBuildDefinition',
      };

      const inputDefinitions: BuildDefinitionReference[] = [inputDefinition];

      azureDevOpsApi.getBuildDefinitions.mockResolvedValueOnce(
        inputDefinitions,
      );

      const response = await request(app).get(
        '/build-definitions/myProject/myBuildDefinition',
      );

      expect(azureDevOpsApi.getBuildDefinitions).toHaveBeenCalledWith(
        'myProject',
        'myBuildDefinition',
        undefined,
        undefined,
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(inputDefinitions);
    });
  });

  describe('GET /builds/:projectName', () => {
    describe('GET /builds/:projectName with repoName', () => {
      it('fetches a list of build runs using repoName', async () => {
        const firstBuildRun: BuildRun = {
          id: 1,
          title: 'My Build Definition - Build 1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.Completed,
          result: BuildResult.PartiallySucceeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
        };

        const secondBuildRun: BuildRun = {
          id: 2,
          title: 'My Build Definition - Build 2',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=2',
          status: BuildStatus.InProgress,
          result: BuildResult.None,
          queueTime: '2020-09-12T06:10:23.932Z',
          source: 'refs/heads/develop (13c988d4)',
        };

        const thirdBuildRun: BuildRun = {
          id: 3,
          title: 'My Build Definition - Build 3',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=3',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          source: 'refs/heads/develop (9bedf678)',
        };

        const buildRuns: BuildRun[] = [
          firstBuildRun,
          secondBuildRun,
          thirdBuildRun,
        ];

        azureDevOpsApi.getBuildRuns.mockResolvedValueOnce(buildRuns);

        mockedAuthorize.mockImplementationOnce(async () => [
          { result: AuthorizeResult.ALLOW },
        ]);

        const response = await request(app)
          .get('/builds/myProject')
          .query({ entityRef: 'component:default/mycomponent' })
          .query({ top: '50', repoName: 'myRepo' });

        expect(azureDevOpsApi.getBuildRuns).toHaveBeenCalledWith(
          'myProject',
          50,
          'myRepo',
          undefined,
          undefined,
          undefined,
        );
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(buildRuns);
      });
    });

    describe('GET /builds/:projectName with definitionName', () => {
      it('fetches a list of build runs using definitionName', async () => {
        const firstBuildRun: BuildRun = {
          id: 1,
          title: 'My Build Definition - Build 1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.Completed,
          result: BuildResult.PartiallySucceeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
        };

        const secondBuildRun: BuildRun = {
          id: 2,
          title: 'My Build Definition - Build 2',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=2',
          status: BuildStatus.InProgress,
          result: BuildResult.None,
          queueTime: '2020-09-12T06:10:23.932Z',
          source: 'refs/heads/develop (13c988d4)',
        };

        const thirdBuildRun: BuildRun = {
          id: 3,
          title: 'My Build Definition - Build 3',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=3',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          source: 'refs/heads/develop (9bedf678)',
        };

        const buildRuns: BuildRun[] = [
          firstBuildRun,
          secondBuildRun,
          thirdBuildRun,
        ];

        mockedAuthorize.mockImplementationOnce(async () => [
          { result: AuthorizeResult.ALLOW },
        ]);

        azureDevOpsApi.getBuildRuns.mockResolvedValueOnce(buildRuns);

        const response = await request(app)
          .get('/builds/myProject')
          .query({ entityRef: 'component:default/mycomponent' })
          .query({ top: '50', definitionName: 'myDefinition' });

        expect(azureDevOpsApi.getBuildRuns).toHaveBeenCalledWith(
          'myProject',
          50,
          undefined,
          'myDefinition',
          undefined,
          undefined,
        );
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(buildRuns);
      });
    });
  });

  describe('GET /users/:userId/team-ids', () => {
    it('fetches a a list of teams', async () => {
      azureDevOpsApi.getAllTeams.mockResolvedValue([]);
      const response = await request(app).get('/users/user1/team-ids');
      expect(response.status).toEqual(200);
    });
  });

  describe('GET /readme/:projectName/:repoName', () => {
    it('fetches default default readme file', async () => {
      const content = getReadmeMock();
      const url = `https://host.com/myOrg/myProject/_git/myRepo?path=README.md`;

      azureDevOpsApi.getReadme.mockResolvedValueOnce({
        content,
        url,
      });
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);

      const response = await request(app)
        .get('/readme/myProject/myRepo?path=README.md')
        .query({ entityRef: 'component:default/mycomponent' });
      expect(azureDevOpsApi.getReadme).toHaveBeenCalledWith(
        'host.com',
        'myOrg',
        'myProject',
        'myRepo',
        'README.md',
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        content,
        url,
      });
    });
  });

  describe('GET /readme/:projectName/:repoName with readme filename', () => {
    it('fetches specified readme file', async () => {
      const content = getReadmeMock();
      const url = `https://host.com/myOrg/myProject/_git/myRepo?path=README_NOT_DEFAULT.md`;

      azureDevOpsApi.getReadme.mockResolvedValueOnce({
        content,
        url,
      });
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);

      const response = await request(app)
        .get('/readme/myProject/myRepo?path=README_NOT_DEFAULT.md')
        .query({ entityRef: 'component:default/mycomponent' });
      expect(azureDevOpsApi.getReadme).toHaveBeenCalledWith(
        'host.com',
        'myOrg',
        'myProject',
        'myRepo',
        'README_NOT_DEFAULT.md',
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        content,
        url,
      });
    });
  });

  describe('GET /readme/:projectName/:repoName with readme path', () => {
    it('fetches specified readme file from subfolder', async () => {
      const content = getReadmeMock();
      const url = `https://host.com/myOrg/myProject/_git/myRepo?path=/my-path/README.md`;

      azureDevOpsApi.getReadme.mockResolvedValueOnce({
        content,
        url,
      });
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);

      const response = await request(app)
        .get('/readme/myProject/myRepo?path=/my-path/README.md')
        .query({ entityRef: 'component:default/mycomponent' });
      expect(azureDevOpsApi.getReadme).toHaveBeenCalledWith(
        'host.com',
        'myOrg',
        'myProject',
        'myRepo',
        '/my-path/README.md',
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        content,
        url,
      });
    });
  });

  describe('GET /readme/:projectName/:repoName with a bad readme path (multiple values)', () => {
    it('throws InputError', async () => {
      const response = await request(app).get(
        '/readme/myProject/myRepo?path=1&path=2',
      );
      expect(azureDevOpsApi.getReadme).not.toHaveBeenCalled();
      expect(response.status).toEqual(400);
    });
  });

  describe('GET /readme/:projectName/:repoName with a bad readme path (empty string)', () => {
    it('throws InputError', async () => {
      const response = await request(app).get('/readme/myProject/myRepo?path=');
      expect(azureDevOpsApi.getReadme).not.toHaveBeenCalled();
      expect(response.status).toEqual(400);
    });
  });
});

function getReadmeMock() {
  return `
    # Introduction 
    TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project. 

    # Getting Started
    TODO: Guide users through getting your code up and running on their own system. In this section you can talk about:
    1.	Installation process
    2.	Software dependencies
    3.	Latest releases
    4.	API references

    # Build and Test
    TODO: Describe and show how to build your code and run the tests. 

    # Contribute
    TODO: Explain how other users and developers can contribute to make your code better. 

    If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
    - [ASP.NET Core](https://github.com/aspnet/Home)
    - [Visual Studio Code](https://github.com/Microsoft/vscode)
    - [Chakra Core](https://github.com/Microsoft/ChakraCore)


    - ![Imagem 1](./images/image1.jpg)
    - ![Imagem 2](./images/image2.png)
    - ![Imagem 3](./images/image3.jpg)
    - ![Imagem 4](./images/image4.webp)
    - ![Imagem 5](./images/image5.png)
    - ![Imagem 6](/images/image6.png)
    - ![Imagem 7](/images/image-7.jpg)
    - ![Imagem 8](./images/image-8.gif)
    - ![Imagem 9](/images/image9.png)
  `;
}
