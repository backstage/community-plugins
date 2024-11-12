/*
 * Copyright 2024 The Backstage Authors
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

import type { GroupEntity, UserEntity } from '@backstage/catalog-model';

import type GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';
import type UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';

export interface GroupRepresentationWithParent extends GroupRepresentation {
  parentId?: string;
  parent?: string;
  members?: string[];
}

export interface GroupRepresentationWithParentAndEntity
  extends GroupRepresentationWithParent {
  entity: GroupEntity;
}

export interface UserRepresentationWithEntity extends UserRepresentation {
  entity: UserEntity;
}

/**
 * Customize the ingested User entity
 *
 * @public
 *
 * @param {UserEntity} entity The output of the default parser
 * @param {UserRepresentation} user Keycloak user representation
 * @param {string} realm Realm name
 * @param {GroupRepresentationWithParentAndEntity[]} groups Data about available groups (can be used to create additional relationships)
 *
 * @returns {Promise<UserEntity | undefined>} Resolve to a modified `UserEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type UserTransformer = (
  entity: UserEntity,
  user: UserRepresentation,
  realm: string,
  groups: GroupRepresentationWithParentAndEntity[],
) => Promise<UserEntity | undefined>;

/**
 * Customize the ingested Group entity
 *
 * @public
 *
 * @param {GroupEntity} entity The output of the default parser
 * @param {GroupRepresentation} group Keycloak group representation
 * @param {string} realm Realm name
 *
 * @returns {Promise<GroupEntity | undefined>} Resolve to a modified `GroupEntity` object that will be ingested into the catalog or resolve to `undefined` to reject the entity
 */
export type GroupTransformer = (
  entity: GroupEntity,
  group: GroupRepresentation,
  realm: string,
) => Promise<GroupEntity | undefined>;
