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

export const RoleEvents = {
  ROLE_CREATE: 'role-create',
  ROLE_UPDATE: 'role-update',
  ROLE_DELETE: 'role-delete',
  ROLE_MUTATE: 'role-mutate',
  ROLE_READ: 'role-read',
} as const;

export const PermissionEvents = {
  POLICY_CREATE: 'policy-create',
  POLICY_UPDATE: 'policy-update',
  POLICY_DELETE: 'policy-delete',
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
  CONDITION_CREATE: 'condition-create',
  CONDITION_UPDATE: 'condition-update',
  CONDITION_DELETE: 'condition-delete',
  CONDITION_READ: 'condition-read',
  CONDITIONAL_POLICIES_FILE_NOT_FOUND: 'conditional-policies-file-not-found',
  CONDITIONAL_POLICIES_FILE_CHANGE: 'conditional-policies-file-change',
};

export const RBAC_BACKEND = 'rbac-backend';

export async function createPermissionEvaluationAuditorEvent(
  auditor: AuditorService,
  userEntityRef: string,
  request: PolicyQuery,
  policyDecision?: PolicyDecision,
): Promise<{
  auditorEvent: AuditorServiceEvent;
  auditInfo: EvaluationAuditInfo;
}> {
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

  const auditorEvent = await auditor.createEvent({
    eventId: EvaluationEvents.PERMISSION_EVALUATION,
    severityLevel: 'medium',
    meta: {
      ...auditInfo,
    },
  });
  return { auditorEvent, auditInfo };
}
