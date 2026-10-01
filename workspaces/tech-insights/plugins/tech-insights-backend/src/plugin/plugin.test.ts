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

import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { techInsightsFactCheckerFactoryExtensionPoint } from '@backstage-community/plugin-tech-insights-node';
import request from 'supertest';
import { techInsightsPlugin } from './plugin';

const baselineActionIds = [
  'tech-insights:tech-insights-get-fact-schemas',
  'tech-insights:tech-insights-get-latest-facts',
  'tech-insights:tech-insights-get-facts-in-range',
];

const factCheckerActionIds = [
  'tech-insights:tech-insights-get-checks',
  'tech-insights:tech-insights-run-checks',
  'tech-insights:tech-insights-get-entity-insights',
  'tech-insights:tech-insights-get-entity-scorecard',
  'tech-insights:tech-insights-get-entity-maturity',
];

const factCheckerModule = createBackendModule({
  pluginId: 'tech-insights',
  moduleId: 'test-fact-checker',
  register(env) {
    env.registerInit({
      deps: {
        techInsights: techInsightsFactCheckerFactoryExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ techInsights }) {
        techInsights.setFactCheckerFactory({
          construct: () => ({
            getChecks: async () => [],
            runChecks: async () => [],
            validate: async () => ({ valid: true }),
          }),
        });
      },
    });
  },
});

const permissions = mockServices.permissions.mock({
  authorize: async requests =>
    requests.map(() => ({ result: AuthorizeResult.ALLOW })),
}).factory;

const config = mockServices.rootConfig.factory({
  data: {
    techInsights: {
      factRetrievers: {
        entityOwnershipFactRetriever: {
          cadence: '*/15 * * * *',
          lifecycle: { timeToLive: { weeks: 2 } },
        },
      },
    },
  },
});

describe('techInsightsPlugin', () => {
  it('registers baseline Actions API action IDs', async () => {
    const { server } = await startTestBackend({
      features: [techInsightsPlugin, config, permissions],
    });

    const response = await request(server).get(
      '/api/tech-insights/.backstage/actions/v1/actions',
    );

    expect(response.status).toBe(200);
    expect(
      response.body.actions.map((action: { id: string }) => action.id).sort(),
    ).toEqual(baselineActionIds.sort());
  });

  it('registers fact-checker Actions API action IDs when configured', async () => {
    const { server } = await startTestBackend({
      features: [techInsightsPlugin, factCheckerModule, config, permissions],
    });

    const response = await request(server).get(
      '/api/tech-insights/.backstage/actions/v1/actions',
    );

    expect(response.status).toBe(200);
    expect(
      response.body.actions.map((action: { id: string }) => action.id).sort(),
    ).toEqual([...baselineActionIds, ...factCheckerActionIds].sort());
  });
});
