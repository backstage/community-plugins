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
// Copyright 2021 Larder Software Limited
// Migrated from https://github.com/RoadieHQ/roadie-backstage-plugins in 2026.
import os from 'os'; // eslint-disable-line

import { PassThrough } from 'stream'; // eslint-disable-line
import { mockServices } from '@backstage/backend-test-utils';
import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { createHttpBackstageAction } from './backstageRequest';
import { http } from './helpers';

jest.mock('./helpers', () => ({
  ...jest.requireActual('./helpers.ts'),
  http: jest.fn(),
}));

describe('http:backstage:request', () => {
  let action: any;
  const mockBaseUrl = 'http://backstage.tests';
  const logger = mockServices.logger.mock();
  const loggerSpy = jest.spyOn(logger, 'info');
  const discovery = UrlPatternDiscovery.compile(`${mockBaseUrl}/{{pluginId}}`);

  beforeEach(() => {
    jest.resetAllMocks();
    action = createHttpBackstageAction({ discovery });
  });

  const mockContext = {
    workspacePath: os.tmpdir(),
    logger: logger,
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    isDryRun: false,
  };

  describe('when the action runs correctly', () => {
    describe('with path simple request', () => {
      it('should create a request and add baseurl of app', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            headers: {},
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as application/json', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: {
              name: 'test',
            },
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: '{"name":"test"}',
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as application/json and passing a string', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              name: 'test',
            }),
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: '{"name":"test"}',
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as a string', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: 'test',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {},
            body: 'test',
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as a string xml', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: '<?xml version="1.0" encoding="UTF-8"><node>asdf</node>',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {},
            body: '<?xml version="1.0" encoding="UTF-8"><node>asdf</node>',
          },
          logger,
          false,
        );
      });
    });

    describe('with body defined as application/json and passing an array', () => {
      it('should create a request and pass body parameter', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify([
              {
                name: 'test',
              },
            ]),
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: '[{"name":"test"}]',
          },
          logger,
          false,
        );
      });
      it('should create a request and pass body parameter regardless of the header casing', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([
              {
                name: 'test',
              },
            ]),
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: '[{"name":"test"}]',
          },
          logger,
          false,
        );
      });
    });

    describe('with authorization header', () => {
      const BACKSTAGE_TOKEN = 'BACKSTAGE_TOKEN';
      it('should create a request and pass backstage token as authorization header', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          secrets: {
            backstageToken: BACKSTAGE_TOKEN,
          },
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: 'test',
            headers: {},
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              authorization: `Bearer ${BACKSTAGE_TOKEN}`,
            },
            body: 'test',
          },
          logger,
          false,
        );
      });

      it('should create a request and pass custom authorization header from input', async () => {
        const HEADERS = {
          Authorization: '123',
          Test: 'some-test',
        };

        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          secrets: {
            backstageToken: BACKSTAGE_TOKEN,
          },
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            body: 'test',
            headers: HEADERS,
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: HEADERS,
            body: 'test',
          },
          logger,
          false,
        );
      });
    });

    describe('with body undefined', () => {
      it('should create a request and body should be undefined', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: undefined,
          },
          logger,
          false,
        );
      });
    });

    describe('with useBackstageToken: true and auth service defined', () => {
      it('should use backstageToken from secrets instead of plugin token exchange', async () => {
        const BACKSTAGE_TOKEN = 'caller-token';
        const mockAuth = {
          getPluginRequestToken: jest
            .fn()
            .mockResolvedValue({ token: 'plugin-token' }),
        };
        const actionWithAuth = createHttpBackstageAction({
          discovery,
          auth: mockAuth as any,
        });
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await actionWithAuth.handler({
          ...mockContext,
          secrets: { backstageToken: BACKSTAGE_TOKEN },
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
            timeout: 60000,
            useBackstageToken: true,
          },
        } as any);
        expect(mockAuth.getPluginRequestToken).not.toHaveBeenCalled();
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            timeout: 60000,
            headers: { authorization: `Bearer ${BACKSTAGE_TOKEN}` },
            body: undefined,
          },
          logger,
          false,
        );
      });

      it('should fall back to plugin token exchange when useBackstageToken is not set', async () => {
        const mockAuth = {
          getPluginRequestToken: jest
            .fn()
            .mockResolvedValue({ token: 'plugin-token' }),
        };
        const actionWithAuth = createHttpBackstageAction({
          discovery,
          auth: mockAuth as any,
        });
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await actionWithAuth.handler({
          ...mockContext,
          getInitiatorCredentials: jest.fn().mockResolvedValue({}),
          secrets: { backstageToken: 'caller-token' },
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
            timeout: 60000,
          },
        } as any);
        expect(mockAuth.getPluginRequestToken).toHaveBeenCalled();
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            timeout: 60000,
            headers: { authorization: 'Bearer plugin-token' },
            body: undefined,
          },
          logger,
          false,
        );
      });
    });

    describe('with a token request', () => {
      it('should create a request', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        await action.handler({
          ...mockContext,
          secrets: { backstageToken: 'some-token' },
          input: {
            path: `/api/proxy/foo`,
            method: 'GET',
          },
        });
        expect(http).toHaveBeenCalledWith(
          {
            url: `${mockBaseUrl}/api/proxy/foo`,
            method: 'GET',
            headers: {
              authorization: 'Bearer some-token',
            },
          },
          logger,
          false,
        );
      });
    });

    describe('with logging enabled', () => {
      it('should create a request with logging', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        const expectedLog =
          'Creating GET request with http:backstage:request scaffolder action against /api/proxy/foo';
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
          },
        });
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            headers: {},
          },
          logger,
          false,
        );
      });
    });

    describe('with logging turned off', () => {
      it('should create a request without logging', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        const expectedLog =
          'Creating GET request with http:backstage:request scaffolder action';
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
            logRequestPath: false,
          },
        });
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            headers: {},
          },
          logger,
          false,
        );
      });
    });

    describe('with dry run enabled', () => {
      beforeEach(() => {
        mockContext.isDryRun = true;
      });

      afterEach(() => {
        mockContext.isDryRun = false;
      });

      it('should call http when a safe method is passed', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        const expectedLog =
          'Creating GET request with http:backstage:request scaffolder action';
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'GET',
            logRequestPath: false,
          },
        });
        expect(loggerSpy).toHaveBeenCalledTimes(1);
        expect(loggerSpy.mock.calls[0]).toContain(expectedLog);
        expect(http).toHaveBeenCalledWith(
          {
            url: 'http://backstage.tests/api/proxy/foo',
            method: 'GET',
            headers: {},
          },
          logger,
          false,
        );
      });

      it('should skip when an unsafe method is passed', async () => {
        (http as jest.Mock).mockReturnValue({
          code: 200,
          headers: {},
          body: {},
        });
        const expectedLog =
          "Dry run mode. Skipping non dry-run safe method 'POST' request to /api/proxy/foo";
        await action.handler({
          ...mockContext,
          input: {
            path: '/api/proxy/foo',
            method: 'POST',
            logRequestPath: false,
          },
        });
        expect(loggerSpy).toHaveBeenCalledTimes(2);
        expect(loggerSpy.mock.calls[1]).toContain(expectedLog);
        expect(http).not.toHaveBeenCalled();
      });
    });
  });

  describe('with idempotencyKey (checkpoint / task recovery)', () => {
    const makeCheckpointContext = () => {
      const checkpoint = jest.fn(
        async ({ fn }: { key: string; fn: () => Promise<any> }) => fn(),
      );
      return { ...mockContext, checkpoint };
    };

    it('wraps the request in ctx.checkpoint when idempotencyKey is set and checkpoint is available', async () => {
      (http as jest.Mock).mockResolvedValue({
        code: 201,
        headers: {},
        body: { id: 'PROJ-1' },
      });
      const ctx: any = makeCheckpointContext();
      await action.handler({
        ...ctx,
        input: {
          path: '/api/proxy/jira/issue',
          method: 'POST',
          idempotencyKey: 'jira.create.parent',
        },
      });
      expect(ctx.checkpoint).toHaveBeenCalledWith({
        key: 'jira.create.parent',
        fn: expect.any(Function),
      });
      expect(http).toHaveBeenCalledTimes(1);
      expect(ctx.output).toHaveBeenCalledWith('code', 201);
      expect(ctx.output).toHaveBeenCalledWith('body', { id: 'PROJ-1' });
    });

    it('falls back to sending the request directly when idempotencyKey is set but checkpoint is unavailable', async () => {
      (http as jest.Mock).mockResolvedValue({
        code: 200,
        headers: {},
        body: {},
      });
      await action.handler({
        ...mockContext,
        input: {
          path: '/api/proxy/jira/issue',
          method: 'POST',
          idempotencyKey: 'jira.create.parent',
        },
      });
      expect(http).toHaveBeenCalledTimes(1);
    });

    it('does not use checkpoint when idempotencyKey is not provided', async () => {
      (http as jest.Mock).mockResolvedValue({
        code: 200,
        headers: {},
        body: {},
      });
      const ctx: any = makeCheckpointContext();
      await action.handler({
        ...ctx,
        input: {
          path: '/api/proxy/foo',
          method: 'POST',
        },
      });
      expect(ctx.checkpoint).not.toHaveBeenCalled();
      expect(http).toHaveBeenCalledTimes(1);
    });
  });
});
