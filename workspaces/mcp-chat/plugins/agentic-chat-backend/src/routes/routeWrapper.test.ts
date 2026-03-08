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

import express from 'express';
import request from 'supertest';
import { createWithRoute, notFound } from './routeWrapper';
import { createMockLogger } from '../test-utils';

describe('routeWrapper', () => {
  describe('createWithRoute', () => {
    it('creates a wrapper that catches errors and delegates to sendRouteError', async () => {
      const logger = createMockLogger();
      const sendRouteError = jest.fn((res: express.Response) => {
        res.status(500).json({ error: 'Something went wrong' });
      });
      const withRoute = createWithRoute(logger, sendRouteError);

      const handler = jest.fn().mockRejectedValue(new Error('Handler failed'));
      const wrapped = withRoute('TestRoute', 'Something went wrong', handler);

      const app = express();
      app.use(express.json());
      app.all('/test', (req, res) => wrapped(req, res));

      const response = await request(app).get('/test');

      expect(handler).toHaveBeenCalled();
      expect(sendRouteError).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Error),
        'TestRoute',
        'Something went wrong',
        { success: false },
      );
      expect(response.status).toBe(500);
    });

    it('logs the label before executing handler', async () => {
      const logger = createMockLogger();
      const sendRouteError = jest.fn();
      const withRoute = createWithRoute(logger, sendRouteError);

      const handler = jest
        .fn()
        .mockImplementation(async (_req, res: express.Response) => {
          res.status(200).json({ ok: true });
        });
      const wrapped = withRoute('MyLabel', 'Error', handler);

      const req = {} as express.Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as express.Response;

      await wrapped(req, res);

      expect(logger.info).toHaveBeenCalledWith('MyLabel');
    });

    it('supports function logLabel that derives label from request', async () => {
      const logger = createMockLogger();
      const sendRouteError = jest.fn();
      const withRoute = createWithRoute(logger, sendRouteError);

      const handler = jest.fn().mockRejectedValue(new Error('Fail'));
      const getLabel = (req: express.Request) =>
        `Dynamic-${
          (req as express.Request & { params?: { id?: string } }).params?.id ??
          'unknown'
        }`;
      const wrapped = withRoute(getLabel, 'Error', handler);

      const req = {
        params: { id: '123' },
      } as unknown as express.Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as express.Response;

      await wrapped(req, res);

      expect(logger.info).toHaveBeenCalledWith('Dynamic-123');
      expect(sendRouteError).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Error),
        'Dynamic-123',
        'Error',
        { success: false },
      );
    });
  });

  describe('notFound', () => {
    it.each([
      ['Entity', 'Entity not found'],
      ['Conversation', 'Conversation not found'],
    ])(
      'sends 404 with correct message for %s',
      (entityName, expectedMessage) => {
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        } as unknown as express.Response;

        notFound(res, entityName);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          error: expectedMessage,
          message: expectedMessage,
        });
      },
    );
  });
});
