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
import { LoggerService } from '@backstage/backend-plugin-api';
import { TimeSaverHandler } from '../timeSaver/handler';
import { TsApi } from '../api/apiService';

export function setupCommonRoutes(
  router: express.Router,
  logger: LoggerService,
  tsHandler: TimeSaverHandler,
  apiHandler: TsApi,
) {
  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/generateSavings', async (_, response) => {
    const status = await tsHandler.fetchTemplates();
    response.json({ status: status });
  });

  router.get('/getStats/', async (request, response) => {
    const { templateId, team, templateName } = request.query;
    let result;
    if (templateId) {
      result = await apiHandler.getStatsByTemplateTaskId(String(templateId));
    } else if (team) {
      result = await apiHandler.getStatsByTeam(String(team));
    } else if (templateName) {
      result = await apiHandler.getStatsByTemplate(String(templateName));
    } else {
      result = await apiHandler.getAllStats();
    }
    response.json(result);
  });

  router.get('/getStats/group', async (_request, response) => {
    const result = await apiHandler.getGroupDivisionStats();
    response.json(result);
  });

  router.get('/getDailyTimeSummary/team', async (_request, response) => {
    const result = await apiHandler.getDailyTimeSummariesTeamWise();
    response.json(result);
  });

  router.get('/getDailyTimeSummary/template', async (_request, response) => {
    const result = await apiHandler.getDailyTimeSummariesTemplateWise();
    response.json(result);
  });

  router.get('/getTimeSummary/team', async (_request, response) => {
    const result = await apiHandler.getTimeSummarySavedTeamWise();
    response.json(result);
  });

  router.get('/getTimeSummary/template', async (_request, response) => {
    const result = await apiHandler.getTimeSummarySavedTemplateWise();
    response.json(result);
  });

  router.get('/migrate', async (_request, response) => {
    const result = await apiHandler.updateTemplatesWithSubstituteData();
    response.json(result);
  });

  router.post('/migrate', async (_request, response) => {
    const template_classification = _request.body;
    const result = await apiHandler.updateTemplatesWithSubstituteData(
      template_classification,
    );
    response.json(result);
  });

  router.get('/generate-sample-classification', async (_request, response) => {
    const { useScaffolderTasksEntries } = _request.query;
    response.json(
      await apiHandler.getSampleMigrationClassificationConfig(undefined, {
        useScaffolderTasksEntries: !!(useScaffolderTasksEntries === 'true'),
      }),
    );
  });

  router.post('/generate-sample-classification', async (_request, response) => {
    const { customClassificationRequest, options } = _request.body;
    response.json(
      await apiHandler.getSampleMigrationClassificationConfig(
        customClassificationRequest,
        options,
      ),
    );
  });

  router.get('/groups', async (_request, response) => {
    const result = await apiHandler.getAllGroups();
    response.json(result);
  });

  router.get('/templates', async (_request, response) => {
    const result = await apiHandler.getAllTemplateNames();
    response.json(result);
  });

  router.get('/templateTasks', async (_request, response) => {
    const result = await apiHandler.getAllTemplateTasks();
    response.json(result);
  });

  router.get('/getTemplateCount', async (_request, response) => {
    const result = await apiHandler.getTemplateCount();
    response.json(result);
  });

  router.get('/getTimeSavedSum', async (request, response) => {
    const divider: number = Number(request.query.divider);
    if (divider !== undefined && divider <= 0) {
      response
        .status(400)
        .json({ error: 'Divider should be a positive number' });
      return;
    }
    const result = divider
      ? await apiHandler.getTimeSavedSum(divider)
      : await apiHandler.getTimeSavedSum();
    response.json(result);
  });

  return router;
}
