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

import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { BackstageCredentials } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { InputError, NotFoundError } from '@backstage/errors';
import { SonarqubeInfoProvider } from '../service/sonarqubeInfoProvider';

const SONARQUBE_ANNOTATION = 'sonarqube.org/project-key';

async function resolveComponentKey(
  entityRef: { kind: string; namespace: string; name: string },
  catalog: CatalogService,
  credentials: BackstageCredentials,
): Promise<{ componentKey: string; instanceName: string | undefined }> {
  const entity = await catalog.getEntityByRef(entityRef, { credentials });
  if (!entity) {
    throw new NotFoundError(
      `Entity ${entityRef.kind}:${entityRef.namespace}/${entityRef.name} not found`,
    );
  }

  const annotation = entity.metadata.annotations?.[SONARQUBE_ANNOTATION];
  if (!annotation) {
    throw new InputError(
      `Entity ${entityRef.kind}:${entityRef.namespace}/${entityRef.name} is missing the "${SONARQUBE_ANNOTATION}" annotation`,
    );
  }

  const separatorIndex = annotation.indexOf('/');
  const instanceName =
    separatorIndex > -1 ? annotation.substring(0, separatorIndex) : undefined;
  const componentKey =
    separatorIndex > -1 ? annotation.substring(separatorIndex + 1) : annotation;

  return { componentKey, instanceName };
}

/**
 * Registers the `sonarqube:get-quality-gate` action with the ActionsRegistryService.
 *
 * @public
 */
export function createGetQualityGateAction(options: {
  actionsRegistry: ActionsRegistryService;
  sonarqubeInfoProvider: SonarqubeInfoProvider;
  catalog: CatalogService;
}) {
  const { actionsRegistry, sonarqubeInfoProvider, catalog } = options;

  actionsRegistry.register({
    name: 'sonarqube:get-quality-gate',
    title: 'Get SonarQube Quality Gate Status',
    description: `
Returns the quality gate status and key code quality metrics for a Backstage catalog entity.

The entity must have the \`sonarqube.org/project-key\` annotation.

## Quality gate status values

- \`OK\` — all quality gate conditions are met
- \`WARN\` — some conditions produce warnings
- \`ERROR\` — one or more conditions are failing (build should be blocked)
- \`NONE\` — no analysis has been run yet

## When to use

Use this action for a quick pass/fail check on a service's code quality. This is ideal
for pre-deployment checks, PR review context, or any workflow where you need a concise
quality status without the full metrics breakdown.

For detailed metric values use \`sonarqube:get-findings\`.
`,
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          name: z.string().describe('The name of the catalog entity.'),
          kind: z
            .string()
            .optional()
            .describe(
              'The kind of the catalog entity, e.g. "Component". Defaults to "Component" if omitted.',
            ),
          namespace: z
            .string()
            .optional()
            .describe(
              'The namespace of the catalog entity. Defaults to "default" if omitted.',
            ),
        }),
      output: z =>
        z.object({
          componentKey: z
            .string()
            .describe('The SonarQube project/component key.'),
          qualityGateStatus: z
            .string()
            .describe(
              'Quality gate status: "OK", "WARN", "ERROR", or "NONE" if no analysis has run.',
            ),
          analysisDate: z
            .string()
            .nullable()
            .describe(
              'ISO 8601 timestamp of the last analysis, or null if no analysis has run.',
            ),
          bugs: z
            .string()
            .nullable()
            .describe('Number of reliability bugs, or null if not available.'),
          vulnerabilities: z
            .string()
            .nullable()
            .describe(
              'Number of security vulnerabilities, or null if not available.',
            ),
          codeSmells: z
            .string()
            .nullable()
            .describe(
              'Number of maintainability code smells, or null if not available.',
            ),
          coverage: z
            .string()
            .nullable()
            .describe(
              'Code coverage percentage (0–100), or null if not available.',
            ),
          duplicatedLinesDensity: z
            .string()
            .nullable()
            .describe(
              'Percentage of duplicated lines (0–100), or null if not available.',
            ),
          projectUrl: z
            .string()
            .describe('Direct URL to the project in the SonarQube instance.'),
        }),
    },
    action: async ({ input, credentials, logger }) => {
      const entityRef = {
        kind: input.kind ?? 'Component',
        namespace: input.namespace ?? 'default',
        name: input.name,
      };

      logger.info(
        `Fetching SonarQube quality gate for entity ${entityRef.kind}:${entityRef.namespace}/${entityRef.name}`,
      );

      const { componentKey, instanceName } = await resolveComponentKey(
        entityRef,
        catalog,
        credentials,
      );

      const [findings, { baseUrl, externalBaseUrl }] = await Promise.all([
        sonarqubeInfoProvider.getFindings({ componentKey, instanceName }),
        Promise.resolve(sonarqubeInfoProvider.getBaseUrl({ instanceName })),
      ]);

      const instanceUrl = externalBaseUrl || baseUrl;

      const getMeasure = (metric: string): string | null =>
        findings?.measures.find(m => m.metric === metric)?.value ?? null;

      return {
        output: {
          componentKey,
          qualityGateStatus: getMeasure('alert_status') ?? 'NONE',
          analysisDate: findings?.analysisDate ?? null,
          bugs: getMeasure('bugs'),
          vulnerabilities: getMeasure('vulnerabilities'),
          codeSmells: getMeasure('code_smells'),
          coverage: getMeasure('coverage'),
          duplicatedLinesDensity: getMeasure('duplicated_lines_density'),
          projectUrl: `${instanceUrl}/dashboard?id=${encodeURIComponent(
            componentKey,
          )}`,
        },
      };
    },
  });
}
