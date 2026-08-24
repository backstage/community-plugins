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
import { requireToken, requireOrganization } from './resolve';
import { examples } from './setQualityGate.examples';

/**
 * Creates a scaffolder action that assigns a quality gate to a SonarCloud project.
 *
 * @public
 * @example
 * ```
 * action: sonarcloud:qualityGate:assign
 * ```
 */
export function createSonarCloudSetQualityGateAction(
  defaults: SonarCloudDefaults = {},
) {
  return createTemplateAction({
    id: 'sonarcloud:qualityGate:assign',
    description: 'Assigns a quality gate to a SonarCloud project',
    examples,
    schema: {
      input: {
        projectKey: z => z.string().min(1).describe('SonarCloud project key'),
        qualityGateName: z =>
          z.string().min(1).describe('Name of the quality gate to assign'),
      },
      output: {
        qualityGateId: z =>
          z.number().describe('Numeric ID of the assigned quality gate'),
        qualityGateName: z =>
          z.string().describe('Name of the assigned quality gate'),
      },
    },
    async handler(ctx) {
      const token = requireToken(defaults);
      const organization = requireOrganization(defaults);

      const { projectKey, qualityGateName } = ctx.input;
      const client = new SonarCloudClient({ token });

      const gates = await client.listQualityGates(organization);

      const gate = gates.find(g => g.name === qualityGateName);
      if (!gate) {
        throw new Error(
          `Quality gate '${qualityGateName}' not found in organization '${organization}'. Available gates: ${gates
            .map(g => g.name)
            .join(', ')}`,
        );
      }

      if (typeof gate.id !== 'number' || !Number.isFinite(gate.id)) {
        throw new Error(
          `Quality gate '${qualityGateName}' has an invalid ID: ${gate.id}`,
        );
      }

      await client.selectQualityGate({
        projectKey,
        gateId: gate.id,
        organization,
      });

      ctx.output('qualityGateId', gate.id);
      ctx.output('qualityGateName', gate.name);
    },
  });
}
