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
import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

export type LicensedUsersAPI = {
  isLicensePluginEnabled(): Promise<boolean>;
  downloadStatistics: () => Promise<Response>;
};

// @public
export const licensedUsersApiRef = createApiRef<LicensedUsersAPI>({
  id: 'plugin.licensed-users-info.service',
});

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class LicensedUsersAPIClient implements LicensedUsersAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }
  async isLicensePluginEnabled(): Promise<boolean> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/licensed-users-info/health`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );

    return jsonResponse.ok;
  }

  async downloadStatistics(): Promise<Response> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const response = await fetch(
      `${backendUrl}/api/licensed-users-info/users`,
      {
        method: 'GET',
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'text/csv',
        },
      },
    );
    return response;
  }
}
