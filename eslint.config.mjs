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

// ESLint config for root-level files only (scripts, tooling config).
// Each workspace is linted separately with its own ESLint version and its
// .eslintrc.js, which extends the shared .eslintrc.cjs in this directory.

import js from '@eslint/js';
import headers from 'eslint-plugin-headers';
import globals from 'globals';

export default [
  {
    ignores: [
      'workspaces/**',
      '.yarn/**',
      '**/node_modules/**',
      '**/dist/**',
      // Legacy configs consumed by workspace ESLint 8
      '.eslintrc.cjs',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    plugins: { headers },
    rules: {
      // Newer recommended rules that existing scripts don't follow yet
      'no-useless-escape': 'warn',
      'preserve-caught-error': 'warn',
      // Same header as scripts/templates/copyright-header.txt. Existing files
      // keep their year, new files get the current one.
      'headers/header-format': [
        'error',
        {
          source: 'string',
          style: 'jsdoc',
          blockPrefix: '\n',
          content: [
            'Copyright (year) The Backstage Authors',
            '',
            'Licensed under the Apache License, Version 2.0 (the "License");',
            'you may not use this file except in compliance with the License.',
            'You may obtain a copy of the License at',
            '',
            '    http://www.apache.org/licenses/LICENSE-2.0',
            '',
            'Unless required by applicable law or agreed to in writing, software',
            'distributed under the License is distributed on an "AS IS" BASIS,',
            'WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
            'See the License for the specific language governing permissions and',
            'limitations under the License.',
          ].join('\n'),
          patterns: {
            year: {
              pattern: '\\d{4}',
              defaultValue: String(new Date().getFullYear()),
            },
          },
        },
      ],
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
  },
];
