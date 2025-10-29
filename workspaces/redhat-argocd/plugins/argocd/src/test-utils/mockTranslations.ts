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
import { ArgoCDMessages } from '../translations/ref';

/**
 * Recursively flatten a nested messages object into a single-level map
 * where keys are dot-separated paths.
 *
 * Example:
 *   - { app: { home: { title: "Hello" } } }
 *
 * becomes:
 *   - { "app.home.title": "Hello" }
 *
 */
function flattenMessages(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  // Start with an empty accumulator for this recursion level
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Build the dot-path for the current key.
    const newKey = prefix ? `${prefix}.${key}` : key;

    // If the value is a plain object, recurse to keep flattening.
    // e.g. key: { keyAsValue: { ... }  }
    // Arrays are treated as leaves, not recursed.
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const child = flattenMessages(value as Record<string, unknown>, newKey);
      return { ...acc, ...child };
    } else if (value !== null) {
      // Leaf value: coerce to string so the map is consistently typed
      return { ...acc, [newKey]: String(value) };
    }

    return acc;
  }, {} as Record<string, string>);
}

// Precompute the flattened message map (faster lookups)
const flattenedMessages = flattenMessages(ArgoCDMessages);

/**
 * Minimal translation function
 * - Looks up a message by dot-key in `flattenedMessages`
 * - Falls back to the key itself if missing (useful for tests)
 */
export const mockT = (key: string): string => {
  return flattenedMessages[key] ?? key;
};

/**
 * Hook-like wrapper that mimics useTranslation.
 */
export const mockUseTranslation = () => ({ t: mockT });
