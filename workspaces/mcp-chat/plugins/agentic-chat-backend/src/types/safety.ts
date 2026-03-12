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

import type { ChatResponse } from '@backstage-community/plugin-agentic-chat-common';

/**
 * Shield registration configuration
 * @public
 */
export interface ShieldRegistration {
  /** Unique identifier for the shield */
  shieldId: string;
  /** Provider ID (e.g., 'llama-guard', 'prompt-guard') */
  providerId: string;
  /** Provider-specific shield/model ID */
  providerShieldId: string;
}

/**
 * Safety configuration for guardrails
 * @public
 */
export interface SafetyConfig {
  /** Enable safety checks */
  enabled: boolean;
  /** Shield IDs to use for input validation */
  inputShields?: string[];
  /** Shield IDs to use for output filtering */
  outputShields?: string[];
  /** Shields to register on Llama Stack if not already present */
  registerShields?: ShieldRegistration[];
  /**
   * Behavior when a safety check fails due to an error (not a violation).
   * - 'allow': Allow the message through on error (fail-open, less secure)
   * - 'block': Block the message on error (fail-closed, more secure)
   * Default: 'block' (secure by default)
   */
  onError?: 'allow' | 'block';
}

/**
 * Shield information from Llama Stack
 * @public
 */
export interface ShieldInfo {
  identifier: string;
  provider_id: string;
  provider_resource_id: string;
  type: string;
  params?: Record<string, unknown>;
}

/**
 * Safety violation detected by a shield
 * @public
 */
export interface SafetyViolation {
  violation_level: 'info' | 'warn' | 'error';
  user_message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Result from running a safety shield
 * @internal
 */
export interface RunShieldResponse {
  violation?: SafetyViolation;
}

/**
 * Extended chat response with safety information
 * @public
 */
export interface SafetyChatResponse extends ChatResponse {
  /** Whether the response was filtered by safety shields */
  filtered?: boolean;
  /** Reason for filtering (if filtered) */
  filterReason?: string;
  /** Whether this action requires user confirmation */
  requiresConfirmation?: boolean;
  /** Description of pending action requiring confirmation */
  pendingAction?: string;
}
