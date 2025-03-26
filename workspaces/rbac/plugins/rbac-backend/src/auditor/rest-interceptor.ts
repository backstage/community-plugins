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
  type ErrorRequestHandler,
} from 'express';

import {
  ActionType,
  ConditionEvents,
  ListConditionEvents,
  ListPluginPoliciesEvents,
  PermissionEvents,
  RoleEvents,
} from './auditor';
import {
  AuditorService,
  AuditorServiceEvent,
} from '@backstage/backend-plugin-api';
import type { JsonObject } from '@backstage/types';

// Mapping paths and methods to corresponding events and messages
const eventMap: {
  [key: string]: { [key: string]: string };
} = {
  '/policies': {
    POST: PermissionEvents.POLICY_WRITE,
    PUT: PermissionEvents.POLICY_WRITE,
    DELETE: PermissionEvents.POLICY_WRITE,
    GET: PermissionEvents.POLICY_READ,
  },
  '/roles/conditions': {
    POST: ConditionEvents.CONDITION_WRITE,
    PUT: ConditionEvents.CONDITION_WRITE,
    DELETE: ConditionEvents.CONDITION_WRITE,
    GET: ConditionEvents.CONDITION_READ,
  },
  '/roles': {
    POST: RoleEvents.ROLE_WRITE,
    PUT: RoleEvents.ROLE_WRITE,
    DELETE: RoleEvents.ROLE_WRITE,
    GET: RoleEvents.ROLE_READ,
  },
  '/plugins/policies': {
    GET: ListPluginPoliciesEvents.PLUGIN_POLICIES_READ,
  },
  '/plugins/condition-rules': {
    GET: ListConditionEvents.CONDITION_RULES_READ,
  },
};

const eventToActionMap: {
  [key: string]: string;
} = {
  POST: ActionType.CREATE,
  PUT: ActionType.UPDATE,
  DELETE: ActionType.DELETE,
};

function getRequestAuditorMeta(req: Request, eventId: string): JsonObject {
  const meta = {
    ...(req.method in eventToActionMap
      ? { actionType: eventToActionMap[req.method] }
      : {}),
    source: 'rest',
  };

  if (req.method !== 'GET') {
    return meta;
  }

  let extraMeta = {};
  const hasQuery = Object.keys(req.query).length > 0;
  const hasParams = Object.keys(req.params).length > 0;
  switch (eventId) {
    case PermissionEvents.POLICY_READ:
      if (hasParams) {
        extraMeta = {
          queryType: 'by-role',
          entityRef: `${req.params.kind}:${req.params.namespace}/${req.params.name}`,
        };
        break;
      }
      extraMeta = {
        queryType: hasQuery ? 'by-query' : 'all',
        ...(hasQuery ? { query: req.query } : {}),
      };
      break;
    case RoleEvents.ROLE_READ:
      extraMeta = {
        queryType: hasParams ? 'by-role' : 'all',
        ...(hasParams
          ? {
              entityRef: `${req.params.kind}:${req.params.namespace}/${req.params.name}`,
            }
          : {}),
      };
      break;
    case ConditionEvents.CONDITION_READ:
      if (hasParams) {
        extraMeta = {
          queryType: 'by-id',
          id: req.params.id,
        };
        break;
      }
      extraMeta = {
        queryType: hasQuery ? 'by-query' : 'all',
        ...(hasQuery ? { query: req.query } : {}),
      };
      break;
    default:
      break;
  }
  return { ...meta, ...extraMeta };
}

export function logAuditorEvent(auditor: AuditorService): RequestHandler {
  return async (req: Request, resp: Response, next: NextFunction) => {
    let auditorEvent: AuditorServiceEvent | undefined;
    const matchedPath = Object.keys(eventMap).find(path =>
      req.path.startsWith(path),
    );
    if (matchedPath) {
      const methodEvent = eventMap[matchedPath][req.method];
      if (methodEvent) {
        const meta = getRequestAuditorMeta(req, methodEvent);
        auditorEvent = await auditor.createEvent({
          eventId: methodEvent,
          severityLevel: 'medium',
          request: req,
          meta,
        });
      }
    }

    resp.on('finish', async () => {
      const meta = {
        response: { status: resp.statusCode },
        ...(resp.locals.meta ?? {}),
      };
      if (resp.statusCode < 400) {
        await auditorEvent?.success({ meta });
      } else {
        const error = resp.locals.error ?? new Error(resp.statusMessage);
        await auditorEvent?.fail({
          error,
          meta,
        });
      }
    });

    next();
  };
}

export function setAuditorError(): ErrorRequestHandler {
  return async (
    err: Error,
    _req: Request,
    resp: Response,
    next: NextFunction,
  ) => {
    resp.locals.error = err;
    next(err);
  };
}
