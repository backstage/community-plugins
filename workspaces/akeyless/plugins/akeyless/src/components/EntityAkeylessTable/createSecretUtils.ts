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

export type ResolveCreateSecretRequestInput = {
  name: string;
  selectedPath: string;
  secretPaths: string[];
};

export type ResolveCreateSecretRequestResult = {
  absoluteName: string;
  contextPath: string;
};

export function normalizeAnnotatedPath(path: string): string {
  const segments = path.trim().split('/').filter(Boolean);
  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

export function resolveCreateSecretRequest({
  name,
  selectedPath,
  secretPaths,
}: ResolveCreateSecretRequestInput): ResolveCreateSecretRequestResult {
  const normalizedSelectedPath = normalizeAnnotatedPath(selectedPath);
  const normalizedPaths = secretPaths.map(normalizeAnnotatedPath);

  const selectedBase =
    normalizedSelectedPath === '/' ? '' : normalizedSelectedPath;
  const fullName = name.startsWith('/')
    ? normalizeAnnotatedPath(name)
    : normalizeAnnotatedPath(`${selectedBase}/${name}`);

  const matchingContextPath =
    normalizedPaths
      .filter(
        path =>
          path !== '/' &&
          (fullName === path || fullName.startsWith(`${path}/`)),
      )
      .sort((a, b) => b.length - a.length)[0] ?? normalizedSelectedPath;

  const absoluteName = fullName;

  if (matchingContextPath === '/') {
    throw new Error(
      'Cannot create static secrets with a root contextPath; set a non-root akeyless.io/secrets-path',
    );
  }

  return {
    absoluteName,
    contextPath: matchingContextPath,
  };
}
