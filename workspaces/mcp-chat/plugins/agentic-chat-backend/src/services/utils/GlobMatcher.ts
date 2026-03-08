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
 * Check if a file path matches any of the provided glob patterns.
 * Supports `**`, `*`, and `?` wildcards.
 */
export function matchesPatterns(filePath: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (matchPattern(filePath, pattern)) {
      return true;
    }
  }
  return false;
}

function matchPattern(filePath: string, pattern: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  // Pattern: **/*.ext
  const doubleStarExtMatch = normalizedPattern.match(/^\*\*\/\*\.(\w+)$/);
  if (doubleStarExtMatch) {
    const ext = doubleStarExtMatch[1];
    return normalizedPath.endsWith(`.${ext}`);
  }

  // Pattern: *.ext
  const singleStarExtMatch = normalizedPattern.match(/^\*\.(\w+)$/);
  if (singleStarExtMatch) {
    const ext = singleStarExtMatch[1];
    return normalizedPath.endsWith(`.${ext}`) && !normalizedPath.includes('/');
  }

  let regex = normalizedPattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '{{DOUBLE_STAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/{{DOUBLE_STAR}}/g, '.*')
    .replace(/\?/g, '.');

  if (!normalizedPattern.startsWith('**/')) {
    regex = `(.*\\/)?${regex}`;
  }

  const regexPattern = new RegExp(`^${regex}$`);
  return regexPattern.test(normalizedPath);
}
