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

import { LoggerService } from '@backstage/backend-plugin-api';
import { NotFoundError, InputError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { N8nApi } from './n8nApi';

/** @public */
export interface RouterOptions {
  logger: LoggerService;
  n8nApi: N8nApi;
}

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, n8nApi } = options;
  const router = Router();
  router.use(express.json());

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/workflows', async (_req, res) => {
    try {
      logger.debug('Fetching all n8n workflows');
      const workflows = await n8nApi.getWorkflows();
      res.json(workflows);
    } catch (error) {
      logger.error('Failed to fetch n8n workflows', error as Error);
      throw error;
    }
  });

  router.get('/workflows/:workflowId', async (req, res) => {
    try {
      const { workflowId } = req.params;
      if (!workflowId) {
        throw new InputError('workflowId is required');
      }
      logger.debug(`Fetching n8n workflow ${workflowId}`);
      const workflow = await n8nApi.getWorkflow(workflowId);
      res.json(workflow);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(
        `Failed to fetch n8n workflow ${req.params.workflowId}`,
        error as Error,
      );
      throw error;
    }
  });

  router.get('/workflows/:workflowId/executions', async (req, res) => {
    try {
      const { workflowId } = req.params;
      if (!workflowId) {
        throw new InputError('workflowId is required');
      }
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      logger.debug(`Fetching executions for workflow ${workflowId}`);
      const executions = await n8nApi.getExecutions(workflowId, limit);
      res.json(executions);
    } catch (error) {
      logger.error(
        `Failed to fetch executions for workflow ${req.params.workflowId}`,
        error as Error,
      );
      throw error;
    }
  });

  router.post('/workflows/:workflowId/activate', async (req, res) => {
    try {
      const { workflowId } = req.params;
      if (!workflowId) {
        throw new InputError('workflowId is required');
      }
      logger.info(`Activating n8n workflow ${workflowId}`);
      const workflow = await n8nApi.activateWorkflow(workflowId);
      res.json(workflow);
    } catch (error) {
      logger.error(
        `Failed to activate n8n workflow ${req.params.workflowId}`,
        error as Error,
      );
      throw error;
    }
  });

  router.post('/workflows/:workflowId/deactivate', async (req, res) => {
    try {
      const { workflowId } = req.params;
      if (!workflowId) {
        throw new InputError('workflowId is required');
      }
      logger.info(`Deactivating n8n workflow ${workflowId}`);
      const workflow = await n8nApi.deactivateWorkflow(workflowId);
      res.json(workflow);
    } catch (error) {
      logger.error(
        `Failed to deactivate n8n workflow ${req.params.workflowId}`,
        error as Error,
      );
      throw error;
    }
  });

  return router;
}
