/*
 * Copyright 2025 The Backstage Authors
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
import type { Workflow, QuickAction } from '../types';
import type { AdminConfigService } from '../services/AdminConfigService';
import { createWithRoute } from './routeWrapper';
import type { RouteContext } from './types';

function workflowsFromYaml(
  config: import('@backstage/config').Config,
): Workflow[] {
  const arr = config.getOptionalConfigArray('agenticChat.workflows') || [];
  return arr.map(wf => ({
    id: wf.getString('id'),
    name: wf.getString('name'),
    description: wf.getOptionalString('description') || '',
    icon: wf.getOptionalString('icon'),
    category: wf.getOptionalString('category'),
    comingSoon: wf.getOptionalBoolean('comingSoon'),
    comingSoonLabel: wf.getOptionalString('comingSoonLabel'),
    steps: (wf.getOptionalConfigArray('steps') || []).map(step => ({
      title: step.getString('title'),
      prompt: step.getString('prompt'),
      description: step.getOptionalString('description'),
    })),
  }));
}

function quickActionsFromYaml(
  config: import('@backstage/config').Config,
): QuickAction[] {
  const arr = config.getOptionalConfigArray('agenticChat.quickPrompts') || [];
  return arr.map(qp => ({
    title: qp.getString('title'),
    description: qp.getOptionalString('description'),
    prompt: qp.getString('prompt'),
    icon: qp.getOptionalString('icon'),
    category: qp.getOptionalString('category'),
    comingSoon: qp.getOptionalBoolean('comingSoon'),
    comingSoonLabel: qp.getOptionalString('comingSoonLabel'),
  }));
}

function swimLanesFromYaml(config: import('@backstage/config').Config) {
  const arr = config.getOptionalConfigArray('agenticChat.swimLanes') || [];
  return arr.map((sl, index) => ({
    id: sl.getString('id'),
    title: sl.getString('title'),
    description: sl.getOptionalString('description'),
    icon: sl.getOptionalString('icon'),
    color: sl.getOptionalString('color'),
    order: sl.getOptionalNumber('order') ?? index + 1,
    cards: (sl.getOptionalConfigArray('cards') || []).map(card => ({
      title: card.getString('title'),
      description: card.getOptionalString('description'),
      prompt: card.getString('prompt'),
      icon: card.getOptionalString('icon'),
      comingSoon: card.getOptionalBoolean('comingSoon'),
      comingSoonLabel: card.getOptionalString('comingSoonLabel'),
    })),
  }));
}

/**
 * Registers endpoints for workflows, quick actions, and swim lanes.
 * When adminConfig is provided, DB values take precedence over YAML.
 */
export function registerConfigRoutes(
  ctx: RouteContext,
  adminConfig?: AdminConfigService,
): void {
  const { router, logger, config, sendRouteError } = ctx;
  const withRoute = createWithRoute(logger, sendRouteError);

  router.get(
    '/workflows',
    withRoute(
      'GET /workflows',
      'Failed to get workflows',
      async (_req, res) => {
        const workflows = workflowsFromYaml(config);
        res.json({
          success: true,
          workflows,
          totalWorkflows: workflows.length,
          source: 'yaml',
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/quick-actions',
    withRoute(
      'GET /quick-actions',
      'Failed to get quick actions',
      async (_req, res) => {
        const quickActions = quickActionsFromYaml(config);
        res.json({
          success: true,
          quickActions,
          totalQuickActions: quickActions.length,
          source: 'yaml',
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );

  router.get(
    '/swim-lanes',
    withRoute(
      'GET /swim-lanes',
      'Failed to get swim lanes',
      async (_req, res) => {
        let swimLanes: ReturnType<typeof swimLanesFromYaml>;
        let source: 'database' | 'yaml' = 'yaml';

        if (adminConfig) {
          const dbValue = await adminConfig.get('swimLanes');
          if (dbValue !== undefined && Array.isArray(dbValue)) {
            swimLanes = dbValue;
            source = 'database';
          } else {
            swimLanes = swimLanesFromYaml(config);
          }
        } else {
          swimLanes = swimLanesFromYaml(config);
        }

        res.json({
          success: true,
          swimLanes,
          totalSwimLanes: swimLanes.length,
          source,
          timestamp: new Date().toISOString(),
        });
      },
    ),
  );
}
