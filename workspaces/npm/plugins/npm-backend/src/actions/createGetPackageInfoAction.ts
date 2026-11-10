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

import { NpmAnnotation } from '@backstage-community/plugin-npm-common';

import { NpmRegistryService } from '../services';
import { entityInputSchema, getTags, loadPackageInfo } from './utils';

/**
 * Registers the `npm:get-package-info` action with the ActionsRegistryService.
 */
export function createGetPackageInfoAction(options: {
  actionsRegistry: ActionsRegistryService;
  catalog: CatalogService;
  npmRegistryService: NpmRegistryService;
}) {
  const { actionsRegistry, catalog, npmRegistryService } = options;

  actionsRegistry.register({
    name: 'get-package-info',
    title: 'Get npm package info',
    description: `
Fetches general information about the npm package of a catalog entity from
its npm registry, like the latest version and its release date, description,
license, keywords and links to the homepage, repository and bug tracker.

The entity must have the \`npm/package\` annotation. The registry is selected
via the optional \`npm/registry\` annotation and the \`npm\` app-config.

The "latest" version is resolved from the dist-tag defined by the optional
\`npm/stable-tag\` annotation and falls back to the \`latest\` tag. The returned
tags are filtered by the optional \`npm/show-tags\` annotation.

## When to use

Use this action to answer questions like "what is the latest version of this
package" or "when was the latest version released". To list the release
history of a package use \`npm:list-package-versions\`.
`,
    attributes: {
      readOnly: true,
      destructive: false,
      idempotent: true,
    },
    schema: {
      input: z => z.object(entityInputSchema(z)),
      output: z =>
        z.object({
          packageName: z.string().describe('The name of the npm package.'),
          description: z
            .string()
            .optional()
            .describe('The description of the package.'),
          license: z.string().optional().describe('The package license.'),
          keywords: z
            .array(z.string())
            .optional()
            .describe('Keywords of the package.'),
          homepage: z
            .string()
            .optional()
            .describe('URL of the package homepage.'),
          repository: z
            .string()
            .optional()
            .describe('URL of the source code repository.'),
          bugs: z.string().optional().describe('URL of the bug tracker.'),
          latestTag: z
            .string()
            .describe(
              'The dist-tag that was used to resolve the latest version.',
            ),
          latestVersion: z
            .string()
            .optional()
            .describe(
              'The latest version of the package, or undefined if the tag does not exist.',
            ),
          latestPublishedAt: z
            .string()
            .optional()
            .describe(
              'ISO 8601 date when the latest version was published, if provided by the registry.',
            ),
          tags: z
            .array(
              z.object({
                tag: z.string().describe('The dist-tag, e.g. "latest".'),
                version: z
                  .string()
                  .describe('The version the tag currently points to.'),
                publishedAt: z
                  .string()
                  .optional()
                  .describe(
                    'ISO 8601 date when that version was published, if provided by the registry.',
                  ),
              }),
            )
            .describe('The dist-tags of the package with their versions.'),
        }),
    },
    action: async ({ input, credentials, logger }) => {
      const { entity, entityRef, packageName, packageInfo } =
        await loadPackageInfo({
          catalog,
          npmRegistryService,
          input,
          credentials,
        });

      logger.info(
        `Fetched npm package info for "${packageName}" of entity ${entityRef}`,
      );

      const latestTag =
        entity.metadata.annotations?.[NpmAnnotation.STABLE_TAG] ?? 'latest';
      const latestVersion = packageInfo['dist-tags']?.[latestTag];
      const latestPublishedAt = latestVersion
        ? packageInfo.time?.[latestVersion]
        : undefined;

      return {
        output: {
          packageName,
          description: packageInfo.description,
          license: packageInfo.license,
          keywords: packageInfo.keywords,
          homepage: packageInfo.homepage,
          repository: packageInfo.repository?.url,
          bugs: packageInfo.bugs?.url,
          latestTag,
          latestVersion,
          latestPublishedAt,
          tags: getTags(entity, packageInfo),
        },
      };
    },
  });
}
