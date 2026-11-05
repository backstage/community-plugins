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
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import {
  CheckResult,
  Check,
  techInsightsPermissions,
} from '@backstage-community/plugin-tech-insights-common';
import {
  FactCheckerFactory,
  FactRetriever,
  FactRetrieverRegistration,
  FactRetrieverRegistry,
  PersistenceContext,
  techInsightsFactCheckerFactoryExtensionPoint,
  techInsightsFactRetrieverRegistryExtensionPoint,
  techInsightsFactRetrieversExtensionPoint,
  techInsightsPersistenceContextExtensionPoint,
} from '@backstage-community/plugin-tech-insights-node';
import {
  buildTechInsightsContext,
  createRouter,
  entityMetadataFactRetriever,
  entityOwnershipFactRetriever,
  techdocsFactRetriever,
} from '../service';
import { createFactRetrieverRegistrationFromConfig } from './config';
import { createTechInsightsActions } from '../actions';

/**
 * The tech-insights backend plugin.
 *
 * @public
 */
export const techInsightsPlugin = createBackendPlugin({
  pluginId: 'tech-insights',
  register(env) {
    let factCheckerFactory: FactCheckerFactory<Check, CheckResult> | undefined =
      undefined;
    env.registerExtensionPoint(techInsightsFactCheckerFactoryExtensionPoint, {
      setFactCheckerFactory<
        CheckType extends Check,
        CheckResultType extends CheckResult,
      >(factory: FactCheckerFactory<CheckType, CheckResultType>): void {
        factCheckerFactory = factory;
      },
    });

    let factRetrieverRegistry: FactRetrieverRegistry | undefined = undefined;
    env.registerExtensionPoint(
      techInsightsFactRetrieverRegistryExtensionPoint,
      {
        setFactRetrieverRegistry(registry: FactRetrieverRegistry): void {
          factRetrieverRegistry = registry;
        },
      },
    );

    // initialized with built-in fact retrievers
    // only added as registration if there is config for them
    const addedFactRetrievers: Record<string, FactRetriever> = {
      entityMetadataFactRetriever,
      entityOwnershipFactRetriever,
      techdocsFactRetriever,
    };
    env.registerExtensionPoint(techInsightsFactRetrieversExtensionPoint, {
      addFactRetrievers(factRetrievers: Record<string, FactRetriever>): void {
        Object.entries(factRetrievers).forEach(([key, value]) => {
          addedFactRetrievers[key] = value;
        });
      },
    });

    let persistenceContext: PersistenceContext | undefined = undefined;
    env.registerExtensionPoint(techInsightsPersistenceContextExtensionPoint, {
      setPersistenceContext(context: PersistenceContext): void {
        persistenceContext = context;
      },
    });

    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        database: coreServices.database,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
        urlReader: coreServices.urlReader,
        httpAuth: coreServices.httpAuth,
        permissions: coreServices.permissions,
        permissionsRegistry: coreServices.permissionsRegistry,
        actionsRegistry: actionsRegistryServiceRef,
        catalog: catalogServiceRef,
      },
      async init({
        config,
        database,
        discovery,
        httpRouter,
        logger,
        scheduler,
        auth,
        urlReader,
        httpAuth,
        permissions,
        permissionsRegistry,
        actionsRegistry,
        catalog,
      }) {
        permissionsRegistry.addPermissions(techInsightsPermissions);

        const factRetrievers: FactRetrieverRegistration[] = Object.entries(
          addedFactRetrievers,
        )
          .map(([name, factRetriever]) =>
            createFactRetrieverRegistrationFromConfig(
              config,
              name,
              factRetriever,
            ),
          )
          .filter(registration => registration) as FactRetrieverRegistration[];

        const context = await buildTechInsightsContext({
          config,
          database,
          discovery,
          factCheckerFactory,
          factRetrieverRegistry,
          factRetrievers,
          logger,
          persistenceContext,
          scheduler,
          auth,
          urlReader,
        });

        createTechInsightsActions({
          actionsRegistry,
          catalog,
          factChecker: context.factChecker,
          permissions,
          persistenceContext: context.persistenceContext,
        });

        httpRouter.use(
          await createRouter({
            ...context,
            config,
            logger,
            permissions,
            httpAuth,
          }),
        );
      },
    });
  },
});
