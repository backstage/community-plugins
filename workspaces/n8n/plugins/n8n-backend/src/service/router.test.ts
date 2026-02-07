/*
 * Copyright 2024 The Backstage Authors
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
import { mockServices } from '@backstage/backend-test-utils';
import { createRouter } from './router';
import { N8nApi } from './n8nApi';

describe('createRouter', () => {
  let app: express.Express;
  let n8nApi: jest.Mocked<N8nApi>;

  beforeEach(async () => {
    n8nApi = {
      getWorkflows: jest.fn(),
      getWorkflow: jest.fn(),
      getExecutions: jest.fn(),
      activateWorkflow: jest.fn(),
      deactivateWorkflow: jest.fn(),
    } as unknown as jest.Mocked<N8nApi>;

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      n8nApi,
    });

    app = express();
    app.use(router);
  });

  describe('GET /health', () => {
    it('should return ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /workflows', () => {
    it('should return workflows', async () => {
      const workflows = [
        {
          id: '1',
          name: 'Test',
          active: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      n8nApi.getWorkflows.mockResolvedValue(workflows);

      const response = await request(app).get('/workflows');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(workflows);
    });
  });

  describe('GET /workflows/:workflowId', () => {
    it('should return a single workflow', async () => {
      const workflow = {
        id: '1',
        name: 'Test',
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      n8nApi.getWorkflow.mockResolvedValue(workflow);

      const response = await request(app).get('/workflows/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(workflow);
      expect(n8nApi.getWorkflow).toHaveBeenCalledWith('1');
    });
  });

  describe('GET /workflows/:workflowId/executions', () => {
    it('should return executions', async () => {
      const executions = [
        {
          id: '100',
          finished: true,
          mode: 'trigger',
          startedAt: '2024-01-01T00:00:00.000Z',
          stoppedAt: '2024-01-01T00:01:00.000Z',
          workflowId: '1',
          status: 'success' as const,
        },
      ];
      n8nApi.getExecutions.mockResolvedValue(executions);

      const response = await request(app).get('/workflows/1/executions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(executions);
    });
  });

  describe('POST /workflows/:workflowId/activate', () => {
    it('should activate a workflow', async () => {
      const workflow = {
        id: '1',
        name: 'Test',
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      n8nApi.activateWorkflow.mockResolvedValue(workflow);

      const response = await request(app).post('/workflows/1/activate');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(workflow);
    });
  });

  describe('POST /workflows/:workflowId/deactivate', () => {
    it('should deactivate a workflow', async () => {
      const workflow = {
        id: '1',
        name: 'Test',
        active: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      n8nApi.deactivateWorkflow.mockResolvedValue(workflow);

      const response = await request(app).post('/workflows/1/deactivate');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(workflow);
    });
  });
});
