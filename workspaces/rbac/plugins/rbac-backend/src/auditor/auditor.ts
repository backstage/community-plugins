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
  PolicyDecision,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import type { PolicyQuery } from '@backstage/plugin-permission-node';

import {
  PermissionAction,
  toPermissionAction,
} from '@backstage-community/plugin-rbac-common';
import {
  AuditorService,
  AuditorServiceEvent,
} from '@backstage/backend-plugin-api';

export const ActionType = {
  CREATE: 'create',
  CREATE_OR_UPDATE: 'create_or_update',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const RoleEvents = {
  ROLE_WRITE: 'role-write',
  ROLE_READ: 'role-read',
} as const;

export const PermissionEvents = {
  POLICY_WRITE: 'policy-write',
  POLICY_READ: 'policy-read',
} as const;

export const EvaluationEvents = {
  PERMISSION_EVALUATION: 'permission-evaluation',
} as const;

export const ListPluginPoliciesEvents = {
  PLUGIN_POLICIES_READ: 'plugin-policies-read',
};

export const ListConditionEvents = {
  CONDITION_RULES_READ: 'condition-rules-read',
};

export type EvaluationAuditInfo = {
  userEntityRef: string;
  permissionName: string;
  action: PermissionAction;
  resourceType?: string;
  decision?: PolicyDecision;
};

export const PoliciesData = {
  PERMISSIONS_READ: 'permissions-read',
};

export const ConditionEvents = {
  CONDITION_WRITE: 'condition-write',
  CONDITION_READ: 'condition-read',
  CONDITIONAL_POLICIES_FILE_NOT_FOUND: 'conditional-policies-file-not-found',
  CONDITIONAL_POLICIES_FILE_CHANGE: 'conditional-policies-file-change',
};

export async function createPermissionEvaluationAuditorEvent(
  auditor: AuditorService,
  userEntityRef: string,
  request: PolicyQuery,
  policyDecision?: PolicyDecision,
): Promise<AuditorServiceEvent> {
  const auditInfo: EvaluationAuditInfo = {
    userEntityRef,
    permissionName: request.permission.name,
    action: toPermissionAction(request.permission.attributes),
  };

  const resourceType = (request.permission as ResourcePermission).resourceType;
  if (resourceType) {
    auditInfo.resourceType = resourceType;
  }
  if (policyDecision) {
    auditInfo.decision = policyDecision;
  }

  return await auditor.createEvent({
    eventId: EvaluationEvents.PERMISSION_EVALUATION,
    severityLevel: 'medium',
    meta: {
      ...auditInfo,
    },
  });
}
