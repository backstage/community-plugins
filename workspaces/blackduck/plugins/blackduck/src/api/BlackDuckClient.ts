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
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { BlackDuckApi } from './BlackDuckApi';

export class BlackDuckClient implements BlackDuckApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;

  public constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  public async getVulns(
    hostKey: string,
    projectName: string,
    projectVersion: string,
    entityRef: string,
  ): Promise<any> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('blackduck')}`;
    const vulnURL = `${baseUrl}/vulns/${hostKey}/${projectName}/${projectVersion}`;
    const { token: accessToken } = await this.identityApi.getCredentials();
    const response = await fetch(vulnURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ entityRef }),
    });
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json();
  }

  public async getRiskProfile(
    hostKey: string,
    projectName: string,
    projectVersion: string,
    entityRef: string,
  ): Promise<any> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('blackduck')}`;
    const vulnURL = `${baseUrl}/risk-profile/${hostKey}/${projectName}/${projectVersion}`;
    const { token: idToken } = await this.identityApi.getCredentials();
    const response = await fetch(vulnURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify({ entityRef }),
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json();
  }
}
