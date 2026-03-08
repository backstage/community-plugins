/*
 * Copyright 2025 The Backstage Authors
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
  LoggerService,
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  agenticChatAccessPermission,
  agenticChatAdminPermission,
  type SecurityMode,
} from '@backstage-community/plugin-agentic-chat-common';
import type express from 'express';
import { toErrorMessage } from '../services/utils';

const GUEST_USER_REF = 'user:default/guest';

export interface SecurityDeps {
  logger: LoggerService;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
  securityMode: SecurityMode;
  accessDeniedMessage?: string;
  adminUsers?: string[];
  permissionsEnabled: boolean;
}

export function createSecurityMiddleware(deps: SecurityDeps) {
  const {
    logger,
    httpAuth,
    permissions,
    securityMode,
    accessDeniedMessage,
    adminUsers,
    permissionsEnabled,
  } = deps;

  const securityConfig = {
    mode: securityMode,
    accessDeniedMessage,
  };

  async function getUserRef(req: express.Request): Promise<string> {
    if (securityConfig.mode === 'none') {
      return GUEST_USER_REF;
    }
    try {
      const credentials = await httpAuth.credentials(req, { allow: ['user'] });
      return credentials.principal.userEntityRef;
    } catch (err) {
      logger.warn(
        `Could not extract user identity, falling back to guest: ${err}`,
      );
      return GUEST_USER_REF;
    }
  }

  const requirePluginAccess: express.RequestHandler = async (
    req,
    res,
    next,
  ) => {
    if (securityConfig.mode === 'none') {
      logger.debug('Security mode is "none" - skipping access control');
      next();
      return;
    }

    try {
      const credentials = await httpAuth.credentials(req);

      const decision = (
        await permissions.authorize(
          [{ permission: agenticChatAccessPermission }],
          { credentials },
        )
      )[0];

      logger.debug(
        `Plugin access check: agenticChat.access = ${decision.result}`,
      );

      if (decision.result === AuthorizeResult.DENY) {
        logger.warn('Agentic Chat access denied for user');
        const deniedMessage =
          securityConfig.accessDeniedMessage ||
          'You do not have permission to access Agentic Chat. ' +
            'Please contact your administrator to request access.';
        res.status(403).json({
          error: 'Access Denied',
          message: deniedMessage,
        });
        return;
      }

      next();
    } catch (error) {
      const errorMessage = toErrorMessage(error);
      logger.warn(`Auth/permission check failed: ${errorMessage}`);

      if (error instanceof NotAllowedError) {
        res.status(403).json({
          error: 'Access Denied',
          message: error.message,
        });
        return;
      }

      res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access Agentic Chat',
        details: errorMessage,
      });
    }
  };

  /**
   * Check whether the request user has admin permission.
   * Returns true for admin users, false otherwise.
   * Never throws — returns false on any error.
   *
   * Decision path:
   *  1. security.mode === 'none' → everyone is admin (dev mode)
   *  2. permission.enabled === true → delegate to Backstage RBAC (RHDH path)
   *  3. Otherwise → check user entity ref against agenticChat.security.adminUsers
   */
  async function checkIsAdmin(req: express.Request): Promise<boolean> {
    if (securityConfig.mode === 'none') {
      return true;
    }

    if (permissionsEnabled) {
      try {
        const credentials = await httpAuth.credentials(req);
        const decision = (
          await permissions.authorize(
            [{ permission: agenticChatAdminPermission }],
            { credentials },
          )
        )[0];
        return decision.result !== AuthorizeResult.DENY;
      } catch {
        logger.debug('Permission check threw, treating as non-admin');
        return false;
      }
    }

    if (!adminUsers || adminUsers.length === 0) {
      logger.debug('checkIsAdmin: no adminUsers configured, returning false');
      return false;
    }
    try {
      const userRef = await getUserRef(req);
      const isMatch = adminUsers.includes(userRef);
      logger.info(
        `checkIsAdmin: userRef="${userRef}", adminUsers=${JSON.stringify(
          adminUsers,
        )}, match=${isMatch}`,
      );
      return isMatch;
    } catch {
      logger.debug('Permission check threw, treating as non-admin');
      return false;
    }
  }

  const requireAdminAccess: express.RequestHandler = async (req, res, next) => {
    if (await checkIsAdmin(req)) {
      next();
      return;
    }
    logger.warn('Agentic Chat admin access denied for user');
    res.status(403).json({
      error: 'Admin Access Denied',
      message:
        'You do not have admin permissions for Agentic Chat. ' +
        'Contact your administrator to request access.',
    });
  };

  return {
    requirePluginAccess,
    checkIsAdmin,
    requireAdminAccess,
    getUserRef,
  };
}
