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
import type {
  AuthService,
  BackstageUserInfo,
  LoggerService,
} from '@backstage/backend-plugin-api';
import type { ConfigApi } from '@backstage/core-plugin-api';
import {
  AuthorizeResult,
  ConditionalPolicyDecision,
  isResourcePermission,
  Permission,
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
  PolicyDecision,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import type {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';

import type { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import type { Knex } from 'knex';

import {
  NonEmptyArray,
  toPermissionAction,
} from '@backstage-community/plugin-rbac-common';

import {
  setAdminPermissions,
  useAdminsFromConfig,
} from '../admin-permissions/admin-creation';
import {
  createPermissionEvaluationOptions,
  EVALUATE_PERMISSION_ACCESS_STAGE,
  EvaluationEvents,
} from '../audit-log/audit-logger';
import { replaceAliases } from '../conditional-aliases/alias-resolver';
import { ConditionalStorage } from '../database/conditional-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { CSVFileWatcher } from '../file-permissions/csv-file-watcher';
import { YamlConditinalPoliciesFileWatcher } from '../file-permissions/yaml-conditional-file-watcher';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';

const evaluatePermMsg = (
  userEntityRef: string | undefined,
  result: AuthorizeResult,
  permission: Permission,
) =>
  `${userEntityRef} is ${result} for permission '${permission.name}'${
    isResourcePermission(permission)
      ? `, resource type '${permission.resourceType}'`
      : ''
  } and action '${toPermissionAction(permission.attributes)}'`;

export class RBACPermissionPolicy implements PermissionPolicy {
  private readonly superUserList?: string[];

  public static async build(
    logger: LoggerService,
    auditLogger: AuditLogger,
    configApi: ConfigApi,
    conditionalStorage: ConditionalStorage,
    enforcerDelegate: EnforcerDelegate,
    roleMetadataStorage: RoleMetadataStorage,
    knex: Knex,
    pluginMetadataCollector: PluginPermissionMetadataCollector,
    auth: AuthService,
  ): Promise<RBACPermissionPolicy> {
    const superUserList: string[] = [];
    const adminUsers = configApi.getOptionalConfigArray(
      'permission.rbac.admin.users',
    );

    const superUsers = configApi.getOptionalConfigArray(
      'permission.rbac.admin.superUsers',
    );

    const policiesFile = configApi.getOptionalString(
      'permission.rbac.policies-csv-file',
    );

    const allowReload =
      configApi.getOptionalBoolean('permission.rbac.policyFileReload') || false;

    const conditionalPoliciesFile = configApi.getOptionalString(
      'permission.rbac.conditionalPoliciesFile',
    );

    if (superUsers && superUsers.length > 0) {
      for (const user of superUsers) {
        const userName = user.getString('name');
        superUserList.push(userName);
      }
    }

    await useAdminsFromConfig(
      adminUsers || [],
      enforcerDelegate,
      auditLogger,
      roleMetadataStorage,
      knex,
    );
    await setAdminPermissions(enforcerDelegate, auditLogger);

    if (
      (!adminUsers || adminUsers.length === 0) &&
      (!superUsers || superUsers.length === 0)
    ) {
      logger.warn(
        'There are no admins or super admins configured for the RBAC-backend plugin.',
      );
    }

    const csvFile = new CSVFileWatcher(
      policiesFile,
      allowReload,
      logger,
      enforcerDelegate,
      roleMetadataStorage,
      auditLogger,
    );
    await csvFile.initialize();

    const conditionalFile = new YamlConditinalPoliciesFileWatcher(
      conditionalPoliciesFile,
      allowReload,
      logger,
      conditionalStorage,
      auditLogger,
      auth,
      pluginMetadataCollector,
      roleMetadataStorage,
      enforcerDelegate,
    );
    await conditionalFile.initialize();

    if (!conditionalPoliciesFile) {
      // clean up conditional policies corresponding to roles from csv file
      logger.info('conditional policies file feature was disabled');
      await conditionalFile.cleanUpConditionalPolicies();
    }
    if (!policiesFile) {
      // remove roles and policies from csv file
      logger.info('csv policies file feature was disabled');
      await csvFile.cleanUpRolesAndPolicies();
    }

    return new RBACPermissionPolicy(
      enforcerDelegate,
      auditLogger,
      conditionalStorage,
      superUserList,
    );
  }

  private constructor(
    private readonly enforcer: EnforcerDelegate,
    private readonly auditLogger: AuditLogger,
    private readonly conditionStorage: ConditionalStorage,
    superUserList?: string[],
  ) {
    this.superUserList = superUserList;
  }

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const userEntityRef = user?.info.userEntityRef ?? `user without entity`;

    let auditOptions = createPermissionEvaluationOptions(
      `Policy check for ${userEntityRef}`,
      userEntityRef,
      request,
    );
    await this.auditLogger.auditLog(auditOptions);

    try {
      let status = false;

      const action = toPermissionAction(request.permission.attributes);
      if (!user) {
        const msg = evaluatePermMsg(
          userEntityRef,
          AuthorizeResult.DENY,
          request.permission,
        );
        auditOptions = createPermissionEvaluationOptions(
          msg,
          userEntityRef,
          request,
          { result: AuthorizeResult.DENY },
        );
        await this.auditLogger.auditLog(auditOptions);
        return { result: AuthorizeResult.DENY };
      }

      if (this.superUserList!.includes(userEntityRef)) {
        const msg = evaluatePermMsg(
          userEntityRef,
          AuthorizeResult.ALLOW,
          request.permission,
        );

        auditOptions = createPermissionEvaluationOptions(
          msg,
          userEntityRef,
          request,
          { result: AuthorizeResult.ALLOW },
        );
        await this.auditLogger.auditLog(auditOptions);

        return { result: AuthorizeResult.ALLOW };
      }

      const permissionName = request.permission.name;
      await this.enforcer.loadPolicy();
      const roles = await this.enforcer.getRolesForUser(userEntityRef);

      if (isResourcePermission(request.permission)) {
        const resourceType = request.permission.resourceType;

        // handle conditions if they are present
        if (user) {
          const conditionResult = await this.handleConditions(
            userEntityRef,
            request,
            roles,
            user.info,
          );
          if (conditionResult) {
            return conditionResult;
          }
        }

        // handle permission with 'resource' type
        const hasNamedPermission =
          await this.hasImplicitPermissionSpecifiedByName(
            permissionName,
            action,
            roles,
          );
        // Let's set up higher priority for permission specified by name, than by resource type
        const obj = hasNamedPermission ? permissionName : resourceType;

        status = await this.isAuthorized(userEntityRef, obj, action, roles);
      } else {
        // handle permission with 'basic' type
        status = await this.isAuthorized(
          userEntityRef,
          permissionName,
          action,
          roles,
        );
      }

      const result = status ? AuthorizeResult.ALLOW : AuthorizeResult.DENY;

      const msg = evaluatePermMsg(userEntityRef, result, request.permission);
      auditOptions = createPermissionEvaluationOptions(
        msg,
        userEntityRef,
        request,
        { result },
      );
      await this.auditLogger.auditLog(auditOptions);
      return { result };
    } catch (error) {
      await this.auditLogger.auditLog({
        message: 'Permission policy check failed',
        eventName: EvaluationEvents.PERMISSION_EVALUATION_FAILED,
        stage: EVALUATE_PERMISSION_ACCESS_STAGE,
        status: 'failed',
        errors: [error],
      });
      return { result: AuthorizeResult.DENY };
    }
  }

  private async hasImplicitPermissionSpecifiedByName(
    permissionName: string,
    action: string,
    roles: string[],
  ): Promise<boolean> {
    const perms: string[][] = [];

    for (const role of roles) {
      perms.push(...(await this.enforcer.getFilteredPolicy(0, role)));
    }

    for (const perm of perms) {
      if (permissionName === perm[1] && action === perm[2]) {
        return true;
      }
    }
    return false;
  }

  private isAuthorized = async (
    userIdentity: string,
    permission: string,
    action: string,
    roles: string[],
  ): Promise<boolean> => {
    return await this.enforcer.enforce(userIdentity, permission, action, roles);
  };

  private async handleConditions(
    userEntityRef: string,
    request: PolicyQuery,
    roles: string[],
    userInfo: BackstageUserInfo,
  ): Promise<PolicyDecision | undefined> {
    const permissionName = request.permission.name;
    const resourceType = (request.permission as ResourcePermission)
      .resourceType;
    const action = toPermissionAction(request.permission.attributes);

    const conditions: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    >[] = [];
    let pluginId = '';
    for (const role of roles) {
      const conditionalDecisions = await this.conditionStorage.filterConditions(
        role,
        undefined,
        resourceType,
        [action],
        [permissionName],
      );

      if (conditionalDecisions.length === 1) {
        pluginId = conditionalDecisions[0].pluginId;
        conditions.push(conditionalDecisions[0].conditions);
      }

      // this error is unexpected and should not happen, but just in case handle it.
      if (conditionalDecisions.length > 1) {
        const msg = `Detected ${JSON.stringify(
          conditionalDecisions,
        )} collisions for conditional policies. Expected to find a stored single condition for permission with name ${permissionName}, resource type ${resourceType}, action ${action} for user ${userEntityRef}`;
        const auditOptions = createPermissionEvaluationOptions(
          msg,
          userEntityRef,
          request,
          { result: AuthorizeResult.DENY },
        );
        await this.auditLogger.auditLog(auditOptions);
        return {
          result: AuthorizeResult.DENY,
        };
      }
    }

    if (conditions.length > 0) {
      const result: ConditionalPolicyDecision = {
        pluginId,
        result: AuthorizeResult.CONDITIONAL,
        resourceType,
        conditions: {
          anyOf: conditions as NonEmptyArray<
            PermissionCriteria<
              PermissionCondition<string, PermissionRuleParams>
            >
          >,
        },
      };

      replaceAliases(result.conditions, userInfo);

      const msg = `Send condition to plugin with id ${pluginId} to evaluate permission ${permissionName} with resource type ${resourceType} and action ${action} for user ${userEntityRef}`;
      const auditOptions = createPermissionEvaluationOptions(
        msg,
        userEntityRef,
        request,
        result,
      );
      await this.auditLogger.auditLog(auditOptions);
      return result;
    }
    return undefined;
  }
}
