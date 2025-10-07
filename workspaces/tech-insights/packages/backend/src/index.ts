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

import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  techInsightsFactCheckerFactoryExtensionPoint,
  techInsightsFactRetrieversExtensionPoint,
} from '@backstage-community/plugin-tech-insights-node';
import { JsonRulesEngineFactCheckerFactory } from '@backstage-community/plugin-tech-insights-backend-module-jsonfc';
import { apiDefinitionFactRetriever, checks } from './plugins/tech-insights';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// Tech insights
backend.add(import('@backstage-community/plugin-tech-insights-backend'));

// This will register JsonRulesEngineFactCheckerFactory by configuration and overwrite all programmatically registration
// backend.add(import('@backstage-community/plugin-tech-insights-backend-module-jsonfc'));

// This will programmatically register JsonRulesEngineFactCheckerFactory
backend.add(
  createBackendModule({
    pluginId: 'tech-insights',
    moduleId: 'json-rules-engine-fact-checker-factory',
    register(env) {
      env.registerInit({
        deps: {
          logger: coreServices.logger,
          techInsightsFactCheckerFactory:
            techInsightsFactCheckerFactoryExtensionPoint,
          techInsightsFactRetrievers: techInsightsFactRetrieversExtensionPoint,
        },
        async init({
          logger,
          techInsightsFactCheckerFactory,
          techInsightsFactRetrievers,
        }) {
          techInsightsFactRetrievers.addFactRetrievers({
            apiDefinitionFactRetriever: apiDefinitionFactRetriever,
          });
          techInsightsFactCheckerFactory.setFactCheckerFactory(
            new JsonRulesEngineFactCheckerFactory({
              logger: logger,
              checks: checks,
            }),
          );
        },
      });
    },
  }),
);

backend.start();
