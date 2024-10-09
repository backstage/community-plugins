/*
 * Copyright 2024 The Backstage Authors
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
import inquirer from 'inquirer';
import chalk from 'chalk';

import { OptionValues } from 'commander';
import { createWorkspace } from '../../lib/workspaces/createWorkspace';

export default async (_: OptionValues) => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: chalk.blue('Name of the new workspace'),
      validate(value) {
        return (
          !!value.match(/^[a-z0-9\-]+$/) ||
          'Invalid input. Please enter lowercase letters, numbers, and dashes only.'
        );
      },
    },
    {
      type: 'input',
      name: 'owners',
      message: chalk.blue('Name of the owner(s) of the workspace'),
      validate(value) {
        return (
          !!value.match(/@[a-zA-Z0-9_-]+/) ||
          "Invalid input. Please enter a valid GitHub handle or group preceded by '@'."
        );
      },
    },
  ]);

  await createWorkspace({
    name: answers.name,
  });
};
