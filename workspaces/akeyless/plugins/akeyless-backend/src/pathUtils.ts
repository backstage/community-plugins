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

import { InputError, NotAllowedError } from '@backstage/errors';

export function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    return '/';
  }

  const segments = trimmed.split('/').filter(Boolean);
  const resolved: string[] = [];

  for (const segment of segments) {
    if (segment === '.') {
      continue;
    }
    if (segment === '..') {
      if (resolved.length === 0) {
        throw new InputError('Invalid path: cannot traverse above root');
      }
      resolved.pop();
      continue;
    }
    resolved.push(segment);
  }

  return resolved.length === 0 ? '/' : `/${resolved.join('/')}`;
}

export function joinSecretPath(
  contextPath: string,
  secretName: string,
): string {
  const trimmedName = secretName.trim();
  if (!trimmedName) {
    throw new InputError('Secret name is required');
  }

  if (trimmedName.startsWith('/')) {
    return normalizePath(trimmedName);
  }

  const base = normalizePath(contextPath).replace(/\/$/, '');
  return base === '/' ? `/${trimmedName}` : `${base}/${trimmedName}`;
}

export function assertPathAllowed(itemPath: string, contextPath: string): void {
  const item = normalizePath(itemPath);
  const context = normalizePath(contextPath).replace(/\/$/, '');

  if (context === '' || context === '/') {
    return;
  }

  if (item === context || item.startsWith(`${context}/`)) {
    return;
  }

  throw new NotAllowedError(
    `Secret path '${itemPath}' is outside the allowed context '${contextPath}'`,
  );
}
