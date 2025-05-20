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
  AuditorService,
  AuditorServiceEvent,
  AuthService,
  BackstageUserInfo,
  LoggerService,
} from '@backstage/backend-plugin-api';
import type { ConfigApi } from '@backstage/core-plugin-api';
import {
  AuthorizeResult,
  ConditionalPolicyDecision,
  isResourcePermission,
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

import type { Knex } from 'knex';

import {
  NonEmptyArray,
  toPermissionAction,
} from '@backstage-community/plugin-rbac-common';

import {
  setAdminPermissions,
  useAdminsFromConfig,
} from '../admin-permissions/admin-creation';
import { createPermissionEvaluationAuditorEvent } from '../auditor/auditor';
import { replaceAliases } from '../conditional-aliases/alias-resolver';
import { ConditionalStorage } from '../database/conditional-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { CSVFileWatcher } from '../file-permissions/csv-file-watcher';
import { YamlConditinalPoliciesFileWatcher } from '../file-permissions/yaml-conditional-file-watcher';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';

export class RBACPermissionPolicy implements PermissionPolicy {
  private readonly superUserList?: string[];
  private readonly defaultUserAccessEnabled: boolean;
  private readonly defaultPermissions: Array<{
    permission: string;
    policy: string;
    effect: string;
  }>;

  public static async build(
    logger: LoggerService,
    auditor: AuditorService,
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

    // Read default user access configuration - properly handle Boolean values
    const defaultUserAccessEnabled = configApi.getOptionalBoolean(
      'permission.rbac.defaultUserAccess.enabled',
    );
    logger.info(
      `Default user access enabled: ${Boolean(defaultUserAccessEnabled)}`,
    );

    // Read default permissions if enabled
    const defaultPermissions: Array<{
      permission: string;
      policy: string;
      effect: string;
    }> = [];

    if (defaultUserAccessEnabled) {
      // Only proceed if explicitly enabled
      const defaultPermissionsConfig = configApi.getOptionalConfigArray(
        'permission.rbac.defaultUserAccess.defaultPermissions',
      );

      if (defaultPermissionsConfig && defaultPermissionsConfig.length > 0) {
        for (const item of defaultPermissionsConfig) {
          defaultPermissions.push({
            permission: item.getString('permission'),
            policy: item.getString('policy'),
            effect: item.getString('effect') || 'allow',
          });
        }
        logger.info(
          `Loaded ${defaultPermissions.length} default permissions: ${JSON.stringify(
            defaultPermissions,
          )}`,
        );
      } else {
        logger.warn(
          'Default user access is enabled but no permissions are defined',
        );
      }
    }

    if (superUsers && superUsers.length > 0) {
      for (const user of superUsers) {
        const userName = user.getString('name');
        superUserList.push(userName);
      }
    }

    await useAdminsFromConfig(
      adminUsers || [],
      enforcerDelegate,
      auditor,
      roleMetadataStorage,
      knex,
    );
    await setAdminPermissions(enforcerDelegate, auditor);

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
      auditor,
    );
    await csvFile.initialize();

    const conditionalFile = new YamlConditinalPoliciesFileWatcher(
      conditionalPoliciesFile,
      allowReload,
      logger,
      conditionalStorage,
      auditor,
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
      auditor,
      conditionalStorage,
      superUserList,
      defaultUserAccessEnabled, // Pass the raw boolean value without conversion
      defaultPermissions,
    );
  }

  private constructor(
    private readonly enforcer: EnforcerDelegate,
    private readonly auditor: AuditorService,
    private readonly conditionStorage: ConditionalStorage,
    superUserList?: string[],
    defaultUserAccessEnabled = false,
    defaultPermissions: Array<{
      permission: string;
      policy: string;
      effect: string;
    }> = [],
  ) {
    this.superUserList = superUserList;
    this.defaultUserAccessEnabled = defaultUserAccessEnabled;
    this.defaultPermissions = defaultPermissions;
  }

  public getDefaultPermissions(): Array<{
    permission: string;
    policy: string;
    effect: string;
  }> {
    return this.defaultPermissions;
  }

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const userEntityRef = user?.info.userEntityRef ?? `user without entity`;

    const auditorEvent = await createPermissionEvaluationAuditorEvent(
      this.auditor,
      userEntityRef,
      request,
    );

    try {
      let status = false;
      const action = toPermissionAction(request.permission.attributes);

      if (!user) {
        await auditorEvent.success({
          meta: { result: AuthorizeResult.DENY },
        });
        return { result: AuthorizeResult.DENY };
      }

      if (this.superUserList!.includes(userEntityRef)) {
        await auditorEvent.success({
          meta: { result: AuthorizeResult.ALLOW },
        });
        return { result: AuthorizeResult.ALLOW };
      }

      const permissionName = request.permission.name;
      const roles = await this.enforcer.getRolesForUser(userEntityRef);
      // handle permission with 'resource' type
      const hasNamedPermission =
        await this.hasImplicitPermissionSpecifiedByName(
          permissionName,
          action,
          roles,
        );

      // TODO: Temporary workaround to prevent breakages after the removal of the resource type `policy-entity` from the permission `policy.entity.create`
      if (
        request.permission.name === 'policy.entity.create' &&
        !hasNamedPermission
      ) {
        request.permission = {
          attributes: { action: 'create' },
          type: 'resource',
          resourceType: 'policy-entity',
          name: 'policy.entity.create',
        };
      }

      if (isResourcePermission(request.permission)) {
        const resourceType = request.permission.resourceType;

        // handle conditions if they are present
        if (user) {
          const conditionResult = await this.handleConditions(
            auditorEvent,
            userEntityRef,
            request,
            roles,
            user.info,
          );
          if (conditionResult) {
            return conditionResult;
          }
        }

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

      // New deny-checking logic block
      if (!status && this.defaultUserAccessEnabled) {
        const resourceTypeDeny = isResourcePermission(request.permission)
          ? request.permission.resourceType
          : undefined;

        const permDeny = hasNamedPermission
          ? permissionName
          : (resourceTypeDeny ?? permissionName);
        const denyPermissions: string[][] = [];
        for (const role of roles) {
          // Assuming getFilteredPolicy params are (fieldIndex, fieldValue0, fieldValue1, fieldValue2, fieldValue3)
          // For deny check, the effect is the 4th parameter (index 3) for the policy rule.
          // So we expect: enforcer.getFilteredPolicy(0, role, permDeny, action, 'deny')
          // The Casbin API getFilteredPolicy(fieldIndex, ...fieldValues) means it filters starting from fieldIndex.
          // If we want to match ptype, v0, v1, v2, v3 (e.g., 'p', role, permDeny, action, 'deny')
          // and our policy has 5 parts (ptype, v0, v1, v2, v3), then:
          // fieldIndex 0 is ptype, fieldIndex 1 is v0 (role), fieldIndex 2 is v1 (permDeny),
          // fieldIndex 3 is v2 (action), fieldIndex 4 is v3 (effect, 'deny')
          // So, to filter for role, permDeny, action, 'deny':
          // We need to provide role, permDeny, action, 'deny' as fieldValues.
          // The enforcer.getFilteredPolicy in Casbin node adapter expects (fieldIndex, ...fieldValues)
          // If the policy is (role, object, action, effect), then:
          // getFilteredPolicy(0, role, permDeny, action, 'deny') should work if 'effect' is the 4th part of the policy rule.
          // Let's assume the underlying enforcer's getFilteredPolicy handles this as intended by the example.
          // The existing code uses getFilteredPolicy(0, role, permissionName, action) for allow checks, implying effect is not the last param or is handled differently.
          // Given the problem description's `this.enforcer.getFilteredPolicy(0, ...[role, permDeny, action, 'deny'])`
          // this suggests the policy rule structure might be [role, permDeny, action, 'deny'] for the purpose of this call.
          // Let's stick to the provided snippet's structure.
          const denyPerm = await this.enforcer.getFilteredPolicy(
            0,
            role,
            permDeny,
            action,
            'deny',
          );
          denyPermissions.push(...denyPerm);
        }

        if (denyPermissions.length === 0) {
          // NO DENY RULES FOUND
          const permissionDebug = {
            user: userEntityRef,
            permissionName,
            action,
            defaultsEnabled: this.defaultUserAccessEnabled,
            defaultPermissions: this.defaultPermissions,
          };

          this.auditor.createEvent({
            eventId: 'permission.debug.defaultAccess.noDeny',
            meta: permissionDebug,
          });

          // First check by permission name (higher priority)
          let defaultPermission = this.defaultPermissions.find(
            dp =>
              dp.permission === permissionName &&
              (dp.policy === action || dp.policy === 'use'),
          );

          // If not found and it's a resourced permission, check by resource type
          if (!defaultPermission && isResourcePermission(request.permission)) {
            // Ensure 'request.permission.resourceType' is valid here.
            // 'isResourcePermission' acts as a type guard.
            const resourceTypeDefault = request.permission.resourceType;
            defaultPermission = this.defaultPermissions.find(
              dp =>
                dp.permission === resourceTypeDefault &&
                (dp.policy === action || dp.policy === 'use'),
            );
          }

          if (defaultPermission) {
            this.auditor.createEvent({
              eventId: 'permission.debug.defaultAccess.applied',
              meta: { defaultPermission, result: 'allow' },
            });
            status = defaultPermission.effect === 'allow'; // This will set status to true if effect is 'allow'
          }
        } else {
          // DENY RULES WERE FOUND
          this.auditor.createEvent({
            eventId: 'permission.debug.defaultAccess.deniedByPolicy',
            meta: {
              user: userEntityRef,
              permissionName,
              action,
              permDeny,
              roles,
              denyPermissions,
            },
          });
          // 'status' is already false and remains false.
        }
      }

      const result = status ? AuthorizeResult.ALLOW : AuthorizeResult.DENY;

      await auditorEvent.success({ meta: { result } });
      return { result };
    } catch (error) {
      await auditorEvent.fail({
        error,
        meta: { result: AuthorizeResult.DENY },
      });
      return { result: AuthorizeResult.DENY };
    }
  }

  private async hasImplicitPermissionSpecifiedByName(
    permissionName: string,
    action: string,
    roles: string[],
  ): Promise<boolean> {
    for (const role of roles) {
      const perms = await this.enforcer.getFilteredPolicy(
        0,
        role,
        permissionName,
        action,
      );
      if (perms.length > 0) {
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
    auditorEvent: AuditorServiceEvent,
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
        await auditorEvent.fail({
          error: new Error(
            `Detected ${JSON.stringify(
              conditionalDecisions,
            )} collisions for conditional policies. Expected to find a stored single condition for permission with name ${permissionName}, resource type ${resourceType}, action ${action} for user ${userEntityRef}`,
          ),
          meta: { result: AuthorizeResult.DENY },
        });
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

      await auditorEvent.success({ meta: { ...result } });
      return result;
    }
    return undefined;
  }
}
