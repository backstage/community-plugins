import inquirer from 'inquirer';
import chalk from 'chalk';

import { OptionValues } from 'commander';
import { createWorkspace } from '../../lib/createWorkspace';

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
