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
import type { LoggerService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import type express from 'express';
import type { AgenticProvider } from '../providers';
import type { ChatSessionService } from '../services/ChatSessionService';
import type { ChatRequest } from '../types';

const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

/**
 * Validates that a session ID is non-empty and contains only safe characters.
 * @throws InputError when the ID is empty, missing, or malformed.
 */
export function validateSessionId(
  id: string | undefined,
): asserts id is string {
  if (!id || !SESSION_ID_PATTERN.test(id)) {
    throw new InputError(
      `Invalid session ID: must be 1-128 alphanumeric, dash, or underscore characters`,
    );
  }
}

/**
 * Extended Express Response interface that includes flush() method
 * added by compression middleware for SSE streaming support.
 */
export interface FlushableResponse extends express.Response {
  flush?: () => void;
}

/**
 * Shared context passed to each route module.
 * Provides dependencies and helper functions created by the top-level router.
 */
export interface RouteContext {
  router: express.Router;
  logger: LoggerService;
  config: import('@backstage/config').Config;
  provider: AgenticProvider;
  sessions: ChatSessionService | undefined;

  /** Extract a safe error message string from an unknown caught value. */
  toErrorMessage(error: unknown): string;

  /** Standard route error handler: logs the error and sends a JSON response. */
  sendRouteError(
    res: express.Response,
    error: unknown,
    logLabel: string,
    userFacingError: string,
    extra?: Record<string, unknown>,
    statusCode?: number,
  ): void;

  /** Returns true (and sends 501) when sessions are unavailable. */
  missingSessions(res: express.Response): boolean;

  /** Returns true (and sends 501) when conversations are unavailable. */
  missingConversations(res: express.Response): boolean;

  /** Resolve the Backstage user entity ref from the request. */
  getUserRef(req: express.Request): Promise<string>;

  /** Check whether the request user has admin permission. */
  checkIsAdmin(req: express.Request): Promise<boolean>;

  /** Express middleware that enforces admin permission. */
  requireAdminAccess: express.RequestHandler;

  /** Parse and validate a chat request body. */
  parseChatRequest(body: unknown): ChatRequest;

  /** Parse and validate an approval request body. */
  parseApprovalRequest(body: unknown): {
    responseId: string;
    callId: string;
    approved: boolean;
    toolName?: string;
    toolArguments?: string;
  };
}
