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
  techInsightsCheckReadPermission,
} from '@backstage-community/plugin-tech-insights-common';
import { FactChecker } from '@backstage-community/plugin-tech-insights-node';
import { checkSchema } from './schemas';
import { authorize } from './utils';

export const createGetChecksAction = ({
  actionsRegistry,
  factChecker,
  permissions,
}: {
  actionsRegistry: ActionsRegistryService;
  factChecker: FactChecker<Check, CheckResult>;
  permissions: PermissionsService;
}) => {
  actionsRegistry.register({
    name: 'tech-insights-get-checks',
    title: 'Get Tech Insights Checks',
    attributes: {
      destructive: false,
      readOnly: true,
      idempotent: true,
    },
    description: 'Returns all configured Tech Insights checks.',
    schema: {
      input: z => z.object({}),
      output: z =>
        z.object({
          checks: z
            .array(checkSchema(z))
            .describe('All checks configured in Tech Insights'),
        }),
    },
    action: async ({ credentials }) => {
      await authorize(
        permissions,
        credentials,
        techInsightsCheckReadPermission,
      );

      return { output: { checks: await factChecker.getChecks() } };
    },
  });
};
