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
import {
  Check,
  CheckResult,
  techInsightsCheckUpdatePermission,
} from '@backstage-community/plugin-tech-insights-common';
import { FactChecker } from '@backstage-community/plugin-tech-insights-node';
import { checkResultSchema } from './schemas';
import { authorize, toEntityRef } from './utils';

export const createRunChecksAction = ({
  actionsRegistry,
  factChecker,
  permissions,
}: {
  actionsRegistry: ActionsRegistryService;
  factChecker: FactChecker<Check, CheckResult>;
  permissions: PermissionsService;
}) => {
  actionsRegistry.register({
    name: 'tech-insights-run-checks',
    title: 'Run Tech Insights Checks',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: 'Runs selected Tech Insights checks against one entity.',
    schema: {
      input: z =>
        z.object({
          entity: z
            .string()
            .describe(
              'The entity ref to run checks against, e.g. component:default/my-service',
            ),
          checks: z
            .array(z.string())
            .describe(
              'The ids of the checks to run. If omitted, all checks are run.',
            )
            .optional(),
        }),
      output: z =>
        z.object({
          results: z
            .array(checkResultSchema(z))
            .describe('The result of each check that was run'),
        }),
    },
    action: async ({ input, credentials }) => {
      await authorize(
        permissions,
        credentials,
        techInsightsCheckUpdatePermission,
      );

      return {
        output: {
          results: await factChecker.runChecks(
            toEntityRef(input.entity),
            input.checks,
          ),
        },
      };
    },
  });
};
