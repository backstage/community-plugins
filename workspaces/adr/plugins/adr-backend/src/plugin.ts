/*
 * Copyright 2023 The Backstage Authors
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
  createBackendPlugin,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { AdrInfoParser } from '@backstage-community/plugin-adr-common';

/**
 * Options for {@link adrExtensionPoint}.
 *
 * @public
 */
export type AdrExtensionPoint = {
  /**
   * Allows you to parse files into different ADR formats.
   */
  setAdrInfoParser(adrInfoParser: AdrInfoParser): void;
};

/**
 * Extension point for customizing how ADRs are shaped for the backend.
 *
 * @public
 */
export const adrExtensionPoint = createExtensionPoint<AdrExtensionPoint>({
  id: 'adr.parser.extension',
});

/**
 * ADR backend plugin
 *
 * @public
 */
export const adrPlugin = createBackendPlugin({
  pluginId: 'adr',
  register(env) {
    let parser: AdrInfoParser | undefined;
    env.registerExtensionPoint(adrExtensionPoint, {
      setAdrInfoParser(adrInfoParser: AdrInfoParser) {
        parser = adrInfoParser;
      },
    });
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        reader: coreServices.urlReader,
        cache: coreServices.cache,
        httpRouter: coreServices.httpRouter,
      },
      async init({ httpRouter, logger, reader, cache }) {
        httpRouter.use(
          await createRouter({
            logger,
            reader,
            cacheClient: cache,
            parser,
          }),
        );

        httpRouter.addAuthPolicy({
          path: '/image',
          allow: 'user-cookie',
        });
      },
    });
  },
});
