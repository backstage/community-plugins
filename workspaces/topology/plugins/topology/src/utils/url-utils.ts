/*
 * Copyright 2026 The Backstage Authors
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

/** Maximum length for untrusted URL inputs before regex/parse operations. */
export const MAX_URL_LENGTH = 2048;

/**
 * Returns true if the URL uses an HTTP or HTTPS scheme.
 * Used when rendering clickable links from untrusted Kubernetes data.
 */
export const isValidHttpUrl = (url?: string | null): boolean => {
  if (!url || url.length > MAX_URL_LENGTH) {
    return false;
  }
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Returns true if the URL uses an allowed git scheme (http, https, ssh, git)
 * or SCP-like syntax (user@host:path).
 */
export const isValidGitUrl = (url?: string | null): boolean => {
  if (!url || url.length > MAX_URL_LENGTH) {
    return false;
  }
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('ssh://') ||
    url.startsWith('git://')
  ) {
    return true;
  }
  // SCP-like: git@host:path or user@host:path
  return /^[^@\s/]+@[^:\s/]+:/.test(url);
};
