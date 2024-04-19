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
  DefinitionReference,
} from 'azure-devops-node-api/interfaces/BuildInterfaces';
import {
  BuildResult,
  BuildStatus,
  GitTag,
  PullRequest,
  PullRequestStatus,
  RepoBuild,
} from '@backstage-community/plugin-azure-devops-common';
import {
  GitPullRequest,
  GitRef,
  GitRepository,
} from 'azure-devops-node-api/interfaces/GitInterfaces';
import {
  mappedBuildRun,
  mappedGitTag,
  mappedPullRequest,
  mappedRepoBuild,
} from './mappers';

import { IdentityRef } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';

describe('mappers', () => {
  describe('mappedRepoBuild', () => {
    describe('mappedRepoBuild happy path', () => {
      it('should return RepoBuild from Build', () => {
        const inputBuildDefinition: DefinitionReference = {
          name: 'My Build Definition',
        };

        const inputLinks: any = {
          web: {
            href: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          },
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: inputBuildDefinition,
          _links: inputLinks,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'My Build Definition - Build-1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedRepoBuild(inputBuild)).toEqual(outputRepoBuild);
      });
    });

    describe('mappedRepoBuild with no Build definition name', () => {
      it('should return RepoBuild with only Build Number for title', () => {
        const inputLinks: any = {
          web: {
            href: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          },
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: undefined,
          _links: inputLinks,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'Build-1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedRepoBuild(inputBuild)).toEqual(outputRepoBuild);
      });
    });

    describe('mappedRepoBuild with undefined status', () => {
      it('should return BuildStatus of None for status', () => {
        const inputLinks: any = {
          web: {
            href: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          },
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: undefined,
          result: BuildResult.Succeeded,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: undefined,
          _links: inputLinks,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'Build-1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.None,
          result: BuildResult.Succeeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedRepoBuild(inputBuild)).toEqual(outputRepoBuild);
      });
    });

    describe('mappedRepoBuild with undefined result', () => {
      it('should return BuildResult of None for result', () => {
        const inputLinks: any = {
          web: {
            href: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          },
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: BuildStatus.InProgress,
          result: undefined,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: undefined,
          _links: inputLinks,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'Build-1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.InProgress,
          result: BuildResult.None,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedRepoBuild(inputBuild)).toEqual(outputRepoBuild);
      });
    });

    describe('mappedRepoBuild with undefined link', () => {
      it('should return empty string for link', () => {
        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: BuildStatus.InProgress,
          result: undefined,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: undefined,
          _links: undefined,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'Build-1',
          link: '',
          status: BuildStatus.InProgress,
          result: BuildResult.None,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedRepoBuild(inputBuild)).toEqual(outputRepoBuild);
      });
    });
  });

  describe('mappedGitTag', () => {
    describe('mappedGitTag happy path', () => {
      it('should return GitTag from GitRef', () => {
        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
        };
        const inputGitRef: GitRef = {
          name: 'refs/tags/v1.1.2',
          creator: inputIdentityRef,
          objectId: '1111aaaa2222bbbb3333cccc4444dddd5555eeee',
          peeledObjectId: '1234567890abcdef1234567890abcdef12345678',
        };
        const inputLinkBaseUrl =
          'https://host.com/myOrg/_git/super-feature-repo?version=GT';
        const inputCommitBaseUrl =
          'https://host.com/myOrg/_git/super-feature-repo/commit';
        const outputGitTag: GitTag = {
          name: 'v1.1.2',
          createdBy: 'Jane Doe',
          commitLink:
            'https://host.com/myOrg/_git/super-feature-repo/commit/1234567890abcdef1234567890abcdef12345678',
          objectId: '1111aaaa2222bbbb3333cccc4444dddd5555eeee',
          peeledObjectId: '1234567890abcdef1234567890abcdef12345678',
          link: 'https://host.com/myOrg/_git/super-feature-repo?version=GTv1.1.2',
        };
        expect(
          mappedGitTag(inputGitRef, inputLinkBaseUrl, inputCommitBaseUrl),
        ).toEqual(outputGitTag);
      });
    });
  });

  describe('mappedPullRequest', () => {
    describe('mappedPullRequest happy path', () => {
      it('should return PullRequest from GitPullRequest', () => {
        const inputGitRepository: GitRepository = {
          name: 'super-feature-repo',
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputPullRequest: GitPullRequest = {
          pullRequestId: 7181,
          repository: inputGitRepository,
          title: 'My Awesome New Feature',
          createdBy: inputIdentityRef,
          creationDate: new Date('2020-09-12T06:10:23.932Z'),
          sourceRefName: 'refs/heads/topic/super-awesome-feature',
          targetRefName: 'refs/heads/main',
          status: PullRequestStatus.Active,
          isDraft: false,
        };

        const inputBaseUrl =
          'https://host.com/myOrg/_git/super-feature-repo/pullrequest';

        const outputPullRequest: PullRequest = {
          pullRequestId: 7181,
          repoName: 'super-feature-repo',
          title: 'My Awesome New Feature',
          uniqueName: 'DOMAIN\\jdoe',
          createdBy: 'Jane Doe',
          creationDate: '2020-09-12T06:10:23.932Z',
          sourceRefName: 'refs/heads/topic/super-awesome-feature',
          targetRefName: 'refs/heads/main',
          status: PullRequestStatus.Active,
          isDraft: false,
          link: 'https://host.com/myOrg/_git/super-feature-repo/pullrequest/7181',
        };

        expect(mappedPullRequest(inputPullRequest, inputBaseUrl)).toEqual(
          outputPullRequest,
        );
      });
    });
  });

  describe('mappedBuildRun', () => {
    describe('mappedBuildRun happy path', () => {
      it('should return RepoBuild from Build', () => {
        const inputBuildDefinition: DefinitionReference = {
          name: 'My Build Definition',
        };

        const inputLinks: any = {
          web: {
            href: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          },
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: inputBuildDefinition,
          _links: inputLinks,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'My Build Definition - Build-1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedBuildRun(inputBuild)).toEqual(outputRepoBuild);
      });
    });

    describe('mappedBuildRun with no Build definition name', () => {
      it('should return RepoBuild with only Build Number for title', () => {
        const inputLinks: any = {
          web: {
            href: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          },
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: undefined,
          _links: inputLinks,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'Build-1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.Completed,
          result: BuildResult.Succeeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedBuildRun(inputBuild)).toEqual(outputRepoBuild);
      });
    });

    describe('mappedBuildRun with undefined status', () => {
      it('should return BuildStatus of None for status', () => {
        const inputLinks: any = {
          web: {
            href: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          },
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: undefined,
          result: BuildResult.Succeeded,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: undefined,
          _links: inputLinks,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'Build-1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.None,
          result: BuildResult.Succeeded,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedBuildRun(inputBuild)).toEqual(outputRepoBuild);
      });
    });

    describe('mappedBuildRun with undefined result', () => {
      it('should return BuildResult of None for result', () => {
        const inputLinks: any = {
          web: {
            href: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          },
        };

        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: BuildStatus.InProgress,
          result: undefined,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: undefined,
          _links: inputLinks,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'Build-1',
          link: 'https://host.com/myOrg/0bcc0c0d-2d02/_build/results?buildId=1',
          status: BuildStatus.InProgress,
          result: BuildResult.None,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedBuildRun(inputBuild)).toEqual(outputRepoBuild);
      });
    });

    describe('mappedBuildRun with undefined link', () => {
      it('should return empty string for link', () => {
        const inputIdentityRef: IdentityRef = {
          displayName: 'Jane Doe',
          uniqueName: 'DOMAIN\\jdoe',
        };

        const inputBuild: Build = {
          id: 1,
          buildNumber: 'Build-1',
          status: BuildStatus.InProgress,
          result: undefined,
          queueTime: new Date('2020-09-12T06:10:23.932Z'),
          startTime: new Date('2020-09-12T06:15:23.932Z'),
          finishTime: new Date('2020-09-12T06:20:23.932Z'),
          sourceBranch: 'refs/heads/develop',
          sourceVersion: 'f4f78b3100b2923982bdf60c89c57ce6fd2d9a1c',
          definition: undefined,
          _links: undefined,
          requestedFor: inputIdentityRef,
        };

        const outputRepoBuild: RepoBuild = {
          id: 1,
          title: 'Build-1',
          link: '',
          status: BuildStatus.InProgress,
          result: BuildResult.None,
          queueTime: '2020-09-12T06:10:23.932Z',
          startTime: '2020-09-12T06:15:23.932Z',
          finishTime: '2020-09-12T06:20:23.932Z',
          source: 'refs/heads/develop (f4f78b31)',
          uniqueName: 'DOMAIN\\jdoe',
        };

        expect(mappedBuildRun(inputBuild)).toEqual(outputRepoBuild);
      });
    });
  });
});
