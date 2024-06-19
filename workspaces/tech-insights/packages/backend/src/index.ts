/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
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

backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// permission plugin
backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

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
