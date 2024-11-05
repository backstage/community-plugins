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
import type { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';

import {
  ConditionEvents,
  ListConditionEvents,
  ListPluginPoliciesEvents,
  PermissionEvents,
  RESPONSE_ERROR,
  RoleEvents,
} from './audit-logger';

// Mapping paths and methods to corresponding events and messages
const eventMap: {
  [key: string]: { [key: string]: { event: string; message: string } };
} = {
  '/policies': {
    POST: {
      event: PermissionEvents.CREATE_POLICY_ERROR,
      message: 'Failed to create permission policies',
    },
    PUT: {
      event: PermissionEvents.UPDATE_POLICY_ERROR,
      message: 'Failed to update permission policies',
    },
    DELETE: {
      event: PermissionEvents.DELETE_POLICY_ERROR,
      message: 'Failed to delete permission policies',
    },
    GET: {
      event: PermissionEvents.GET_POLICY_ERROR,
      message: 'Failed to get permission policies',
    },
  },
  '/roles': {
    POST: {
      event: RoleEvents.CREATE_ROLE_ERROR,
      message: 'Failed to create role',
    },
    PUT: {
      event: RoleEvents.UPDATE_ROLE_ERROR,
      message: 'Failed to update role',
    },
    DELETE: {
      event: RoleEvents.DELETE_ROLE_ERROR,
      message: 'Failed to delete role',
    },
    GET: { event: RoleEvents.GET_ROLE_ERROR, message: 'Failed to get role' },
  },
  '/roles/conditions': {
    POST: {
      event: ConditionEvents.CREATE_CONDITION_ERROR,
      message: 'Failed to create condition',
    },
    PUT: {
      event: ConditionEvents.UPDATE_CONDITION_ERROR,
      message: 'Failed to update condition',
    },
    DELETE: {
      event: ConditionEvents.DELETE_CONDITION_ERROR,
      message: 'Failed to delete condition',
    },
    GET: {
      event: ConditionEvents.GET_CONDITION_ERROR,
      message: 'Failed to get condition',
    },
  },
  '/plugins/policies': {
    GET: {
      event: ListPluginPoliciesEvents.GET_PLUGINS_POLICIES_ERROR,
      message: 'Failed to get list permission policies',
    },
  },
  '/plugins/condition-rules': {
    GET: {
      event: ListConditionEvents.GET_CONDITION_RULES_ERROR,
      message: 'Failed to get list condition rules and schemas',
    },
  },
};

// Audit log REST api errors interceptor.
export function auditError(auditLogger: AuditLogger): ErrorRequestHandler {
  return async (
    err: Error,
    req: Request,
    _resp: Response,
    next: NextFunction,
  ) => {
    const matchedPath = Object.keys(eventMap).find(path =>
      req.path.startsWith(path),
    );
    if (matchedPath) {
      const methodEvents = eventMap[matchedPath][req.method];
      if (methodEvents) {
        const { event, message } = methodEvents;
        try {
          await auditLogger.auditLog({
            message,
            eventName: event,
            stage: RESPONSE_ERROR,
            status: 'failed',
            request: req,
            errors: [err],
          });
          next(err);
        } catch (auditLogError) {
          next(auditLogError);
        }
        return;
      }
    }
    next(err);
  };
}
