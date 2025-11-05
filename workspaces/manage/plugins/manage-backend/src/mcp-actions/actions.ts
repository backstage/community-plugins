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
  const catalogHelper = new CatalogHelper({ auth, catalog });

  actionsRegistry.register({
    attributes: {
      readOnly: true,
    },
    name: 'my-entities',
    title: 'My entities',
    description:
      'Returns the entities (Components, Systems, etc) owned by a user or a ' +
      'group the user belongs to (including parent and child groups).',
    schema: {
      input: z =>
        z.object({
          user: z
            .string()
            .describe('The username, "entity ref" or email of the person'),
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
          ownerEntities: z
            .array(z.object({}).passthrough())
            .describe(
              'A list of Backstage entities representing the user and groups ' +
                'the user belongs to, or their parent or child groups all ' +
                'the way up to the root group and down to leaf groups. ' +
                'The relations between groups are stored in the ' +
                '`relations` property of type `childOf` or `parentOf`.',
            ),
        }),
    },
    action: async ({ input }) => {
      const userEntity = await catalogHelper.getUserByNameOrEmail(input.user);
      const ownershipEntityRefs = await catalogHelper.getOwnershipEntityRefs(
        userEntity,
      );

      const ownersAndOwnedEntities =
        await manageService.getOwnersAndOwnedEntities(
          ownershipEntityRefs,
          [],
          await auth.getOwnServiceCredentials(),
        );

      return {
        output: ownersAndOwnedEntities,
      };
    },
  });
}
