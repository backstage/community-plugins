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
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import {
  LabelsResponse,
  ManifestByDigestResponse,
  SecurityDetailsResponse,
  TagsResponse,
} from '../types';

export interface QuayService {
  getTags(
    org: string,
    repo: string,
    page?: number,
    limit?: number,
  ): Promise<TagsResponse>;
  getLabels(org: string, repo: string, digest: string): Promise<LabelsResponse>;
  getManifestByDigest(
    org: string,
    repo: string,
    digest: string,
  ): Promise<ManifestByDigestResponse>;
  getSecurityDetails(
    org: string,
    repo: string,
    digest: string,
  ): Promise<SecurityDetailsResponse>;
}

export class QuayService {
  private readonly apiUrl: string;
  private readonly token?: string;
  private readonly logger: LoggerService;

  constructor(config: Config, logger: LoggerService) {
    this.apiUrl = config.getString('quay.apiUrl');
    this.token = config.getOptionalString('quay.apiKey');
    this.logger = logger;
  }

  static fromConfig(config: Config, logger: LoggerService): QuayService {
    return new QuayService(config, logger);
  }

  private async fetchFromQuay(endpoint: string): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
      });

      if (!response.ok) {
        this.logger.error(
          `Quay Service request failed: (${response.status}, ${response.statusText})`,
        );

        // Check if this is an access issue.
        if (response?.status === 401) {
          throw new Error(
            `Quay returned (${response.status}, ${response.statusText}): Please make sure you have access to this repository or have valid access tokens.`,
          );
        }

        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Quay Service request failed: ${error}`);
    }
  }

  async getTags(
    org: string,
    repo: string,
    page?: number,
    limit?: number,
    specificTag?: string,
  ) {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    if (specificTag !== undefined) params.append('specificTag', specificTag);

    // We only want active tags
    params.append('onlyActiveTags', 'true');

    return this.fetchFromQuay(
      `/api/v1/repository/${org}/${repo}/tag?${params.toString()}`,
    ) as Promise<TagsResponse>;
  }

  async getLabels(org: string, repo: string, digest: string) {
    return this.fetchFromQuay(
      `/api/v1/repository/${org}/${repo}/manifest/${digest}/labels`,
    ) as Promise<LabelsResponse>;
  }

  async getManifestByDigest(org: string, repo: string, digest: string) {
    return this.fetchFromQuay(
      `/api/v1/repository/${org}/${repo}/manifest/${digest}`,
    ) as Promise<ManifestByDigestResponse>;
  }

  async getSecurityDetails(org: string, repo: string, digest: string) {
    const params = new URLSearchParams();
    params.append('vulnerabilities', 'true');

    return this.fetchFromQuay(
      `/api/v1/repository/${org}/${repo}/manifest/${digest}/security?${params}`,
    ) as Promise<SecurityDetailsResponse>;
  }
}
