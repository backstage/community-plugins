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

import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  techdocsPreparerExtensionPoint,
  UrlPreparer,
} from '@backstage/plugin-techdocs-node';
import { ConfluencePreparer } from './ConfluencePreparer';
import { Entity } from '@backstage/catalog-model';
import { TECHDOCS_ANNOTATION } from '@backstage/plugin-techdocs-common';

/**
 * TechDocs backend module for Confluence integration
 *
 * @public
 */
export const techdocsModuleConfluence = createBackendModule({
  pluginId: 'techdocs',
  moduleId: 'confluence',
  register(env) {
    env.registerInit({
      deps: {
        techdocs: techdocsPreparerExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        urlReader: coreServices.urlReader,
      },
      async init({ techdocs, logger, config, urlReader }) {
        logger.info('Initializing TechDocs Confluence module');

        const confluencePreparer = ConfluencePreparer.fromConfig({
          logger,
          config,
        });

        // Create standard URL preparer as fallback
        const standardUrlPreparer = UrlPreparer.fromConfig({
          reader: urlReader,
          logger,
        });

        // Create a hybrid preparer that delegates based on URL type
        const hybridPreparer = {
          shouldCleanPreparedDirectory: () => true,
          prepare: async (entity: Entity, options?: any) => {
            const annotation =
              entity.metadata.annotations?.[TECHDOCS_ANNOTATION];

            if (!annotation) {
              throw new Error(`No ${TECHDOCS_ANNOTATION} annotation found`);
            }

            // Check if it's a Confluence URL (both confluence-url: and url: formats)
            let targetUrl: string | undefined;

            if (annotation.startsWith('confluence-url:')) {
              targetUrl = annotation.substring('confluence-url:'.length);
            } else if (annotation.startsWith('url:')) {
              targetUrl = annotation.substring('url:'.length);
            }

            // If it's a Confluence URL, use the Confluence preparer
            if (targetUrl && ConfluencePreparer.isConfluenceUrl(targetUrl)) {
              logger.info(
                `Using Confluence preparer for entity ${entity.metadata.name}`,
              );
              return confluencePreparer.prepare(entity, options);
            }

            // Otherwise, use the standard URL preparer
            logger.debug(
              `Using standard URL preparer for entity ${entity.metadata.name}`,
            );
            return standardUrlPreparer.prepare(entity, options);
          },
        };

        // Register the hybrid preparer for the 'url' protocol
        techdocs.registerPreparer('url', hybridPreparer);

        logger.info(
          'TechDocs Confluence preparer registered (handles Confluence URLs within standard url: protocol)',
        );
      },
    });
  },
});
