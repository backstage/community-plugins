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
import { CatalogService } from '@backstage/plugin-catalog-node';
import { AuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';

import { ManageService } from '../services/Manage';
import { CatalogHelper } from './catalog-helper';

export function registerMcpActions({
  auth,
  catalog,
  actionsRegistry,
  manageService,
}: {
  auth: AuthService;
  catalog: CatalogService;
  actionsRegistry: ActionsRegistryService;
  manageService: ManageService;
}) {
  actionsRegistry.register({
    attributes: {
      readOnly: true,
    },
    name: 'get-managed-entities',
    title: 'Get Managed Entities',
    description:
      'Returns the entities (Components, Systems, etc) owned by a user or a ' +
      'group the user belongs to (including parent and child groups).',
    schema: {
      input: z =>
        z.object({
          user: z
            .string()
            .optional()
            .describe(
              'The username, "user entity ref" or email of the person. ' +
                'This field is not required if the action is executed in the ' +
                'context of an authenticated user.',
            ),
        }),
      output: z =>
        z.object({
          ownedEntities: z
            .array(z.object({}).passthrough())
            .describe(
              'A list of Backstage entities owned either by the user or any ' +
                'group the user belongs to, or a parent or child group of any ' +
                'of those groups.',
            ),
        }),
    },
    action: async ({ input, credentials }) => {
      const user = auth.isPrincipal(credentials, 'user')
        ? credentials.principal.userEntityRef
        : input.user;

      if (!user) {
        throw new InputError(
          'No user specified, and the action is not executed in the context ' +
            'of an authenticated user.',
        );
      }

      const catalogHelper = new CatalogHelper({ credentials, catalog });

      const userEntity = await catalogHelper.getUserByNameOrEmail(user);
      const ownershipEntityRefs = await catalogHelper.getOwnershipEntityRefs(
        userEntity,
      );

      const ownersAndOwnedEntities =
        await manageService.getOwnersAndOwnedEntities(
          ownershipEntityRefs,
          [],
          credentials,
        );

      return {
        output: {
          ownedEntities: ownersAndOwnedEntities.ownedEntities,
        },
      };
    },
  });
}
