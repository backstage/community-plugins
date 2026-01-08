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

import type { Config } from '@backstage/config';
import type { Entity } from '@backstage/catalog-model';
import { ScmIntegrations } from '@backstage/integration';
import type { LoggerService } from '@backstage/backend-plugin-api';
import type { VcsProviderRegistry } from '../vcs/VcsProviderRegistry';

/**
 * Extracts the template source URL from a template entity
 *
 * Uses the VCS provider to extract the base URL from the entity's
 * managed-by-location annotation, then resolves any relative paths.
 *
 * @param templateEntity - The template entity
 * @param vcsRegistry - VCS provider registry
 * @param config - Backstage config for SCM integrations
 * @param logger - Logger service for debugging
 * @returns The source URL from the fetch:template action, or null if not found
 *
 * @internal
 */
export function extractTemplateSourceUrl(
  templateEntity: Entity,
  vcsRegistry: VcsProviderRegistry,
  config: Config,
  logger: LoggerService,
): string | null {
  const spec = templateEntity.spec as any;
  if (!spec?.steps || !Array.isArray(spec.steps)) {
    return null;
  }

  for (const step of spec.steps) {
    if (step.action === 'fetch:template' && step.input?.url) {
      const relativeUrl = step.input.url;

      // If URL is relative (starts with './', eg. './skeleton'), combine with base URL
      if (relativeUrl.startsWith('./')) {
        const provider = vcsRegistry.getProviderForEntity(templateEntity);
        if (!provider) {
          logger.warn(
            `No VCS provider found for template ${templateEntity.metadata.name}`,
          );
          return null;
        }

        const baseUrl = provider.extractRepoUrl(templateEntity);
        if (!baseUrl) {
          logger.warn(
            `Could not extract base URL from template ${templateEntity.metadata.name}`,
          );
          return null;
        }

        const integrations = ScmIntegrations.fromConfig(config);
        try {
          return integrations.resolveUrl({
            url: relativeUrl,
            base: baseUrl,
          });
        } catch (error) {
          logger.warn(
            `Failed to resolve template URL: ${relativeUrl} against base: ${baseUrl}`,
          );
          return null;
        }
      }

      // Absolute URL - return as-is
      return relativeUrl;
    }
  }

  return null;
}
