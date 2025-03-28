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
  FetchUrlReader,
  ReaderFactory,
  UrlReaders,
} from '@backstage/backend-defaults/urlReader';
import type {
  AuthService,
  DiscoveryService,
  LoggerService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { isError } from '@backstage/errors';
import {
  isResourcePermission,
  Permission,
} from '@backstage/plugin-permission-common';
import type {
  MetadataResponse,
  MetadataResponseSerializedRule,
} from '@backstage/plugin-permission-node';

import {
  policyEntityPermissions,
  type PluginPermissionMetaData,
  type PolicyDetails,
} from '@backstage-community/plugin-rbac-common';
import type { PluginIdProvider } from '@backstage-community/plugin-rbac-node';
import { rules } from '../permissions';

type PluginMetadataResponse = {
  pluginId: string;
  metaDataResponse: MetadataResponse;
};

export type PluginMetadataResponseSerializedRule = {
  pluginId: string;
  rules: MetadataResponseSerializedRule[];
};

const rbacPermissionMetadata: MetadataResponse = {
  permissions: policyEntityPermissions,
  rules: Object.values(rules),
};

export class PluginPermissionMetadataCollector {
  private readonly pluginIds: string[];
  private readonly discovery: DiscoveryService;
  private readonly logger: LoggerService;
  private readonly urlReader: UrlReaderService;

  constructor({
    deps,
    optional,
  }: {
    deps: {
      discovery: DiscoveryService;
      pluginIdProvider: PluginIdProvider;
      logger: LoggerService;
      config: Config;
    };
    optional?: {
      urlReader?: UrlReaderService;
    };
  }) {
    const { discovery, pluginIdProvider, logger, config } = deps;
    this.pluginIds = pluginIdProvider.getPluginIds();
    this.discovery = discovery;
    this.logger = logger;
    this.urlReader =
      optional?.urlReader ??
      UrlReaders.default({
        config,
        logger,
        factories: [PluginPermissionMetadataCollector.permissionFactory],
      });
  }

  async getPluginConditionRules(
    auth: AuthService,
  ): Promise<PluginMetadataResponseSerializedRule[]> {
    const pluginMetadata = await this.getPluginMetaData(auth);

    return pluginMetadata
      .filter(metadata => metadata.metaDataResponse.rules.length > 0)
      .map(metadata => {
        return {
          pluginId: metadata.pluginId,
          rules: metadata.metaDataResponse.rules,
        };
      });
  }

  async getPluginPolicies(
    auth: AuthService,
  ): Promise<PluginPermissionMetaData[]> {
    const pluginMetadata = await this.getPluginMetaData(auth);

    return pluginMetadata
      .filter(metadata => metadata.metaDataResponse.permissions !== undefined)
      .map(metadata => {
        return {
          pluginId: metadata.pluginId,
          policies: permissionsToCasbinPolicies(
            metadata.metaDataResponse.permissions!,
          ),
        };
      });
  }

  private static permissionFactory: ReaderFactory = () => {
    return [{ reader: new FetchUrlReader(), predicate: (_url: URL) => true }];
  };

  private async getPluginMetaData(
    auth: AuthService,
  ): Promise<PluginMetadataResponse[]> {
    let pluginResponses: PluginMetadataResponse[] = [];

    for (const pluginId of this.pluginIds) {
      try {
        const { token } = await auth.getPluginRequestToken({
          onBehalfOf: await auth.getOwnServiceCredentials(),
          targetPluginId: pluginId,
        });

        const permMetaData = await this.getMetadataByPluginId(pluginId, token);
        if (permMetaData) {
          pluginResponses = [
            ...pluginResponses,
            {
              metaDataResponse: permMetaData,
              pluginId,
            },
          ];
        }
      } catch (error) {
        this.logger.error(
          `Failed to retrieve permission metadata for ${pluginId}. ${error}`,
        );
      }
    }

    return pluginResponses;
  }

  async getMetadataByPluginId(
    pluginId: string,
    token: string | undefined,
  ): Promise<MetadataResponse | undefined> {
    let permMetaData: MetadataResponse | undefined;

    // Work around: This is needed for start up whenever a conditional policy for the plugin permission in the yaml file
    // will make a check to the well known endpoint
    // However, our plugin has not completely started and as such will throw a 503 error
    // TODO: see if we are able to remove this after we migrate to the permission registry
    if (pluginId === 'permission') {
      return rbacPermissionMetadata;
    }

    try {
      const baseEndpoint = await this.discovery.getBaseUrl(pluginId);
      const wellKnownURL = `${baseEndpoint}/.well-known/backstage/permissions/metadata`;

      const permResp = await this.urlReader.readUrl(wellKnownURL, { token });
      const permMetaDataRaw = (await permResp.buffer()).toString();

      try {
        permMetaData = JSON.parse(permMetaDataRaw);
      } catch (err) {
        // workaround for https://issues.redhat.com/browse/RHIDP-1456
        return undefined;
      }
    } catch (err) {
      if (isError(err) && err.name === 'NotFoundError') {
        this.logger.warn(
          `No permission metadata found for ${pluginId}. ${err}`,
        );
        return undefined;
      }
      this.logger.error(
        `Failed to retrieve permission metadata for ${pluginId}. ${err}`,
      );
    }
    return permMetaData;
  }
}

function permissionsToCasbinPolicies(
  permissions: Permission[],
): PolicyDetails[] {
  const policies: PolicyDetails[] = [];
  for (const permission of permissions) {
    if (isResourcePermission(permission)) {
      policies.push({
        resourceType: permission.resourceType,
        name: permission.name,
        policy: permission.attributes.action || 'use',
      });
    } else {
      policies.push({
        name: permission.name,
        policy: permission.attributes.action || 'use',
      });
    }
  }

  return policies;
}
