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

import { Message } from '../types';

/**
 * Chat session interface for managing multiple conversations
 * @public
 */
export interface ChatSession {
  contextId: string; // From A2A API for conversation continuity
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat storage interface for browser persistence
 * @public
 */
export interface ChatStorage {
  sessions: ChatSession[];
  currentSessionId: string | null;
  executionPlanBuffer?: Record<string, string>; // Store execution plans by message ID (per-session)
  executionPlanHistory?: Record<string, string[]>; // Store history of execution plan updates by message ID
  autoExpandExecutionPlans?: string[]; // Store which plans should be auto-expanded
}
