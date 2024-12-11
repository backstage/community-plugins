/*
 * Copyright 2020 The Backstage Authors
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

import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { ResourceGraphClient } from '@azure/arm-resourcegraph';
import {
  ClientSecretCredential,
  DefaultAzureCredential,
} from '@azure/identity';
import { AzureResourceConfig } from '../config';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const azureConfig = azureResourceConfig.fromConfig(options.config);

  const cred =
    azureConfig !== null
      ? new ClientSecretCredential(
          azureConfig.tenantId,
          azureConfig.clientId,
          azureConfig.clientSecret,
        )
      : new DefaultAzureCredential();

  const client = new ResourceGraphClient(cred);
  const { logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.send({ status: 'OK - azure resource backend api' });
  });

  router.get('/rg/:tagKey/:tagValue', (req, response) => {
    const tagKey = req.params.tagKey;
    const tagValue = req.params.tagValue;
    if (!tagKey) {
      return response.send({
        error: 'name must be defined',
      });
    }
    const query = `ResourceContainers
| where type =~ "microsoft.resources/subscriptions/resourcegroups"
| where tags["${tagKey}"] =~ "${tagValue}"`;
    return client
      .resources({ query: query }, { resultFormat: 'table' })
      .then(result => {
        response.send({
          total: result.count,
          data: result.data,
        });
      })
      .catch(e => {
        response.status(500).send({
          error: e,
        });
      });
  });

  router.get('/rg/:tagKey/:tagValue/secrecommendations', (req, response) => {
    const tagKey = req.params.tagKey;
    const tagValue = req.params.tagValue;

    if (!tagKey) {
      return response.send({
        error: 'name must be defined',
      });
    }
    const query = `ResourceContainers
    | where type =~ "microsoft.resources/subscriptions/resourcegroups"
    | where tags["${tagKey}"] =~ "${tagValue}"
    | join (securityresources
        | where type == 'microsoft.security/assessments'
        | extend statusCode=properties.status.code,
            resourceId=tolower(properties.resourceDetails.Id),
            severity = properties.metadata.severity,
            displayName = properties.metadata.displayName,
            link = properties.links.azurePortal
        | join kind=leftouter(
            resources | extend resourceName = name
                    | extend resourceId = tolower(id)
                    | extend resourceType = type
                    | project resourceName, resourceId, resourceType) on resourceId
    ) on resourceGroup
| where statusCode =~"Unhealthy"
| project resourceId, displayName, link, resourceName, resourceType, resourceGroup, severity`;
    return client
      .resources({ query: query }, { resultFormat: 'table' })
      .then(result => {
        response.send({
          total: result.count,
          data: result.data,
        });
      })
      .catch(e => {
        response.status(500).send({
          error: e,
        });
      });
  });

  router.get('/rg/:tagKey/:tagValue/costadvice', (req, response) => {
    const tagKey = req.params.tagKey;
    const tagValue = req.params.tagValue;

    if (!tagKey) {
      return response.send({
        error: 'name must be defined',
      });
    }

    const query = `ResourceContainers
    | where type =~ "microsoft.resources/subscriptions/resourceGroups"
    | where tags["${tagKey}"] =~ "${tagValue}"
    | join (AdvisorResources
        | where type == 'microsoft.advisor/recommendations'
        | where properties.category == 'Cost'
        | extend
            resources = tostring(properties.resourceMetadata.resourceId),
            savings = todouble(properties.extendedProperties.savingsAmount),
            solution = tostring(properties.shortDescription.solution),
            currency = tostring(properties.extendedProperties.savingsCurrency),
            impact = tostring(properties.impact)
        )   on subscriptionId
    | summarize
      dcount(resources),
      bin(sum(savings), 0.01)
      by solution, currency, impact
    | project-away dcount_resources`;
    return client
      .resources({ query: query }, { resultFormat: 'table' })
      .then(result => {
        response.send({
          total: result.count,
          data: result.data,
        });
      })
      .catch(e => {
        response.status(500).send({
          error: e,
        });
      });
  });

  router.use(errorHandler());
  return router;
}
