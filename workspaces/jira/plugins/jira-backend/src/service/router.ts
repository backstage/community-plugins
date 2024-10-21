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

import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Knex } from 'knex';
import { JiraService } from './jiraService';
import { scheduleJiraTask } from '../cron/cronJira';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  db: Knex;
  configApi: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, db, configApi } = options;

  const router = Router();
  router.use(express.json());

  const jiraService = new JiraService(db, config);

  // Initialize the cron job for scheduling Jira tasks
  scheduleJiraTask(jiraService);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // Endpoint to fetch issues from Jira and store them in the database
  router.post('/fetch-issues', async (request, response) => {
    // console.log('Inside fetch-issues');
    const { jql, maxResults, startAt, username } = request.body;

    try {
      const dataCount = await jiraService.fetchAndStoreIssues(
        jql,
        maxResults,
        startAt,
        username,
      );

      const storedEmail = await jiraService.getCurrentUserEmail();
      const storedIssues = await jiraService.getStoredIssues();

      response.status(200).json({ total: dataCount, storedIssues });
    } catch (error) {
      logger.error(`Error fetching Jira issues: ${error}`);
      response.status(500).send('Error fetching Jira issues');
    }
  });

  // Endpoint to retrieve stored issues from the database
  router.get('/issues', async (_, response) => {
    console.log('inside issues');
    try {
      const issues = await jiraService.getStoredIssues();
      response.json(issues);
    } catch (error) {
      logger.error(`Error fetching stored Jira issues: ${error}`);
      response.status(500).send('Error fetching stored Jira issues');
    }
  });

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());

  return router;
}
