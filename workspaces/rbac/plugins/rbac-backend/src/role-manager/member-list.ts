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
import { Knex } from 'knex';

export class RoleMemberList {
  public name: string;

  private members: string[];
  private roles: string[];

  public constructor(name: string) {
    this.name = name;
    this.members = [];
    this.roles = [];
  }

  /**
   * addMembers will add members to the RoleMemberList
   * @param members The members to be added.
   */
  public addMembers(members: string[]): void {
    this.members = members;
  }

  /**
   * addMember will add a single member to the RoleMemberList, skips adding the user in the
   * event that they already exist in the members array.
   * @param member The member to be added.
   */
  public addMember(member: string): void {
    if (this.members.some(n => n === member)) {
      return;
    }
    this.members.push(member);
  }

  /**
   * hasMember will check if a particular member exists in the members array.
   * @param name The member to be checked for.
   */
  public hasMember(name: string): boolean {
    return this.members.includes(name);
  }

  /**
   * deleteMember will remove a user from the members array.
   * @param member The member to be removed.
   */
  public deleteMember(member: string): void {
    this.members = this.members.filter(n => n !== member);
  }

  /**
   * buildMembers will query the `casbin_rule` database table to ensure that the role
   * that we have cached is up to date.
   * This is important in multi node scenarios where the cached roles in role manager can become
   * out of sync with the database.
   * @param roleMemberList The RoleMemberList to be updated.
   * @param client The database client.
   */
  public async buildMembers(
    roleMemberList: RoleMemberList,
    client: Knex,
  ): Promise<void> {
    try {
      const members: string[] = await client
        .table('casbin_rule')
        .where('v1', this.name)
        .pluck('v0')
        .distinct();

      roleMemberList.addMembers(members);
    } catch (error) {
      throw new Error(
        `Unable to find members for the role ${this.name}. Cause: ${error}`,
      );
    }
  }

  /**
   * getMembers will return the members of the RoleMemberList
   * @returns The members.
   */
  getMembers(): string[] {
    return this.members;
  }

  /**
   * addRoles will add roles to the RoleMemberList
   * @param roles The roles to be added.
   */
  public addRoles(roles: string[]): void {
    this.roles = roles;
  }

  /**
   * buildRoles will query the `casbin_rule` database table to quickly grab all of the
   * roles that a particular user is attached to.
   * @param roleMemberList The RoleMemberList to be updated.
   * @param userAndGroups The user and groups to query with.
   * @param client The database client.
   */
  public async buildRoles(
    roleMemberList: RoleMemberList,
    userAndGroups: string[],
    client: Knex,
  ): Promise<void> {
    try {
      const roles: string[] = await client
        .table('casbin_rule')
        .where('ptype', 'g')
        .whereIn('v0', userAndGroups)
        .pluck('v1')
        .distinct();

      roleMemberList.addRoles(roles);
    } catch (error) {
      throw new Error(`Unable to find all roles. Cause: ${error}`);
    }
  }

  /**
   * getRoles will return the roles of the RoleMemberList.
   * @returns The roles.
   */
  getRoles(): string[] {
    return this.roles;
  }
}
