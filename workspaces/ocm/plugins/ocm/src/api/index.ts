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
import { ErrorResponseBody } from '@backstage/errors';

import { Cluster } from '@backstage-community/plugin-ocm-common';

export interface OcmApiV1 {
  getClusters(): Promise<Cluster[] | ErrorResponseBody>;
  getClusterByName(
    providerId: string,
    name: string,
  ): Promise<Cluster | ErrorResponseBody>;
}

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export const OcmApiRef = createApiRef<OcmApiV1>({
  id: 'plugin.ocm.service',
});

export class OcmApiClient implements OcmApiV1 {
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  private async clusterApiFetchCall(params?: string): Promise<any> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/ocm/status${params || ''}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
    return jsonResponse.json();
  }

  getClusters(): Promise<ErrorResponseBody | Cluster[]> {
    return this.clusterApiFetchCall();
  }
  getClusterByName(
    providerId: string,
    name: string,
  ): Promise<Cluster | ErrorResponseBody> {
    return this.clusterApiFetchCall(`/${providerId}/${name}`);
  }
}
