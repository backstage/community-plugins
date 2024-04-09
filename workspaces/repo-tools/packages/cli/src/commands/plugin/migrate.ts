import chalk from 'chalk';
import { OptionValues } from 'commander';

export default async (opts: OptionValues) => {
  const { monorepoPath, pluginName } = opts as {
    monorepoPath: string;
    pluginName: string;
  };

  console.log(
    chalk.blue`Migrating plugin ${pluginName} in monorepo at ${monorepoPath}`,
  );

  // check if the workspace exists, create if not.

  // find all the packages in the main monorepo that should be in the workspace

  // copy packages across, and adjust the package.jsons

  // mark copied packages as deprecated and add changeset.

  console.log();
};
