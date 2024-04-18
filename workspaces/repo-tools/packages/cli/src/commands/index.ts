import { Command } from 'commander';
import { exitWithError } from '../lib/errors';
import { assertError } from '@backstage/errors';

// Wraps an action function so that it always exits and handles errors
function lazy(
  getActionFunc: () => Promise<(...args: any[]) => Promise<void>>,
): (...args: any[]) => Promise<never> {
  return async (...args: any[]) => {
    try {
      const actionFunc = await getActionFunc();
      await actionFunc(...args);

      process.exit(0);
    } catch (error) {
      assertError(error);
      exitWithError(error);
    }
  };
}

export const registerCommands = (program: Command) => {
  program
    .command('plugin')
    .command('migrate')
    .requiredOption('--monorepo-path [path]', 'Path to the monorepo')
    .requiredOption(
      '--workspace-name [name]',
      'Name of the workspace that will be created, the plugins will be pulled automatically from the monorepo',
    )
    .option('--branch [branch]', 'use a branch for deprecation commits')
    .option('--force', 'Overwrite existing workspace', false)
    .action(lazy(() => import('./plugin/migrate').then(m => m.default)));

  program
    .command('workspace')
    .command('create')
    .action(lazy(() => import('./workspace/create').then(m => m.default)));
};
