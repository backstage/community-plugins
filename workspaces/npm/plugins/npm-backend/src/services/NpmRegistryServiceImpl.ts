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
  AuthService,
  BackstageCredentials,
  BackstageUserPrincipal,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import {
  NpmAnnotation,
  NpmRegistryClient,
  NpmRegistryPackageInfo,
} from '@backstage-community/plugin-npm-common';

import { NpmRegistryService } from './NpmRegistryService';
import { Config } from '../../config';

export type Options = {
  logger: LoggerService;
  auth: AuthService;
  config: RootConfigService;
  // TODO update CatalogService
  catalog: typeof catalogServiceRef.T;
};

export class NpmRegistryServiceImpl implements NpmRegistryService {
  private readonly logger: LoggerService;
  private readonly auth: AuthService;
  private readonly config: RootConfigService;
  private readonly catalog: typeof catalogServiceRef.T;

  constructor(options: Options) {
    this.logger = options.logger;
    this.auth = options.auth;
    this.config = options.config;
    this.catalog = options.catalog;
  }

  async getPackageInfo(
    entityRef: string,
    options: { credentials: BackstageCredentials<BackstageUserPrincipal> },
  ): Promise<NpmRegistryPackageInfo> {
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: options.credentials,
      targetPluginId: 'catalog',
    });
    const entity = await this.catalog.getEntityByRef(entityRef, {
      token,
    });
    if (!entity) {
      throw new NotFoundError(`No entity found for ref '${entityRef}'`);
    }

    const config = this.config.getOptional<Config['npm']>('npm');
    const defaultRegistry = config?.defaultRegistry;

    const packageName =
      entity.metadata.annotations?.[NpmAnnotation.PACKAGE_NAME];
    const registryName =
      entity.metadata.annotations?.[NpmAnnotation.REGISTRY_NAME] ||
      defaultRegistry;
    if (!packageName) {
      throw new NotFoundError(
        `Npm package name not defined at entity '${entityRef}'`,
      );
    }

    const registry = config?.registries?.find(r => r.name === registryName);
    if (!registry && registryName !== 'default' && registryName !== 'npmjs') {
      throw new NotFoundError(
        `Npm registry config '${registryName}' not found as defined in entity '${entityRef}'`,
      );
    }

    this.logger.info('Will use npmjs package info:', {
      entityRef,
      packageName,
      registryUrl: registry?.url,
      registryToken: registry?.token ? 'yes' : 'no',
    });

    const client = new NpmRegistryClient({
      // TODO pass apiFetch.fetch
      baseUrl: registry?.url,
      token: registry?.token,
    });
    const packageInfo = await client.getPackageInfo(packageName);
    return packageInfo;
  }
}
