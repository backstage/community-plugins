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
  type RequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

import {
  ConditionEvents,
  ListConditionEvents,
  ListPluginPoliciesEvents,
  PermissionEvents,
  RoleEvents,
} from './auditor';
import {
  AuditorService,
  AuditorServiceEvent,
} from '@backstage/backend-plugin-api/index';

// Mapping paths and methods to corresponding events and messages
const eventMap: {
  [key: string]: { [key: string]: string };
} = {
  '/policies': {
    POST: PermissionEvents.POLICY_CREATE,
    PUT: PermissionEvents.POLICY_UPDATE,
    DELETE: PermissionEvents.POLICY_DELETE,
    GET: PermissionEvents.POLICY_GET,
  },
  '/roles': {
    POST: RoleEvents.ROLE_CREATE,
    PUT: RoleEvents.ROLE_UPDATE,
    DELETE: RoleEvents.ROLE_DELETE,
    GET: RoleEvents.ROLE_GET,
  },
  '/roles/conditions': {
    POST: ConditionEvents.CONDITION_CREATE,
    PUT: ConditionEvents.CONDITION_UPDATE,
    DELETE: ConditionEvents.CONDITION_DELETE,
    GET: ConditionEvents.CONDITION_GET,
  },
  '/plugins/policies': {
    GET: ListPluginPoliciesEvents.PLUGIN_POLICIES_GET,
  },
  '/plugins/condition-rules': {
    GET: ListConditionEvents.CONDITION_RULES_GET,
  },
};

export function logAuditorEvent(auditor: AuditorService): RequestHandler {
  return async (req: Request, resp: Response, next: NextFunction) => {
    let auditorEvent: AuditorServiceEvent | undefined;
    const matchedPath = Object.keys(eventMap).find(path =>
      req.path.startsWith(path),
    );
    if (matchedPath) {
      const methodEvent = eventMap[matchedPath][req.method];
      if (methodEvent) {
        auditorEvent = await auditor.createEvent({
          eventId: methodEvent,
          severityLevel: 'medium',
          request: req,
          meta: { source: 'rest' },
        });
      }
    }

    resp.on('finish', async () => {
      if (resp.statusCode < 400) {
        const meta = resp.locals.meta ?? {};
        await auditorEvent?.success({
          meta: {
            source: 'rest',
            response: { status: resp.statusCode },
            ...meta,
          },
        });
      } else {
        await auditorEvent?.fail({
          error: Error(resp.statusMessage),
          meta: { response: { status: resp.statusCode } },
        });
      }
    });

    next();
  };
}
