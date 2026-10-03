/*
 * Copyright 2026 The Backstage Authors
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
import { PermissionsService } from '@backstage/backend-plugin-api';
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import {
  Check,
  CheckResult,
} from '@backstage-community/plugin-tech-insights-common';
import {
  FactChecker,
  PersistenceContext,
} from '@backstage-community/plugin-tech-insights-node';
import { createGetChecksAction } from './createGetChecksAction';
import { createGetEntityInsightsAction } from './createGetEntityInsightsAction';
import { createGetEntityMaturityAction } from './createGetEntityMaturityAction';
import { createGetEntityScorecardAction } from './createGetEntityScorecardAction';
import { createGetFactSchemasAction } from './createGetFactSchemasAction';
import { createGetFactsInRangeAction } from './createGetFactsInRangeAction';
import { createGetLatestFactsAction } from './createGetLatestFactsAction';
import { createRunChecksAction } from './createRunChecksAction';

/**
 * Registers the Tech Insights actions in the actions registry.
 *
 * Actions that depend on a fact checker are only registered when one is
 * configured.
 */
export const createTechInsightsActions = (options: {
  actionsRegistry: ActionsRegistryService;
  catalog: CatalogService;
  factChecker?: FactChecker<Check, CheckResult>;
  permissions: PermissionsService;
  persistenceContext: PersistenceContext;
}) => {
  const { actionsRegistry, catalog, factChecker, permissions } = options;
  const { techInsightsStore } = options.persistenceContext;

  createGetFactSchemasAction({
    actionsRegistry,
    permissions,
    techInsightsStore,
  });
  createGetLatestFactsAction({
    actionsRegistry,
    permissions,
    techInsightsStore,
  });
  createGetFactsInRangeAction({
    actionsRegistry,
    permissions,
    techInsightsStore,
  });

  if (!factChecker) {
    return;
  }

  createGetChecksAction({ actionsRegistry, factChecker, permissions });
  createRunChecksAction({ actionsRegistry, factChecker, permissions });
  createGetEntityInsightsAction({
    actionsRegistry,
    catalog,
    factChecker,
    permissions,
  });
  createGetEntityScorecardAction({
    actionsRegistry,
    catalog,
    factChecker,
    permissions,
  });
  createGetEntityMaturityAction({
    actionsRegistry,
    catalog,
    factChecker,
    permissions,
  });
};
