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
import { DatabaseManager } from '@backstage/backend-defaults/database';
import type {
  AuditorService,
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LifecycleService,
  LoggerService,
  PermissionsRegistryService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';
import type { PermissionEvaluator } from '@backstage/plugin-permission-common';
import { PermissionPolicy } from '@backstage/plugin-permission-node';

import { newEnforcer, newModelFromString } from 'casbin';
import type { Router } from 'express';

import type {
  PluginIdProvider,
  RBACProvider,
} from '@backstage-community/plugin-rbac-node';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { DataBaseConditionalStorage } from '../database/conditional-storage';
import { migrate } from '../database/migration';
import { DataBaseRoleMetadataStorage } from '../database/role-metadata';
import { AllowAllPolicy } from '../policies/allow-all-policy';
import { RBACPermissionPolicy } from '../policies/permission-policy';
import { connectRBACProviders } from '../providers/connect-providers';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { PoliciesServer } from './policies-rest-api';
import { policyEntityPermissions } from '@backstage-community/plugin-rbac-common';
import { rules } from '../permissions';
import { permissionMetadataResourceRef } from '../permissions/resource';

/**
 * @public
 */
export type EnvOptions = {
  config: Config;
  logger: LoggerService;
  discovery: DiscoveryService;
  permissions: PermissionEvaluator;
  auth: AuthService;
  httpAuth: HttpAuthService;
  auditor: AuditorService;
  userInfo: UserInfoService;
  lifecycle: LifecycleService;
  permissionsRegistry: PermissionsRegistryService;
};

/**
 * @public
 */
export type RBACRouterOptions = {
  config: Config;
  logger: LoggerService;
  discovery: DiscoveryService;
  policy: PermissionPolicy;
  auth: AuthService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  permissionsRegistry: PermissionsRegistryService;
};

/**
 * @public
 */
export class PolicyBuilder {
  public static async build(
    env: EnvOptions,
    pluginIdProvider: PluginIdProvider = { getPluginIds: () => [] },
    rbacProviders?: Array<RBACProvider>,
  ): Promise<Router> {
    let policy: PermissionPolicy;

    const databaseManager = DatabaseManager.fromConfig(env.config).forPlugin(
      'permission',
      { logger: env.logger, lifecycle: env.lifecycle },
    );

    const databaseClient = await databaseManager.getClient();

    const adapter = await new CasbinDBAdapterFactory(
      env.config,
      databaseClient,
    ).createAdapter();

    const enf = await newEnforcer(newModelFromString(MODEL), adapter);
    await enf.loadPolicy();
    enf.enableAutoSave(true);

    const catalogClient = new CatalogClient({ discoveryApi: env.discovery });
    const catalogDBClient = await DatabaseManager.fromConfig(env.config)
      .forPlugin('catalog', { logger: env.logger, lifecycle: env.lifecycle })
      .getClient();

    const rm = new BackstageRoleManager(
      catalogClient,
      env.logger,
      catalogDBClient,
      databaseClient,
      env.config,
      env.auth,
    );
    enf.setRoleManager(rm);
    enf.enableAutoBuildRoleLinks(false);
    await enf.buildRoleLinks();

    await migrate(databaseManager);

    const conditionStorage = new DataBaseConditionalStorage(databaseClient);

    const roleMetadataStorage = new DataBaseRoleMetadataStorage(databaseClient);
    const enforcerDelegate = new EnforcerDelegate(
      enf,
      env.auditor,
      conditionStorage,
      roleMetadataStorage,
      databaseClient,
    );

    env.permissionsRegistry.addResourceType({
      resourceRef: permissionMetadataResourceRef,
      getResources: resourceRefs =>
        Promise.all(
          resourceRefs.map(ref => {
            return roleMetadataStorage.findRoleMetadata(ref);
          }),
        ),
      permissions: policyEntityPermissions,
      rules: Object.values(rules),
    });

    if (rbacProviders) {
      await connectRBACProviders(
        rbacProviders,
        enforcerDelegate,
        roleMetadataStorage,
        env.logger,
        env.auditor,
      );
    }

    const pluginIdsConfig = env.config.getOptionalStringArray(
      'permission.rbac.pluginsWithPermission',
    );
    if (pluginIdsConfig) {
      const pluginIds = new Set([
        ...pluginIdsConfig,
        ...pluginIdProvider.getPluginIds(),
      ]);
      pluginIdProvider.getPluginIds = () => {
        return [...pluginIds];
      };
    }

    const pluginPermMetaData = new PluginPermissionMetadataCollector({
      deps: {
        discovery: env.discovery,
        pluginIdProvider: pluginIdProvider,
        logger: env.logger,
        config: env.config,
      },
    });

    const isPluginEnabled = env.config.getOptionalBoolean('permission.enabled');
    if (isPluginEnabled) {
      env.logger.info('RBAC backend plugin was enabled');

      policy = await RBACPermissionPolicy.build(
        env.logger,
        env.auditor,
        env.config,
        conditionStorage,
        enforcerDelegate,
        roleMetadataStorage,
        databaseClient,
        pluginPermMetaData,
        env.auth,
      );
    } else {
      env.logger.warn(
        'RBAC backend plugin was disabled by application config permission.enabled: false',
      );

      policy = new AllowAllPolicy();
    }

    const options: RBACRouterOptions = {
      config: env.config,
      logger: env.logger,
      discovery: env.discovery,
      policy,
      auth: env.auth,
      httpAuth: env.httpAuth,
      userInfo: env.userInfo,
      permissionsRegistry: env.permissionsRegistry,
    };

    const server = new PoliciesServer(
      env.permissions,
      options,
      enforcerDelegate,
      conditionStorage,
      pluginPermMetaData,
      roleMetadataStorage,
      env.auditor,
      rbacProviders,
    );
    return server.serve();
  }
}
