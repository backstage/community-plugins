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
 * Classifies a stream error and returns an error message string if the caller
 * should display an error. Returns undefined when the error should be ignored
 * (user cancelled via AbortError, or component unmounted).
 */
export function handleStreamError(
  err: unknown,
  _abortControllerRef: { current: AbortController | null },
  mountedRef: { current: boolean },
): string | undefined {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return undefined; // user cancelled
  }
  if (!mountedRef.current) {
    return undefined;
  }
  return err instanceof Error
    ? `Error: ${err.message}`
    : 'An unexpected error occurred.';
}
