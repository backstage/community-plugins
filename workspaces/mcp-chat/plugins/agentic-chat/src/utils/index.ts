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

export {
  debugLog,
  debugError,
  debugWarn,
  enableDebug,
  disableDebug,
  initializeDebug,
} from './debug';

export { normalizeErrorMessage } from './errors';

export { sanitizeResponseText } from './sanitize';

export { formatResponseText, formatToolOutput } from './formatResponse';

export { formatRelativeTime } from './formatTime';

export { getSeverity } from './toolSeverity';
export type { ToolSeverity } from './toolSeverity';

export { stripToolPrefix } from './toolNameUtils';

export { handleStreamError } from './streamErrorHandler';

export {
  findJsonBlocks,
  stripEchoedToolOutput,
  getFallbackResponseText,
  getEmptyStreamResponseText,
  buildBotResponse,
} from './streamingHelpers';

/**
 * Safely extract a string array from an unknown config value.
 * Returns an empty array if the value is not a string array.
 */
export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every(v => typeof v === 'string')
    ? (value as string[])
    : [];
}
