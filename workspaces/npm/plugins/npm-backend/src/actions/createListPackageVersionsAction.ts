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
import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';

import { NpmRegistryService } from '../services';
import { entityInputSchema, getVersions, loadPackageInfo } from './utils';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 1000;

/**
 * Registers the `npm:list-package-versions` action with the ActionsRegistryService.
 */
export function createListPackageVersionsAction(options: {
  actionsRegistry: ActionsRegistryService;
  catalog: CatalogService;
  npmRegistryService: NpmRegistryService;
}) {
  const { actionsRegistry, catalog, npmRegistryService } = options;

  actionsRegistry.register({
    name: 'list-package-versions',
    title: 'List npm package versions',
    description: `
Lists the published versions of the npm package of a catalog entity, newest
first, including the release date of each version when the registry provides
it (npmjs and GitHub do, GitLab doesn't).

The entity must have the \`npm/package\` annotation. The registry is selected
via the optional \`npm/registry\` annotation and the \`npm\` app-config.

## When to use

Use this action to answer questions like "when were the last 5 versions of
this package released" or "how often is this package released". For general
package information and the latest version use \`npm:get-package-info\`.
`,
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    schema: {
      input: z =>
        z.object({
          ...entityInputSchema(z),
          limit: z
            .number()
            .int()
            .min(1)
            .max(MAX_LIMIT)
            .optional()
            .describe(
              `Maximum number of versions to return, newest first. Defaults to ${DEFAULT_LIMIT}.`,
            ),
        }),
      output: z =>
        z.object({
          packageName: z.string().describe('The name of the npm package.'),
          total: z
            .number()
            .describe('Total number of published versions of the package.'),
          versions: z
            .array(
              z.object({
                version: z.string().describe('The version number.'),
                publishedAt: z
                  .string()
                  .optional()
                  .describe(
                    'ISO 8601 date when the version was published, if provided by the registry.',
                  ),
                tags: z
                  .array(z.string())
                  .describe(
                    'The dist-tags that currently point to this version, e.g. ["latest"].',
                  ),
              }),
            )
            .describe('The most recent versions, newest first.'),
        }),
    },
    action: async ({ input, credentials, logger }) => {
      const { entityRef, packageName, packageInfo } = await loadPackageInfo({
        catalog,
        npmRegistryService,
        input,
        credentials,
      });

      const versions = getVersions(packageInfo);
      const limit = input.limit ?? DEFAULT_LIMIT;

      logger.info(
        `Fetched ${versions.length} npm package versions for "${packageName}" of entity ${entityRef}`,
      );

      return {
        output: {
          packageName,
          total: versions.length,
          versions: versions.slice(0, limit),
        },
      };
    },
  });
}
