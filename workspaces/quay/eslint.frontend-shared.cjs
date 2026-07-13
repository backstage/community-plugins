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

const muiV4RestrictedImports = [
  {
    name: '@material-ui/core',
    message: 'Use @backstage/ui instead of Material UI v4.',
  },
  {
    name: '@material-ui/icons',
    message: 'Use @remixicon/react or @backstage/ui instead of Material UI v4.',
  },
  {
    name: '@material-ui/lab',
    message: 'Use @backstage/ui instead of Material UI v4.',
  },
  {
    name: '@material-ui/styles',
    message: 'Use @backstage/ui or CSS modules instead of Material UI v4.',
  },
];

const muiV5RestrictedImports = [
  {
    name: '@mui/material',
    message: 'Use @backstage/ui instead of MUI v5.',
  },
  {
    name: '@mui/icons-material',
    message: 'Use @remixicon/react or @backstage/ui instead of MUI v5.',
  },
  {
    name: '@mui/lab',
    message: 'Use @backstage/ui instead of MUI v5.',
  },
  {
    name: '@mui/styles',
    message:
      'Use @backstage/ui or CSS modules instead of @mui/styles (legacy MUI styling).',
  },
];

const legacyJssRestrictedImport = {
  name: '@mui/styles',
  message:
    'Use @backstage/ui or CSS modules instead of @mui/styles (legacy MUI styling).',
};

/**
 * ESLint config for frontend packages in this workspace.
 *
 * @param {string} packageDir
 * @param {{ buiPlugin?: boolean }} [options]
 *   When `buiPlugin` is true, block both MUI v4 and MUI v5 (for plugins migrated to BUI).
 *   Otherwise only block MUI v4 re-introduction (for app packages still on MUI v5).
 */
module.exports = function createEslintConfig(
  packageDir,
  { buiPlugin = false } = {},
) {
  const config = buiPlugin
    ? {
        restrictedImports: [
          ...muiV4RestrictedImports,
          ...muiV5RestrictedImports,
        ],
        restrictedImportPatterns: ['@material-ui/*', '@mui/*'],
      }
    : {
        restrictedImports: [
          ...muiV4RestrictedImports,
          legacyJssRestrictedImport,
        ],
        restrictedImportPatterns: ['@material-ui/*'],
      };

  return require('@backstage/cli/config/eslint-factory')(packageDir, config);
};
