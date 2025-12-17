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

import { QUAY_SINGLE_INSTANCE_NAME } from '@backstage-community/plugin-quay-common';

import {
  LabelsResponse,
  ManifestByDigestResponse,
  SecurityDetailsResponse,
  TagsResponse,
} from '../types';

export interface QuayService {
  getQuayInstance(instanceName?: string): QuayInstance | undefined;
  getTags(
    instanceName: string,
    org: string,
    repo: string,
    page?: number,
    limit?: number,
  ): Promise<TagsResponse>;
  getLabels(
    instanceName: string,
    org: string,
    repo: string,
    digest: string,
  ): Promise<LabelsResponse>;
  getManifestByDigest(
    instanceName: string,
    org: string,
    repo: string,
    digest: string,
  ): Promise<ManifestByDigestResponse>;
  getSecurityDetails(
    instanceName: string,
    org: string,
    repo: string,
    digest: string,
  ): Promise<SecurityDetailsResponse>;
}

export type QuayInstance = {
  name: string;
  apiUrl: string;
  token: string | undefined;
};

export class QuayService {
  private readonly logger: LoggerService;
  private readonly instances: Map<string, QuayInstance>;
  private readonly defaultInstanceName: string;

  constructor(instances: QuayInstance[], logger: LoggerService) {
    if (instances.length === 0) {
      throw new Error('At least one Quay instance must be configured');
    }

    this.instances = new Map(
      instances.map(instance => [instance.name, instance]),
    );
    this.defaultInstanceName = instances[0].name;
    this.logger = logger;
  }

  static fromConfig(config: Config, logger: LoggerService): QuayService {
    const quayConfig = config.getConfig('quay');

    // Multiple instances configuration
    if (quayConfig.has('instances')) {
      const instancesConfig = quayConfig.getConfigArray('instances');
      const instances = instancesConfig.map(instanceConfig => ({
        name: instanceConfig.getString('name'),
        apiUrl: instanceConfig.getString('apiUrl'),
        token: instanceConfig.getOptionalString('apiKey'),
      }));
      return new QuayService(instances, logger);
    }

    // Single instance configuration
    return new QuayService(
      [
        {
          name: QUAY_SINGLE_INSTANCE_NAME,
          apiUrl: quayConfig.getString('apiUrl'),
          token: quayConfig.getOptionalString('apiKey'),
        },
      ],
      logger,
    );
  }

  public getQuayInstance(instanceName?: string): QuayInstance | undefined {
    return instanceName
      ? this.instances.get(instanceName)
      : this.instances.get(this.defaultInstanceName);
  }

  private async fetchFromQuay(
    endpoint: string,
    instanceName: string,
  ): Promise<any> {
    const instance = this.getQuayInstance(instanceName);
    if (!instance) {
      throw new Error(
        `Quay instance "${instanceName}" not found in configuration.`,
      );
    }

    const url = `${instance.apiUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(instance.token
            ? { Authorization: `Bearer ${instance.token}` }
            : {}),
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
    instanceName: string,
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
      instanceName,
    ) as Promise<TagsResponse>;
  }

  async getLabels(
    instanceName: string,
    org: string,
    repo: string,
    digest: string,
  ) {
    return this.fetchFromQuay(
      `/api/v1/repository/${org}/${repo}/manifest/${digest}/labels`,
      instanceName,
    ) as Promise<LabelsResponse>;
  }

  async getManifestByDigest(
    instanceName: string,
    org: string,
    repo: string,
    digest: string,
  ) {
    return this.fetchFromQuay(
      `/api/v1/repository/${org}/${repo}/manifest/${digest}`,
      instanceName,
    ) as Promise<ManifestByDigestResponse>;
  }

  async getSecurityDetails(
    instanceName: string,
    org: string,
    repo: string,
    digest: string,
  ) {
    const params = new URLSearchParams();
    params.append('vulnerabilities', 'true');

    return this.fetchFromQuay(
      `/api/v1/repository/${org}/${repo}/manifest/${digest}/security?${params}`,
      instanceName,
    ) as Promise<SecurityDetailsResponse>;
  }
}
