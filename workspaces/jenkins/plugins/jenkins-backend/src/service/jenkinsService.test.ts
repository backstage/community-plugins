/*
 * Copyright 2026 The Backstage Authors
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

import { JenkinsService } from './jenkinsService';
import { JenkinsApiImpl } from './jenkinsApi';
import { JenkinsInfoProvider, JenkinsInfo } from './jenkinsInfoProvider';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { mockServices } from '@backstage/backend-test-utils';

jest.mock('./jenkinsApi');

const MockedJenkinsApiImpl = JenkinsApiImpl as jest.MockedClass<
  typeof JenkinsApiImpl
>;

const mockJenkinsApi = {
  getProjects: jest.fn(),
  getBuild: jest.fn(),
  rebuildProject: jest.fn(),
  getJobBuilds: jest.fn(),
  getBuildConsoleText: jest.fn(),
};

MockedJenkinsApiImpl.mockImplementation(() => mockJenkinsApi as any);

const jenkinsInfo: JenkinsInfo = {
  baseUrl: 'https://jenkins.example.com',
  headers: { Authorization: 'Basic abc' },
  fullJobNames: ['my-job'],
  projectCountLimit: 50,
};

const mockInfoProvider: jest.Mocked<JenkinsInfoProvider> = {
  getInstance: jest.fn().mockResolvedValue(jenkinsInfo),
};

const fakePermissionApi = {
  authorize: jest.fn().mockResolvedValue([{ result: AuthorizeResult.ALLOW }]),
  authorizeConditional: jest.fn(),
};

describe('JenkinsService', () => {
  let service: JenkinsService;
  const auth = mockServices.auth();
  let credentials: any;

  beforeAll(async () => {
    credentials = await auth.getOwnServiceCredentials();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockInfoProvider.getInstance.mockResolvedValue(jenkinsInfo);

    service = JenkinsService.createService({
      permissions: fakePermissionApi,
      logger: mockServices.rootLogger(),
      jenkinsInfoProvider: mockInfoProvider,
    });
  });

  describe('getProjects', () => {
    it('should return projects from the jenkins api', async () => {
      const projects = [{ fullName: 'my-job/main', status: 'success' }];
      mockJenkinsApi.getProjects.mockResolvedValueOnce(projects);

      const result = await service.getProjects({
        entityRef: { kind: 'Component', namespace: 'default', name: 'my-svc' },
        credentials,
      });

      expect(result).toEqual({ projects });
      expect(mockInfoProvider.getInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          entityRef: {
            kind: 'Component',
            namespace: 'default',
            name: 'my-svc',
          },
        }),
      );
      expect(mockJenkinsApi.getProjects).toHaveBeenCalledWith(
        jenkinsInfo,
        undefined,
      );
    });

    it('should pass branches through', async () => {
      mockJenkinsApi.getProjects.mockResolvedValueOnce([]);

      await service.getProjects({
        entityRef: { name: 'my-svc' },
        branches: ['main', 'develop'],
        credentials,
      });

      expect(mockJenkinsApi.getProjects).toHaveBeenCalledWith(jenkinsInfo, [
        'main',
        'develop',
      ]);
    });

    it('should default kind and namespace', async () => {
      mockJenkinsApi.getProjects.mockResolvedValueOnce([]);

      await service.getProjects({
        entityRef: { name: 'my-svc' },
        credentials,
      });

      expect(mockInfoProvider.getInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          entityRef: {
            kind: 'Component',
            namespace: 'default',
            name: 'my-svc',
          },
        }),
      );
    });

    it('should wrap AggregateError with useful message', async () => {
      const aggError: any = new Error('All promises were rejected');
      aggError.errors = [new Error('connection refused')];
      mockJenkinsApi.getProjects.mockRejectedValueOnce(aggError);

      await expect(
        service.getProjects({
          entityRef: { name: 'my-svc' },
          credentials,
        }),
      ).rejects.toThrow(/Unable to fetch projects/);
    });

    it('should rethrow non-aggregate errors as-is', async () => {
      mockJenkinsApi.getProjects.mockRejectedValueOnce(
        new Error('some other error'),
      );

      await expect(
        service.getProjects({
          entityRef: { name: 'my-svc' },
          credentials,
        }),
      ).rejects.toThrow('some other error');
    });
  });

  describe('getBuild', () => {
    it('should return a build', async () => {
      const build = { number: 42, result: 'SUCCESS' };
      mockJenkinsApi.getBuild.mockResolvedValueOnce(build);

      const result = await service.getBuild({
        entityRef: { name: 'my-svc' },
        jobFullName: 'folder/my-job',
        buildNumber: 42,
        credentials,
      });

      expect(result).toEqual({ build });
      expect(mockInfoProvider.getInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          fullJobNames: ['folder/my-job'],
        }),
      );
      expect(mockJenkinsApi.getBuild).toHaveBeenCalledWith(
        jenkinsInfo,
        ['folder', 'my-job'],
        42,
      );
    });
  });

  describe('getJobBuilds', () => {
    it('should return builds for a job', async () => {
      const builds = [{ number: 1 }, { number: 2 }];
      mockJenkinsApi.getJobBuilds.mockResolvedValueOnce(builds);

      const result = await service.getJobBuilds({
        entityRef: { name: 'my-svc' },
        jobFullName: 'my-job',
        credentials,
      });

      expect(result).toEqual({ builds });
      expect(mockJenkinsApi.getJobBuilds).toHaveBeenCalledWith(jenkinsInfo, [
        'my-job',
      ]);
    });
  });

  describe('rebuildProject', () => {
    it('should return success on rebuild', async () => {
      mockJenkinsApi.rebuildProject.mockResolvedValueOnce(200);

      const result = await service.rebuildProject({
        entityRef: { kind: 'Component', namespace: 'default', name: 'my-svc' },
        jobFullName: 'my-job',
        buildNumber: 7,
        credentials,
      });

      expect(result).toEqual({
        status: 'success',
        message: 'Successfully triggered rebuild of my-job #7',
      });
      expect(mockJenkinsApi.rebuildProject).toHaveBeenCalledWith(
        jenkinsInfo,
        ['my-job'],
        7,
        'component:default/my-svc',
        { credentials },
      );
    });
  });

  describe('getBuildConsoleText', () => {
    it('should return console text', async () => {
      mockJenkinsApi.getBuildConsoleText.mockResolvedValueOnce('Build output');

      const result = await service.getBuildConsoleText({
        entityRef: { name: 'my-svc' },
        jobFullName: 'my-job',
        buildNumber: 5,
        credentials,
      });

      expect(result).toEqual({ consoleText: 'Build output' });
      expect(mockJenkinsApi.getBuildConsoleText).toHaveBeenCalledWith(
        jenkinsInfo,
        ['my-job'],
        5,
      );
    });
  });
});
