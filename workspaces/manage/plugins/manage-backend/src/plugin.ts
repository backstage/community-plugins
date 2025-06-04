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
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

import {
  ownedEntitesExtensionRef,
  OwnedEntitiesService,
  ownershipExtensionRef,
  OwnershipService,
} from '@backstage-community/plugin-manage-node';

import { OwnershipServiceImpl } from './services/OwnershipService';
import { OwnedEntitiesImpl } from './services/OwnedEntities';
import { ManageServiceImpl } from './services/Manage';
import { createRouter } from './router';

/**
 * managePlugin backend plugin
 *
 * @public
 */
export const managePlugin = createBackendPlugin({
  pluginId: 'manage',
  register(env) {
    const ownershipExtension: { ownershipService?: OwnershipService } = {};
    const ownedEntitiesExtension: {
      ownedEntitiesService?: OwnedEntitiesService;
    } = {};

    env.registerExtensionPoint(ownershipExtensionRef, {
      setOwnershipService(ownershipService) {
        ownershipExtension.ownershipService = ownershipService;
      },
    });

    env.registerExtensionPoint(ownedEntitesExtensionRef, {
      setOwnedEntitiesService(ownedEntitiesService) {
        ownedEntitiesExtension.ownedEntitiesService = ownedEntitiesService;
      },
    });

    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
        userInfo: coreServices.userInfo,
      },
      async init({ httpAuth, httpRouter, catalog, userInfo }) {
        const ownershipService: OwnershipService =
          ownershipExtension.ownershipService ??
          new OwnershipServiceImpl(catalog);

        const ownedEntitiesService: OwnedEntitiesService =
          ownedEntitiesExtension.ownedEntitiesService ??
          new OwnedEntitiesImpl(catalog);

        const manageService = new ManageServiceImpl(
          ownershipService,
          ownedEntitiesService,
        );

        httpRouter.use(
          await createRouter({
            httpAuth,
            userInfo,
            manageService,
          }),
        );
      },
    });
  },
});
