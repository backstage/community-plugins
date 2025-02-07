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

/**
 * @public
 * The Keycloak group representation with parent and group members information.
 */
export interface GroupRepresentationWithParent extends GroupRepresentation {
  /**
   * The parent group ID.
   */
  parentId?: string;
  /**
   * The parent group name.
   */
  parent?: string;
  /**
   * The group members.
   */
  members?: string[];
}

/**
 * @public
 * The Keycloak group representation with parent, group members, and conrresponding backstage entity information.
 */
export interface GroupRepresentationWithParentAndEntity
  extends GroupRepresentationWithParent {
  /**
   * The corresponding backstage entity information.
   */
  entity: GroupEntity;
}

/**
 * @public
 * The Keycloak user representation with corresponding backstage entity information.
 */
export interface UserRepresentationWithEntity extends UserRepresentation {
  /**
   * The corresponding backstage entity information.
   */
  entity: UserEntity;
}

/**
 * Customize the ingested User entity.
 *
 * @public
 *
 * @param entity - The output of the default parser.
 * @param user - The Keycloak user representation.
 * @param realm - The realm name.
 * @param groups - Data about available groups, which can be used to create additional relationships.
 *
 * @returns A promise resolving to a modified `UserEntity` object to be ingested into the catalog,
 * or `undefined` to reject the entity.
 */
export type UserTransformer = (
  entity: UserEntity,
  user: UserRepresentation,
  realm: string,
  groups: GroupRepresentationWithParentAndEntity[],
) => Promise<UserEntity | undefined>;

/**
 * Customize the ingested Group entity.
 *
 * @public
 *
 * @param entity - The output of the default parser.
 * @param group - The Keycloak group representation.
 * @param realm - The realm name.
 *
 * @returns A promise resolving to a modified `GroupEntity` object to be ingested into the catalog,
 * or `undefined` to reject the entity.
 */
export type GroupTransformer = (
  entity: GroupEntity,
  group: GroupRepresentation,
  realm: string,
) => Promise<GroupEntity | undefined>;
