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

/**
 * Debug logger for Agentic Chat frontend
 *
 * Controlled via:
 * - localStorage.setItem('agenticChat.debug', 'true') - enables debug logging
 * - Only active in development mode by default
 *
 * Usage:
 *   import { debugLog, debugError } from '../../utils';
 *   debugLog('Loading conversation:', responseId);
 *   debugError('Failed to load:', error);
 */

const DEBUG_KEY = 'agenticChat.debug';
const PREFIX = '[AgenticChat]';

// Config-based debug setting (set via initializeDebug)
let configDebugEnabled: boolean | undefined;

/**
 * Initialize debug logging from app-config.yaml
 * Called by AgenticChatApiClient when it has access to configApi
 *
 * @param enabled - Value from agenticChat.debug in app-config.yaml
 */
export function initializeDebug(enabled: boolean | undefined): void {
  configDebugEnabled = enabled;
}

/**
 * Check if debug logging is enabled
 * Priority order:
 * 1. localStorage (allows runtime override for troubleshooting)
 * 2. app-config.yaml agenticChat.debug setting
 * 3. Default: only in development mode (NODE_ENV !== 'production')
 */
function isDebugEnabled(): boolean {
  try {
    // 1. Check localStorage first (allows runtime override)
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(DEBUG_KEY);
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    }
  } catch {
    // localStorage not available (SSR or security restrictions)
  }

  // 2. Check config-based setting
  if (configDebugEnabled !== undefined) {
    return configDebugEnabled;
  }

  // 3. Default: only in development
  return process.env.NODE_ENV !== 'production';
}

/**
 * Debug log - only outputs when debug is enabled
 */
export function debugLog(...args: unknown[]): void {
  if (isDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.log(PREFIX, ...args);
  }
}

/**
 * Debug error - only outputs when debug is enabled
 * For critical errors that should always log, use console.error directly
 */
export function debugError(...args: unknown[]): void {
  if (isDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.error(PREFIX, ...args);
  }
}

/**
 * Debug warn - only outputs when debug is enabled
 */
export function debugWarn(...args: unknown[]): void {
  if (isDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.warn(PREFIX, ...args);
  }
}

/**
 * Enable debug logging (for use in browser console)
 * Usage: window.enableAgenticChatDebug()
 */
export function enableDebug(): void {
  try {
    localStorage.setItem(DEBUG_KEY, 'true');
    // eslint-disable-next-line no-console
    console.log(PREFIX, 'Debug logging enabled. Refresh to see logs.');
  } catch {
    // eslint-disable-next-line no-console
    console.error(PREFIX, 'Could not enable debug logging');
  }
}

/**
 * Disable debug logging
 * Usage: window.disableAgenticChatDebug()
 */
export function disableDebug(): void {
  try {
    localStorage.setItem(DEBUG_KEY, 'false');
    // eslint-disable-next-line no-console
    console.log(PREFIX, 'Debug logging disabled.');
  } catch {
    // eslint-disable-next-line no-console
    console.error(PREFIX, 'Could not disable debug logging');
  }
}

// Expose to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).enableAgenticChatDebug =
    enableDebug;
  (window as unknown as Record<string, unknown>).disableAgenticChatDebug =
    disableDebug;
}
