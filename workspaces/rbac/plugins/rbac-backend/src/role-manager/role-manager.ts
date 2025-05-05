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
import type { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import { parseEntityRef } from '@backstage/catalog-model';
import type { Config } from '@backstage/config';

import { RoleManager } from 'casbin';
import { Knex } from 'knex';

import { AncestorSearchMemo, ASMGroup } from './ancestor-search-memo';
import { RoleMemberList } from './member-list';
import { AncestorSearchFactory } from './ancestor-search-factory';

export class BackstageRoleManager implements RoleManager {
  private allRoles: Map<string, RoleMemberList>;
  private maxDepth?: number;
  constructor(
    private readonly catalogApi: CatalogApi,
    private readonly logger: LoggerService,
    private readonly catalogDBClient: Knex,
    private readonly rbacDBClient: Knex,
    private readonly config: Config,
    private readonly auth: AuthService,
  ) {
    this.allRoles = new Map<string, RoleMemberList>();
    const rbacConfig = this.config.getOptionalConfig('permission.rbac');
    this.maxDepth = rbacConfig?.getOptionalNumber('maxDepth');
    if (this.maxDepth !== undefined && this.maxDepth! < 0) {
      throw new Error(
        'Max Depth for RBAC group hierarchy must be greater than or equal to zero',
      );
    }
  }

  /**
   * clear clears all stored data and resets the role manager to the initial state.
   */
  async clear(): Promise<void> {
    // do nothing
  }

  /**
   * addLink adds the inheritance link between name1 and role: name2.
   * aka name1 inherits role: name2.
   * The link that is established is based on the defined grouping policies that are added by the enforcer.
   *
   * ex. `g, name1, name2`.
   * @param name1 User or group that will be assigned to a role.
   * @param name2 The role that will be created or updated.
   * @param _domain Unimplemented prefix to the role.
   */
  async addLink(
    name1: string,
    name2: string,
    ..._domain: string[]
  ): Promise<void> {
    if (!this.isPGClient()) {
      const role1 = this.getOrCreateRole(name2);
      role1.addMember(name1);
    }
  }

  /**
   * deleteLink deletes the inheritance link between name1 and role: name2.
   * aka name1 does not inherit role: name2 any more.
   * The link that is deleted is based on the defined grouping policies that are removed by the enforcer.
   *
   * ex. `g, name1, name2`.
   * @param name1 User or group that will be removed from assignment of a role.
   * @param name2 The role that will be deleted or updated.
   * @param _domain Unimplemented.
   */
  async deleteLink(
    name1: string,
    name2: string,
    ..._domain: string[]
  ): Promise<void> {
    if (!this.isPGClient()) {
      const role1 = this.getOrCreateRole(name2);
      role1.deleteMember(name1);

      // Clean up in the event that there are no more members in the role
      if (role1.getMembers().length === 0) {
        this.allRoles.delete(name2);
      }
    }
  }

  /**
   * hasLink determines whether name1 inherits role: name2.
   * Before this check is called in the background by the enforcer,
   * we filter out all roles that the user is not connected to
   * directly or indirectly through the use of retrieving roles through
   * enforcer.getRolesForUser and apply those roles to a tempEnforcer.
   *
   * This means that hasLink will almost always be true in the event that a user
   * is assigned to a role (either directly or indirectly)
   *
   * In the event that a user or group is not assigned to a role and instead
   * are assigned directly to permissions, then name2 will become either that
   * user or group through the filtering. In this case we will build the graph
   * if necessary for name2 group presence or evaulate based on the names matching.
   * @param name1 The user that we are authorizing.
   * @param name2 The name of the role that we are checking against.
   * @param domain Unimplemented.
   * @returns True if the user is directly or indirectly attached to the role.
   */
  async hasLink(
    name1: string,
    name2: string,
    ...domain: string[]
  ): Promise<boolean> {
    if (domain.length > 0) {
      throw new Error('domain argument is not supported.');
    }

    // Name2 can be an empty string in the event that there is not a role associated with the user
    // This happens because of the filtering of the roles reduces the number of roles that we iterate through.
    if (name2.length === 0) {
      return false;
    }

    if (name1 === name2) {
      return true;
    }

    // name1 is always user in our case.
    // name2 is user or group.
    // user(name1) couldn't inherit user(name2).
    // We can use this fact for optimization.
    const { kind } = parseEntityRef(name2);
    if (kind.toLocaleLowerCase() === 'user') {
      return false;
    }

    // if it is a group, then we will have to build the graph,
    if (kind.toLocaleLowerCase() === 'group') {
      const memo = await AncestorSearchFactory.createAncestorSearchMemo(
        name1,
        this.config,
        this.catalogApi,
        this.catalogDBClient,
        this.auth,
        this.maxDepth,
      );

      await memo.buildUserGraph();
      memo.debugNodesAndEdges(this.logger, name1);

      if (!memo.isAcyclic()) {
        const cycles = memo.findCycles();

        this.logger.warn(
          `Detected cycle dependencies in the Group graph: ${JSON.stringify(
            cycles,
          )}. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: ${JSON.stringify(
            cycles,
          )}`,
        );
        return false;
      }

      return memo.hasEntityRef(name2);
    }

    return true;
  }

  /**
   * syncedHasLink determines whether role: name1 inherits role: name2.
   * domain is a prefix to the roles.
   */
  syncedHasLink?(
    _name1: string,
    _name2: string,
    ..._domain: string[]
  ): boolean {
    throw new Error('Method "syncedHasLink" not implemented.');
  }

  /**
   * getRoles gets the roles that a subject inherits.
   *
   * name - is a string entity reference, for example: user:default/tom, role:default/dev,
   * so format is <kind>:<namespace>/<entity-name>.
   * GetRoles method supports only two kind values: 'user' and 'role'.
   *
   * domain - is a prefix to the roles, unused parameter.
   *
   * If name's kind === 'user' we return all inherited roles from groups and roles directly assigned to the user.
   * if name's kind === 'role' we return empty array, because we don't support role inheritance.
   * Case kind === 'group' - should not happen, because:
   * 1) Method getRoles returns only role entity references, so casbin engine doesn't call this
   * method again to ask about name with kind "group".
   * 2) We implemented getRoles method only to use:
   * 'await enforcer.getImplicitPermissionsForUser(userEntityRef)',
   * so name argument can be only with kind 'user' or 'role'.
   *
   * Info: when we call 'await enforcer.getImplicitPermissionsForUser(userEntityRef)',
   * then casbin engine executes 'getRoles' method few times.
   * Firstly casbin asks about roles for 'userEntityRef'.
   * Let's imagine, that 'getRoles' returned two roles for userEntityRef.
   * Then casbin calls 'getRoles' two more times to
   * find parent roles. But we return empty array for each such call,
   * because we don't support role inheritance and we notify casbin about end of the role sub-tree.
   */
  async getRoles(name: string, ..._domain: string[]): Promise<string[]> {
    const { kind } = parseEntityRef(name);
    if (kind === 'user') {
      const memo = await AncestorSearchFactory.createAncestorSearchMemo(
        name,
        this.config,
        this.catalogApi,
        this.catalogDBClient,
        this.auth,
        this.maxDepth,
      );
      await memo.buildUserGraph();
      memo.debugNodesAndEdges(this.logger, name);

      // Account for the user not being in the graph (this can happen during direct assignment to roles)
      memo.setNode(name);

      if (!memo.isAcyclic()) {
        const cycles = memo.findCycles();

        this.logger.warn(
          `Detected cycle dependencies in the Group graph: ${JSON.stringify(
            cycles,
          )}. Admin/(catalog owner) have to fix it to make RBAC permission evaluation correct for groups: ${JSON.stringify(
            cycles,
          )}`,
        );
        return Promise.resolve([]);
      }

      if (this.isPGClient()) {
        const currentRole = new RoleMemberList(name);
        await currentRole.buildRoles(
          currentRole,
          memo.getNodes(),
          this.rbacDBClient,
        );
        return Promise.resolve(currentRole.getRoles());
      }

      const allRoles: string[] = [];
      for (const value of this.allRoles.values()) {
        if (this.hasMember(value, memo)) {
          allRoles.push(value.name);
        }
      }

      return Promise.resolve(allRoles);
    }

    return [];
  }

  /**
   * getUsers gets the users that inherits a subject.
   * domain is an unreferenced parameter here, may be used in other implementations.
   */
  async getUsers(_name: string, ..._domain: string[]): Promise<string[]> {
    throw new Error('Method "getUsers" not implemented.');
  }

  /**
   * printRoles prints all the roles to log.
   */
  async printRoles(): Promise<void> {
    // do nothing
  }

  /**
   * getOrCreateRole will get a role if it has already been cached
   * or it will create a new role to be cached.
   * This cache is a simple tree that is used to quickly compare
   * users and groups to roles.
   * @param name The user or group whose cache we will be getting / creating.
   * @returns The cached role as a RoleList.
   */
  private getOrCreateRole(name: string): RoleMemberList {
    const role = this.allRoles.get(name);
    if (role) {
      return role;
    }
    const newRole = new RoleMemberList(name);
    this.allRoles.set(name, newRole);

    return newRole;
  }

  /**
   * isPGClient checks what the current database client is at them time.
   * This is to ensure that we are querying the database in the event of postgres
   * or using in memory cache for better sqlite3.
   * @returns True if the database client is pg.
   */
  isPGClient(): boolean {
    const client = this.rbacDBClient.client.config.client;
    return client === 'pg';
  }

  /**
   * hasMember checks if the members from a particular role is associated with the user
   * that the AncestorSearchMemo graph is built for.
   * @param role The role that we are getting the members from.
   * @param memo The user graph that we are comparing members with.
   * @returns True if a member from the role is also associated with the user.
   */
  private hasMember(
    role: RoleMemberList | undefined,
    memo: AncestorSearchMemo<ASMGroup>,
  ): boolean {
    if (role === undefined) {
      return false;
    }

    for (const member of role.getMembers()) {
      if (memo.hasEntityRef(member)) {
        return true;
      }
    }
    return false;
  }
}
