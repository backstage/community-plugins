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

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { SonarCloudClient } from '../lib';
import type { SonarCloudDefaults } from '../lib';
import { examples } from './setNewCodeDefinition.examples';

/**
 * Creates a scaffolder action that sets the new code definition for a SonarCloud project.
 *
 * @public
 * @example
 * ```
 * action: sonarcloud:setNewCodeDefinition
 * ```
 */
export function createSonarCloudSetNewCodeDefinitionAction(
  defaults: SonarCloudDefaults = {},
) {
  return createTemplateAction({
    id: 'sonarcloud:setNewCodeDefinition',
    description: 'Sets the new code definition for a SonarCloud project',
    examples,
    schema: {
      input: {
        projectKey: z => z.string().min(1).describe('SonarCloud project key'),
        type: z =>
          z
            .enum(['previous_version', 'number_of_days', 'reference_branch'])
            .describe('New code definition strategy'),
        value: z =>
          z
            .string()
            .optional()
            .describe('Value for the definition (days count or branch name)'),
        token: z =>
          z
            .string()
            .optional()
            .describe('SonarCloud API token (defaults to app-config)'),
      },
      output: {
        type: z =>
          z.string().describe('The new code definition type that was set'),
        value: z =>
          z
            .string()
            .optional()
            .describe('The value set (omitted for previous_version)'),
      },
    },
    async handler(ctx) {
      const token = ctx.input.token || defaults.token;
      if (!token) {
        throw new Error(
          "Missing SonarCloud token: provide 'token' input or set sonarcloud.token in app-config",
        );
      }

      const { projectKey, type, value } = ctx.input;

      validateNewCodeInput(type, value);

      const client = new SonarCloudClient({ token });
      await client.setNewCodePeriod({ projectKey, type, value });

      ctx.output('type', type);
      if (type !== 'previous_version' && value !== undefined) {
        ctx.output('value', value);
      }
    },
  });
}

function validateNewCodeInput(
  type: 'previous_version' | 'number_of_days' | 'reference_branch',
  value: string | undefined,
): void {
  if (type === 'number_of_days') {
    if (!value) {
      throw new Error("A 'value' is required when type is 'number_of_days'");
    }
    if (!/^\d+$/.test(value)) {
      throw new Error(
        `'value' must be a positive integer for 'number_of_days', got '${value}'`,
      );
    }
  }

  if (type === 'reference_branch' && !value) {
    throw new Error("A 'value' is required when type is 'reference_branch'");
  }
}
