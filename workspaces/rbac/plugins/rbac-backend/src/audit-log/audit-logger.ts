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
  AuthorizeResult,
  PolicyDecision,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import type { PolicyQuery } from '@backstage/plugin-permission-node';

import type { AuditLogOptions } from '@janus-idp/backstage-plugin-audit-log-node';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
  Source,
  toPermissionAction,
} from '@backstage-community/plugin-rbac-common';

export const RoleEvents = {
  CREATE_ROLE: 'CreateRole',
  UPDATE_ROLE: 'UpdateRole',
  DELETE_ROLE: 'DeleteRole',
  CREATE_OR_UPDATE_ROLE: 'CreateOrUpdateRole',
  GET_ROLE: 'GetRole',

  CREATE_ROLE_ERROR: 'CreateRoleError',
  UPDATE_ROLE_ERROR: 'UpdateRoleError',
  DELETE_ROLE_ERROR: 'DeleteRoleError',
  GET_ROLE_ERROR: 'GetRoleError',
} as const;

export const PermissionEvents = {
  CREATE_POLICY: 'CreatePolicy',
  UPDATE_POLICY: 'UpdatePolicy',
  DELETE_POLICY: 'DeletePolicy',
  GET_POLICY: 'GetPolicy',

  CREATE_POLICY_ERROR: 'CreatePolicyError',
  UPDATE_POLICY_ERROR: 'UpdatePolicyError',
  DELETE_POLICY_ERROR: 'DeletePolicyError',
  GET_POLICY_ERROR: 'GetPolicyError',
} as const;

export type RoleAuditInfo = {
  roleEntityRef: string;
  description?: string;
  source: Source;

  members: string[];
};

export type RolesAuditInfo = {
  groupingPolicies: string[][];
  source: Source;
};

export type PermissionAuditInfo = {
  policies: string[][];
  source: Source;
};

export const EvaluationEvents = {
  PERMISSION_EVALUATION_STARTED: 'PermissionEvaluationStarted',
  PERMISSION_EVALUATION_COMPLETED: 'PermissionEvaluationCompleted',
  CONDITION_EVALUATION_COMPLETED: 'ConditionEvaluationCompleted',
  PERMISSION_EVALUATION_FAILED: 'PermissionEvaluationFailed',
} as const;

export const ListPluginPoliciesEvents = {
  GET_PLUGINS_POLICIES: 'GetPluginsPolicies',
  GET_PLUGINS_POLICIES_ERROR: 'GetPluginsPoliciesError',
};

export const ListConditionEvents = {
  GET_CONDITION_RULES: 'GetConditionRules',
  GET_CONDITION_RULES_ERROR: 'GetConditionRulesError',
};

export type EvaluationAuditInfo = {
  userEntityRef: string;
  permissionName: string;
  action: PermissionAction;
  resourceType?: string;
  decision?: PolicyDecision;
};

export const PoliciesData = {
  FAILED_TO_FETCH_NEWER_PERMISSIONS: 'FailedToFetchNewerPermissions',
};

export const ConditionEvents = {
  CREATE_CONDITION: 'CreateCondition',
  UPDATE_CONDITION: 'UpdateCondition',
  DELETE_CONDITION: 'DeleteCondition',
  GET_CONDITION: 'GetCondition',

  CREATE_CONDITION_ERROR: 'CreateConditionError',
  UPDATE_CONDITION_ERROR: 'UpdateConditionError',
  DELETE_CONDITION_ERROR: 'DeleteConditionError',
  GET_CONDITION_ERROR: 'GetConditionError',
  PARSE_CONDITION_ERROR: 'ParseConditionError',
  CHANGE_CONDITIONAL_POLICIES_FILE_ERROR: 'ChangeConditionalPoliciesError',
  CONDITIONAL_POLICIES_FILE_NOT_FOUND: 'ConditionalPoliciesFileNotFound',
};

export type ConditionAuditInfo = {
  condition: RoleConditionalPolicyDecision<PermissionAction>;
};

export const RBAC_BACKEND = 'rbac-backend';

// Audit log stage for processing Role-Based Access Control (RBAC) data
export const HANDLE_RBAC_DATA_STAGE = 'handleRBACData';

// Audit log stage to refresh Role-Based Access Control (RBAC) data
export const FETCH_NEWER_PERMISSIONS_STAGE = 'fetchNewerPermissions';

// Audit log stage for determining access rights based on user permissions and resource information
export const EVALUATE_PERMISSION_ACCESS_STAGE = 'evaluatePermissionAccess';

// Audit log stage for sending the response to the client about handled permission policies, roles, and condition policies
export const SEND_RESPONSE_STAGE = 'sendResponse';
export const RESPONSE_ERROR = 'responseError';

export function createPermissionEvaluationOptions(
  message: string,
  userEntityRef: string,
  request: PolicyQuery,
  policyDecision?: PolicyDecision,
): AuditLogOptions<EvaluationAuditInfo> {
  const auditInfo: EvaluationAuditInfo = {
    userEntityRef,
    permissionName: request.permission.name,
    action: toPermissionAction(request.permission.attributes),
  };

  const resourceType = (request.permission as ResourcePermission).resourceType;
  if (resourceType) {
    auditInfo.resourceType = resourceType;
  }

  let eventName;
  if (!policyDecision) {
    eventName = EvaluationEvents.PERMISSION_EVALUATION_STARTED;
  } else {
    auditInfo.decision = policyDecision;

    switch (policyDecision.result) {
      case AuthorizeResult.DENY:
      case AuthorizeResult.ALLOW:
        eventName = EvaluationEvents.PERMISSION_EVALUATION_COMPLETED;
        break;
      case AuthorizeResult.CONDITIONAL:
        eventName = EvaluationEvents.CONDITION_EVALUATION_COMPLETED;
        break;
      default:
        throw new Error('Unknown policy decision result');
    }
  }

  return {
    actorId: userEntityRef,
    message,
    eventName,
    metadata: auditInfo,
    stage: EVALUATE_PERMISSION_ACCESS_STAGE,
    status: 'succeeded',
  };
}
