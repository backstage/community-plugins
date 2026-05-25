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

module.exports = function materialUiMigrationEslintConfig(packageDir) {
  return require('@backstage/cli/config/eslint-factory')(packageDir, {
    restrictedImports: [
      {
        name: '@material-ui/core',
        message: 'Use @mui/material instead of Material UI v4.',
      },
      {
        name: '@material-ui/lab',
        message: 'Use @mui/material or @mui/lab instead of Material UI v4.',
      },
      {
        name: 'makeStyles',
        message:
          'Use @mui/material sx/styled, or Backstage UI instead makeStyles.',
      },
      {
        name: '@material-ui/icons',
        message:
          "Use '@mui/icons-material/<Icon>' instead of Material UI v4 (e.g. import MenuIcon from '@mui/icons-material/Menu').",
      },
    ],
  });
};
