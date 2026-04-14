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

import express from 'express';
import http from 'http';
import fetch from 'node-fetch';
import { JenkinsBuilder, JenkinsEnvironment } from './JenkinsBuilder';
import { JenkinsService } from './jenkinsService';
import { ConfigReader } from '@backstage/config';
import { mockServices } from '@backstage/backend-test-utils';

describe('JenkinsBuilder', () => {
  let mockJenkinsService: jest.Mocked<JenkinsService>;

  beforeEach(() => {
    mockJenkinsService = {
      getProjects: jest.fn(),
      getBuild: jest.fn(),
      getJobBuilds: jest.fn(),
      rebuildProject: jest.fn(),
      getBuildConsoleText: jest.fn(),
    } as unknown as jest.Mocked<JenkinsService>;
  });

  function createEnv(configData: Record<string, any> = {}): JenkinsEnvironment {
    return {
      permissions: {
        authorize: jest.fn(),
        authorizeConditional: jest.fn(),
      },
      config: new ConfigReader(configData),
      logger: mockServices.rootLogger(),
      jenkinsInfoProvider: {} as any,
      discovery: mockServices.discovery(),
      httpAuth: mockServices.httpAuth(),
      jenkinsService: mockJenkinsService,
    };
  }

  describe('build', () => {
    it('should throw if jenkins config is missing and not in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const env = createEnv({});
        const builder = JenkinsBuilder.createBuilder(env);
        await expect(builder.build()).rejects.toThrow(
          'Jenkins configuration is missing',
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should return an empty router if jenkins config is missing in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        const env = createEnv({});
        const builder = JenkinsBuilder.createBuilder(env);
        const { router } = await builder.build();
        expect(router).toBeDefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should return a router when jenkins config is present', async () => {
      const env = createEnv({
        jenkins: { baseUrl: 'https://jenkins.example.com' },
      });
      const builder = JenkinsBuilder.createBuilder(env);
      const { router } = await builder.build();
      expect(router).toBeDefined();
    });
  });

  describe('router', () => {
    let server: http.Server;
    let baseUrl: string;

    beforeEach(async () => {
      const env = createEnv({
        jenkins: { baseUrl: 'https://jenkins.example.com' },
      });
      const builder = JenkinsBuilder.createBuilder(env);
      const { router } = await builder.build();
      const app = express();
      app.use(router);
      server = http.createServer(app);
      await new Promise<void>(resolve => server.listen(0, resolve));
      const addr = server.address();
      if (addr && typeof addr !== 'string') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
    });

    afterEach(async () => {
      await new Promise<void>((resolve, reject) =>
        server.close(err => (err ? reject(err) : resolve())),
      );
    });

    describe('GET /v1/entity/:namespace/:kind/:name/projects', () => {
      it('should return projects', async () => {
        mockJenkinsService.getProjects.mockResolvedValueOnce({
          projects: [{ fullName: 'test-project' }],
        } as any);

        const res = await fetch(
          `${baseUrl}/v1/entity/default/Component/my-service/projects`,
        );

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
          projects: [{ fullName: 'test-project' }],
        });
        expect(mockJenkinsService.getProjects).toHaveBeenCalledWith(
          expect.objectContaining({
            entityRef: {
              kind: 'Component',
              namespace: 'default',
              name: 'my-service',
            },
            branches: undefined,
          }),
        );
      });

      it('should pass branch filter as array', async () => {
        mockJenkinsService.getProjects.mockResolvedValueOnce({
          projects: [],
        } as any);

        await fetch(
          `${baseUrl}/v1/entity/default/Component/my-service/projects?branch=main,develop`,
        );

        expect(mockJenkinsService.getProjects).toHaveBeenCalledWith(
          expect.objectContaining({
            branches: ['main', 'develop'],
          }),
        );
      });
    });

    describe('GET /v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber', () => {
      it('should return a build', async () => {
        mockJenkinsService.getBuild.mockResolvedValueOnce({
          build: { number: 42, result: 'SUCCESS' },
        } as any);

        const res = await fetch(
          `${baseUrl}/v1/entity/default/Component/my-service/job/my-job/42`,
        );

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
          build: { number: 42, result: 'SUCCESS' },
        });
        expect(mockJenkinsService.getBuild).toHaveBeenCalledWith(
          expect.objectContaining({
            entityRef: {
              kind: 'Component',
              namespace: 'default',
              name: 'my-service',
            },
            jobFullName: 'my-job',
            buildNumber: 42,
          }),
        );
      });
    });

    describe('GET /v1/entity/:namespace/:kind/:name/job/:jobFullName', () => {
      it('should return job builds', async () => {
        mockJenkinsService.getJobBuilds.mockResolvedValueOnce({
          builds: [{ number: 1 }, { number: 2 }],
        } as any);

        const res = await fetch(
          `${baseUrl}/v1/entity/default/Component/my-service/job/my-job`,
        );

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
          build: [{ number: 1 }, { number: 2 }],
        });
        expect(mockJenkinsService.getJobBuilds).toHaveBeenCalledWith(
          expect.objectContaining({
            entityRef: {
              kind: 'Component',
              namespace: 'default',
              name: 'my-service',
            },
            jobFullName: 'my-job',
          }),
        );
      });
    });

    describe('POST /v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber', () => {
      it('should return 200 on successful rebuild', async () => {
        mockJenkinsService.rebuildProject.mockResolvedValueOnce({
          status: 'success',
          message: 'ok',
        });

        const res = await fetch(
          `${baseUrl}/v1/entity/default/Component/my-service/job/my-job/42`,
          { method: 'POST' },
        );

        expect(res.status).toBe(200);
        expect(mockJenkinsService.rebuildProject).toHaveBeenCalledWith(
          expect.objectContaining({
            entityRef: {
              kind: 'Component',
              namespace: 'default',
              name: 'my-service',
            },
            jobFullName: 'my-job',
            buildNumber: 42,
          }),
        );
      });

      it('should return 401 on denied rebuild', async () => {
        mockJenkinsService.rebuildProject.mockResolvedValueOnce({
          status: 'denied',
          message: 'not allowed',
        });

        const res = await fetch(
          `${baseUrl}/v1/entity/default/Component/my-service/job/my-job/42`,
          { method: 'POST' },
        );

        expect(res.status).toBe(401);
      });
    });

    describe('GET /v1/entity/:namespace/:kind/:name/job/:jobFullName/:buildNumber/consoleText', () => {
      it('should return console text', async () => {
        mockJenkinsService.getBuildConsoleText.mockResolvedValueOnce({
          consoleText: 'Build output here',
        } as any);

        const res = await fetch(
          `${baseUrl}/v1/entity/default/Component/my-service/job/my-job/42/consoleText`,
        );

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
          consoleText: 'Build output here',
        });
        expect(mockJenkinsService.getBuildConsoleText).toHaveBeenCalledWith(
          expect.objectContaining({
            entityRef: {
              kind: 'Component',
              namespace: 'default',
              name: 'my-service',
            },
            jobFullName: 'my-job',
            buildNumber: 42,
          }),
        );
      });
    });
  });
});
