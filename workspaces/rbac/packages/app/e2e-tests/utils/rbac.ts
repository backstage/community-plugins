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
import { APIResponse, Page, expect } from '@playwright/test';
// import { UIhelper } from "../../utils/ui-helper";
import { Policy, Role } from '../api/rbac-api-structures';

export class Roles {
  private readonly page: Page;
  // private readonly uiHelper: UIhelper;

  constructor(page: Page) {
    this.page = page;
    // this.uiHelper = new UIhelper(page);
  }
  static getRolesListCellsIdentifier() {
    const roleName = new RegExp(/^(role|user|group):[a-zA-Z]+\/[\w@*.~-]+$/);
    const usersAndGroups = new RegExp(
      /^(1\s(user|group)|[2-9]\s(users|groups))(, (1\s(user|group)|[2-9]\s(users|groups)))?$/,
    );
    const permissionPolicies = /\d/;
    return [roleName, usersAndGroups, permissionPolicies];
  }

  static getUsersAndGroupsListCellsIdentifier() {
    const name = new RegExp(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/);
    const type = new RegExp(/^(User|Group)$/);
    const members = /^(-|\d+)$/;
    return [name, type, members];
  }

  static getPermissionPoliciesListCellsIdentifier() {
    const policies =
      /^(?:(Read|Create|Update|Delete)(?:, (?:Read|Create|Update|Delete))*|Use)$/;
    return [policies];
  }

  // Depending on the version of the Backstage, it can be 'Permission Policies' or 'Accessible Plugins'
  // Accepts either term
  static getRolesListColumnsText() {
    return [
      /^Name$/,
      /^Users and groups$/,
      /Permission Policies|Accessible plugins/,
    ];
  }

  static getUsersAndGroupsListColumnsText() {
    return ['Name', 'Type', 'Members'];
  }

  static getPermissionPoliciesListColumnsText() {
    return ['Plugin', 'Permission', 'Policies'];
  }
}

export class Response {
  static async removeMetadataFromResponse(
    response: APIResponse,
  ): Promise<unknown[]> {
    try {
      const responseJson = await response.json();

      // Validate that the response is an array
      if (!Array.isArray(responseJson)) {
        console.warn(
          // eslint-disable-line no-console
          `Expected an array but received: ${JSON.stringify(responseJson)}`,
        );
        return []; // Return an empty array as a fallback
      }

      // Clean metadata from the response
      const responseClean = responseJson.map((item: { metadata: unknown }) => {
        if (item.metadata) {
          delete item.metadata;
        }
        return item;
      });

      return responseClean;
    } catch (error) {
      console.error('Error processing API response:', error); // eslint-disable-line no-console
      throw new Error('Failed to process the API response');
    }
  }

  static async checkResponse(
    response: APIResponse,
    expected: Role[] | Policy[],
  ) {
    const cleanResponse = await this.removeMetadataFromResponse(response);
    expect(cleanResponse).toEqual(expected);
  }
}
