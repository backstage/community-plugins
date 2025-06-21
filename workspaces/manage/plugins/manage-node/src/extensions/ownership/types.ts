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
import { Entity } from '@backstage/catalog-model';

/**
 * An ownership service allows fetching all groups a set of ownership entity
 * refs belong to.
 *
 * @public
 */
export interface OwnershipService {
  /**
   * Finds all parent groups given a set of ownershipEntityRefs.
   * This will include pseudo groups (i.e. a group with children groups that are
   * also children of other groups).
   *
   * Returns all ownership entities (users and groups)
   */
  getOwnedGroups(
    ownershipEntityRefs: readonly string[],
    credentials: BackstageCredentials<BackstageUserPrincipal>,
  ): Promise<Entity[]>;
}

/**
 * An ownership provider allows registering a custom ownership service.
 *
 * @public
 */
export interface OwnershipProvider {
  setOwnershipService(ownershipService: OwnershipService): void;
}
