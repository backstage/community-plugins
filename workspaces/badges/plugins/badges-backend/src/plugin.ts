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
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { createDefaultBadgeFactories } from './badges';
import { badgeBuildersExtensionPoint } from './extensions';
import { BadgeFactories } from './types';
import { BadgeBuilder } from './lib';
import { BadgesStore } from './database/badgesStore';

/**
 * Badges backend plugin
 *
 * @public
 */
export const badgesPlugin = createBackendPlugin({
  pluginId: 'badges',
  register(env) {
    let badgeFactories: BadgeFactories | undefined;
    let badgeBuilder: BadgeBuilder | undefined;
    let badgeStore: BadgesStore | undefined;

    env.registerExtensionPoint(badgeBuildersExtensionPoint, {
      setBadgeFactories(factory) {
        badgeFactories = factory;
      },
      setBadgeBuilder(builder) {
        badgeBuilder = builder;
      },
      setBadgeStore(store) {
        badgeStore = store;
      },
    });

    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        auth: coreServices.auth,
        database: coreServices.database,
      },
      async init({
        config,
        logger,
        discovery,
        httpRouter,
        httpAuth,
        auth,
        database,
      }) {
        httpRouter.use(
          await createRouter({
            badgeBuilder,
            badgeStore,
            config,
            logger,
            badgeFactories: badgeFactories || createDefaultBadgeFactories(),
            discovery,
            httpAuth,
            auth,
            database,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/entity/:entityUuid/:badgeId',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/entity/:namespace/:kind/:name/badge/:badgeId',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
