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
  BackstageCredentials,
  BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';

import {
  OwnedEntitiesService,
  OwnershipService,
} from '@backstage-community/plugin-manage-node';
import { OwnersAndOwnedEntities } from '@backstage-community/plugin-manage-common';

export class ManageServiceImpl {
  constructor(
    private readonly ownershipService: OwnershipService,
    private readonly ownedEntitiesService: OwnedEntitiesService,
  ) {}

  public async getOwnersAndOwnedEntities(
    ownershipEntityRefs: string[],
    kinds: readonly string[],
    credentials: BackstageCredentials<BackstageUserPrincipal>,
  ): Promise<OwnersAndOwnedEntities> {
    const ownerEntities = await this.ownershipService.getOwnedGroups(
      ownershipEntityRefs,
      credentials,
    );

    const ownedEntities =
      await this.ownedEntitiesService.getOwnedEntitiesByOwnerEntities(
        ownerEntities,
        kinds,
        credentials,
      );
    return { ownerEntities, ownedEntities };
  }
}
