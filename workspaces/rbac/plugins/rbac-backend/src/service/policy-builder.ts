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
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';
import type { PermissionEvaluator } from '@backstage/plugin-permission-common';

import { newEnforcer, newModelFromString } from 'casbin';
import type { Router } from 'express';

import type {
  PluginIdProvider,
  RBACProvider,
} from '@backstage-community/plugin-rbac-node';

import { getDefaultRoleAndPolicies } from '../default-permissions/default-permissions';
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
import { PermissionDependentPluginDatabaseStore } from '../database/extra-permission-enabled-plugins-storage';
import { ExtendablePluginIdProvider } from './extendable-id-provider';
import { PolicyExtensionPoint } from '@backstage/plugin-permission-node/alpha';

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
  lifecycle: LifecycleService;
  permissionsRegistry: PermissionsRegistryService;
  policy: PolicyExtensionPoint;
};

/**
 * @public
 */
export type RBACRouterOptions = {
  config: Config;
  logger: LoggerService;
  auth: AuthService;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
  permissionsRegistry: PermissionsRegistryService;
  auditor: AuditorService;
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

    const extraPluginsIdStorage = new PermissionDependentPluginDatabaseStore(
      databaseClient,
    );
    const extendablePluginIdProvider = new ExtendablePluginIdProvider(
      extraPluginsIdStorage,
      pluginIdProvider,
      env.config,
    );
    await extendablePluginIdProvider.handleConflictedPluginIds();
    const pluginPermMetaData = new PluginPermissionMetadataCollector({
      deps: {
        discovery: env.discovery,
        pluginIdProvider: extendablePluginIdProvider,
        logger: env.logger,
        config: env.config,
      },
    });

    const defaultRoleAndPolicies = await getDefaultRoleAndPolicies(
      env.config,
      roleMetadataStorage,
      enforcerDelegate,
    );
    const isPluginEnabled = env.config.getOptionalBoolean('permission.enabled');
    if (isPluginEnabled) {
      env.logger.info('RBAC backend plugin was enabled');

      const policy = await RBACPermissionPolicy.build(
        env.logger,
        env.auditor,
        env.config,
        conditionStorage,
        enforcerDelegate,
        roleMetadataStorage,
        databaseClient,
        pluginPermMetaData,
        env.auth,
        defaultRoleAndPolicies,
      );
      env.policy.setPolicy(policy);
    } else {
      env.logger.warn(
        'RBAC backend plugin was disabled by application config permission.enabled: false',
      );

      env.policy.setPolicy(new AllowAllPolicy());
    }

    const options: RBACRouterOptions = {
      config: env.config,
      logger: env.logger,
      auth: env.auth,
      httpAuth: env.httpAuth,
      permissions: env.permissions,
      permissionsRegistry: env.permissionsRegistry,
      auditor: env.auditor,
    };

    const server = new PoliciesServer(
      options,
      enforcerDelegate,
      conditionStorage,
      pluginPermMetaData,
      roleMetadataStorage,
      extraPluginsIdStorage,
      extendablePluginIdProvider,
      defaultRoleAndPolicies?.role,
      defaultRoleAndPolicies?.policies,
      rbacProviders,
    );
    return server.serve();
  }
}
