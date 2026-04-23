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
 * Checks if an error indicates that the Mend backend plugin is not installed
 * This typically happens when the API endpoint doesn't exist (404) or when
 * there's a JSON parsing error due to an empty response
 * @param error - The error object to check
 * @returns true if the error indicates the backend plugin is not installed
 */
export function isMendBackendNotInstalled(
  error: (Error & { status?: number; response?: any }) | null,
): boolean {
  if (!error) return false;

  // Check for common indicators that the backend plugin is not installed:
  // 1. 404 status (endpoint not found)
  // 2. JSON parsing errors (empty response from missing endpoint)
  // 3. Network errors when trying to reach the mend endpoint
  return (
    (error.status === 404 &&
      (error.message?.includes('Unexpected end of JSON input') ||
        error.message?.includes("Failed to execute 'json' on 'Response'") ||
        error.message?.includes('Not Found'))) ||
    (error.status === undefined && error.message?.includes('fetch'))
  );
}
