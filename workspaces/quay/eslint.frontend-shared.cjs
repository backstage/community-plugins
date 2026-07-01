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

const materialUiMigrationEslintConfig = {
  restrictedImports: [
    {
      name: '@material-ui/core',
      message: 'Use @backstage/ui instead of Material UI v4.',
    },
    {
      name: '@material-ui/icons',
      message:
        'Use @remixicon/react or @backstage/ui instead of Material UI v4.',
    },
    {
      name: '@material-ui/lab',
      message: 'Use @backstage/ui instead of Material UI v4.',
    },
    {
      name: '@material-ui/styles',
      message: 'Use @backstage/ui or CSS modules instead of Material UI v4.',
    },
    {
      name: '@mui/styles',
      message:
        'Use @backstage/ui or CSS modules instead of @mui/styles (legacy MUI styling).',
    },
  ],
  restrictedImportPatterns: ['@material-ui/*'],
};

/**
 * ESLint config for frontend packages in this workspace (Material UI v4 migration guards).
 */
module.exports = function createEslintConfig(packageDir) {
  return require('@backstage/cli/config/eslint-factory')(
    packageDir,
    materialUiMigrationEslintConfig,
  );
};
