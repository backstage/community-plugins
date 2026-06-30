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

  // Annotation format is either "projectKey" or "instanceName/projectKey"
  const separatorIndex = annotation.indexOf('/');
  const instanceName =
    separatorIndex > -1 ? annotation.substring(0, separatorIndex) : undefined;
  const componentKey =
    separatorIndex > -1 ? annotation.substring(separatorIndex + 1) : annotation;

  return { componentKey, instanceName };
}

/**
 * Registers the `sonarqube:get-findings` action with the ActionsRegistryService.
 *
 * @public
 */
export function createGetFindingsAction(options: {
  actionsRegistry: ActionsRegistryService;
  sonarqubeInfoProvider: SonarqubeInfoProvider;
  catalog: CatalogService;
}) {
  const { actionsRegistry, sonarqubeInfoProvider, catalog } = options;

  actionsRegistry.register({
    name: 'sonarqube:get-findings',
    title: 'Get SonarQube Findings',
    description: `
Returns all SonarQube measures (findings) for a Backstage catalog entity.

The entity must have the \`sonarqube.org/project-key\` annotation. The annotation
value is either:
- \`projectKey\` — uses the default SonarQube instance
- \`instanceName/projectKey\` — uses a named SonarQube instance from config

## Metrics returned

The following metrics are returned when available on the SonarQube instance:

| Metric | Description |
|---|---|
| \`alert_status\` | Quality gate status: \`OK\`, \`WARN\`, or \`ERROR\` |
| \`bugs\` | Number of reliability bugs |
| \`reliability_rating\` | Reliability rating (A=1.0, B=2.0, C=3.0, D=4.0, E=5.0) |
| \`vulnerabilities\` | Number of security vulnerabilities |
| \`security_rating\` | Security rating (A–E) |
| \`security_hotspots_reviewed\` | Percentage of security hotspots reviewed |
| \`security_review_rating\` | Security review rating (A–E) |
| \`code_smells\` | Number of maintainability code smells |
| \`sqale_rating\` | Maintainability rating (A–E) |
| \`coverage\` | Code coverage percentage |
| \`duplicated_lines_density\` | Percentage of duplicated lines |

## When to use

Use this action to assess the overall code quality of a service before a release,
as part of a security review workflow, or to identify the most critical quality issues.
For a quick pass/fail check use \`sonarqube:get-quality-gate\`.
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
          instanceUrl: z
            .string()
            .describe('URL of the SonarQube instance for building deep links.'),
          analysisDate: z
            .string()
            .nullable()
            .describe(
              'ISO 8601 timestamp of the last analysis, or null if no analysis has run.',
            ),
          measures: z
            .array(
              z.object({
                metric: z
                  .string()
                  .describe(
                    'Metric key (e.g. "alert_status", "bugs", "coverage").',
                  ),
                value: z.string().describe('String value of the metric.'),
              }),
            )
            .describe('List of all returned SonarQube measures.'),
        }),
    },
    action: async ({ input, credentials, logger }) => {
      const entityRef = {
        kind: input.kind ?? 'Component',
        namespace: input.namespace ?? 'default',
        name: input.name,
      };

      logger.info(
        `Fetching SonarQube findings for entity ${entityRef.kind}:${entityRef.namespace}/${entityRef.name}`,
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

      return {
        output: {
          componentKey,
          instanceUrl: externalBaseUrl || baseUrl,
          analysisDate: findings?.analysisDate ?? null,
          measures: findings?.measures ?? [],
        },
      };
    },
  });
}
