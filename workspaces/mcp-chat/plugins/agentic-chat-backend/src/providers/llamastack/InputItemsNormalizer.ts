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
 * Normalize message/response content into a consistent format.
 * Handles string content (passed through) and array-of-parts content
 * (normalized to { type, text } objects).
 *
 * Used by getConversationInputs and getConversationItems to ensure
 * consistent content structure regardless of API response shape.
 */
export function normalizeContent(
  content: unknown,
): string | Array<{ type: string; text?: string }> | undefined {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((c: unknown) => {
      if (typeof c === 'object' && c !== null) {
        const part = c as Record<string, unknown>;
        return {
          type: String(part.type || 'text'),
          text: typeof part.text === 'string' ? part.text : undefined,
        };
      }
      return { type: 'text', text: String(c) };
    });
  }
  return undefined;
}
