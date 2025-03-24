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

const eventToActionMap: {
  [key: string]: string;
} = {
  POST: 'create',
  PUT: 'update',
  DELETE: 'delete',
};

function getRequestAuditorMeta(req: Request, eventId: string): JsonObject {
  const meta = {
    source: 'rest',
    ...(req.method in eventToActionMap
      ? { actionType: eventToActionMap[req.method] }
      : {}),
  };

  if (req.method !== 'GET') {
    return meta;
  }

  let extraMeta = {};
  const hasQuery = Object.keys(req.query).length > 0;
  const hasParams = Object.keys(req.params).length > 0;
  switch (eventId) {
    case PermissionEvents.POLICY_GET:
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
    case RoleEvents.ROLE_GET:
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
    case ConditionEvents.CONDITION_GET:
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
        source: 'rest',
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
