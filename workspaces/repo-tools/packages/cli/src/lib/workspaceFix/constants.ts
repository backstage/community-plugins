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

export const REPO_ROOT_PACKAGE_NAME = '@backstage-community/plugins';

// Match .github/workflows/ci.yml so local yarn fix behaves like CI.
export const DEFAULT_NODE_OPTIONS = '--max-old-space-size=8192';

export const MEMORY_HEAVY_STEPS = new Set([
  'repo-fix',
  'lint-fix',
  'prettier',
  'knip',
]);

export const MARKDOWNLINT_PACKAGES = [
  'markdownlint-cli2',
  'markdownlint-cli',
  'markdownlint',
] as const;

/**
 * Deterministic fixer order. Add new fixers here.
 *
 * 1. backstage-cli repo fix  (package.json exports / metadata)
 * 2. sort-package-json       (optional; skipped unless installed)
 * 3. backstage-cli repo lint --fix
 * 4. markdownlint --fix      (optional; skipped unless installed)
 * 5. prettier --write        (last formatter so eslint and prettier do not fight)
 * 6. knip --fix              (opt-in only; skipped unless workspaceFix.knip or --knip)
 */
export const FIXER_ORDER = [
  'repo-fix',
  'sort-package-json',
  'lint-fix',
  'markdownlint',
  'prettier',
  'knip',
] as const;

export const PACKAGE_ROOTS = ['plugins', 'packages'] as const;
